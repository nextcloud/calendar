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

use \OCA\Calendar\Utility\SabreUtility;

class JSONObjectCollection extends JSONCollection {

	/**
	 * @brief get headers for response
	 * @return array
	 */
	public function getHeaders() {
		return array_merge(
			parent::getHeaders(),
			array(
				'Content-type' => 'application/calendar+json; charset=utf-8',
			)
		);
	}


	/**
	 * @brief get json-encoded string containing all information
	 * @return mixed (null|array)
	 */
	public function serialize() {
		/**
		 * If the collection is empty, return 204
		 */
		if ($this->object->count() === 0) {
			return null;
		} else {
			$vcalendar = $this->object->getVObject();
			$timezoneMapper = $this->app->query('TimezoneMapper');
		
			SabreUtility::addMissingVTimezones(
				$vcalendar,
				$timezoneMapper
			);

			return $vcalendar->jsonSerialize();
		}
	}
}