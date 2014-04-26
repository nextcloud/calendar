<?php
/**
 * Copyright (c) 2014 Georg Ehrke <oc.list@georgehrke.com>
 * This file is licensed under the Affero General Public License version 3 or
 * later.
 * See the COPYING-README file.
 */
namespace OCA\Calendar\Controller;

use \OCA\Calendar\Http\Response;

class SettingsController extends Controller {

	/**
	 * @NoAdminRequired
	 * @NoCSRFRequired
	 */
	public function setView() {
		$userId = $this->api->getUserId();
		$app = $this->appName;
		$key = 'currentView';
		$view = $this->params('view');

		if(trim($view) !== '') {
			OCP\Config::setUserValue($userId, $app, $key, $view);
		}

		return new Response();
	}


	/**
	 * @NoAdminRequired
	 * @NoCSRFRequired
	 */
	public function getView() {
		$userId = $this->api->getUserId();
		$app = $this->appName;
		$key = 'currentView';
		$default = $this->params('month');

		$value = OCP\Config::getUserValue($userId, $app, $key, $default);
		$response = array(
			'view' => $value
		);

		return new Response($response);
	}
}