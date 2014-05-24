<?php
/**
 * Copyright (c) 2014 Georg Ehrke <oc.list@georgehrke.com>
 * This file is licensed under the Affero General Public License version 3 or
 * later.
 * See the COPYING-README file.
 */
namespace OCA\Calendar\Controller;

use OCP\AppFramework\Http\TemplateResponse;

use OCA\Calendar\Http\Response;

class ViewController extends Controller {

	/**
	 * @NoAdminRequired
	 * @NoCSRFRequired
	 */
	public function index(){
		//$this->api->addStyle();
		//$this->api->addScript();
		return new TemplateResponse('calendar', 'main');
	}


	/**
	 * @NoAdminRequired
	 * @NoCSRFRequired
	 */
	public function searchLocation() {
		$location = $this->params('location');

		$result = \OCP\Contacts::search($location, array('FN', 'ADR'));
		
		$contacts = array();
		
		foreach ($result as $r) {
			if (!isset($r['ADR'])) {
				continue;
			}
		
			$tmp = $r['ADR'][0];
			$address = trim(implode(" ", $tmp));
		  
			$contacts[] = array('label' => $address);
		}

		return new Response($contacts);
	}
}