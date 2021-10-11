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
use OC\Calendar\Manager;
use OCA\Calendar\Db\AppointmentConfig;
use OCA\Calendar\Db\AppointmentConfigMapper;
use OCA\Calendar\Exception\ServiceException;
use OCP\AppFramework\Db\DoesNotExistException;
use OCP\AppFramework\Db\MultipleObjectsReturnedException;
use OCP\Calendar\IManager;
use OCP\DB\Exception as DbException;
use Safe\DateTime;

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
	public function book() {
		// stub
	}

	public function getBookingInformation(){

	}

	public function getSlots(Booking $booking): array {
		$bookedSlots = $this->findBookedSlotsAmount($booking);

		// negotiate available slots
		if($booking->getAvailableSlotsAmount($bookedSlots) <= 0) {
			return [];
		}

     	// Remove unavailable slots via comparing with RRule
		$booking->generateSlots();


		// remove conflicting slots via calendar free busy
		$booking = $this->getCalendarFreeTimeblocks($booking);

		$slots = [new Slot(1,1)];
		return $slots; // make a DTO out of this
	}

	/**
	 * @param int $time
	 * @param string $outboxUri
	 * @param array $freeBusyUris
	 * @return [][]
	 *
	 * Check if slot is conflicting with existing appointments
	 */
	public function getCalendarFreeTimeblocks(Booking $booking): Booking {
		$query = $this->manager->newQuery($booking->getAppointmentConfig()->getPrincipalUri());
		$query->setSearchCalendar($booking->getAppointmentConfig()->getTargetCalendarUri());

		if(!empty($booking->getAppointmentConfig()->getCalendarFreebusyUris())) {
			foreach ($booking->getAppointmentConfig()->getCalendarFreebusyUris() as $uri) {
				$query->setSearchCalendar($uri);
			}
		}

		/** @var Slot $slot */
		$slots = $booking->getSlots();
		foreach($slots as $k => $slot) {
			$query->setTimerangeStart($slot->getStartTimeDTObj());
			$query->setTimerangeEnd($slot->getEndTimeDTObj());
			// cache the query maybe? or maybe run everything at once?
			$events = $this->manager->searchForPrincipal($query);
			if(!empty($events)) {
				unset($slots[$k]);
			}
		}
		$booking->setSlots($slots);

		return $booking;
	}

	public function findBookedSlotsAmount(Booking $booking): int {
		/** @var CalendarQuery $query */
		$query = $this->manager->newQuery($booking->getAppointmentConfig()->getPrincipalUri());
		$query->setSearchCalendar($booking->getAppointmentConfig()->getTargetCalendarUri());
		$query->searchAppointments();
		$query->setSearchPattern($booking->getAppointmentConfig()->getToken());
		$query->setTimerangeStart($booking->getStartTimeDTObj());
		$query->setTimerangeEnd($booking->getEndTimeDTObj());
		$events = $this->manager->searchForPrincipal($query);
		return count($events);
	}

	// Update
	public function updateBooking(){

	}

	// Delete
	public function delete(){

	}





}
