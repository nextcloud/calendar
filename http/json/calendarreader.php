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

use OCA\Calendar\Utility\JSONUtility;

class CalendarReader extends SimpleReader {

	/**
	 * parse a json calendar
	 * @param array &$data
	 * @param string $key
	 * @param mixed $value
	 */
	protected function setProperty(&$data, $key, $value) {
		switch($key) {
			case 'backend':
			case 'color':
			case 'description':
			case 'displayname':
			case 'timezone':
				$data[$key] = strval($value);
				break;

			case 'uri':
				$data['publicUri'] = strval($value);
				break;

			case 'order':
				$data[$key] = intval($value);
				break;

			case 'enabled':
				$data[$key] = (bool) $value; //boolval is PHP >= 5.5 only
				break;

			case 'components':
				$data[$key] = JSONUtility::parseComponents($value);
				break;

			//blacklist:
			case 'cruds':
			case 'ctag':
			case 'user':
			case 'owner':
				break;

			default:
				break;
		}
	}
}