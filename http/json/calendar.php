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

use OCP\Calendar\ITimezone;
use OCA\Calendar\Http\JSONResponse;
use OCA\Calendar\Utility\JSONUtility;

class JSONCalendarResponse extends JSONResponse {

	/**
	 * set property
	 * @param array &$data
	 * @param string $key
	 * @param mixed $value
	 */
	public function setProperty(array &$data, $key, $value) {
		switch($key) {
			case 'color':
			case 'description':
			case 'displayname':
			case 'backend':
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

			case 'ownerId':
			case 'userId':
				$key = substr($key, 0, -2);
				$data[$key] = JSONUtility::getUserInformation($value);
				break;

			case 'lastpropertiesupdate':
			case 'lastobjectupdate':
			case 'privateuri':
				break;

			default:
				$data[$key] = $value;
				break;
			
		}
	}
}