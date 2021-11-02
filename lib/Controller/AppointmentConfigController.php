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

namespace OCA\Calendar\Controller;

use OCA\Calendar\Db\AppointmentConfig;
use OCA\Calendar\Exception\ClientException;
use OCA\Calendar\Exception\ServiceException;
use OCA\Calendar\Http\JsonResponse;
use OCA\Calendar\Service\Appointments\AppointmentConfigService;
use OCP\AppFramework\Controller;
use OCP\AppFramework\Http;
use OCP\IRequest;

class AppointmentConfigController extends Controller {

	/** @var AppointmentConfigService */
	private $appointmentConfigService;

	/** @var string|null */
	private $userId;

	public function __construct(string $appName,
								IRequest $request,
								AppointmentConfigService $appointmentService,
								?string $userId) {
		parent::__construct($appName, $request);
		$this->appointmentConfigService = $appointmentService;
		$this->userId = $userId;
	}

	/**
	 * @NoAdminRequired
	 */
	public function index(): JsonResponse {
		if ($this->userId === null) {
			return JsonResponse::fail(null, Http::STATUS_NOT_FOUND);
		}

		return JsonResponse::success(
			$this->appointmentConfigService->getAllAppointmentConfigurations($this->userId)
		);
	}

	/**
	 * @param int $id
	 *
	 * @return JsonResponse
	 */
	public function show(int $id): JsonResponse {
		if ($this->userId === null) {
			return JsonResponse::fail();
		}

		try {
			$appointmentConfig = $this->appointmentConfigService->findByIdAndUser($id, $this->userId);
			return JsonResponse::success($appointmentConfig);
		} catch (ClientException $e) {
			return JsonResponse::fail([], $e->getHttpCode() ?? Http::STATUS_BAD_REQUEST);
		} catch (ServiceException $e) {
			return JsonResponse::errorFromThrowable($e);
		}
	}

	/**
	 * @NoAdminRequired
	 *
	 * @param string $name
	 * @param string $description
	 * @param string $location
	 * @param string $visibility
	 * @param string $targetCalendarUri
	 * @param string|null $availability
	 * @param int $length
	 * @param int $increment
	 * @param int $preparationDuration
	 * @param int $followupDuration
	 * @param int $timeToNextSlot
	 * @param int|null $dailyMax
	 * @param string[] $freebusyUris
	 * @param int|null $start
	 * @param int|null $end
	 * @return JsonResponse
	 */
	public function create(
		string  $name,
		string  $description,
		string  $location,
		string  $visibility,
		string  $targetCalendarUri,
		?string $availability,
		int $length,
		int $increment,
		int $preparationDuration = 0,
		int $followupDuration = 0,
		int $timeToNextSlot = 0,
		?int $dailyMax = null,
		array $freebusyUris = null,
		?int $start = null,
		?int $end = null): JsonResponse {

		if ($this->userId === null) {
			return JsonResponse::fail();
		}

		try {
			$appointmentConfig = $this->appointmentConfigService->create(
				$name,
				$description,
				$location,
				$visibility,
				$this->userId,
				$targetCalendarUri,
				$availability,
				$length,
				$increment,
				$preparationDuration,
				$followupDuration,
				$timeToNextSlot,
				$dailyMax,
				$freebusyUris,
				$start,
				$end
			);
			return JsonResponse::success($appointmentConfig);
		} catch (ServiceException $e) {
			return JsonResponse::errorFromThrowable($e);
		}
	}

	/**
	 * @NoAdminRequired
	 *
	 * @param int $id
	 * @param string $name
	 * @param string $description
	 * @param string $location
	 * @param string $visibility
	 * @param string $targetCalendarUri
	 * @param string $availability
	 * @param int $length
	 * @param int $increment
	 * @param int $preparationDuration
	 * @param int $followupDuration
	 * @param int $buffer
	 * @param int|null $dailyMax
	 * @param string|null $freebusyUris
	 * @param int|null $start
	 * @param int|null $end
	 * @return JsonResponse
	 */
	public function update(
		int $id,
		string $name,
		string $description,
		string $location,
		string $visibility,
		string $targetCalendarUri,
		string $availability,
		int $length,
		int $increment,
		int $preparationDuration = 0,
		int $followupDuration = 0,
		int $buffer = 0,
		?int $dailyMax = null,
		?string $freebusyUris = null,
		?int $start = null,
		?int $end = null): JsonResponse {
		if ($this->userId === null) {
			return JsonResponse::fail(null, Http::STATUS_NOT_FOUND);
		}

		try {
			$appointmentConfig = $this->appointmentConfigService->findByIdAndUser($id, $this->userId);
		} catch (ServiceException $e) {
			return JsonResponse::errorFromThrowable($e);
		}

		$appointmentConfig->setName($name);
		$appointmentConfig->setDescription($description);
		$appointmentConfig->setLocation($location);
		$appointmentConfig->setVisibility($visibility);
		$appointmentConfig->setUserId($this->userId);
		$appointmentConfig->setTargetCalendarUri($targetCalendarUri);
		$appointmentConfig->setAvailability($availability);
		$appointmentConfig->setLength($length);
		$appointmentConfig->setIncrement($increment);
		$appointmentConfig->setPreparationDuration($preparationDuration);
		$appointmentConfig->setFollowupDuration($followupDuration);
		$appointmentConfig->setTimeBeforeNextSlot($buffer);
		$appointmentConfig->setDailyMax($dailyMax);
		$appointmentConfig->setCalendarFreebusyUris($freebusyUris);
		$appointmentConfig->setStart($start);
		$appointmentConfig->setEnd($end);

		try {
			$appointmentConfig = $this->appointmentConfigService->update($appointmentConfig);
			return JsonResponse::success($appointmentConfig);
		} catch (ServiceException $e) {
			return JsonResponse::errorFromThrowable($e, 403);
		}
	}

	/**
	 * @NoAdminRequired
	 */
	public function destroy(int $id): JsonResponse {
		if ($this->userId === null) {
			return JsonResponse::fail(null, Http::STATUS_NOT_FOUND);
		}

		try {
			$this->appointmentConfigService->delete($id, $this->userId);
			return JsonResponse::success();
		} catch (ServiceException $e) {
			return JsonResponse::errorFromThrowable($e, 403);
		}
	}
}
