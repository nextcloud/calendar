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
namespace OCA\Calendar\Service\Appointments;

use ChristophWurst\Nextcloud\Testing\ServiceMockObject;
use ChristophWurst\Nextcloud\Testing\TestCase;
use OC\Calendar\CalendarQuery;
use OC\Calendar\Manager;
use OCA\Calendar\Exception\ClientException;
use OCA\Calendar\Exception\ServiceException;
use OCA\DAV\CalDAV\CalDavBackend;
use OCA\DAV\CalDAV\CalendarProvider;
use OCA\Calendar\Db\AppointmentConfig;
use OCA\Calendar\Db\AppointmentConfigMapper;
use OCA\Files\App;
use PHPUnit\Framework\MockObject\MockObject;
use Safe\DateTimeImmutable;

class BookingServiceTest extends TestCase {

	/** @var AvailabilityGenerator|MockObject */
	private $availabilityGenerator;

	/** @var SlotExtrapolator|MockObject */
	private $extrapolator;

	/** @var DailyLimitFilter|MockObject */
	private $dailyLimitFilter;

	/** @var EventConflictFilter|MockObject */
	private $eventConflictFilter;

	/** @var BookingService */
	private $service;

	/** @var BookingCalendarWriter|MockObject */
	private $bookingCalendarWriter;

	protected function setUp(): void {
		parent::setUp();

		$this->availabilityGenerator = $this->createMock(AvailabilityGenerator::class);
		$this->extrapolator = $this->createMock(SlotExtrapolator::class);
		$this->dailyLimitFilter = $this->createMock(DailyLimitFilter::class);
		$this->eventConflictFilter = $this->createMock(EventConflictFilter::class);
		$this->bookingCalendarWriter = $this->createMock(BookingCalendarWriter::class);

		$this->service = new BookingService(
			$this->availabilityGenerator,
			$this->extrapolator,
			$this->dailyLimitFilter,
			$this->eventConflictFilter,
			$this->bookingCalendarWriter
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

		$slots = $this->service-> getAvailableSlots($config, 0, 100);
		self::assertEmpty($slots);
	}

	public function testBookInvalid(): void {
		$this->expectException(ClientException::class);
		$this->service->book(new AppointmentConfig(), new \DateTimeImmutable(), new \DateTimeImmutable(), time(), 'Test', 'test@test.com', 'Test');
	}

	public function testBookInvalidTimestamp(): void {
		$start = (new DateTimeImmutable('now'))->setTimestamp(1891382400);
		$end = (new DateTimeImmutable('now'))->setTimestamp(1891386000);
		$intervals = [
			new Interval(1891378800, 1891382400),
			new Interval(1891382400, 1891386000),
			new Interval(1891386000, 1891389600 )
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

		$this->expectException(ClientException::class);
		$this->service->book(new AppointmentConfig(), $start, $end, 0, 'Test', 'test@test.com', 'Test');
	}

	public function testBook(): void {
		$start = (new DateTimeImmutable('now'))->setTimestamp(1891382400);
		$end = (new DateTimeImmutable('now'))->setTimestamp(1891386000);
		$intervals = [
			new Interval(1891378800, 1891382400),
			new Interval(1891382400, 1891386000),
			new Interval(1891386000, 1891389600 )
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
		$this->bookingCalendarWriter->expects(self::once())
			->method('write');

		$this->service->book(new AppointmentConfig(), $start, $end, 1891382400, 'Test', 'test@test.com');
	}

}
