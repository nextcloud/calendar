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

use OCA\Calendar\Http\Reader;
use OCP\Calendar\ICalendar;
use OCP\Calendar\ICalendarCollection;
use OCP\Calendar\ITimezone;

use OCA\Calendar\BusinessLayer\BusinessLayerException;
use OCA\Calendar\Db\Calendar;
use OCA\Calendar\Db\CalendarCollection;
use OCA\Calendar\Http\SerializerException;
use OCA\Calendar\Http\ReaderException;
use OCA\Calendar\Utility\JSONUtility;

class JSONCalendarReader extends Reader {


	/**
	 * @var \OCA\Calendar\BusinessLayer\TimezoneBusinessLayer
	 */
	protected $timezones;


	public function preParse() {
		$this->timezones = $this->app->query('TimezoneBusinessLayer');
	}


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

		$this->setObject($object);
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
					$calendar->$setter(strval($value));
					break;

				case 'uri':
					$calendar->setPublicUri(strval($value));
					break;

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

				case 'timezone':
					$timezoneObject = $this->parseTimezone($value);
					$calendar->$setter($timezoneObject);
					break;

				//blacklist:
				case 'url':
				case 'caldav':
				case 'cruds':
				case 'ctag':
				case 'user':
				case 'owner':
					break;

				default:
					break;
			}
		}

		return $calendar;
	}


	/**
	 * @param string $tzId
	 * @return ITimezone|null
	 */
	private function parseTimezone($tzId) {
		try {
			return $this->timezones->find($tzId, $this->app->getCoreApi()->getUserId());
		} catch(BusinessLayerException $ex) {
			return null;
		}
	}
}