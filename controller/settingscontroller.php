<?php
/**
 * ownCloud - Calendar App
 *
 * @author Georg Ehrke
 * @copyright 2014 Georg Ehrke <oc.list@georgehrke.com>
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
	}


	/**
	 * set a new view
	 *
	 * @param string $view
	 * @return JSONResponse
	 *
	 * @NoAdminRequired
	 */
	public function setView($view) {
		$userId = $this->userSession->getUser()->getUID();
		$app = $this->appName;

		if (!$this->isViewAllowed($view)) {
			return new JSONResponse([], Http::STATUS_UNPROCESSABLE_ENTITY);
		}

		try {
			$this->config->setUserValue(
				$userId,
				$app,
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
	 *
	 * @NoAdminRequired
	 */
	public function getView() {
		$userId = $this->userSession->getUser()->getUID();
		$app = $this->appName;

		try {
			$view = $this->config->getUserValue(
				$userId,
				$app,
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
}