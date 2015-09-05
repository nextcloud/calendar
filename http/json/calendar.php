<?php
/**
 * Copyright (c) 2014 Georg Ehrke <oc.list@georgehrke.com>
 * This file is licensed under the Affero General Public License version 3 or
 * later.
 * See the COPYING-README file.
 * 
 * Example output:
 * ```json
 * {
 *   "displayname" : "Work",
 *   "calendarURI" : "local-work",
 *   "owner" : {
 *     "userid" : "developer42",
 *     "displayname" : "developer42"
 *   },
 *   "ctag" : 0,
 *   "url" : "https://owncloud/index.php/apps/calendar/calendars/local-work",
 *   "color" : "#000000",
 *   "order" : 0,
 *   "enabled" : true,
 *   "components" : {
 *     "vevent" : true,
 *     "vjournal" : false,
 *     "vtodo" : true
 *   },
 *   "timezone" : {}, //see JSONTIMEZONE
 *   "user" : {
 *     "userid" : "developer42",
 *     "displayname" : "developer42"
 *   },
 *   "cruds" : {
 *     "create" : true,
 *     "update" : true,
 *     "delete" : true,
 *     "code" : 31,
 *     "read" : true,
 *     "share" : true
 *   }
 * }
 * ```
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
	 * @brief get mimetype of serialized output
	 */
	public function getMimeType() {
		return 'application/json';
	}


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
				case 'backend':
				case 'uri':
					break;

				default:
					$this->jsonArray[$key] = $value;
					break;
				
			}
		}

		$this->setCalendarURI();
		$this->setCalendarURL();

		return $this->jsonArray;
	}

	/**
	 * @brief set public calendar uri
	 */
	private function setCalendarURI() {
		$backend = $this->object->getBackend();
		$calendarURI = $this->object->getUri();

		$calendarURI = CalendarUtility::getURI($backend, $calendarURI);

		$this->jsonArray['calendarURI'] = $calendarURI;
	}

	/**
	 * @brief set api url to calendar
	 */
	private function setCalendarURL() {
		$calendarURI = $this->jsonArray['calendarURI'];

		//TODO - fix me
		//$calendarURL = JSONUtility::getURL($calendarURI);
		$calendarURL = '';

		$this->jsonArray['url'] = $calendarURL;
	}
}