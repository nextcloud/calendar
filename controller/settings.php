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

use OCP\AppFramework\Http;
use OCP\AppFramework\Http\JSONResponse;
use OCP\Config;

class SettingsController extends Controller {

	private static $viewKey = 'currentView';
	private static $timeKey = 'timeformat';
	private static $firstDayKey = 'firstday';

	/**
	 * @param string $view
	 * @return JSONResponse
	 *
	 * @NoAdminRequired
	 * @NoCSRFRequired
	 */
	public function setView($view) {
		$userId = $this->api->getUserId();
		$app = $this->app->getAppName();
		$view = trim($view);

		$availableViews = array(
			'agendaDay',
			'agendaWeek',
			'month',
		);

		if (in_array($view, $availableViews)) {
			Config::setUserValue(
				$userId,
				$app,
				self::$viewKey,
				$view
			);
			return new JSONResponse(array(
				'view' => $view,
			));
		} else {
			return new JSONResponse(array(
				'message' => 'view not supported',
			), HTTP::STATUS_UNPROCESSABLE_ENTITY);
		}
	}


	/**
	 * @return JSONResponse
	 *
	 * @NoAdminRequired
	 * @NoCSRFRequired
	 */
	public function getView() {
		$userId = $this->api->getUserId();
		$app = $this->app->getAppName();
		$default = 'month';

		$value = Config::getUserValue(
			$userId,
			$app,
			self::$viewKey,
			$default
		);
		$response = array(
			'view' => $value
		);

		return new JSONResponse($response);
	}


	/**
	 * @param string $timeformat
	 * @return JSONResponse
	 *
	 * @NoAdminRequired
	 * @NoCSRFRequired
	 */
	public function setTimeFormat($timeformat) {
		$userId = $this->api->getUserId();
		$app = $this->app->getAppName();

		$availableTimeFormats = array(
			'ampm',
			'24',
		);

		if (in_array($timeformat, $availableTimeFormats)) {
			Config::setUserValue(
				$userId,
				$app,
				self::$timeKey,
				$timeformat
			);
			return new JSONResponse(array(
				'timeformat' => $timeformat
			));
		} else {
			return new JSONResponse(array(
				'message' => 'time-format not supported',
			), HTTP::STATUS_UNPROCESSABLE_ENTITY);
		}
	}


	/**
	 * @return JSONResponse
	 *
	 * @NoAdminRequired
	 * @NoCSRFRequired
	 */
	public function getTimeFormat() {
		$userId = $this->api->getUserId();
		$app = $this->app->getAppName();
		$default = '24';

		$value = Config::getUserValue(
			$userId,
			$app,
			self::$timeKey,
			$default
		);
		$response = array(
			'timeformat' => $value
		);

		return new JSONResponse($response);
	}


	/**
	 * @param string $firstday
	 * @return JSONResponse
	 *
	 * @NoAdminRequired
	 * @NoCSRFRequired
	 */
	public function setFirstDayOfWeek($firstday) {
		$userId = $this->api->getUserId();
		$app = $this->app->getAppName();

		$availableFirstDays = array(
			'sa',
			'su',
			'mo',
		);

		if (in_array($firstday, $availableFirstDays)) {
			Config::setUserValue(
				$userId,
				$app,
				self::$firstDayKey,
				$firstday
			);
			return new JSONResponse(array(
				'firstday' => $firstday
			));
		} else {
			return new JSONResponse(array(
				'message' => 'firstday not supported',
			), HTTP::STATUS_UNPROCESSABLE_ENTITY);
		}
	}


	/**
	 * @return JSONResponse
	 *
	 * @NoAdminRequired
	 * @NoCSRFRequired
	 */
	public function getFirstDayOfWeek() {
		$userId = $this->api->getUserId();
		$app = $this->app->getAppName();
		$default = 'mo';

		$value = Config::getUserValue(
			$userId,
			$app,
			self::$firstDayKey,
			$default
		);
		$response = array(
			'firstday' => $value
		);

		return new JSONResponse($response);
	}
}