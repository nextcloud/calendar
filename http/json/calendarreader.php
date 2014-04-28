<?php
/**
 * Copyright (c) 2014 Georg Ehrke <oc.list@georgehrke.com>
 * This file is licensed under the Affero General Public License version 3 or
 * later.
 * See the COPYING-README file.
 */
namespace OCA\Calendar\Http\JSON;

use \OCA\Calendar\Db\Calendar;
use \OCA\Calendar\Db\ObjectType;
use \OCA\Calendar\Db\Permissions;

use \OCA\Calendar\Http\ReaderException;

use \OCA\Calendar\Utility\CalendarUtility;
use \OCA\Calendar\Utility\JSONUtility;

class JSONCalendarReader extends JSONReader{

	/**
	 * @brief parse jsoncalendar
	 */
	public function parse() {
		$data = stream_get_contents($this->handle);
		$json = json_decode($data, true);

		if ($json === null) {
			$msg  = 'JSONCalendarReader: User Error';
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
	 * @brief overwrite values that should not be set by user with null
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
	 * @brief check if $this->data is a collection
	 * @return boolean
	 */
	private function isUserDataACollection($json) {
		if (array_key_exists(0, $json) && is_array($json[0])) {
			return true;
		}

		return false;
	}


	/**
	 * @brief parse a json calendar collection
	 * @return \OCA\Calendar\Db\CalendarCollection
	 */
	private function parseCollection($data) {
		$collection = new CalendarCollection();

		foreach($data as $singleEntity) {
			try {
				$calendar = $this->parseSingleEntity($singleEntity);
				$collection->add($calendar);
			} catch(JSONReaderException $ex) {
				//TODO - log error message
				continue;
			}
		}

		return $collection;
	}


	/**
	 * @brief parse a json calendar
	 * @return \OCA\Calendar\Db\Calendar
	 */
	private function parseSingleEntity($data) {
		$calendar = new Calendar();

		foreach($data as $key => $value) {
			$setter = 'set' . ucfirst($key);

			switch($key) {
				case 'color':
				case 'displayname':
				case 'backend':
				case 'uri':
				case 'timezone':
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
					$propertySetter .= 'Id';
					$value = JSONUtility::parseUserInformation($value);
					$calendar->$setter($value);
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
}