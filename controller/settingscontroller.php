<?php
/**
 * Copyright (c) 2014 Georg Ehrke <oc.list@georgehrke.com>
 * This file is licensed under the Affero General Public License version 3 or
 * later.
 * See the COPYING-README file.
 */
namespace OCA\Calendar\Controller;

use \OCA\Calendar\Http\Response;

class ViewController extends Controller {

	/**
	 * @NoAdminRequired
	 * @NoCSRFRequired
	 */
	public function setView() {
		return new Response();
	}


	/**
	 * @NoAdminRequired
	 * @NoCSRFRequired
	 */
	public function getView() {
		return new Response();
	}
}