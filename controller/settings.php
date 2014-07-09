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
use OCP\AppFramework\IAppContainer;
use OCP\Config;
use OCP\IRequest;

class SettingsController extends Controller {

	/**
	 * @var array
	 */
	private $settings;


	/**
	 * @param IAppContainer $app
	 * @param IRequest $request
	 * @param array $settings
	 */
	public function __construct(IAppContainer $app, IRequest $request, array $settings) {
		parent::__construct($app, $request);
		$this->settings = $settings;
	}


	/**
	 * set a config value
	 *
	 * @param string $value
	 * @return JSONResponse
	 *
	 * @NoAdminRequired
	 * @NoCSRFRequired
	 */
	public function setValue($value) {
		$userId = $this->api->getUserId();
		$app = $this->app->getAppName();

		$info = $this->getInfoFromRoute();

		if (isset($info['options']) && !in_array($value, $info['options'])) {
			return new JSONResponse(array(
				'message' => 'Value not supported',
			), HTTP::STATUS_UNPROCESSABLE_ENTITY);
		}

		Config::setUserValue(
			$userId,
			$app,
			$info['configKey'],
			$value
		);

		return new JSONResponse(array(
			'message' => 'Value stored successfully',
		), HTTP::STATUS_OK);
	}


	/**
	 * get a config value
	 *
	 * @return JSONResponse
	 *
	 * @NoAdminRequired
	 * @NoCSRFRequired
	 */
	public function getValue() {
		$userId = $this->api->getUserId();
		$app = $this->app->getAppName();

		$info = $this->getInfoFromRoute();

		$value = Config::getUserValue(
			$userId,
			$app,
			$info['configKey'],
			(isset($info['default'])) ? $info['default'] : null
		);

		return new JSONResponse(array(
			'value' => $value,
		), HTTP::STATUS_OK);
	}


	/**
	 * @return null|array
	 */
	private function getInfoFromRoute() {
		$route = $this->request->getParam('_route');
		list(, , $name) = explode('.', $route);
		$key = lcfirst(substr($name, 3));

		if (isset($this->settings[$key])) {
			return $this->settings[$key];
		} else {
			return $this->throwSettingNotAvailable();
		}
	}


	/**
	 * @return JSONResponse
	 */
	private function throwSettingNotAvailable() {
		return new JSONResponse(array(
			'message' => 'Setting not available',
		), HTTP::STATUS_NOT_FOUND);
	}
}