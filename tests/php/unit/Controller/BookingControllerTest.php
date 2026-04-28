<?php

declare(strict_types=1);
/**
 * SPDX-FileCopyrightText: 2021 Nextcloud GmbH and Nextcloud contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */
namespace OCA\Calendar\Controller;

use ChristophWurst\Nextcloud\Testing\TestCase;
use DateTime;
use Exception;
use InvalidArgumentException;
use OC\URLGenerator;
use OCA\Calendar\Db\AppointmentConfig;
use OCA\Calendar\Db\Booking;
use OCA\Calendar\Exception\ClientException;
use OCA\Calendar\Exception\NoSlotFoundException;
use OCA\Calendar\Exception\ServiceException;
use OCA\Calendar\Http\JsonResponse;
use OCA\Calendar\Service\Appointments\AppointmentConfigService;
use OCA\Calendar\Service\Appointments\BookingService;
use OCP\AppFramework\Http;
use OCP\AppFramework\Http\TemplateResponse;
use OCP\AppFramework\Services\IInitialState;
use OCP\AppFramework\Utility\ITimeFactory;
use OCP\Calendar\ICalendarQuery;
use OCP\Contacts\IManager;
use OCP\IConfig;
use OCP\IInitialStateService;
use OCP\IRequest;
use OCP\IUser;
use OCP\Mail\IMailer;
use PHPUnit\Framework\MockObject\MockObject;
use Psr\Log\LoggerInterface;

class BookingControllerTest extends TestCase {
	/** @var string */
	protected $appName;

	/** @var IRequest|MockObject */
	protected $request;

	/** @var IManager|MockObject */
	protected $manager;

	/** @var IInitialStateService|MockObject */
	protected $initialState;

	/** @var IUser|MockObject */
	protected $user;

	/** @var AppointmentConfigService|MockObject */
	protected $service;

	/** @var BookingController */
	protected $controller;

	/** @var ITimeFactory|MockObject */
	private $time;

	/** @var BookingService|MockObject */
	private $bookingService;

	/** @var AppointmentConfigService|MockObject */
	private $apptService;

	/** @var URLGenerator|MockObject */
	private $urlGenerator;

	/** @var mixed|MockObject|LoggerInterface */
	private $logger;

	/** @var IMailer|MockObject */
	private $mailer;

	/** @var IConfig|MockObject */
	private $systemConfig;

	protected function setUp():void {
		parent::setUp();

		if (!interface_exists(ICalendarQuery::class)) {
			self::markTestIncomplete();
		}

		$this->appName = 'calendar';
		$this->request = $this->createMock(IRequest::class);
		$this->time = $this->createMock(ITimeFactory::class);
		$this->initialState = $this->createMock(IInitialState::class);
		$this->bookingService = $this->createMock(BookingService::class);
		$this->apptService = $this->createMock(AppointmentConfigService::class);
		$this->urlGenerator = $this->createMock(URLGenerator::class);
		$this->logger = $this->createMock(LoggerInterface::class);
		$this->mailer = $this->createMock(IMailer::class);
		$this->systemConfig = $this->createMock(IConfig::class);
		$this->controller = new BookingController(
			$this->appName,
			$this->request,
			$this->time,
			$this->initialState,
			$this->bookingService,
			$this->apptService,
			$this->urlGenerator,
			$this->logger,
			$this->mailer,
			$this->systemConfig,
		);
	}

	public function testGetBookableSlots(): void {
		$currentDate = (new DateTime('2024-6-30'))->getTimestamp();
		$selectedDate = '2024-7-1';
		$selectedTz = 'Europe/Berlin';
		//selected date start and end epoch in selected time zone
		$sDT = (new DateTime('2024-6-30 22:00:00'))->getTimestamp();
		$eDT = (new DateTime('2024-7-1 22:00:00'))->getTimestamp();

		$apptConfg = new AppointmentConfig();
		$apptConfg->setId(1);
		$apptConfg->setToken('abc123');
		$this->time->expects(self::once())
			->method('getTime')
			->willReturn($currentDate);
		$this->apptService->expects(self::once())
			->method('findByToken')
			->with($apptConfg->getToken())
			->willReturn($apptConfg);
		$this->bookingService->expects(self::once())
			->method('getAvailableSlots')
			->with($apptConfg, $sDT, $eDT);

		$this->controller->getBookableSlots($apptConfg->getToken(), $selectedDate, $selectedTz);
	}

	public function testGetBookableSlotsDatesInPast(): void {
		$currentDate = (new DateTime('2024-7-2'))->getTimestamp();
		$selectedDate = '2024-7-1';
		$apptConfg = new AppointmentConfig();
		$apptConfg->setId(1);
		$apptConfg->setToken('abc123');
		$this->time->expects(self::once())
			->method('getTime')
			->willReturn($currentDate);
		$this->apptService->expects(self::never())
			->method('findByToken')
			->with($apptConfg->getToken());
		$this->bookingService->expects(self::never())
			->method('getAvailableSlots');
		$this->logger->expects(self::once())
			->method('warning');

		$this->controller->getBookableSlots($apptConfg->getToken(), $selectedDate, 'Europe/Berlin');
	}

	public function testGetBookableSlotsInvalidTimezone(): void {
		$selectedDate = '2024-7-1';
		$apptConfg = new AppointmentConfig();
		$apptConfg->setId(1);
		$apptConfg->setToken('abc123');
		$this->time->expects(self::never())
			->method('getTime');
		$this->apptService->expects(self::never())
			->method('findByToken')
			->with($apptConfg->getToken());
		$this->bookingService->expects(self::never())
			->method('getAvailableSlots');
		$this->expectException(Exception::class);

		$this->controller->getBookableSlots($apptConfg->getToken(), $selectedDate, 'Hook/Neverland');
	}

	public function testGetBookableSlotsTimezoneIdentical(): void {
		$currentDate = (new DateTime('2024-6-30'))->getTimestamp();
		$selectedDate = '2024-7-1';
		$selectedTz = 'America/Toronto';
		//selected date start and end epoch in selected time zone
		$sDT = (new DateTime('2024-7-1 04:00:00'))->getTimestamp();
		$eDT = (new DateTime('2024-7-2 04:00:00'))->getTimestamp();

		$apptConfg = new AppointmentConfig();
		$apptConfg->setId(1);
		$apptConfg->setToken('abc123');
		$this->time->expects(self::once())
			->method('getTime')
			->willReturn($currentDate);
		$this->apptService->expects(self::once())
			->method('findByToken')
			->with($apptConfg->getToken())
			->willReturn($apptConfg);
		$this->bookingService->expects(self::once())
			->method('getAvailableSlots')
			->with($apptConfg, $sDT, $eDT);

		$this->controller->getBookableSlots($apptConfg->getToken(), $selectedDate, $selectedTz);
	}

	public function testGetBookableSlotsTimezoneMinus10(): void {
		$currentDate = (new DateTime('2024-6-30'))->getTimestamp();
		$selectedDate = '2024-7-1';
		$timezone = 'Pacific/Pago_Pago';
		//selected date start and end epoch in selected time zone
		$sDT = (new DateTime('2024-7-1 11:00:00'))->getTimestamp();
		$eDT = (new DateTime('2024-7-2 11:00:00'))->getTimestamp();

		$apptConfg = new AppointmentConfig();
		$apptConfg->setId(1);
		$apptConfg->setToken('abc123');
		$this->time->expects(self::once())
			->method('getTime')
			->willReturn($currentDate);
		$this->apptService->expects(self::once())
			->method('findByToken')
			->with($apptConfg->getToken())
			->willReturn($apptConfg);
		$this->bookingService->expects(self::once())
			->method('getAvailableSlots')
			->with($apptConfg, $sDT, $eDT);

		$this->controller->getBookableSlots($apptConfg->getToken(), $selectedDate, $timezone);
	}

	public function testGetBookableSlotsTimezonePlus10(): void {
		$currentDate = (new DateTime('2024-6-30'))->getTimestamp();
		$selectedDate = '2024-7-1';
		$timezone = 'Australia/Sydney';
		//selected date start and end epoch in selected time zone
		$sDT = (new DateTime('2024-6-30 14:00:00'))->getTimestamp();
		$eDT = (new DateTime('2024-7-1 14:00:00'))->getTimestamp();

		$apptConfg = new AppointmentConfig();
		$apptConfg->setId(1);
		$apptConfg->setToken('abc123');
		$this->time->expects(self::once())
			->method('getTime')
			->willReturn($currentDate);
		$this->apptService->expects(self::once())
			->method('findByToken')
			->with($apptConfg->getToken())
			->willReturn($apptConfg);
		$this->bookingService->expects(self::once())
			->method('getAvailableSlots')
			->with($apptConfg, $sDT, $eDT);

		$this->controller->getBookableSlots($apptConfg->getToken(), $selectedDate, $timezone);
	}

	public function testGetBookableSlotsTimezonePlus14(): void {
		$currentDate = (new DateTime('2024-6-30'))->getTimestamp();
		$selectedDate = '2024-7-1';
		$timezone = 'Pacific/Kiritimati';
		//selected date start and end epoch in selected time zone
		$sDT = (new DateTime('2024-6-30 10:00:00'))->getTimestamp();
		$eDT = (new DateTime('2024-7-1 10:00:00'))->getTimestamp();

		$apptConfg = new AppointmentConfig();
		$apptConfg->setId(1);
		$apptConfg->setToken('abc123');
		$this->time->expects(self::once())
			->method('getTime')
			->willReturn($currentDate);
		$this->apptService->expects(self::once())
			->method('findByToken')
			->with($apptConfg->getToken())
			->willReturn($apptConfg);
		$this->bookingService->expects(self::once())
			->method('getAvailableSlots')
			->with($apptConfg, $sDT, $eDT);

		$this->controller->getBookableSlots($apptConfg->getToken(), $selectedDate, $timezone);
	}

	public function testBook(): void {
		$email = 'penny@stardewvalley.edu';
		$config = new AppointmentConfig();

		$this->mailer->expects(self::once())
			->method('validateMailAddress')
			->with($email)
			->willReturn(true);
		$this->apptService->expects(self::once())
			->method('findByToken')
			->willReturn($config);
		$this->bookingService->expects(self::once())
			->method('book')
			->with($config, 1, 1, 'Hook/Neverland', 'Test', $email, 'Test')
			->willReturn(new Booking());

		$this->controller->bookSlot('abc123', 1, 1, 'Test', $email, 'Test', 'Hook/Neverland');
	}


	public function testBookInvalidTimeZone(): void {
		$email = 'penny@stardewvalley.edu';
		$config = new AppointmentConfig();

		$this->mailer->expects(self::once())
			->method('validateMailAddress')
			->with($email)
			->willReturn(true);
		$this->apptService->expects(self::once())
			->method('findByToken')
			->willReturn($config);
		$this->bookingService->expects(self::once())
			->method('book')
			->with($config, 1, 1, 'Hook/Neverland', 'Test', $email, 'Test')
			->willThrowException(new InvalidArgumentException());

		$this->controller->bookSlot('abc123', 1, 1, 'Test', $email, 'Test', 'Hook/Neverland');
	}

	public function testBookInvalidSlot(): void {
		$email = 'penny@stardewvalley.edu';
		$config = new AppointmentConfig();

		$this->mailer->expects(self::once())
			->method('validateMailAddress')
			->with($email)
			->willReturn(true);
		$this->apptService->expects(self::once())
			->method('findByToken')
			->willReturn($config);
		$this->bookingService->expects(self::once())
			->method('book')
			->with($config, 1, 1, 'Europe/Berlin', 'Test', $email, 'Test')
			->willThrowException(new NoSlotFoundException());

		$this->controller->bookSlot('abc123', 1, 1, 'Test', $email, 'Test', 'Europe/Berlin');
	}

	public function testBookInvalidBooking(): void {
		$email = 'penny@stardewvalley.edu';
		$config = new AppointmentConfig();

		$this->mailer->expects(self::once())
			->method('validateMailAddress')
			->with($email)
			->willReturn(true);
		$this->apptService->expects(self::once())
			->method('findByToken')
			->willReturn($config);
		$this->bookingService->expects(self::once())
			->method('book')
			->with($config, 1, 1, 'Europe/Berlin', 'Test', $email, 'Test')
			->willThrowException(new ServiceException());
		$this->systemConfig->expects(self::once())
			->method('getSystemValue')
			->with('debug')
			->willReturn(false);

		$this->controller->bookSlot('abc123', 1, 1, 'Test', $email, 'Test', 'Europe/Berlin');
	}

	public function testBookInvalidId(): void {
		$email = 'penny@stardewvalley.edu';
		$this->mailer->expects(self::once())
			->method('validateMailAddress')
			->with($email)
			->willReturn(true);
		$this->apptService->expects(self::once())
			->method('findByToken')
			->willThrowException(new ServiceException());
		$this->bookingService->expects(self::never())
			->method('book');

		$this->controller->bookSlot('abc123', 1, 1, 'Test', $email, 'Test', 'Europe/Berlin');
	}


	public function testBookInvalidEmail(): void {
		$email = 'testing-abcdef';

		$this->mailer->expects(self::once())
			->method('validateMailAddress')
			->with($email)
			->willReturn(false);
		$this->apptService->expects(self::never())
			->method('findByToken');
		$this->bookingService->expects(self::never())
			->method('book');

		$this->controller->bookSlot('abc123', 1, 1, 'Test', $email, 'Test', 'Europe/Berlin');
	}

	public function testShowConfirmBookingBookingNotFound(): void {
		$this->bookingService->expects(self::once())
			->method('findByToken')
			->with('tok')
			->willThrowException(new ClientException());
		$this->apptService->expects(self::never())
			->method('findById');
		$this->initialState->expects(self::never())
			->method('provideInitialState');

		$response = $this->controller->showConfirmBooking('tok');

		self::assertInstanceOf(TemplateResponse::class, $response);
		self::assertSame('appointments/404-booking', $response->getTemplateName());
	}

	public function testShowConfirmBookingConfigNotFound(): void {
		$booking = new Booking();
		$booking->setApptConfigId(42);
		$this->bookingService->expects(self::once())
			->method('findByToken')
			->willReturn($booking);
		$this->apptService->expects(self::once())
			->method('findById')
			->with(42)
			->willThrowException(new ClientException());
		$this->initialState->expects(self::never())
			->method('provideInitialState');

		$response = $this->controller->showConfirmBooking('tok');

		self::assertInstanceOf(TemplateResponse::class, $response);
		self::assertSame('appointments/404-booking', $response->getTemplateName());
	}

	public function testShowConfirmBooking(): void {
		$booking = new Booking();
		$booking->setApptConfigId(42);
		$config = new AppointmentConfig();
		$config->setToken('cfg-tok');
		$this->bookingService->expects(self::once())
			->method('findByToken')
			->with('tok')
			->willReturn($booking);
		$this->apptService->expects(self::once())
			->method('findById')
			->with(42)
			->willReturn($config);
		$this->urlGenerator->expects(self::once())
			->method('linkToRouteAbsolute')
			->with('calendar.appointment.show', ['token' => 'cfg-tok'])
			->willReturn('https://example.test/appt');
		$matcher = self::exactly(3);
		$this->initialState->expects($matcher)
			->method('provideInitialState')
			->willReturnCallback(function (string $key, $value) use ($matcher, $booking): void {
				match ($matcher->getInvocationCount()) {
					1 => self::assertSame(['appointment-link', 'https://example.test/appt'], [$key, $value]),
					2 => self::assertSame(['booking', $booking], [$key, $value]),
					3 => self::assertSame(['booking-token', 'tok'], [$key, $value]),
				};
			});

		$response = $this->controller->showConfirmBooking('tok');

		self::assertInstanceOf(TemplateResponse::class, $response);
		self::assertSame('appointments/confirmation', $response->getTemplateName());
	}

	public function testConfirmBookingNotFound(): void {
		$this->bookingService->expects(self::once())
			->method('findByToken')
			->with('tok')
			->willThrowException(new ClientException());
		$this->bookingService->expects(self::never())
			->method('confirmBooking');

		$response = $this->controller->confirmBooking('tok');

		self::assertInstanceOf(JsonResponse::class, $response);
		self::assertSame(Http::STATUS_NOT_FOUND, $response->getStatus());
	}

	public function testConfirmBookingAlreadyConfirmed(): void {
		$booking = new Booking();
		$booking->setApptConfigId(42);
		$booking->setConfirmed(true);
		$this->bookingService->expects(self::once())
			->method('findByToken')
			->willReturn($booking);
		$this->apptService->expects(self::never())
			->method('findById');
		$this->bookingService->expects(self::never())
			->method('confirmBooking');

		$response = $this->controller->confirmBooking('tok');

		self::assertInstanceOf(JsonResponse::class, $response);
		self::assertSame(Http::STATUS_OK, $response->getStatus());
		self::assertSame(['status' => 'success', 'data' => ['confirmed' => true]], $response->getData());
	}

	public function testConfirmBookingConfigNotFound(): void {
		$booking = new Booking();
		$booking->setApptConfigId(42);
		$this->bookingService->expects(self::once())
			->method('findByToken')
			->willReturn($booking);
		$this->apptService->expects(self::once())
			->method('findById')
			->with(42)
			->willThrowException(new ClientException());
		$this->bookingService->expects(self::never())
			->method('confirmBooking');

		$response = $this->controller->confirmBooking('tok');

		self::assertInstanceOf(JsonResponse::class, $response);
		self::assertSame(Http::STATUS_NOT_FOUND, $response->getStatus());
	}

	public function testConfirmBookingSlotUnavailable(): void {
		$booking = new Booking();
		$booking->setApptConfigId(42);
		$config = new AppointmentConfig();
		$this->bookingService->expects(self::once())
			->method('findByToken')
			->willReturn($booking);
		$this->apptService->expects(self::once())
			->method('findById')
			->willReturn($config);
		$this->bookingService->expects(self::once())
			->method('confirmBooking')
			->with($booking, $config)
			->willThrowException(new NoSlotFoundException());

		$response = $this->controller->confirmBooking('tok');

		self::assertInstanceOf(JsonResponse::class, $response);
		self::assertSame(Http::STATUS_CONFLICT, $response->getStatus());
		self::assertSame(['status' => 'fail', 'data' => 'slot_unavailable'], $response->getData());
	}

	public function testConfirmBookingClientError(): void {
		$booking = new Booking();
		$booking->setApptConfigId(42);
		$config = new AppointmentConfig();
		$this->bookingService->expects(self::once())
			->method('findByToken')
			->willReturn($booking);
		$this->apptService->expects(self::once())
			->method('findById')
			->willReturn($config);
		$this->bookingService->expects(self::once())
			->method('confirmBooking')
			->willThrowException(new ClientException());

		$response = $this->controller->confirmBooking('tok');

		self::assertInstanceOf(JsonResponse::class, $response);
		self::assertSame(Http::STATUS_UNPROCESSABLE_ENTITY, $response->getStatus());
	}

	public function testConfirmBooking(): void {
		$booking = new Booking();
		$booking->setApptConfigId(42);
		$config = new AppointmentConfig();
		$confirmed = new Booking();
		$confirmed->setConfirmed(true);
		$this->bookingService->expects(self::once())
			->method('findByToken')
			->willReturn($booking);
		$this->apptService->expects(self::once())
			->method('findById')
			->willReturn($config);
		$this->bookingService->expects(self::once())
			->method('confirmBooking')
			->with($booking, $config)
			->willReturn($confirmed);

		$response = $this->controller->confirmBooking('tok');

		self::assertInstanceOf(JsonResponse::class, $response);
		self::assertSame(Http::STATUS_OK, $response->getStatus());
		self::assertSame(['status' => 'success', 'data' => ['confirmed' => true]], $response->getData());
	}
}
