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
 * License along with this library.  If not, see <http://www.gnu.org/licenses/>.
 *
 */
namespace OCA\Calendar\Controller;

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
		$view = $this->params('view');

		if(trim($view) !== '') {
			Config::setUserValue($userId, $app, self::$viewKey, $view);
		}

		return new Response();
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

		switch($value) {
			case 'ampm':
			case '24':
				Config::setUserValue($userId, $app, self::$timeKey, $value);
				break;

			default:
				break;
		}

		return new Response();
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

		switch($value) {
			case 'sa':
			case 'su':
			case 'mo':
				Config::setUserValue($userId, $app, self::$firstDayKey, $value);
				break;

			default:
				break;
		}

		return new Response();
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