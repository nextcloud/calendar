<?php
/**
 * ownCloud - Calendar App
 *
 * @author Georg Ehrke
 * @copyright 2014 Georg Ehrke <oc.list@georgehrke.com>
 * @author Davide Saurino
 * @copyright 2013 Davide Saurino <davide.saurino@alcacoop.it>
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

use OCP\AppFramework\Http\JSONResponse;
use OCP\AppFramework\Http\TemplateResponse;
use OCP\Contacts;

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
	 * @param string $location
	 * @return JSONResponse
	 *
	 * @NoAdminRequired
	 * @NoCSRFRequired
	 */
	public function searchLocation($location) {
		$result = Contacts::search($location, array('FN', 'ADR'));

		$contacts = array();

		foreach ($result as $r) {
			if (!isset($r['ADR'])) {
				continue;
			}

			$name = '';
			if (isset($r['FN'])) {
				$name = $r['FN'];
			}

			foreach ($r['ADR'] as $address) {
				$address = trim(implode(" ", $address));
				$contacts[] = array(
					'label' => $address,
					'name' => $name
				);
			}
		}

		return new JSONResponse($contacts);
	}


	/**
	 * @param string $search
	 * @return JSONResponse
	 *
	 * @NoAdminRequired
	 * @NoCSRFRequired
	 */
	public function searchAttendee($search) {
		$result = Contacts::search($search, array('FN', 'EMAIL'));

		$contacts = array();

		foreach ($result as $r) {
			if (!isset($r['EMAIL'])) {
				continue;
			}

			$name = '';
			if (isset($r['FN'])) {
				$name = $r['FN'];
			}

			foreach ($r['EMAIL'] as $email) {
				$contacts[] = array(
					'email' => $email,
					'name' => $name
				);
			}
		}

		return new JSONResponse($contacts);
	}
}