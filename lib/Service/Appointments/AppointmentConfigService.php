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

use OCA\Calendar\Db\AppointmentConfig;
use OCA\Calendar\Db\AppointmentConfigMapper;
use OCA\Calendar\Exception\ClientException;
use OCA\Calendar\Exception\ServiceException;
use OCP\AppFramework\Db\DoesNotExistException;
use OCP\AppFramework\Db\MultipleObjectsReturnedException;
use OCP\AppFramework\Http;
use OCP\DB\Exception as DbException;
use OCP\Security\ISecureRandom;

class AppointmentConfigService {

	/** @var AppointmentConfigMapper */
	private $mapper;

	/** @var ISecureRandom */
	private $random;

	public function __construct(AppointmentConfigMapper $mapper,
								ISecureRandom $random) {
		$this->mapper = $mapper;
		$this->random = $random;
	}

	/**
	 * @param string $userId
	 *
	 * @return AppointmentConfig[]
	 * @throws ServiceException
	 */
	public function getAllAppointmentConfigurations(string $userId): array {
		try {
			return $this->mapper->findAllForUser($userId);
		} catch (DbException $e) {
			throw new ServiceException('Error fetching configs', $e->getCode(), $e);
		}
	}

	/**
	 * @param int $id
	 * @param string $userId
	 *
	 * @throws ServiceException
	 */
	public function delete(int $id, string $userId): void {
		try {
			$this->mapper->deleteById($id, $userId);
		} catch (DbException $e) {
			throw new ServiceException('Could not delete appointment', $e->getCode(), $e);
		}
	}

	/**
	 * @param AppointmentConfig $appointmentConfig
	 *
	 * @return AppointmentConfig
	 * @throws ServiceException
	 */
	public function update(AppointmentConfig $appointmentConfig): AppointmentConfig {
		try {
			return $this->mapper->update($appointmentConfig);
		} catch (DbException $e) {
			throw new ServiceException('Could not update Appointment', $e->getCode(), $e);
		}
	}

	/**
	 * @param int $id
	 *
	 * @return AppointmentConfig
	 * @throws ServiceException
	 */
	public function findById(int $id): AppointmentConfig {
		try {
			return $this->mapper->findById($id);
		} catch (DbException | DoesNotExistException | MultipleObjectsReturnedException $e) {
			throw new ClientException(
				'Could not find a record for id',
				$e->getCode(),
				$e,
				Http::STATUS_NOT_FOUND
			);
		}
	}

	public function findByToken(string $token): AppointmentConfig {
		try {
			return $this->mapper->findByToken($token);
		} catch (DoesNotExistException $e) {
			throw new ClientException(
				"Appointment config $token does not exist",
				0,
				$e,
				Http::STATUS_NOT_FOUND
			);
		}
	}

	/**
	 * @param int $id
	 *
	 * @return AppointmentConfig
	 * @throws ServiceException
	 */
	public function findByIdAndUser(int $id, string $userId): AppointmentConfig {
		try {
			return $this->mapper->findByIdForUser($id, $userId);
		} catch (DoesNotExistException $e) {
			throw new ClientException('Could not find a record for id', $e->getCode(), $e, Http::STATUS_NOT_FOUND);
		}
	}

	/**
	 * @param string $name
	 * @param string $description
	 * @param string $location
	 * @param string $visibility
	 * @param string $userId
	 * @param string $targetCalendarUri
	 * @param string|null $availability
	 * @param int $length
	 * @param int $increment
	 * @param int $preparationDuration
	 * @param int $followupDuration
	 * @param int $buffer
	 * @param int|null $dailyMax
	 * @param string[] $freebusyUris
	 * @param int|null $start
	 * @param int|null $end
	 * @return AppointmentConfig
	 * @throws ServiceException
	 */
	public function create(string $name,
						   string $description,
						   string $location,
						   string $visibility,
						   string $userId,
						   string $targetCalendarUri,
						   ?string $availability,
						   int $length,
						   int $increment,
						   int $preparationDuration,
						   int $followupDuration,
						   int $buffer,
						   ?int $dailyMax,
						   ?array $freebusyUris = [],
						   ?int $start = null,
						   ?int $end = null): AppointmentConfig {
		try {
			$appointmentConfig = new AppointmentConfig();
			$appointmentConfig->setToken($this->random->generate(12, ISecureRandom::CHAR_HUMAN_READABLE));
			$appointmentConfig->setName($name);
			$appointmentConfig->setDescription($description);
			$appointmentConfig->setLocation($location);
			$appointmentConfig->setVisibility($visibility);
			$appointmentConfig->setUserId($userId);
			$appointmentConfig->setTargetCalendarUri($targetCalendarUri);
			$appointmentConfig->setAvailability($availability);
			$appointmentConfig->setLength($length);
			$appointmentConfig->setIncrement($increment);
			$appointmentConfig->setPreparationDuration($preparationDuration);
			$appointmentConfig->setFollowupDuration($followupDuration);
			$appointmentConfig->setTimeBeforeNextSlot($buffer);
			$appointmentConfig->setDailyMax($dailyMax);
			$appointmentConfig->setCalendarFreeBusyUrisAsArray($freebusyUris);
			$appointmentConfig->setStart($start);
			$appointmentConfig->setEnd($end);

			return $this->mapper->insert($appointmentConfig);
		} catch (DbException $e) {
			throw new ServiceException('Could not create new appointment', $e->getCode(), $e);
		}
	}

	/**
	 * @param int $id ?? maybe pass the appointment
	 * @param int $unixStartTime
	 * @param int $unixEndTime
	 *
	 * @return array
	 * @throws ServiceException
	 */
	public function getSlots(AppointmentConfig $appointmentConfig, int $unixStartTime, int $unixEndTime, string $outboxUri): array {
		// rate limit this to only allow ranges between 0 to 7 days?

		// move this to controller
		//ITimeFactory
		if (time() > $unixStartTime || time() > $unixEndTime) {
			throw  new ServiceException('Booking time must be in the future', 403);
		}

		// move this to controller
		try {
			$appointment = $this->mapper->findByIdForUser($id);
		} catch (DbException | DoesNotExistException | MultipleObjectsReturnedException $e) {
			throw new ServiceException('Appointment not found', 404, $e);
		}

		//do i need to check the recurrence rule here?
		$availability = $this->parseRRule($appointment->getAvailability());

		// move this to create
		$totalLength = $appointment->getTotalLength() * 60;
//		if($totalLength === 0){
//			throw new ServiceException('Appointment not bookable');
//		}

		$bookedSlots = $this->findBookedSlotsAmount($id, $unixStartTime, $unixEndTime);

		// negotiate avaliable slots
		$bookableSlots = ($appointment->getDailyMax() !== null) ? $appointment->getDailyMax() - $bookedSlots : 99999;

		if ($bookableSlots <= 0) {
			return [];
		}

		$slots = [];
		$timeblocks = $this->getCalendarFreeTimeblocks($unixStartTime, $unixEndTime, $outboxUri, $appointment->getCalendarFreebusyUris());
		// get slots irrespective of conflicts
		// Remove unavailable slots via comparing with RRule
		// remove conflicting slots via calendar free busy
		// check daily max via bookable slots via TDO Slot object


		// @TODO - refactor this to functions
//		foreach($timeblocks as $calendarTimeblock){
//			$time = $calendarTimeblock['start'];
//			// we only render slots that fit into the time frame given
//			while(($time + $totalLength) <= $calendarTimeblock['end'] ) {
//				$slots[] = ['start' => $time];
//				// add the increment
//				$time += $appointment->getIncrement()*60;
//				// reduce the amount of available slots
//				$bookableSlots--;
//				if($bookableSlots <= 0) {
//					// no more slots, let's break the outer loop, too
//					break 2;
//				}
//			}
//		}
		return $slots; // make a DTO out of this
	}

	/**
	 * @param int $time
	 * @param string $outboxUri
	 * @param array $freeBusyUris
	 *
	 * @return [][]
	 *
	 * Check if slot is conflicting with existing appointments
	 * returns the start and end times of free blocks
	 *     [
	 *         ['start' => 12345678, 'end' => 1234567]
	 *         ['start' => 12345678, 'end' => 1234567]
	 *     ]
	 */
	public function getCalendarFreeTimeblocks(int $startTime, int $endTime, string $outboxUri, array $freeBusyUris): array {
		// get all blocks of time that are still free
		// so if there is an appointment from 10 to 11am, we would return the
		// slot from 9am to 10am and the slot from 11am to 5pm
		// IManager::search auf calendar in general - empty pattern
		return [
			['start' => $startTime, 'end' => $endTime]
		];
	}

	public function findBookedSlotsAmount(int $id, int $unixStartDateTime, int $unixEndDateTime): int {
		// return amount of booked slot
		// IManager::search auf X-NC-Appts-Id


		return 0;
	}

	private function parseRRule($rrule) {
		return ['start' => '', 'end', ''];
	}
}
