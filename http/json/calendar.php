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
	public function serialize($convenience=true) {
		$this->jsonArray = array();

		$properties = get_object_vars($this->object);

		foreach($properties as $key => $key) {
			$propertyGetter = 'get' . ucfirst($key);
			$key = strtolower($key);
			$value = $this->object->{$propertyGetter}();

			switch($key) {
				case 'color':
				case 'displayname':
				case 'timezone':
				case 'backend':
				case 'uri':
					$this->jsonArray[$key] = (string) $value;
					break;

				case 'ctag':
				case 'order':
					$this->jsonArray[$key] = (int) $value;
					break;

				case 'enabled':
					$this->jsonArray[$key] = (bool) $value;
					break;

				case 'components':
					$this->jsonArray[$key] = JSONUtility::getComponents($value);
					break;

				case 'cruds':
					$this->jsonArray[$key] = JSONUtility::getCruds($value);
					break;

				case 'ownerId':
				case 'userId':
					$key = substr($key, 0, (strlen($key) - 2));
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

		$this->setCalendarURL();
		$this->setCalDAVURL();

		return $this->jsonArray;
	}

	/**
	 * @brief set api url to calendar
	 */
	private function setCalendarURL() {
		$calendarURI = CalendarUtility::getURI($this->object->getBackend(), $this->object->getUri());

		$calendarURL = JSONUtility::getURL($calendarURI);
		$this->jsonArray['url'] = $calendarURL;
	}

	private function setCalDAVURL() {
		$calendarURI = CalendarUtility::getURI($this->object->getBackend(), $this->object->getUri());

		$calDAVURL = JSONUtility::getCalDAV($calendarURI);
		$this->jsonArray['caldav'] = $calDAVURL;
	}
}