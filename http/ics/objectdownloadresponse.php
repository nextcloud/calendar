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
namespace OCA\Calendar\Http\ICS;

use OCA\Calendar\Db\TimezoneMapper;
use OCA\Calendar\ICalendar;
use OCA\Calendar\IObject;
use OCA\Calendar\Utility\SabreUtility;

use OCP\AppFramework\Http\DataDownloadResponse;

class ObjectDownloadResponse extends DataDownloadResponse {

	/**
	 * @param ICalendar $calendar
	 * @param \OCA\Calendar\IObject|\OCA\Calendar\IObjectCollection $data
	 * @param TimezoneMapper $timezones
	 */
	public function __construct(ICalendar $calendar, $data, TimezoneMapper $timezones) {
		$vobject = $data->getVObject();
		if ($vobject) {
			if ($timezones) {
				SabreUtility::addMissingVTimezones($vobject, $timezones);
			}

			$serialized = $vobject->serialize();

			$contentType = 'application/octet-stream';

			$filename  = $calendar->getPublicUri();
			if ($data instanceof IObject) {
				$filename .= '-' . $data->getSummary();
			}
			$filename .= '.ics';

			parent::__construct($serialized, $filename, $contentType);
		}
	}
}