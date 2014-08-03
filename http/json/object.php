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
namespace OCA\Calendar\Http\JSON;

use OCP\Calendar\IEntity;
use OCP\Calendar\ICollection;
use OCA\Calendar\Http\JSONResponse;
use OCA\Calendar\Utility\SabreUtility;

class JSONObjectResponse extends JSONResponse {

	public function preSerialize() {
		$this->addHeader('Content-type', 'application/calendar+json; charset=utf-8');
	}


	/**
	 * get json-encoded string containing all information
	 */
	public function serializeData() {
		if ($this->input instanceof IEntity || $this->input instanceof ICollection) {
			/* @var \OCA\Calendar\Sabre\VObject\Component\VCalendar $vcalendar */
			$vcalendar = $this->input->getVObject();
			$timezoneMapper = $this->app->query('TimezoneMapper');

			SabreUtility::addMissingVTimezones(
				$vcalendar,
				$timezoneMapper
			);

			$this->data = $vcalendar->jsonSerialize();
		} else {
			$this->data = array();
		}
	}
}