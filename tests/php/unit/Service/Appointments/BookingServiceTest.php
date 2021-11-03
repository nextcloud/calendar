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

use ChristophWurst\Nextcloud\Testing\TestCase;
use OCA\Calendar\Db\AppointmentConfig;
use PHPUnit\Framework\MockObject\MockObject;

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

	protected function setUp(): void {
		parent::setUp();

		$this->availabilityGenerator = $this->createMock(AvailabilityGenerator::class);
		$this->extrapolator = $this->createMock(SlotExtrapolator::class);
		$this->dailyLimitFilter = $this->createMock(DailyLimitFilter::class);
		$this->eventConflictFilter = $this->createMock(EventConflictFilter::class);

		$this->service = new BookingService(
			$this->availabilityGenerator,
			$this->extrapolator,
			$this->dailyLimitFilter,
			$this->eventConflictFilter,
		);
	}

	public function testGetAvailableSlots(): void {
		$config = new AppointmentConfig();

		$slots = $this->service->getAvailableSlots($config, 0, 100);

		self::assertEmpty($slots);
	}
}
