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

use OCA\Calendar\ICalendar;
use OCA\Calendar\ITimezone;
use OCA\Calendar\Utility\ColorUtility;
use OCA\Calendar\Utility\JSONUtility;

class CalendarResponse extends SimpleResponse {

	/**
	 * generate output for one calendar
	 * @param ICalendar $calendar
	 * @return array
	 */
	protected function generate(ICalendar $calendar) {
		$data = parent::generate($calendar);

		$this->generateTextColor($data);

		return $data;
	}

	/**
	 * @param array &$data
	 * @param string $key
	 * @param mixed $value
	 */
	public function setProperty(array &$data, $key, $value) {
		switch($key) {
			case 'backend':
			case 'color':
			case 'description':
			case 'displayname':
				$data[$key] = strval($value);
				break;

			case 'timezone':
				$data[$key] = ($value instanceof ITimezone) ? $value->getTzId() : null;
				break;

			case 'publicuri':
				$data['uri'] = strval($value);
				break;

			case 'ctag':
			case 'id':
			case 'order':
				$data[$key] = intval($value);
				break;

			case 'enabled':
				$data[$key] = (bool) $value; //boolval is PHP >= 5.5 only
				break;

			case 'components':
				$data[$key] = JSONUtility::getComponents($value);
				break;

			case 'cruds':
				$data[$key] = JSONUtility::getCruds($value);
				break;

			case 'ownerid':
			case 'userid':
				$key = substr($key, 0, -2);
				$data[$key] = JSONUtility::getUserInformation($value);
				break;

			case 'lastpropertiesupdate':
			case 'lastobjectupdate':
			case 'privateuri':
			case 'fileid':
				break;

			default:
				$data[$key] = $value;
				break;
		}
	}


	/**
	 * @param array $data
	 */
	protected function generateTextColor(array &$data) {
		$dark = '#000000';
		$bright = '#FAFAFA';

		if (!isset($data['color'])) {
			$data['textColor'] = $dark;
			return;
		}

		$color = ColorUtility::getHEX($data['color']);
		if (!$color) {
			return;
		}

		$color = substr($color, 1);
		$red = hexdec(substr($color,0,2));
		$green = hexdec(substr($color,2,2));
		$blue = hexdec(substr($color,4,2));

		$brightness = ((($red * 299) + ($green * 587) + ($blue * 114)) / 1000);
		$data['textColor'] = ($brightness > 130) ? $dark : $bright;
	}
}