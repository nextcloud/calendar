<?php

declare(strict_types=1);
/**
 * Calendar App
 *
 * @copyright 2021 Anna Larch <anna.larch@gmx.net>
 *
 * @author Anna Larch <anna.larch@gmx.net>
 *
 * This library is free software; you can redistribute it and/or
 * modify it under the terms of the GNU AFFERO GENERAL PUBLIC LICENSE
 * License as published by the Free Software Foundation; either
 * version 3 of the License, or any later version.
 *
 * This library is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU AFFERO GENERAL PUBLIC LICENSE for more details.
 *
 * You should have received a copy of the GNU Affero General Public
 * License along with this library.  If not, see <http://www.gnu.org/licenses/>.
 *
 */
namespace OCA\Calendar\Controller;

use ChristophWurst\Nextcloud\Testing\TestCase;
use DateTime;
use DateTimeZone;
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
use Safe\DateTimeImmutable;

class BookingControllerTest extends TestCase {
	/** @var string */
	protected $appName;

	/** @var IRequest|MockObject */
	protected $request;

	/** @var IManager|MockObject */
	protected $manager;

	/** @var IInitialStateService|MockObject */
	protected $initialState;

	/** @var IUser|MockObject  */
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

	/** @var IConfig|MockObject  */
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
		$start = time();
		$tz = new DateTimeZone('Europe/Berlin');
		$startDate = (new DateTimeImmutable("@$start"));
		$sDT = (new DateTime($startDate->format('Y-m-d'), $tz))
			->getTimestamp();
		$eDT = (new DateTime($startDate->format('Y-m-d'), $tz))
			->modify('+1 day')
			->getTimestamp();

		$apptConfg = new AppointmentConfig();
		$apptConfg->setId(1);
		$this->time->expects(self::once())
			->method('getTime')
			->willReturn($start);
		$this->apptService->expects(self::once())
			->method('findById')
			->with(1)
			->willReturn($apptConfg);
		$this->bookingService->expects(self::once())
			->method('getAvailableSlots')
			->with($apptConfg, $sDT, $eDT);

		$this->controller->getBookableSlots($apptConfg->getId(), $start, 'Europe/Berlin');
	}

	public function testGetBookableSlotsDatesInPast(): void {
		$start = time();
		$fakeFutureTimestamp = time() + (100 * 24 * 60 * 60);
		$apptConfg = new AppointmentConfig();
		$apptConfg->setId(1);
		$this->time->expects(self::once())
			->method('getTime')
			->willReturn($fakeFutureTimestamp);
		$this->apptService->expects(self::never())
			->method('findById')
			->with(1);
		$this->bookingService->expects(self::never())
			->method('getAvailableSlots');
		$this->logger->expects(self::once())
			->method('warning');

		$this->controller->getBookableSlots($apptConfg->getId(), $start, 'Europe/Berlin');
	}

	public function testGetBookableSlotsInvalidTimezone(): void {
		$start = time();
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

		$this->controller->getBookableSlots($apptConfg->getId(), $start, 'Hook/Neverland');
	}

	public function testGetBookableSlotsTimezoneIdentical(): void {
		$now = (new DateTime('2024-6-30 8:00:00'))->getTimestamp();
		$start = (new DateTime('2024-7-1 04:00:00'))->getTimestamp(); // Start date with America/Toronto offset
		$timezone = 'America/Toronto';
		$sDT = (new DateTime('2024-7-1 04:00:00'))->getTimestamp();
		$eDT = (new DateTime('2024-7-2 04:00:00'))->getTimestamp();

		$apptConfg = new AppointmentConfig();
		$apptConfg->setId(1);
		$this->time->expects(self::once())
			->method('getTime')
			->willReturn($now);
		$this->apptService->expects(self::once())
			->method('findById')
			->with(1)
			->willReturn($apptConfg);
		$this->bookingService->expects(self::once())
			->method('getAvailableSlots')
			->with($apptConfg, $sDT, $eDT);

		$this->controller->getBookableSlots($apptConfg->getId(), $start, $timezone);
	}

	public function testGetBookableSlotsTimezoneMinus10(): void {
		$now = (new DateTime('2024-6-30 8:00:00'))->getTimestamp();
		$start = (new DateTime('2024-7-1 4:00:00'))->getTimestamp(); // Start date with America/Toronto offset
		$timezone = 'Pacific/Pago_Pago';
		$sDT = (new DateTime('2024-7-1 11:00:00'))->getTimestamp();
		$eDT = (new DateTime('2024-7-2 11:00:00'))->getTimestamp();

		$apptConfg = new AppointmentConfig();
		$apptConfg->setId(1);
		$this->time->expects(self::once())
			->method('getTime')
			->willReturn($now);
		$this->apptService->expects(self::once())
			->method('findById')
			->with(1)
			->willReturn($apptConfg);
		$this->bookingService->expects(self::once())
			->method('getAvailableSlots')
			->with($apptConfg, $sDT, $eDT);

		$this->controller->getBookableSlots($apptConfg->getId(), $start, $timezone);
	}

	public function testGetBookableSlotsTimezonePlus10(): void {
		$now = (new DateTime('2024-6-30 8:00:00'))->getTimestamp();
		$start = (new DateTime('2024-7-1 4:00:00'))->getTimestamp(); // Start date with America/Toronto offset
		$timezone = 'Australia/Sydney';
		$sDT = (new DateTime('2024-6-30 14:00:00'))->getTimestamp();
		$eDT = (new DateTime('2024-7-1 14:00:00'))->getTimestamp();

		$apptConfg = new AppointmentConfig();
		$apptConfg->setId(1);
		$this->time->expects(self::once())
			->method('getTime')
			->willReturn($now);
		$this->apptService->expects(self::once())
			->method('findById')
			->with(1)
			->willReturn($apptConfg);
		$this->bookingService->expects(self::once())
			->method('getAvailableSlots')
			->with($apptConfg, $sDT, $eDT);

		$this->controller->getBookableSlots($apptConfg->getId(), $start, $timezone);
	}

	public function testGetBookableSlotsTimezonePlus14(): void {
		$now = (new DateTime('2024-6-30 8:00:00'))->getTimestamp();
		$start = (new DateTime('2024-7-1 4:00:00'))->getTimestamp(); // Start date with America/Toronto offset
		$timezone = 'Pacific/Kiritimati';
		$sDT = (new DateTime('2024-6-30 10:00:00'))->getTimestamp();
		$eDT = (new DateTime('2024-7-1 10:00:00'))->getTimestamp();

		$apptConfg = new AppointmentConfig();
		$apptConfg->setId(1);
		$this->time->expects(self::once())
			->method('getTime')
			->willReturn($now);
		$this->apptService->expects(self::once())
			->method('findById')
			->with(1)
			->willReturn($apptConfg);
		$this->bookingService->expects(self::once())
			->method('getAvailableSlots')
			->with($apptConfg, $sDT, $eDT);

		$this->controller->getBookableSlots($apptConfg->getId(), $start, $timezone);
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
