<?php

declare(strict_types=1);

/**
 * Calendar App
 *
 * @copyright 2021 Anna Larch <anna.larch@gmx.net>
 *
 * @author Anna Larch <anna.larch@gmx.net>
 * @author Richard Steinmetz <richard@steinmetz.cloud>
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
use OCP\IUser;
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
	 * @param string|null $visibility optionally filter for visibility
	 * @psalm-param AppointmentConfig::VISIBILITY_* $visibility
	 *
	 * @return AppointmentConfig[]
	 * @throws ServiceException
	 */
	public function getAllAppointmentConfigurations(string $userId, ?string $visibility = null): array {
		try {
			return $this->mapper->findAllForUser($userId, $visibility);
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
	 * @param string $userId
	 * @return AppointmentConfig
	 * @throws ClientException
	 */
	public function findByIdAndUser(int $id, string $userId): AppointmentConfig {
		try {
			return $this->mapper->findByIdForUser($id, $userId);
		} catch (DoesNotExistException $e) {
			throw new ClientException('Could not find a record for id', $e->getCode(), $e, Http::STATUS_NOT_FOUND);
		}
	}

	/**
	 * @throws ServiceException
	 */
	public function create(string $name,
		string $description,
		?string $location,
		string $visibility,
		string $userId,
		string $targetCalendarUri,
		array $availability,
		int $length,
		int $increment,
		int $preparationDuration,
		int $followupDuration,
		int $buffer,
		?int $dailyMax,
		?array $calendarFreeBusyUris = [],
		?int $start = null,
		?int $end = null,
		?int $futureLimit = null,
		?bool $createTalkRoom = false): AppointmentConfig {
		try {
			$appointmentConfig = new AppointmentConfig();
			$appointmentConfig->setToken($this->random->generate(12, ISecureRandom::CHAR_HUMAN_READABLE));
			$appointmentConfig->setName($name);
			$appointmentConfig->setDescription($description);
			$appointmentConfig->setLocation($location);
			$appointmentConfig->setVisibility($visibility);
			$appointmentConfig->setUserId($userId);
			$appointmentConfig->setTargetCalendarUri($targetCalendarUri);
			$appointmentConfig->setAvailabilityAsArray($availability);
			$appointmentConfig->setLength($length);
			$appointmentConfig->setIncrement($increment);
			$appointmentConfig->setPreparationDuration($preparationDuration);
			$appointmentConfig->setFollowupDuration($followupDuration);
			$appointmentConfig->setTimeBeforeNextSlot($buffer);
			$appointmentConfig->setDailyMax($dailyMax);
			$appointmentConfig->setCalendarFreeBusyUrisAsArray($calendarFreeBusyUris);
			$appointmentConfig->setStart($start);
			$appointmentConfig->setEnd($end);
			$appointmentConfig->setFutureLimit($futureLimit);
			$appointmentConfig->setCreateTalkRoom($createTalkRoom === true);

			return $this->mapper->insert($appointmentConfig);
		} catch (DbException $e) {
			throw new ServiceException('Could not create new appointment', $e->getCode(), $e);
		}
	}

	public function deleteByUser(IUser $getUser): void {
		$this->mapper->deleteByUserId($getUser->getUID());
	}
}
