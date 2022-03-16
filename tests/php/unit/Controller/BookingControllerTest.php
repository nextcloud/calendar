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
		$this->controller = new BookingController(
			$this->appName,
			$this->request,
			$this->time,
			$this->initialState,
			$this->bookingService,
			$this->apptService,
			$this->urlGenerator,
			$this->logger,
			$this->mailer
		);
	}

	public function testGetBookableSlots(): void {
		$start = time();
		$tz = new DateTimeZone('Europe/Berlin');
		$sDT = (new DateTimeImmutable())
			->setTimestamp($start)
			->setTimezone($tz)
			->setTime(0, 0)
			->getTimestamp();
		$eDT = (new DateTimeImmutable())
			->setTimestamp($start)
			->setTimezone($tz)
			->setTime(23, 59, 59)
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

		$this->controller->getBookableSlots($apptConfg->getId(), $start,'Europe/Berlin');
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

		$this->controller->getBookableSlots($apptConfg->getId(), $start,'Europe/Berlin');
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
