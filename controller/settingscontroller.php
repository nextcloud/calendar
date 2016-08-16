<?php
/**
 * ownCloud - Calendar App
 *
 * @author Georg Ehrke
 * @copyright 2016 Georg Ehrke <oc.list@georgehrke.com>
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
use OCP\IUserSession;

class SettingsController extends Controller {

	/**
	 * @var IConfig
	 */
	private $config;

	/**
	 * @var IUserSession
	 */
	private $userSession;

	/**
	 * @var string
	 */
	private $userId;

	/**
	 * @param string $appName
	 * @param IRequest $request an instance of the request
	 * @param IUserSession $userSession
	 * @param IConfig $config
	 */
	public function __construct($appName, IRequest $request, IUserSession $userSession,
								IConfig $config) {
		parent::__construct($appName, $request);
		$this->config = $config;
		$this->userSession = $userSession;
		$this->userId = $userSession->getUser()->getUID();
	}

	/**
	 * get a configuration item
	 *
	 * @NoAdminRequired
	 *
	 * @param string $key
	 * @return JSONResponse
	 */
	public function getConfig($key) {
		switch ($key) {
			case 'view':
				return $this->getView();
			case 'skipPopover':
				return $this->getSkipPopover();
			default:
				return new JSONResponse([], Http::STATUS_BAD_REQUEST);
		}
	}

	/**
	 * set a configuration item
	 *
	 * @NoAdminRequired
	 *
	 * @param string $key
	 * @param mixed $value
	 * @return JSONResponse
	 */
	public function setConfig($key, $value) {
		switch ($key) {
			case 'view':
				return $this->setView($value);
			case 'skipPopover':
				return $this->setSkipPopover($value);
			default:
				return new JSONResponse([], Http::STATUS_BAD_REQUEST);
		}
	}


	/**
	 * set a new view
	 *
	 * @param string $view
	 * @return JSONResponse
	 */
	private function setView($view) {
		if (!$this->isViewAllowed($view)) {
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
	 * get a config value
	 *
	 * @return JSONResponse
	 */
	private function getView() {
		try {
			$view = $this->config->getUserValue(
				$this->userId,
				$this->appName,
				'currentView',
				'month'
			);
		} catch(\Exception $e) {
			return new JSONResponse([], Http::STATUS_INTERNAL_SERVER_ERROR);
		}

		return new JSONResponse([
			'value' => $view,
		]);
	}

	/**
	 * check if view is allowed
	 *
	 * @param $view
	 * @return bool
	 */
	private function isViewAllowed($view) {
		$allowedViews = [
			'agendaDay',
			'agendaWeek',
			'month',
		];

		return in_array($view, $allowedViews);
	}

	/**
	 * set if popover shall be skipped
	 *
	 * @param $value
	 * @return JSONResponse
	 */
	private function setSkipPopover($value) {
		if (!$this->isSkipPopoverValueAllowed($value)) {
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
	 * get if popover shall be skipped
	 *
	 * @return JSONResponse
	 */
	private function getSkipPopover() {
		try {
			$view = $this->config->getUserValue(
				$this->userId,
				$this->appName,
				'skipPopover',
				'no'
			);
		} catch(\Exception $e) {
			return new JSONResponse([], Http::STATUS_INTERNAL_SERVER_ERROR);
		}

		return new JSONResponse([
			'value' => $view,
		]);
	}

	/**
	 * check if value for skipPopover is allowed
	 *
	 * @param $value
	 * @return bool
	 */
	private function isSkipPopoverValueAllowed($value) {
		$allowedValues = [
			'yes',
			'no'
		];

		return in_array($value, $allowedValues);
	}
}