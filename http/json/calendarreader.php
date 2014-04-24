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

use \OCA\Calendar\Utility\CalendarUtility;
use \OCA\Calendar\Utility\JSONUtility;

class JSONCalendarReader extends JSONReader{

	/**
	 * @brief parse jsoncalendar
	 */
	public function parse() {
		$data = $this->getData();
		$isCollection = $this->isDataACollection();

		if ($isCollection) {
			$collection = new CalendarCollection();

			foreach($data as $singleEntity) {
				try {
					$calendar = $this->parseJSONCalendar($singleEntity);
					$collection->add($calendar);
				} catch(JSONReaderException $ex) {
					//TODO - log error message
					continue;
				}
			}

			$this->setObject($collection);
		} else {
			try {
				$calendar = $this->parseJSONCalendar($data);
				$this->setObject($calendar);
			} catch(JSONReaderException $ex) {
				//TODO - log error message
				return;
			}
		}
		return $this;
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

		parent::nullProperties($sanitize);
		return $this;
	}

	/**
	 * @brief check if $this->data is a collection
	 * @return boolean
	 */
	private function isDataACollection() {
		$data = $this->data;

		if (array_key_exists(0, $data) && is_array($data[0])) {
			return true;
		}
		return false;
	}

	/**
	 * @brief parse a single json calendar
	 * @return \OCA\Calendar\Db\Calendar
	 */
	private function parseJSONCalendar($data) {
		$calendar = new Calendar();

		foreach($data as $key => $value) {
			$setter = 'set' . ucfirst($key);

			switch($key) {
				case 'color':
				case 'displayname':
				case 'backend':
				case 'uri':
				//case 'timezone':
					$value = strval($value);
					$calendar->$setter($value);
					break;

				case 'ctag':
				case 'order':
					$value = intval($value);
					$calendar->$setter($value);
					break;

				case 'enabled':
					//$value = boolval($value); boolval is PHP >= 5.5 only
					$calendar->$setter($value);
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

				case 'calendarURI':
					$this->setCalendarURI($value);
					break;

				//blacklist:
				case 'url':
					break;

				default:
					break;
			}
		}

		return $calendar;
	}

	private function setCalendarURI($calendarURI) {
		//Todo - check 
	}
}