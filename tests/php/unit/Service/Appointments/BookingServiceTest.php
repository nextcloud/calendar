<?php

declare(strict_types=1);
/**
 * SPDX-FileCopyrightText: 2021 Nextcloud GmbH and Nextcloud contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */
namespace OCA\Calendar\Tests\Unit\Service\Appointments;

use ChristophWurst\Nextcloud\Testing\TestCase;
use DateTimeImmutable;
use Exception;
use OCA\Calendar\Db\AppointmentConfig;
use OCA\Calendar\Db\Booking;
use OCA\Calendar\Db\BookingMapper;
use OCA\Calendar\Exception\ClientException;
use OCA\Calendar\Service\Appointments\AvailabilityGenerator;
use OCA\Calendar\Service\Appointments\BookingCalendarWriter;
use OCA\Calendar\Service\Appointments\BookingService;
use OCA\Calendar\Service\Appointments\DailyLimitFilter;
use OCA\Calendar\Service\Appointments\EventConflictFilter;
use OCA\Calendar\Service\Appointments\Interval;
use OCA\Calendar\Service\Appointments\MailService;
use OCA\Calendar\Service\Appointments\SlotExtrapolator;
use OCP\AppFramework\Db\DoesNotExistException;
use OCP\Calendar\ICalendarQuery;
use OCP\EventDispatcher\IEventDispatcher;
use OCP\IUser;
use OCP\Security\ISecureRandom;
use PHPUnit\Framework\MockObject\MockObject;
use Psr\Log\LoggerInterface;

class BookingServiceTest extends TestCase {
	/** @var AvailabilityGenerator|MockObject */
	private $availabilityGenerator;

	/** @var SlotExtrapolator|MockObject */
	private $extrapolator;

	/** @var DailyLimitFilter|MockObject */
	private $dailyLimitFilter;

	/** @var EventConflictFilter|MockObject */
	private $eventConflictFilter;

	/** @var BookingCalendarWriter|MockObject */
	private $bookingCalendarWriter;

	/** @var BookingMapper|MockObject */
	private $bookingMapper;

	/** @var ISecureRandom|MockObject */
	private $random;

	/** @var MailService|MockObject */
	private $mailService;

	/** @var IEventDispatcher|MockObject */
	private $eventDispatcher;

	/** @var MockObject|LoggerInterface */
	private $logger;

	/** @var BookingService */
	private $service;

	protected function setUp(): void {
		parent::setUp();

		if (!interface_exists(ICalendarQuery::class)) {
			self::markTestIncomplete();
		}

		$this->availabilityGenerator = $this->createMock(AvailabilityGenerator::class);
		$this->extrapolator = $this->createMock(SlotExtrapolator::class);
		$this->dailyLimitFilter = $this->createMock(DailyLimitFilter::class);
		$this->eventConflictFilter = $this->createMock(EventConflictFilter::class);
		$this->bookingMapper = $this->createMock(BookingMapper::class);
		$this->bookingCalendarWriter = $this->createMock(BookingCalendarWriter::class);
		$this->random = $this->createMock(ISecureRandom::class);
		$this->mailService = $this->createMock(MailService::class);
		$this->eventDispatcher = $this->createMock(IEventDispatcher::class);
		$this->logger = $this->createMock(LoggerInterface::class);

		$this->service = new BookingService(
			$this->availabilityGenerator,
			$this->extrapolator,
			$this->dailyLimitFilter,
			$this->eventConflictFilter,
			$this->bookingMapper,
			$this->bookingCalendarWriter,
			$this->random,
			$this->mailService,
			$this->eventDispatcher,
			$this->logger,
		);
	}

	public function testGetAvailableSlots(): void {
		$config = new AppointmentConfig();

		$this->availabilityGenerator->expects(self::once())
			->method('generate');
		$this->extrapolator->expects(self::once())
			->method('extrapolate');
		$this->dailyLimitFilter->expects(self::once())
			->method('filter');
		$this->eventConflictFilter->expects(self::once())
			->method('filter');

		$slots = $this->service->getAvailableSlots($config, 0, 100);
		self::assertEmpty($slots);
	}

	public function testBookInvalid(): void {
		$this->expectException(ClientException::class);
		$this->service->book(new AppointmentConfig(), 0, 0, 'sjf', 'Test', 'test@test.com', 'Test');
	}

	public function testBookInvalidTimestamp(): void {
		$intervals = [];
		$this->availabilityGenerator->expects(self::once())
			->method('generate')
			->willReturn($intervals);
		$this->extrapolator->expects(self::once())
			->method('extrapolate')
			->willReturnArgument(1);
		$this->dailyLimitFilter->expects(self::once())
			->method('filter')
			->willReturnArgument(1);
		$this->eventConflictFilter->expects(self::once())
			->method('filter')
			->willReturnArgument(1);
		$this->random->expects(self::never())
			->method('generate');

		$this->expectException(ClientException::class);
		$this->service->book(new AppointmentConfig(), 4054546654, 44545454, 'Europe/Vienna', 'Test', 'test@test.com', 'Test');
	}

	public function testBookInvalidTimezone(): void {
		$intervals = [
			new Interval(1891378800, 1891382400),
			new Interval(1891382400, 1891386000),
			new Interval(1891386000, 1891389600)
		];
		$this->availabilityGenerator->expects(self::once())
			->method('generate')
			->willReturn($intervals);
		$this->extrapolator->expects(self::once())
			->method('extrapolate')
			->willReturnArgument(1);
		$this->dailyLimitFilter->expects(self::once())
			->method('filter')
			->willReturnArgument(1);
		$this->eventConflictFilter->expects(self::once())
			->method('filter')
			->willReturnArgument(1);
		$this->random->expects(self::never())
			->method('generate');

		$this->expectException(Exception::class);
		$this->service->book(new AppointmentConfig(), 4054546654, 44545454, 'Nighttime/DAYTIME!', 'Test', 'test@test.com', 'Test');
	}

	public function testBook(): void {
		$start = (new DateTimeImmutable('now'))->setTimestamp(1891382400);
		$end = (new DateTimeImmutable('now'))->setTimestamp(1891386000);
		$intervals = [
			new Interval(1891378800, 1891382400),
			new Interval(1891382400, 1891386000),
			new Interval(1891386000, 1891389600)
		];

		$this->availabilityGenerator->expects(self::once())
			->method('generate')
			->willReturn($intervals);
		$this->extrapolator->expects(self::once())
			->method('extrapolate')
			->willReturnArgument(1);
		$this->dailyLimitFilter->expects(self::once())
			->method('filter')
			->willReturnArgument(1);
		$this->eventConflictFilter->expects(self::once())
			->method('filter')
			->willReturnArgument(1);
		$this->bookingMapper->expects(self::once())
			->method('insert');
		$this->mailService->expects(self::once())
			->method('sendConfirmationEmail');
		$this->random->expects(self::once())
			->method('generate')
			->with(32, 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789')
			->willReturn('abc');

		$this->service->book(new AppointmentConfig(), $start->getTimestamp(), $end->getTimestamp(), 'Europe/Berlin', 'Test', 'test@test.com');
	}

	public function testConfirmBooking(): void {
		$booking = new Booking();
		$booking->setStart(1891378800);
		$booking->setEnd(1891382400);
		$booking->setTimezone('Europe/Vienna');
		$booking->setDisplayName('Test');
		$booking->setDescription('Testing');
		$booking->setEmail('anna@banana.com');
		$config = new AppointmentConfig();
		$interval = [
			new Interval(1891378800, 1891382400)
		];

		$this->availabilityGenerator->expects(self::once())
			->method('generate')
			->willReturn($interval);
		$this->extrapolator->expects(self::once())
			->method('extrapolate')
			->willReturnArgument(1);
		$this->dailyLimitFilter->expects(self::once())
			->method('filter')
			->willReturnArgument(1);
		$this->eventConflictFilter->expects(self::once())
			->method('filter')
			->willReturnArgument(1);
		$this->bookingCalendarWriter->expects(self::once())
			->method('write')
			->willReturn('abc');
		$this->bookingMapper->expects(self::once())
			->method('update');
		$this->mailService->expects(self::once())
			->method('sendBookingInformationEmail')
			->with($booking, $config, 'abc');

		$this->service->confirmBooking($booking, $config);
	}

	public function testConfirmBookingNoSlot(): void {
		$booking = new Booking();
		$booking->setStart(1891378800);
		$booking->setEnd(1891382400);
		$config = new AppointmentConfig();
		$interval = [];

		$this->availabilityGenerator->expects(self::once())
			->method('generate')
			->willReturn($interval);
		$this->extrapolator->expects(self::once())
			->method('extrapolate')
			->willReturnArgument(1);
		$this->dailyLimitFilter->expects(self::once())
			->method('filter')
			->willReturnArgument(1);
		$this->eventConflictFilter->expects(self::once())
			->method('filter')
			->willReturnArgument(1);
		$this->bookingCalendarWriter->expects(self::never())
			->method('write');
		$this->bookingMapper->expects(self::never())
			->method('delete');
		$this->mailService->expects(self::never())
			->method('sendBookingInformationEmail');

		$this->expectException(ClientException::class);
		$this->service->confirmBooking($booking, $config);
	}

	public function testFindByToken() {
		$token = 'test';

		$this->bookingMapper->expects(self::once())
			->method('findByToken')
			->with($token)
			->willReturn(new Booking());

		$this->service->findByToken($token);
	}

	public function testFindByTokenNoToken() {
		$token = 'iDontExists';

		$this->bookingMapper->expects(self::once())
			->method('findByToken')
			->with($token)
			->willThrowException(new DoesNotExistException(''));

		$this->expectException(ClientException::class);
		$this->service->findByToken($token);
	}

	public function testDeleteByUser(): void {
		$user = $this->createMock(IUser::class);
		$user->method('getUid')->willReturn('user123');
		$this->bookingMapper->expects(self::once())
			->method('deleteByUserId')
			->with('user123');

		$this->service->deleteByUser($user);
	}

	public function testDeleteOutdated(): void {
		$this->bookingMapper->expects(self::once())
			->method('deleteOutdated')
			->with(24 * 60 * 60)
			->willReturn(1);

		$this->service->deleteOutdated();
	}
}
