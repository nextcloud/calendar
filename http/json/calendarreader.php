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
		try{
			$data = $this->getData();
			$isCollection = false;

			if(array_key_exists(0, $data) === true && is_array($data[0]) === true) {
				$isCollection = true;
			}

			if($isCollection === false) {
				try {
					$object = $this->parseSingleEntry($data);
					$this->setObject($object);
				} catch(/* some */Exception $ex) {
					//TODO - log error msg
					return;
				}
			} else {
				$collection = new CalendarCollection();

				foreach($data as $entry) {
					try {
						$object = $this->parseSingleEntry($data);
						$collection->add($object);
					} catch(/* some */Exception $ex) {
						//TODO - log some error msg
						continue;
					}
				}

				$this->setObject($collection);
			}
		} catch(Exception $ex /* What exception is being thrown??? */) {
			throw new JSONCalendarReaderException($ex->getMessage());
		}
	}

	/**
	 * @brief overwrite values that should not be set by user with null
	 */
	public function sanitize() {
		//make sure object exists
		$this->getObject();

		$sanitize = array(
			'userId',
			'ownerId',
			'cruds',
			'ctag',
		);

		parent::nullProperties($sanitize);
		return $this;
	}

	private function parseSingleEntry($data) {
		$calendar = new Calendar();

		foreach($data as $key => $value) {
			$propertySetter = 'set' . ucfirst($key);

			switch($key) {
				case 'color':
				case 'displayname':
				case 'timezone':
					$calendar->{$propertySetter}((string) $value);
					break;

				case 'ctag':
				case 'order':
					$calendar->{$propertySetter}((int) $value);
					break;

				case 'enabled':
					$calendar->{$propertySetter}((bool) $value);
					break;

				case 'components':
					$calendar->{$propertySetter}(JSONUtility::parseComponents($value));
					break;

				case 'cruds':
					$calendar->{$propertySetter}(JSONUtility::parseCruds($value));
					break;

				case 'owner':
				case 'user':
					$propertySetter .= 'Id';
					$calendar->{$propertySetter}(JSONUtility::parseUserInformation($value));
					break;

				case 'calendarURI':
					$calendar->setBackend(JSONUtility::parseCalendarURIForBackend($value));
					$calendar->setUri(JSONUtility::parseCalendarURIForURI($value));

				//blacklist:
				case 'url':
					break;

				default:
					break;
			}
		}

		return $calendar;
	}
}

class JSONCalendarReaderException extends \Exception{}