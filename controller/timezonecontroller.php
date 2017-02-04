<?php
/**
 * Calendar App
 *
 * @author Georg Ehrke
 * @copyright 2017 Georg Ehrke <oc.list@georgehrke.com>
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

use OCP\AppFramework\Controller;
use OCP\AppFramework\Http;
use OCP\AppFramework\Http\DataDisplayResponse;
use OCP\AppFramework\Http\NotFoundResponse;

class TimezoneController extends Controller {

	/**
	 * @NoAdminRequired
	 *
	 * @param string $id
	 * @return NotFoundResponse|DataDisplayResponse
	 */
	public function getTimezone($id) {
		if (!in_array($id, $this->getTimezoneList())) {
			return new NotFoundResponse();
		}

		$tzData = file_get_contents(__DIR__ . '/../timezones/' . $id);

		return new DataDisplayResponse($tzData, Http::STATUS_OK, [
			'content-type' => 'text/calendar',
		]);
	}

	/**
	 * @NoAdminRequired
	 * @NoCSRFRequired
	 * @PublicPage
	 *
	 * @param $region
	 * @param $city
	 * @return DataDisplayResponse
	 */
	public function getTimezoneWithRegion($region, $city) {
		return $this->getTimezone($region . '-' . $city);
	}

	/**
	 * @NoAdminRequired
	 * @NoCSRFRequired
	 * @PublicPage
	 *
	 * @param $region
	 * @param $subRegion
	 * @param $city
	 * @return DataDisplayResponse
	 */
	public function getTimezoneWithSubRegion($region, $subRegion, $city) {
		return $this->getTimezone($region . '-' . $subRegion . '-' . $city);
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
