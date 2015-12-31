<?php
/**
 * ownCloud - Calendar App
 *
 * @author Georg Ehrke
 * @copyright 2016 Georg Ehrke <oc.list@georgehrke.com>
 * @author Raghu Nayyar
 * @copyright 2016 Raghu Nayyar <beingminimal@gmail.com>
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

use OC\AppFramework\Http;
use OCP\AppFramework\Controller;
use OCP\AppFramework\Http\DataDisplayResponse;
use OCP\AppFramework\Http\JSONResponse;
use OCP\AppFramework\Http\NotFoundResponse;
use OCP\AppFramework\Http\TemplateResponse;

class ViewController extends Controller {

	/**
	 * @NoAdminRequired
	 * @NoCSRFRequired
	 *
	 * @return TemplateResponse
	 */
	public function index(){
		return new TemplateResponse('calendar', 'main');
	}

	/**
	 * @NoAdminRequired
	 *
	 * @return JSONResponse
	 */
	public function timezoneList() {
		return new JSONResponse($this->getTimezoneList());
	}

	/**
	 * @NoAdminRequired
	 *
	 * @param string $id
	 * @return DataDisplayResponse
	 */
	public function getTimezone($id) {
		if (!in_array($id, $this->getTimezoneList())) {
			return new NotFoundResponse();
		}

		$tzData = file_get_contents(__DIR__ . '/../timezones/' . $id);

		return new DataDisplayResponse($tzData, HTTP::STATUS_OK, [
			'content-type' => 'text/calendar',
		]);
	}


	/**
	 * @NoAdminRequired
	 *
	 * @param $region
	 * @param $city
	 * @return DataDisplayResponse
	 */
	public function getTimezoneWithRegion($region, $city) {
		return $this->getTimezone($region . '-' . $city);
	}


	/**
	 * get a list of default timezones
	 *
	 * @return array
	 */
	private function getTimezoneList() {
		$allFiles = scandir(__DIR__ . '/../timezones/');

		return array_values(array_filter($allFiles, function($file) {
			return (substr($file, -4) === '.ics');
		}));
	}
}