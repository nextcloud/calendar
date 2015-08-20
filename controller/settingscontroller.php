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

use OCA\Calendar\BusinessLayer\Exception;
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
	 * array with available settings
	 * @var array
	 */
	private $settings;


	/**
	 * @param string $appName
	 * @param IRequest $request an instance of the request
	 * @param IUserSession $userSession
	 * @param IConfig $config
	 * @param array $settings
	 */
	public function __construct($appName, IRequest $request, IUserSession $userSession,
								IConfig $config, array $settings) {
		parent::__construct($appName, $request, $userSession);
		$this->config = $config;
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
		try {
			$userId = $this->user->getUID();
			$app = $this->appName;

			$info = $this->getInfoFromRoute();

			if (isset($info['options']) && !in_array($value, $info['options'])) {
				throw new Exception('Value not supported', HTTP::STATUS_UNPROCESSABLE_ENTITY);
			}

			$this->config->setUserValue(
				$userId,
				$app,
				$info['configKey'],
				$value
			);

			return new JSONResponse([
				'message' => 'Value stored successfully',
			], HTTP::STATUS_OK);
		} catch (\Exception $ex) {
			return $this->handleException($ex);
		}
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
		try {
			$userId = $this->user->getUID();
			$app = $this->appName;

			$info = $this->getInfoFromRoute();

			$value = $this->config->getUserValue(
				$userId,
				$app,
				$info['configKey'],
				(isset($info['default'])) ? $info['default'] : null
			);

			return new JSONResponse([
				'value' => $value,
			], HTTP::STATUS_OK);
		} catch (\Exception $ex) {
			return $this->handleException($ex);
		}
	}


	/**
	 * extract info about config key from route
	 * @throws \Exception
	 * @return null|array
	 */
	private function getInfoFromRoute() {
		if (!isset($this->request->server['REQUEST_URI'])) {
			throw new Exception('Setting not available', HTTP::STATUS_NOT_FOUND);
		}

		$request_uri = $this->request->server['REQUEST_URI'];
		$request_uri_parts = explode('/', $request_uri);
		$key = end($request_uri_parts);

		if (isset($this->settings[$key])) {
			return $this->settings[$key];
		} else {
			throw new Exception('Setting not available', HTTP::STATUS_NOT_FOUND);
		}
	}
}