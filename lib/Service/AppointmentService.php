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

use BadFunctionCallException;
use InvalidArgumentException;
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

class AppointmentService {

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
		}catch (Exception|InvalidArgumentException|BadFunctionCallException $e){
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
		}catch (Exception|InvalidArgumentException|BadFunctionCallException $e){
			throw new ServiceException('Could not create new appointment', 400, $e);
		}
	}

	/**
	 * @param int $id
	 * @param int $unixStartTime
	 * @param int $unixEndTime
	 * @return array
	 * @throws ServiceException
	 */
	public function getSlots(int $id, int $unixStartTime, int $unixEndTime, string $outboxUri): array {
		if(time() > $unixStartTime || time() > $unixEndTime) {
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

		$bookedSlots = $this->findBookedSlotsAmount($id, $unixStartTime, $unixEndTime);

		// negotiate avaliable slots
		$bookableSlots = ($appointment->getDailyMax() !==  null) ? $appointment->getDailyMax() - $bookedSlots : 99999;

		if($bookableSlots <= 0) {
			throw new ServiceException('No more bookable slots');
		}

		$slots = [];
		$timeblocks = $this->getCalendarFreeTimeblocks($unixStartTime, $unixEndTime, $outboxUri, $appointment->getCalendarFreebusyUris());
		// @TODO - refactor this to functions
		foreach($timeblocks as $calendarTimeblock){
			$time = $calendarTimeblock['start'];
			// we only render slots that fit into the time frame given
			while(($time + $totalLength) <= $calendarTimeblock['end'] ) {
				$slots[] = ['start' => $time];
				// add the increment
				$time += $appointment->getIncrement()*60;
				// reduce the amount of available slots
				$bookableSlots--;
				if($bookableSlots <= 0) {
					// no more slots, let's break the outer loop, too
					break 2;
				}
			}
		}
		return $slots;
	}

	/**
	 * @param int $time
	 * @param string $outboxUri
	 * @param array $freeBusyUris
	 * @return [][]
	 *
	 * Check if slot is conflicting with existing appointments
	 * should return the end time of the conflicting appointment
	 * we will use this time as our new time and go from there
	 */
	public function getCalendarFreeTimeblocks(int $startTime, int $endTime, string $outboxUri, array $freeBusyUris): array {
		// get all blocks of time that are still free
		// so if there is an appointment from 10 to 11am, we would return the
		// slot from 9am to 10am and the slot from 11am to 5pm
		return [
			['start' => $startTime, 'end' => $endTime]
		];
	}

	public function findBookedSlotsAmount(int $id, int $unixStartDateTime, int $unixEndDateTime): int {
		// return amount of booked slot
		return 0;
	}

	private function resolveSlots(array $timeSlot) {
	}
}
