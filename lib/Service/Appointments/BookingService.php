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

use DateTimeImmutable;
use OCA\Calendar\Db\AppointmentConfig;
use OCA\Calendar\Exception\ServiceException;

class BookingService {

	/** @var AvailabilityGenerator */
	private $availabilityGenerator;

	/** @var SlotExtrapolator */
	private $extrapolator;

	/** @var DailyLimitFilter */
	private $dailyLimitFilter;

	/** @var EventConflictFilter */
	private $eventConflictFilter;

	/** @var BookingCalendarWriter */
	private $calendarWriter;

	public function __construct(AvailabilityGenerator $availabilityGenerator,
								SlotExtrapolator $extrapolator,
								DailyLimitFilter $dailyLimitFilter,
								EventConflictFilter $eventConflictFilter,
								BookingCalendarWriter $calendarWriter) {
		$this->availabilityGenerator = $availabilityGenerator;
		$this->extrapolator = $extrapolator;
		$this->dailyLimitFilter = $dailyLimitFilter;
		$this->eventConflictFilter = $eventConflictFilter;
		$this->calendarWriter = $calendarWriter;
	}

	/**
	 * @param AppointmentConfig $config
	 * @param DateTimeImmutable $startTimeInTz
	 * @param DateTimeImmutable $endTimeInTz
	 * @param int $start
	 * @param string $name
	 * @param string $email
	 * @param string $description
	 *
	 * @return Interval
	 *
	 * @throws ServiceException
	 */
	public function book(AppointmentConfig $config, DateTimeImmutable $startTimeInTz, DateTimeImmutable $endTimeInTz, int $start, string $name, string $email, string $description): Interval {
		$slots = $this->getAvailableSlots($config, $startTimeInTz->getTimestamp(), $endTimeInTz->getTimestamp());
		/** @var Interval $bookingSlot */
		$bookingSlot = current(array_filter($slots, static function ($slot) use ($start) {
			return $slot->getStart() === $start;
		}));

		if (!$bookingSlot) {
			throw new ServiceException('Could not find slot for booking');
		}

		$start = $startTimeInTz->setTimestamp($start);

		if(!$start) {
			throw new ServiceException('Could not create booking slot for this time');
		}
		// Pass the $startTimeInTz to get the Timezone for the booker
		$this->calendarWriter->write($config, $start, $name, $email, $description);

		return $bookingSlot;
	}

	/**
	 * @return Interval[]
	 */
	public function getAvailableSlots(AppointmentConfig $config, int $startTime, int $endTime): array {
		// 1. Build intervals at which slots may be booked
		$availabilityIntervals = $this->availabilityGenerator->generate($config, $startTime, $endTime);
		// 2. Generate all possible slots
		$allPossibleSlots = $this->extrapolator->extrapolate($config, $availabilityIntervals);
		// 3. Filter out the daily limits
		$filteredByDailyLimit = $this->dailyLimitFilter->filter($config, $allPossibleSlots);
		// 4. Filter out booking conflicts
		$filteredByConflict = $this->eventConflictFilter->filter($config, $filteredByDailyLimit);

		return $filteredByConflict;
	}

	// Update
	public function updateBooking() {
		// noop for now? we don't support a public update method at the moment
	}

	// Delete
	public function delete() {
		// this would be a cancel request to ICreateFromString::create()
	}
}
