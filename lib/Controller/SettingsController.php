<?php
/**
 * Calendar App
 *
 * @author Georg Ehrke
 * @copyright 2019 Georg Ehrke <oc.list@georgehrke.com>
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
 * License along with this library.  If not, see <http://www.gnu.org/g/>.
 *
 */
namespace OCA\Calendar\Controller;

use OCP\AppFramework\Controller;
use OCP\AppFramework\Http\JSONResponse;
use OCP\AppFramework\Http;
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
		if (!\in_array($view, ['timeGridDay', 'timeGridWeek', 'dayGridMonth'])) {
			return new JSONResponse([], Http::STATUS_UNPROCESSABLE_ENTITY);
		}

		try {
			$this->config->setUserValue(
				$this->userId,
				$this->appName,
				'currentView',
				$view
			);
		} catch(\Exception $e) {
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
		} catch(\Exception $e) {
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
		} catch(\Exception $e) {
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
		} catch(\Exception $e) {
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
		} catch(\Exception $e) {
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
		} catch(\Exception $e) {
			return new JSONResponse([], Http::STATUS_INTERNAL_SERVER_ERROR);
		}

		return new JSONResponse();
	}
}
