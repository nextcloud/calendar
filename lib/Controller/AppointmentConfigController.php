<?php

declare(strict_types=1);
/**
 * SPDX-FileCopyrightText: 2021 Nextcloud GmbH and Nextcloud contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */
namespace OCA\Calendar\Controller;

use InvalidArgumentException;
use OCA\Calendar\AppInfo\Application;
use OCA\Calendar\Exception\ClientException;
use OCA\Calendar\Exception\ServiceException;
use OCA\Calendar\Http\JsonResponse;
use OCA\Calendar\Service\Appointments\AppointmentConfigService;
use OCP\AppFramework\Controller;
use OCP\AppFramework\Http;
use OCP\AppFramework\Http\Attribute\UserRateLimit;
use OCP\IRequest;
use Psr\Log\LoggerInterface;
use function array_keys;
use function array_merge;
use function array_values;

class AppointmentConfigController extends Controller {
	/** @var AppointmentConfigService */
	private $appointmentConfigService;

	/** @var string|null */
	private $userId;

	/** @var LoggerInterface */
	private $logger;

	public function __construct(IRequest $request,
		AppointmentConfigService $appointmentService,
		LoggerInterface $logger,
		?string $userId) {
		parent::__construct(Application::APP_ID, $request);
		$this->appointmentConfigService = $appointmentService;
		$this->userId = $userId;
		$this->logger = $logger;
	}

	/**
	 * @NoAdminRequired
	 */
	public function index(): JsonResponse {
		if ($this->userId === null) {
			$this->logger->warning('No user found');
			return JsonResponse::fail(null, Http::STATUS_NOT_FOUND);
		}

		try {
			$appointmentConfigs = $this->appointmentConfigService->getAllAppointmentConfigurations($this->userId);
			return JsonResponse::success($appointmentConfigs);
		} catch (ServiceException $e) {
			$this->logger->error('No appointment configurations found', ['exception' => $e]);
			return JsonResponse::fail([], $e->getHttpCode() ?? Http::STATUS_BAD_REQUEST);
		}
	}

	/**
	 * @param int $id
	 *
	 * @return JsonResponse
	 */
	public function show(int $id): JsonResponse {
		if ($this->userId === null) {
			$this->logger->warning('No user found');
			return JsonResponse::fail();
		}

		try {
			$appointmentConfig = $this->appointmentConfigService->findByIdAndUser($id, $this->userId);
			return JsonResponse::success($appointmentConfig);
		} catch (ClientException $e) {
			$this->logger->warning('No appointment configuration found with id ' . $id, ['exception' => $e]);
			return JsonResponse::fail([], $e->getHttpCode() ?? Http::STATUS_BAD_REQUEST);
		}
	}

	/**
	 * @throws InvalidArgumentException
	 */
	private function validateAvailability(array $availability): void {
		$expectedKeys = ['slots', 'timezoneId'];
		$actualKeys = array_keys($availability);
		sort($actualKeys);
		if ($expectedKeys !== $actualKeys) {
			throw new InvalidArgumentException('Invalid value for availability');
		}

		$expectedDayKeys = ['FR', 'MO', 'SA', 'SU', 'TH', 'TU', 'WE'];
		$actualDayKeys = array_keys($availability['slots']);
		sort($actualDayKeys);
		if ($expectedDayKeys !== $actualDayKeys) {
			throw new InvalidArgumentException('Invalid value for availability slots');
		}

		$slots = array_merge(...array_values($availability['slots']));
		foreach ($slots as $slot) {
			$slotKeys = array_keys($slot);
			sort($slotKeys);
			if ($slotKeys !== ['end', 'start']) {
				throw new InvalidArgumentException('Invalid value for availability slot');
			}
		}
	}

	/**
	 * @NoAdminRequired
	 *
	 * @param string $name
	 * @param string $description
	 * @param string|null $location
	 * @param string $visibility
	 * @param string $targetCalendarUri
	 * @param array $availability
	 * @param int $length
	 * @param int $increment
	 * @param int $preparationDuration
	 * @param int $followupDuration
	 * @param int $timeBeforeNextSlot
	 * @param int|null $dailyMax
	 * @param string[]|null $calendarFreeBusyUris
	 * @param int|null $start
	 * @param int|null $end
	 * @param int|null $futureLimit
	 * @return JsonResponse
	 * @UserRateThrottle(limit=10, period=1200)
	 */
	#[UserRateLimit(limit: 10, period: 1200)]
	public function create(
		string $name,
		string $description,
		?string $location,
		string $visibility,
		string $targetCalendarUri,
		array $availability,
		int $length,
		int $increment,
		int $preparationDuration = 0,
		int $followupDuration = 0,
		int $timeBeforeNextSlot = 0,
		?int $dailyMax = null,
		?array $calendarFreeBusyUris = null,
		?int $start = null,
		?int $end = null,
		?int $futureLimit = null,
		?bool $createTalkRoom = false): JsonResponse {
		if ($this->userId === null) {
			return JsonResponse::fail();
		}
		try {
			$this->validateAvailability($availability);
		} catch (InvalidArgumentException $e) {
			return JsonResponse::fail($e->getMessage(), Http::STATUS_UNPROCESSABLE_ENTITY);
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
				$timeBeforeNextSlot,
				$dailyMax,
				$calendarFreeBusyUris,
				$start,
				$end,
				$futureLimit,
				$createTalkRoom
			);
			return JsonResponse::success($appointmentConfig);
		} catch (ServiceException $e) {
			$this->logger->error('Could not create new configuration', ['exception' => $e]);
			return JsonResponse::fail($e->getMessage(), Http::STATUS_INTERNAL_SERVER_ERROR);
		}
	}

	/**
	 * @NoAdminRequired
	 *
	 * @param int $id
	 * @param string $name
	 * @param string $description
	 * @param string|null $location
	 * @param string $visibility
	 * @param string $targetCalendarUri
	 * @param array $availability
	 * @param int $length
	 * @param int $increment
	 * @param int $preparationDuration
	 * @param int $followupDuration
	 * @param int $timeBeforeNextSlot
	 * @param int|null $dailyMax
	 * @param string[] $calendarFreeBusyUris
	 * @param int|null $start
	 * @param int|null $end
	 * @param int|null $futureLimit
	 * @return JsonResponse
	 */
	public function update(
		int $id,
		string $name,
		string $description,
		?string $location,
		string $visibility,
		string $targetCalendarUri,
		array $availability,
		int $length,
		int $increment,
		int $preparationDuration = 0,
		int $followupDuration = 0,
		int $timeBeforeNextSlot = 0,
		?int $dailyMax = null,
		?array $calendarFreeBusyUris = null,
		?int $start = null,
		?int $end = null,
		?int $futureLimit = null,
		?bool $createTalkRoom = false): JsonResponse {
		if ($this->userId === null) {
			return JsonResponse::fail(null, Http::STATUS_NOT_FOUND);
		}
		try {
			$this->validateAvailability($availability);
		} catch (InvalidArgumentException $e) {
			return JsonResponse::fail($e->getMessage(), Http::STATUS_UNPROCESSABLE_ENTITY);
		}

		try {
			$appointmentConfig = $this->appointmentConfigService->findByIdAndUser($id, $this->userId);
		} catch (ClientException $e) {
			$this->logger->error('Could not find configuration with id ' . $id, ['exception' => $e]);
			return JsonResponse::fail($e->getMessage(), Http::STATUS_NOT_FOUND);
		}

		$appointmentConfig->setName($name);
		$appointmentConfig->setDescription($description);
		$appointmentConfig->setLocation($location);
		$appointmentConfig->setVisibility($visibility);
		$appointmentConfig->setUserId($this->userId);
		$appointmentConfig->setTargetCalendarUri($targetCalendarUri);
		$appointmentConfig->setAvailabilityAsArray($availability);
		$appointmentConfig->setLength($length);
		$appointmentConfig->setIncrement($increment);
		$appointmentConfig->setPreparationDuration($preparationDuration);
		$appointmentConfig->setFollowupDuration($followupDuration);
		$appointmentConfig->setTimeBeforeNextSlot($timeBeforeNextSlot);
		$appointmentConfig->setDailyMax($dailyMax);
		$appointmentConfig->setCalendarFreeBusyUrisAsArray($calendarFreeBusyUris ?? []);
		$appointmentConfig->setStart($start);
		$appointmentConfig->setEnd($end);
		$appointmentConfig->setFutureLimit($futureLimit);
		$appointmentConfig->setCreateTalkRoom($createTalkRoom === true);

		try {
			$appointmentConfig = $this->appointmentConfigService->update($appointmentConfig);
			return JsonResponse::success($appointmentConfig);
		} catch (ServiceException $e) {
			$this->logger->error('Could not update configuration with id ' . $id, ['exception' => $e]);
			return JsonResponse::fail($e->getMessage(), Http::STATUS_INTERNAL_SERVER_ERROR);
		}
	}

	/**
	 * @NoAdminRequired
	 */
	public function destroy(int $id): JsonResponse {
		if ($this->userId === null) {
			$this->logger->warning('No user found');
			return JsonResponse::fail(null, Http::STATUS_NOT_FOUND);
		}

		try {
			// delete all outstanding bookings
			$this->appointmentConfigService->delete($id, $this->userId);
			return JsonResponse::success();
		} catch (ServiceException $e) {
			$this->logger->error('Could not delete configuration with id ' . $id, ['exception' => $e]);
			return JsonResponse::fail($e->getMessage(), Http::STATUS_INTERNAL_SERVER_ERROR);
		}
	}
}
