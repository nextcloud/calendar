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
use DateTimeZone;
use OCA\Calendar\Db\AppointmentConfig;
use OCA\Calendar\Db\AppointmentConfigMapper;
use OCA\Calendar\Db\Booking;
use OCA\Calendar\Db\BookingMapper;
use OCA\Calendar\Exception\ClientException;
use OCA\Calendar\Exception\ServiceException;
use OCP\AppFramework\Db\DoesNotExistException;
use OCP\AppFramework\Db\MultipleObjectsReturnedException;
use OCP\DB\Exception;
use OCP\Security\ISecureRandom;

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
	/** @var BookingMapper */
	private $bookingMapper;

	/** @var AppointmentConfigMapper */
	private $appointmentConfigMapper;
	/** @var ISecureRandom */
	private $random;

	public function __construct(AvailabilityGenerator $availabilityGenerator,
								SlotExtrapolator $extrapolator,
								DailyLimitFilter $dailyLimitFilter,
								EventConflictFilter $eventConflictFilter,
								AppointmentConfigMapper $appointmentConfigMapper,
								BookingMapper $bookingMapper,
								BookingCalendarWriter $calendarWriter,
								ISecureRandom $random) {
		$this->availabilityGenerator = $availabilityGenerator;
		$this->extrapolator = $extrapolator;
		$this->dailyLimitFilter = $dailyLimitFilter;
		$this->eventConflictFilter = $eventConflictFilter;
		$this->calendarWriter = $calendarWriter;
		$this->bookingMapper = $bookingMapper;
		$this->appointmentConfigMapper = $appointmentConfigMapper;
		$this->random = $random;
	}

	/**
	 * @param string $token
	 * @return Interval
	 *
	 * @throws ClientException
	 * @throws Exception
	 * @throws MultipleObjectsReturnedException
	 */
	public function confirmBooking(string $token): Interval {
		// pretty sure this can move
		try {
			$booking = $this->bookingMapper->findByToken($token);
		} catch (DoesNotExistException $e) {
			throw new ClientException('Could not find the booking', 0, $e);
		}

		try {
			$config = $this->appointmentConfigMapper->findById($booking->getId());
		} catch (DoesNotExistException $e) {
			throw new ClientException('Could not find the booking', 0, $e);
		}

		// pass $config, start and end as before
		$slots = $this->getAvailableSlots($config, $booking->getStart(), $booking->getEnd());

		$start = $booking->getStart();
		/** @var Interval|false $bookingSlot */
		$bookingSlot = current(array_filter($slots, static function (Interval $slot) use ($start) {
			return $slot->getStart() === $start;
		}));

		if (!$bookingSlot) {
			throw new ClientException('Slot for bookin is not available any more');
		}

		$tz = new DateTimeZone($booking->getTimezone());
		$startObj = (new DateTimeImmutable())->setTimestamp($booking->getStart())->setTimezone($tz);
		if(!$startObj) {
			throw new ClientException('Could not make sense of booking times');
		}

		// Pass the $startTimeInTz to get the Timezone for the booker
		$this->calendarWriter->write($config, $startObj, $booking->getName(), $booking->getEmail(), $booking->getDescription());

		return $bookingSlot;
	}

	/**
	 * @param AppointmentConfig $config
	 * @param DateTimeImmutable $startTimeOfDayInTz
	 * @param DateTimeImmutable $endTimeOfDayInTz
	 * @param int $start
	 * @param string $name
	 * @param string $email
	 * @param string|null $description
	 *
	 * @return Interval
	 *
	 * @throws ClientException
	 */
	public function book(AppointmentConfig $config, DateTimeImmutable $startTimeOfDayInTz, DateTimeImmutable $endTimeOfDayInTz, int $start, string $name, string $email, ?string $description = null): Interval {
		$slots = $this->getAvailableSlots($config, $startTimeOfDayInTz->getTimestamp(), $endTimeOfDayInTz->getTimestamp());

		/** @var Interval|false $bookingSlot */
		$bookingSlot = current(array_filter($slots, static function (Interval $slot) use ($start) {
			return $slot->getStart() === $start;
		}));

		if (!$bookingSlot) {
			throw new ClientException('Could not find slot for booking');
		}

		// this can move probably? run the booking logic, return slot, set that as start and end time for the new Booking obj?
		$booking = new Booking();
		$booking->setApptConfigId($config->getId());
		$booking->setCreatedAt(time());
		$booking->setToken($this->random->generate(32, ISecureRandom::CHAR_ALPHANUMERIC));
		$booking->setName($name);
		$booking->setDescription($description);
		$booking->setEmail($email);
		$booking->setStart($start);
		$booking->setEnd($endTimeOfDayInTz->getTimestamp());
		$tz = $startTimeOfDayInTz->getTimezone()->getName();
		$booking->setTimezone($tz);
		try {
			$this->bookingMapper->insert($booking);
		} catch (Exception $e) {
			throw new ServiceException('Could not create booking');
		}
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
		return $this->eventConflictFilter->filter($config, $filteredByDailyLimit);
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
