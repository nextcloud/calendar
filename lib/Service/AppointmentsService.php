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
use OCP\DB\Exception;
use OCP\IConfig;
use OCP\IUserSession;
use PHPUnit\Util\Json;

class AppointmentsService implements \JsonSerializable {

	/** @var IConfig */
	private $config;

	/** @var IUserSession */
	private $userSession;

	/** @var AppointmentMapper */
	private $mapper;

	/**
	 * JSDataService constructor.
	 *
	 * @param IConfig $config
	 * @param IUserSession $userSession
	 */
	public function __construct(IConfig $config,
								IUserSession $userSession,
								AppointmentMapper $mapper) {
		$this->config = $config;
		$this->userSession = $userSession;
		$this->mapper = $mapper;
	}

	/**
	 * @inheritDoc
	 */
	public function jsonSerialize() {
		$user = $this->userSession->getUser();

		if ($user === null) {
			return [];
		}

		$defaultTimezone = $this->config->getAppValue(Application::APP_ID, 'timezone', 'automatic');
		$timezone = $this->config->getUserValue($user->getUID(), Application::APP_ID, 'timezone', $defaultTimezone);

		return [
			'timezone' => $timezone,
		];
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
			$this->mapper->delete($id);
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
		}catch (Exception $e) {
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
			return $this->mapper->insert($data);
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
		$appointment = $this->findById($id);

		$slots = [];
		$i = 0;
		$time = $unixStartDateTime;
		$totalLength = ($appointment->getLength() + (int)$appointment->getFollowupDuration() + (int)$appointment->getPreparationDuration())*60;
		$bookedSlots = $this->findBookedSlotsAmount($id, $unixStartDateTime, $unixEndDateTime);
		$dailyMax = $appointment->getDailyMax();
		$bookable = $dailyMax - $bookedSlots;

		// no more slots available
		if($bookable <= 0) {
			return $slots;
		}
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
