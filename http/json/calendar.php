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

use OCP\Calendar\ICalendar;
use OCP\Calendar\ICalendarCollection;
use OCP\Calendar\ITimezone;

use OCA\Calendar\Http\JSONResponse;
use OCA\Calendar\Http\SerializerException;
use OCA\Calendar\Utility\JSONUtility;

class JSONCalendarResponse extends JSONResponse {

	/**
	 * serialize output data from input
	 */
	public function serializeData() {
		if ($this->input instanceof ICalendar) {
			$this->data = $this->generate($this->input);
		} elseif ($this->input instanceof ICalendarCollection) {
			$data = array();
			$this->input->iterate(function (ICalendar $calendar) use (&$data) {
				try {
					$data[] = $this->generate($calendar);
				} catch (SerializerException $ex) {
					return;
				}
			});
			$this->data = $data;
		} else {
			$this->data = array();
		}
	}


	/**
	 * generate output for one backend
	 * @param ICalendar $calendar
	 * @return array
	 */
	public function generate(ICalendar $calendar) {
		$data = array();

		$properties = get_object_vars($calendar);
		foreach ($properties as $key => $value) {
			$getter = 'get' . ucfirst($key);
			$value = $calendar->{$getter}();

			$this->setProperty($data, strtolower($key), $value);
		}

		return $data;
	}


	/**
	 * set property
	 * @param array &$data
	 * @param string $key
	 * @param mixed $value
	 */
	private function setProperty(array &$data, $key, $value) {
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