<?php

declare(strict_types=1);
/**
 * SPDX-FileCopyrightText: 2019 Nextcloud GmbH and Nextcloud contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */
namespace OCA\Calendar\Controller;

use OCP\AppFramework\Controller;
use OCP\AppFramework\Http;
use OCP\AppFramework\Http\JSONResponse;
use OCP\IConfig;
use OCP\IRequest;

/**
 * Class SettingsController
 *
 * @package OCA\Calendar\Controller
 */
class SettingsController extends Controller {
	/** @var IConfig */
	private $config;

	/** @var string */
	private $userId;

	/**
	 * SettingsController constructor.
	 *
	 * @param string $appName
	 * @param IRequest $request
	 * @param IConfig $config
	 * @param string $userId
	 */
	public function __construct(string $appName,
		IRequest $request,
		IConfig $config,
		string $userId) {
		parent::__construct($appName, $request);
		$this->config = $config;
		$this->userId = $userId;
	}

	/**
	 * set a configuration item
	 *
	 * @NoAdminRequired
	 *
	 * @param string $key The config key to set
	 * @param mixed $value The value to set for given config key
	 * @return JSONResponse
	 */
	public function setConfig(string $key,
		string $value):JSONResponse {
		switch ($key) {
			case 'view':
				return $this->setView($value);
			case 'skipPopover':
				return $this->setSkipPopover($value);
			case 'showWeekends':
				return $this->showWeekends($value);
			case 'showWeekNr':
				return $this->setShowWeekNr($value);
			case 'firstRun':
				return $this->setFirstRun();
			case 'timezone':
				return $this->setTimezone($value);
			case 'eventLimit':
				return $this->setEventLimit($value);
			case 'slotDuration':
				return $this->setSlotDuration($value);
			case 'defaultReminder':
				return $this->setDefaultReminder($value);
			case 'showTasks':
				return $this->setShowTasks($value);
			case 'tasksSidebar':
				return $this->setTasksSidebar($value);
			case 'attachmentsFolder':
				return $this->setAttachmentsFolder($value);
			default:
				return new JSONResponse([], Http::STATUS_BAD_REQUEST);
		}
	}


	/**
	 * set a new view
	 *
	 * @param string $view Selected view by user
	 * @return JSONResponse
	 */
	private function setView(string $view):JSONResponse {
		if (!\in_array($view, ['timeGridDay', 'timeGridWeek', 'dayGridMonth', 'multiMonthYear', 'listMonth'])) {
			return new JSONResponse([], Http::STATUS_UNPROCESSABLE_ENTITY);
		}

		try {
			$this->config->setUserValue(
				$this->userId,
				$this->appName,
				'currentView',
				$view
			);
		} catch (\Exception $e) {
			return new JSONResponse([], Http::STATUS_INTERNAL_SERVER_ERROR);
		}

		return new JSONResponse();
	}

	/**
	 * set if popover shall be skipped
	 *
	 * @param $value User-selected option whether or not to show simple event editor
	 * @return JSONResponse
	 */
	private function setSkipPopover(string $value):JSONResponse {
		if (!\in_array($value, ['yes', 'no'])) {
			return new JSONResponse([], Http::STATUS_UNPROCESSABLE_ENTITY);
		}

		try {
			$this->config->setUserValue(
				$this->userId,
				$this->appName,
				'skipPopover',
				$value
			);
		} catch (\Exception $e) {
			return new JSONResponse([], Http::STATUS_INTERNAL_SERVER_ERROR);
		}

		return new JSONResponse();
	}

	/**
	 * set config value for showing tasks
	 *
	 * @param $value User-selected option whether or not to show tasks
	 * @return JSONResponse
	 */
	private function setShowTasks(string $value):JSONResponse {
		if (!\in_array($value, ['yes', 'no'])) {
			return new JSONResponse([], Http::STATUS_UNPROCESSABLE_ENTITY);
		}

		try {
			$this->config->setUserValue(
				$this->userId,
				$this->appName,
				'showTasks',
				$value
			);
		} catch (\Exception $e) {
			return new JSONResponse([], Http::STATUS_INTERNAL_SERVER_ERROR);
		}

		return new JSONResponse();
	}

	/**
	 * set config value for enabling the sidebar for unscheduled tasks by default
	 *
	 * @param $value User-selected option whether or not to show the sidebar
	 * @return JSONResponse
	 */
	private function setTasksSidebar(string $value):JSONResponse {
		if (!\in_array($value, ['yes', 'no'])) {
			return new JSONResponse([], Http::STATUS_UNPROCESSABLE_ENTITY);
		}

		try {
			$this->config->setUserValue(
				$this->userId,
				$this->appName,
				'tasksSidebar',
				$value
			);
		} catch (\Exception $e) {
			return new JSONResponse([], Http::STATUS_INTERNAL_SERVER_ERROR);
		}

		return new JSONResponse();
	}

	/**
	 * Set config for attachments folder
	 *
	 * @param string $value
	 * @return JSONResponse
	 */
	private function setAttachmentsFolder(string $value):JSONResponse {
		try {
			$this->config->setUserValue(
				$this->userId,
				'dav',
				'attachmentsFolder',
				$value
			);
		} catch (\Exception $e) {
			return new JSONResponse([], Http::STATUS_INTERNAL_SERVER_ERROR);
		}

		return new JSONResponse();
	}

	/**
	 * set config value for showing week numbers
	 *
	 * @param $value User-selected option whether or not to show weekends
	 * @return JSONResponse
	 */
	private function showWeekends(string $value):JSONResponse {
		if (!\in_array($value, ['yes', 'no'])) {
			return new JSONResponse([], Http::STATUS_UNPROCESSABLE_ENTITY);
		}

		try {
			$this->config->setUserValue(
				$this->userId,
				$this->appName,
				'showWeekends',
				$value
			);
		} catch (\Exception $e) {
			return new JSONResponse([], Http::STATUS_INTERNAL_SERVER_ERROR);
		}

		return new JSONResponse();
	}

	/**
	 * set config value for showing week numbers
	 *
	 * @param $value User-selected option whether or not to show week numbers
	 * @return JSONResponse
	 */
	private function setShowWeekNr(string $value):JSONResponse {
		if (!\in_array($value, ['yes', 'no'])) {
			return new JSONResponse([], Http::STATUS_UNPROCESSABLE_ENTITY);
		}

		try {
			$this->config->setUserValue(
				$this->userId,
				$this->appName,
				'showWeekNr',
				$value
			);
		} catch (\Exception $e) {
			return new JSONResponse([], Http::STATUS_INTERNAL_SERVER_ERROR);
		}

		return new JSONResponse();
	}

	/**
	 * remember that first run routines executed
	 *
	 * @return JSONResponse
	 */
	private function setFirstRun():JSONResponse {
		try {
			$this->config->setUserValue(
				$this->userId,
				$this->appName,
				'firstRun',
				'no'
			);
		} catch (\Exception $e) {
			return new JSONResponse([], Http::STATUS_INTERNAL_SERVER_ERROR);
		}

		return new JSONResponse();
	}

	/**
	 * sets display timezone for user
	 *
	 * @param string $value User-selected option for timezone to display events in
	 * @return JSONResponse
	 */
	private function setTimezone(string $value):JSONResponse {
		try {
			$this->config->setUserValue(
				$this->userId,
				$this->appName,
				'timezone',
				$value
			);
		} catch (\Exception $e) {
			return new JSONResponse([], Http::STATUS_INTERNAL_SERVER_ERROR);
		}

		return new JSONResponse();
	}

	/**
	 * sets eventLimit for user
	 *
	 * @param string $value User-selected option whether or not to have an event limit
	 * @return JSONResponse
	 */
	private function setEventLimit(string $value):JSONResponse {
		if (!\in_array($value, ['yes', 'no'])) {
			return new JSONResponse([], Http::STATUS_UNPROCESSABLE_ENTITY);
		}

		try {
			$this->config->setUserValue(
				$this->userId,
				$this->appName,
				'eventLimit',
				$value
			);
		} catch (\Exception $e) {
			return new JSONResponse([], Http::STATUS_INTERNAL_SERVER_ERROR);
		}

		return new JSONResponse();
	}

	/**
	 * sets slotDuration for user
	 *
	 * @param string $value User-selected option for slot-duration in agenda view
	 * @return JSONResponse
	 */
	private function setSlotDuration(string $value):JSONResponse {
		if (!\in_array($value, ['00:05:00', '00:10:00', '00:15:00', '00:20:00', '00:30:00', '01:00:00'])) {
			return new JSONResponse([], Http::STATUS_UNPROCESSABLE_ENTITY);
		}

		try {
			$this->config->setUserValue(
				$this->userId,
				$this->appName,
				'slotDuration',
				$value
			);
		} catch (\Exception $e) {
			return new JSONResponse([], Http::STATUS_INTERNAL_SERVER_ERROR);
		}

		return new JSONResponse();
	}

	/**
	 * sets defaultReminder for user
	 *
	 * @param string $value User-selected option for default_reminder in agenda view
	 * @return JSONResponse
	 */
	private function setDefaultReminder(string $value):JSONResponse {
		if ($value !== 'none'
			&& filter_var($value, FILTER_VALIDATE_INT,
				['options' => ['max_range' => 0]]) === false) {
			return new JSONResponse([], Http::STATUS_UNPROCESSABLE_ENTITY);
		}

		try {
			$this->config->setUserValue(
				$this->userId,
				$this->appName,
				'defaultReminder',
				$value
			);
		} catch (\Exception $e) {
			return new JSONResponse([], Http::STATUS_INTERNAL_SERVER_ERROR);
		}

		return new JSONResponse();
	}
}
