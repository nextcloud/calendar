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

use OC\Calendar\CalendarQuery;
use OCA\Calendar\Db\AppointmentConfigMapper;
use OCP\Calendar\IManager;

class BookingService {

	/** @var IManager */
	private $manager;

	/** @var AppointmentConfigMapper */
	private $mapper;

	public function __construct(IManager $manager,
	AppointmentConfigMapper $mapper) {
		$this->manager = $manager;
		$this->mapper = $mapper;
	}

	// CREATE
	public function book(string $calendarData) {
		// use new ICreateFromString::create method
	}

	public function getBookingInformation(string $token) {
		// unmarshal token for ID would be an option too
		// this also returns all bookings for this token
		// needs a unique identifier - X-NC-USERID or something?
		$config = $this->mapper->findByToken($token);
		$query = $this->manager->newQuery($config->getPrincipalUri());
		$query->addSearchCalendar($config->getTargetCalendarUri());
		return $this->manager->searchForPrincipal($query);
	}

	public function getSlots(Booking $booking): array {
		$bookedSlots = $this->findBookedSlotsAmount($booking);

		// negotiate available slots
		if ($booking->getAvailableSlotsAmount($bookedSlots) <= 0) {
			return [];
		}

		// decide if we want to use the complete 24 hour period to intersect via:
		// $booking->generateSlots();
		// Remove unavailable slots via comparing with RRule
		$booking->parseRRule();

		// remove conflicting slots via calendar free busy
		$booking = $this->getCalendarFreeTimeblocks($booking);
		return $booking->getSlots();
	}

	/**
	 * @param Booking $booking
	 * @return Booking
	 *
	 * Check if slot is conflicting with existing appointments
	 */
	public function getCalendarFreeTimeblocks(Booking $booking): Booking {
		$query = $this->manager->newQuery($booking->getAppointmentConfig()->getPrincipalUri());
		$query->addSearchCalendar($booking->getAppointmentConfig()->getTargetCalendarUri());

		if (!empty($booking->getAppointmentConfig()->getCalendarFreebusyUris())) {
			foreach ($booking->getAppointmentConfig()->getCalendarFreebusyUris() as $uri) {
				$query->addSearchCalendar($uri);
			}
		}

		$slots = $booking->getSlots();
		foreach ($slots as $k => $slot) {
			$query->setTimerangeStart($slot->getStartTimeDTObj());
			$query->setTimerangeEnd($slot->getEndTimeDTObj());
			// cache the query maybe? or maybe run everything at once?
			$events = $this->manager->searchForPrincipal($query);
			if (!empty($events)) {
				unset($slots[$k]);
			}
		}
		$booking->setSlots($slots);
		return $booking;
	}

	public function findBookedSlotsAmount(Booking $booking): int {
		/** @var CalendarQuery $query */
		$query = $this->manager->newQuery($booking->getAppointmentConfig()->getPrincipalUri());
		$query->addSearchCalendar($booking->getAppointmentConfig()->getTargetCalendarUri());
		$query->addSearchProperty('X-NC-APPOINTMENT');
		$query->setSearchPattern($booking->getAppointmentConfig()->getToken());
		$query->setTimerangeStart($booking->getStartTimeDTObj());
		$query->setTimerangeEnd($booking->getEndTimeDTObj());
		$events = $this->manager->searchForPrincipal($query);
		return count($events);
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
