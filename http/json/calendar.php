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

class JSONCalendar extends JSON {

	/**
	 * json-encoded data
	 * @var array
	 */
	private $jsonArray;


	/**
	 * @brief get headers for response
	 * @return array
	 */
	public function getHeaders() {
		return array_merge(
			parent::getHeaders(),
			array(
				'Content-type' => 'application/json; charset=utf-8',
			)
		);
	}


	/**
	 * @brief get json-encoded string containing all information
	 * @return array
	 */
	public function serialize() {
		$this->jsonArray = array();

		$properties = get_object_vars($this->object);
		foreach($properties as $key => $value) {
			$getter = 'get' . ucfirst($key);
			$value = $this->object->{$getter}();

			$this->setProperty(strtolower($key), $value);
		}

		$this->setCalendarURL();
		$this->setCalDAVURL();

		return $this->jsonArray;
	}


	/**
	 * @brief set property 
	 * @param string $key
	 * @param mixed $value
	 */
	private function setProperty($key, $value) {
		switch($key) {
			case 'color':
			case 'displayname':
			case 'timezone':
			case 'backend':
			case 'uri':
				$this->jsonArray[$key] = strval($value);
				break;

			case 'ctag':
			case 'order':
				$this->jsonArray[$key] = intval($value);
				break;

			case 'enabled':
				$this->jsonArray[$key] = (bool) $value; //boolval is PHP >= 5.5 only
				break;

			case 'components':
				$this->jsonArray[$key] = JSONUtility::getComponents($value);
				break;

			case 'cruds':
				$this->jsonArray[$key] = JSONUtility::getCruds($value);
				break;

			case 'ownerId':
			case 'userId':
				$key = substr($key, 0, -2);
				$this->jsonArray[$key] = JSONUtility::getUserInformation($value);
				break;

			//blacklist
			case 'id':
				break;

			default:
				$this->jsonArray[$key] = $value;
				break;
			
		}
	}


	/**
	 * @brief set api url to calendar
	 * @return $this
	 */
	private function setCalendarURL() {
		$calendarURI = CalendarUtility::getURI(
			$this->object->getBackend(),
			$this->object->getUri()
		);

		$calendarURL = JSONUtility::getURL($calendarURI);
		$this->jsonArray['url'] = $calendarURL;

		return $this;
	}


	/**
	 * @brief set api url to calendar
	 * @return $this;
	 */
	private function setCalDAVURL() {
		$calendarURI = CalendarUtility::getURI(
			$this->object->getBackend(),
			$this->object->getUri()
		);

		$calDAVURL = JSONUtility::getCalDAV($calendarURI, $this->object->getUserId());
		$this->jsonArray['caldav'] = $calDAVURL;

		return $this;
	}
}