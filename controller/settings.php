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
use \OCP\Config;
use \OCA\Calendar\Http\Response;

class SettingsController extends Controller {

	private static $viewKey = 'currentView';
	private static $timeKey = 'timeformat';
	private static $firstDayKey = 'firstday';

	/**
	 * @NoAdminRequired
	 * @NoCSRFRequired
	 */
	public function setView() {
		$userId = $this->api->getUserId();
		$app = $this->app->getAppName();
		$view = trim($this->params('view'));

		$availableViews = array(
			'agendaDay',
			'agendaWeek',
			'month',
		);

		if (in_array($view, $availableViews)) {
			Config::setUserValue($userId, $app, self::$viewKey, $view);
			return new Response(array(
				'view' => $view,
			));
		} else {
			return new Response(array(
				'message' => 'view not supported',
			), HTTP::STATUS_UNPROCESSABLE_ENTITY);
		}
	}


	/**
	 * @NoAdminRequired
	 * @NoCSRFRequired
	 */
	public function getView() {
		$userId = $this->api->getUserId();
		$app = $this->app->getAppName();
		$default = 'month';

		$value = Config::getUserValue($userId, $app, self::$viewKey, $default);
		$response = array(
			'view' => $value
		);

		return new Response($response);
	}


	/**
	 * @NoAdminRequired
	 * @NoCSRFRequired
	 */
	public function setTimeFormat() {
		$userId = $this->api->getUserId();
		$app = $this->app->getAppName();
		$value = $this->params('timeformat');

		$availableTimeFormats = array(
			'ampm',
			'24',
		);

		if (in_array($value, $availableTimeFormats)) {
			Config::setUserValue($userId, $app, self::$timeKey, $value);
			return new Response(array(
				'timeformat' => $value
			));
		} else {
			return new Response(array(
				'message' => 'time-format not supported',
			), HTTP::STATUS_UNPROCESSABLE_ENTITY);
		}
	}


	/**
	 * @NoAdminRequired
	 * @NoCSRFRequired
	 */
	public function getTimeFormat() {
		$userId = $this->api->getUserId();
		$app = $this->app->getAppName();
		$default = '24';

		$value = Config::getUserValue($userId, $app, self::$timeKey, $default);
		$response = array(
			'timeformat' => $value
		);

		return new Response($response);
	}


	/**
	 * @NoAdminRequired
	 * @NoCSRFRequired
	 */
	public function setFirstDayOfWeek() {
		$userId = $this->api->getUserId();
		$app = $this->app->getAppName();
		$value = $this->params('firstday');

		$availableFirstDays = array(
			'sa',
			'su',
			'mo',
		);

		if (in_array($value, $availableFirstDays)) {
			Config::setUserValue($userId, $app, self::$firstDayKey, $value);
			return new Response(array(
				'firstday' => $value
			));
		} else {
			return new Response(array(
				'message' => 'firstday not supported',
			), HTTP::STATUS_UNPROCESSABLE_ENTITY);
		}
	}


	/**
	 * @NoAdminRequired
	 * @NoCSRFRequired
	 */
	public function getFirstDayOfWeek() {
		$userId = $this->api->getUserId();
		$app = $this->app->getAppName();
		$default = 'mo';

		$value = Config::getUserValue($userId, $app, self::$firstDayKey, $default);
		$response = array(
			'firstday' => $value
		);

		return new Response($response);
	}
}