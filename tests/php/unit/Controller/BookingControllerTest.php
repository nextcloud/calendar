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
use OCA\Calendar\Exception\NoSlotFoundException;
use OCA\Calendar\Exception\ServiceException;
use OCA\Calendar\Service\Appointments\AppointmentConfigService;
use OCA\Calendar\Service\Appointments\BookingService;
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

	/** @var AppointmentConfigController */
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
		$this->time->expects(self::once())
			->method('getTime')
			->willReturn($currentDate);
		$this->apptService->expects(self::once())
			->method('findById')
			->with(1)
			->willReturn($apptConfg);
		$this->bookingService->expects(self::once())
			->method('getAvailableSlots')
			->with($apptConfg, $sDT, $eDT);

		$this->controller->getBookableSlots($apptConfg->getId(), $selectedDate, $selectedTz);
	}

	public function testGetBookableSlotsDatesInPast(): void {
		$currentDate = (new DateTime('2024-7-2'))->getTimestamp();
		$selectedDate = '2024-7-1';
		$apptConfg = new AppointmentConfig();
		$apptConfg->setId(1);
		$this->time->expects(self::once())
			->method('getTime')
			->willReturn($currentDate);
		$this->apptService->expects(self::never())
			->method('findById')
			->with(1);
		$this->bookingService->expects(self::never())
			->method('getAvailableSlots');
		$this->logger->expects(self::once())
			->method('warning');

		$this->controller->getBookableSlots($apptConfg->getId(), $selectedDate, 'Europe/Berlin');
	}

	public function testGetBookableSlotsInvalidTimezone(): void {
		$selectedDate = '2024-7-1';
		$apptConfg = new AppointmentConfig();
		$apptConfg->setId(1);
		$this->time->expects(self::never())
			->method('getTime');
		$this->apptService->expects(self::never())
			->method('findById')
			->with(1);
		$this->bookingService->expects(self::never())
			->method('getAvailableSlots');
		$this->expectException(Exception::class);

		$this->controller->getBookableSlots($apptConfg->getId(), $selectedDate, 'Hook/Neverland');
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
		$this->time->expects(self::once())
			->method('getTime')
			->willReturn($currentDate);
		$this->apptService->expects(self::once())
			->method('findById')
			->with(1)
			->willReturn($apptConfg);
		$this->bookingService->expects(self::once())
			->method('getAvailableSlots')
			->with($apptConfg, $sDT, $eDT);

		$this->controller->getBookableSlots($apptConfg->getId(), $selectedDate, $selectedTz);
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
		$this->time->expects(self::once())
			->method('getTime')
			->willReturn($currentDate);
		$this->apptService->expects(self::once())
			->method('findById')
			->with(1)
			->willReturn($apptConfg);
		$this->bookingService->expects(self::once())
			->method('getAvailableSlots')
			->with($apptConfg, $sDT, $eDT);

		$this->controller->getBookableSlots($apptConfg->getId(), $selectedDate, $timezone);
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
		$this->time->expects(self::once())
			->method('getTime')
			->willReturn($currentDate);
		$this->apptService->expects(self::once())
			->method('findById')
			->with(1)
			->willReturn($apptConfg);
		$this->bookingService->expects(self::once())
			->method('getAvailableSlots')
			->with($apptConfg, $sDT, $eDT);

		$this->controller->getBookableSlots($apptConfg->getId(), $selectedDate, $timezone);
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
		$this->time->expects(self::once())
			->method('getTime')
			->willReturn($currentDate);
		$this->apptService->expects(self::once())
			->method('findById')
			->with(1)
			->willReturn($apptConfg);
		$this->bookingService->expects(self::once())
			->method('getAvailableSlots')
			->with($apptConfg, $sDT, $eDT);

		$this->controller->getBookableSlots($apptConfg->getId(), $selectedDate, $timezone);
	}

	public function testBook(): void {
		$email = 'penny@stardewvalley.edu';
		$config = new AppointmentConfig();

		$this->mailer->expects(self::once())
			->method('validateMailAddress')
			->with($email)
			->willReturn(true);
		$this->apptService->expects(self::once())
			->method('findById')
			->willReturn($config);
		$this->bookingService->expects(self::once())
			->method('book')
			->with($config, 1, 1, 'Hook/Neverland', 'Test', $email, 'Test')
			->willReturn(new Booking());

		$this->controller->bookSlot(1, 1, 1, 'Test', $email, 'Test', 'Hook/Neverland');
	}


	public function testBookInvalidTimeZone(): void {
		$email = 'penny@stardewvalley.edu';
		$config = new AppointmentConfig();

		$this->mailer->expects(self::once())
			->method('validateMailAddress')
			->with($email)
			->willReturn(true);
		$this->apptService->expects(self::once())
			->method('findById')
			->willReturn($config);
		$this->bookingService->expects(self::once())
			->method('book')
			->with($config, 1, 1, 'Hook/Neverland', 'Test', $email, 'Test')
			->willThrowException(new InvalidArgumentException());

		$this->controller->bookSlot(1, 1, 1, 'Test', $email, 'Test', 'Hook/Neverland');
	}

	public function testBookInvalidSlot(): void {
		$email = 'penny@stardewvalley.edu';
		$config = new AppointmentConfig();

		$this->mailer->expects(self::once())
			->method('validateMailAddress')
			->with($email)
			->willReturn(true);
		$this->apptService->expects(self::once())
			->method('findById')
			->willReturn($config);
		$this->bookingService->expects(self::once())
			->method('book')
			->with($config, 1, 1, 'Europe/Berlin', 'Test', $email, 'Test')
			->willThrowException(new NoSlotFoundException());

		$this->controller->bookSlot(1, 1, 1, 'Test', $email, 'Test', 'Europe/Berlin');
	}

	public function testBookInvalidBooking(): void {
		$email = 'penny@stardewvalley.edu';
		$config = new AppointmentConfig();

		$this->mailer->expects(self::once())
			->method('validateMailAddress')
			->with($email)
			->willReturn(true);
		$this->apptService->expects(self::once())
			->method('findById')
			->willReturn($config);
		$this->bookingService->expects(self::once())
			->method('book')
			->with($config, 1, 1, 'Europe/Berlin', 'Test', $email, 'Test')
			->willThrowException(new ServiceException());
		$this->systemConfig->expects(self::once())
			->method('getSystemValue')
			->with('debug')
			->willReturn(false);

		$this->controller->bookSlot(1, 1, 1, 'Test', $email, 'Test', 'Europe/Berlin');
	}

	public function testBookInvalidId(): void {
		$email = 'penny@stardewvalley.edu';
		$this->mailer->expects(self::once())
			->method('validateMailAddress')
			->with($email)
			->willReturn(true);
		$this->apptService->expects(self::once())
			->method('findById')
			->willThrowException(new ServiceException());
		$this->bookingService->expects(self::never())
			->method('book');

		$this->controller->bookSlot(1, 1, 1, 'Test', $email, 'Test', 'Europe/Berlin');
	}


	public function testBookInvalidEmail(): void {
		$email = 'testing-abcdef';

		$this->mailer->expects(self::once())
			->method('validateMailAddress')
			->with($email)
			->willReturn(false);
		$this->apptService->expects(self::never())
			->method('findById');
		$this->bookingService->expects(self::never())
			->method('book');

		$this->controller->bookSlot(1, 1, 1, 'Test', $email, 'Test', 'Europe/Berlin');
	}
}
