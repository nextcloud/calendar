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
use OCP\Calendar\DoesNotExistException;

use OCA\Calendar\Db\Calendar;
use OCA\Calendar\Db\CalendarCollection;
use OCA\Calendar\Http\SerializerException;
use OCA\Calendar\Http\ReaderException;
use OCA\Calendar\Utility\JSONUtility;

class JSONCalendarReader extends JSONReader{

	/**
	 * @return $this
	 * @throws ReaderException
	 */
	public function parse() {
		$data = stream_get_contents($this->handle);
		$json = json_decode($data, true);

		if ($json === null) {
			$msg  = 'JSONCalendarReader: User Error: ';
			$msg .= 'Could not decode json string.';
			throw new ReaderException($msg);
		}

		if ($this->isUserDataACollection($json)) {
			$object = $this->parseCollection($json);
		} else {
			$object = $this->parseSingleEntity($json);
		}

		return $this->setObject($object);
	}


	/**
	 * overwrite values that should not be set by user with null
	 */
	public function sanitize() {
		if ($this->object === null) {
			$this->parse();
		}

		$sanitize = array(
			'userId',
			'ownerId',
			'cruds',
			'ctag',
		);

		return parent::nullProperties($sanitize);
	}


	/**
	 * check if $this->data is a collection
	 * @param array $json
	 * @return boolean
	 */
	private function isUserDataACollection(array $json) {
		if (array_key_exists(0, $json) && is_array($json[0])) {
			return true;
		}

		return false;
	}


	/**
	 * parse a json calendar collection
	 * @param array $data
	 * @return ICalendarCollection
	 */
	private function parseCollection(array $data) {
		$collection = new CalendarCollection();

		foreach($data as $singleEntity) {
			try {
				$calendar = $this->parseSingleEntity($singleEntity);
				$collection->add($calendar);
			} catch(SerializerException $ex) {
				//TODO - log error message
				continue;
			}
		}

		return $collection;
	}


	/**
	 * parse a json calendar
	 * @param array $data
	 * @return ICalendar
	 */
	private function parseSingleEntity(array $data) {
		$calendar = new Calendar();

		foreach($data as $key => $value) {
			$setter = 'set' . ucfirst($key);

			switch($key) {
				case 'color':
				case 'description':
				case 'displayname':
				case 'backend':
				case 'uri':
					$calendar->$setter(strval($value));
					break;

				case 'ctag':
				case 'order':
					$calendar->$setter(intval($value));
					break;

				case 'enabled':
					$calendar->$setter((bool) $value); //boolval is PHP >= 5.5 only
					break;

				case 'components':
					$value = JSONUtility::parseComponents($value);
					$calendar->$setter($value);
					break;

				case 'cruds':
					$value = JSONUtility::parseCruds($value);
					$calendar->$setter($value);
					break;

				case 'owner':
				case 'user':
					$setter .= 'Id';
					$value = JSONUtility::parseUserInformation($value);
					$calendar->$setter($value);
					break;

				case 'timezone':
					$timezoneObject = $this->parseTimezone($value);
					$calendar->$setter($timezoneObject);
					break;

				//blacklist:
				case 'url':
				case 'caldav':
					break;

				default:
					break;
			}
		}

		return $calendar;
	}


	/**
	 * get timezone Object from timezoneId
	 * @param string $timezoneId
	 * @return ITimezone
	 */
	private function parseTimezone($timezoneId) {
		try {
			if (trim($timezoneId) === '') {
				return null;
			}

			$timezoneMapper = $this->app->query('TimezoneMapper');
			return $timezoneMapper->find($timezoneId);
		} catch(DoesNotExistException $ex) {
			return null;
		}
	}
}