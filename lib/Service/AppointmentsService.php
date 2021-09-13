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
namespace OCA\Calendar\Service;

use OC\DatabaseException;
use OCA\Calendar\AppInfo\Application;
use OCA\Calendar\Db\Appointment;
use OCA\Calendar\Db\AppointmentMapper;
use OCA\Calendar\Exception\ServiceException;
use OCA\Calendar\Http\JsonResponse;
use OCP\AppFramework\Db\DoesNotExistException;
use OCP\AppFramework\Db\MultipleObjectsReturnedException;
use OCP\DB\Exception;
use OCP\IConfig;
use OCP\IUserSession;
use PHPUnit\Util\Json;

class AppointmentsService {

	/** @var AppointmentMapper */
	private $mapper;

	/**
	 * @param AppointmentMapper $mapper
	 */
	public function __construct(AppointmentMapper $mapper) {
		$this->mapper = $mapper;
	}

	/**
	 * @param string $user
	 * @return Appointment[]
	 */
	public function getAllAppointmentConfigurations(string $user): array {
		try {
			return $this->mapper->findAllForUser($user);
		}catch(Exception $e){
			throw new ServiceException('Error fetching configs', 400, $e);
		}
	}

	/**
	 * @param int $id
	 * @throws ServiceException
	 */
	public function delete(int $id): void {
		try {
			$this->mapper->deleteById($id);
		} catch(Exception $e) {
			throw new ServiceException('Could not delete appointment', 400, $e);
		}
	}

	/**
	 * @param array $data
	 * @return Appointment
	 * @throws ServiceException
	 */
	public function update(array $data): Appointment {
		try {
			return $this->mapper->updateFromData($data);
		} catch(Exception $e) {
			throw new ServiceException('Could not update Appointment', 400, $e);
		}
	}

	/**
	 * @param int $id
	 * @return Appointment
	 * @throws ServiceException
	 */
	public function findById(int $id): Appointment {
		try {
			return $this->mapper->findById($id);
		}catch (Exception|DoesNotExistException|MultipleObjectsReturnedException $e) {
			throw new ServiceException('Could not find a record for id', 400, $e);
		}
	}


	/**
	 * @param array $data
	 * @return Appointment
	 * @throws ServiceException
	 */
	public function create(array $data): Appointment {
		try {
			return $this->mapper->insertFromData($data);
		}catch (Exception $e){
			throw new ServiceException('Could not create new appointment', 400, $e);
		}
	}

	/**
	 * @param int $id
	 * @param int $unixStartDateTime
	 * @param int $unixEndDateTime
	 * @return array
	 * @throws ServiceException
	 */
	public function getSlots(int $id, int $unixStartDateTime, int $unixEndDateTime, string $outboxUri): array {
		if(time() > $unixStartDateTime || time() > $unixEndDateTime) {
			throw  new ServiceException('Booking time must be in the future', 403);
		}

		try {
			$appointment = $this->mapper->findById($id);
		}catch(Exception|DoesNotExistException|MultipleObjectsReturnedException $e) {
			throw new ServiceException('Appointment not found', 404, $e);
		}

		$totalLength = $appointment->getTotalLength()*60;
		if($totalLength === 0){
			throw new ServiceException('Appointment not bookable');
		}

		$bookedSlots = $this->findBookedSlotsAmount($id, $unixStartDateTime, $unixEndDateTime);

		$dailyMax = $appointment->getDailyMax();
		/** @var int $bookable - set an absurdly high number so we never run out */
		$bookable = 99999;

		// in case the daily max is set
		if($dailyMax !==  null) {
			$bookable = $dailyMax - $bookedSlots;
		}

		// no more slots available
		if($bookable <= 0) {
			return [];
		}

		$slots = [];
		$i = 0;
		$time = $unixStartDateTime;
		while(($time + $totalLength) <= $unixEndDateTime ) {
			// check here for:
			// - slot conflicting with existing appointment
			$this->checkCalendarConflicts($time, $outboxUri, $appointment->getCalendarFreebusyUris());
			// - slot max number having been reached via existing bookings
			$slots[] = ['start' => $time];
			$time += $appointment->getIncrement()*60;
			$i++;
			// check the max amount of appointments still available
			if($i >= $bookable) {
				break;
			}
		}
		return $slots;
	}

	private function checkCalendarConflicts(int $time, string $outboxUri, array $freeBusyUris) {
		// is conflicting?
		return false;
	}

	private function findBookedSlotsAmount(int $id, int $unixStartDateTime, int $unixEndDateTime): int {
		// return amount of booked slot
		return 0;
	}
}
