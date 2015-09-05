<?php
/**
 * Copyright (c) 2014 Georg Ehrke <oc.list@georgehrke.com>
 * This file is licensed under the Affero General Public License version 3 or
 * later.
 * See the COPYING-README file.
 */
namespace OCA\Calendar\Utility;

use \OCA\Calendar\Db\ObjectType;
use \OCA\Calendar\Db\Permissions;

class JSONUtility extends Utility{

	public static function getUserInformation($userId) {
		if($userId === null) {
			$userId = \OCP\User::getUser();
		}

		return array(
			'userid' => $userId,
			'displayname' => \OCP\User::getDisplayName($userId),
		);
	}

	public static function parseUserInformation($value) {
		if(is_array($value) === false) {
			return null;
		}

		if(array_key_exists('userid', $value) === false) {
			return null;
		} else {
			return $value['userid'];
		}
	}

	public static function getComponents($components) {
		return array(
			'vevent'	=> (bool) ($components & ObjectType::EVENT),
			'vjournal'	=> (bool) ($components & ObjectType::JOURNAL),
			'vtodo'		=> (bool) ($components & ObjectType::TODO),
		);
	}

	public static function parseComponents($value) {
		if(is_array($value) === false) {
			return null;
		}

		$components = 0;

		if(array_key_exists('vevent', $value) && $value['vevent'] === true) {
			$components += ObjectType::EVENT;
		}
		if(array_key_exists('vjournal', $value) && $value['vjournal'] === true) {
			$components += ObjectType::JOURNAL;
		}
		if(array_key_exists('vtodo', $value) && $value['vtodo'] === true) {
			$components += ObjectType::TODO;
		}

		return $components;
	}

	public static function getCruds($cruds) {
		return array(
			'code' => 	$cruds,
			'create' =>	(bool) ($cruds & Permissions::CREATE),
			'read' => 	(bool) ($cruds & Permissions::READ),
			'update' =>	(bool) ($cruds & Permissions::UPDATE),
			'delete' =>	(bool) ($cruds & Permissions::DELETE),
			'share' =>	(bool) ($cruds & Permissions::SHARE),
		);
	}

	public static function parseCruds($value) {
		if(is_array($value) === false) {
			return null;
		}

		$cruds = 0;

		//use code if given
		if(array_key_exists('code', $value) && (int) $value['code'] >= 0 && (int) $value['code'] <= 31) {
			$cruds = (int) $value['code'];
		} else {
			if(array_key_exists('create', $value) && $value['create'] === true) {
				$cruds += Permissions::CREATE;
			}
			if(array_key_exists('update', $value) && $value['update'] === true) {
				$cruds += Permissions::UPDATE;
			}
			if(array_key_exists('delete', $value) && $value['delete'] === true) {
				$cruds += Permissions::DELETE;
			}
			if(array_key_exists('read', $value) && $value['read'] === true) {
				$cruds += Permissions::READ;
			}
			if(array_key_exists('share', $value) && $value['share'] === true) {
				$cruds += Permissions::SHARE;
			}
		}
	}

	public static function parseCalendarURIForBackend($calendarURI) {
		list($backend, $uri) = CalendarUtility::splitURI($calendarURI);
		if($backend === false) {
			return null;
		}

		return $backend;
	}

	public static function parseCalendarURIForURI($calendarURI) {
		list($backend, $uri) =  CalendarUtility::splitURI($calendarURI);
		if($uri === false) {
			return null;
		}

		return $uri;
	}

	public static function parseCalendarURI($key, $value) {
		list($backend, $calendarURI) = CalendarUtility::splitURI($value);

		if($backend === false || $calendarURI === false) {
			return null;
		}

		return array(
			$backend,
			$calendarURI
		);
	}

	public static function getTimeZone($timezone, $convenience) {
		$jsonTimezone = new JSONTimezone($timezone);
		return $jsonTimezone->serialize($convenience);
	}

	public static function parseTimeZone($value) {
		//$timezoneReader = new JSONTimezoneReader($value);
		//return $timezoneReader->getObject();
		return null;
	}

	public static function getURL($calendarURI) {
		$properties = array(
			'calendarId' => $calendarURI,
		);

		$url = \OCP\Util::linkToRoute('calendar.calendars.show', $properties);
		$this->url = \OCP\Util::linkToAbsolute('', substr($url, 1));
	}

	public static function addConvenience(&$vobject) {
		$dtstart = SabreUtility::getDTStart($vobject);
		if($dtstart !== null) {
			$vobject->{'X-OC-DTSTART'} = $dtstart->getDateTime()->format(\DateTime::ISO8601);
		}

		$dtend = SabreUtility::getDTEnd($vobject);
		if($dtend !== null) {
			$vobject->{'X-OC-DTEND'} = $dtend->getDateTime()->format(\DateTime::ISO8601);
		}

		//extending SabreDAV's date and datetime jsonSerialize method would probably be easier
		//iterate over all VALARMs
		//iterate over all VTIMEZONEs
		//iterate over all FREEBUSY
		//DTSTART
		//DTEND
		//CREATED
		//DTSTAMP
		//LAST-MODIFIED
		//DUE
		//COMPLETED
		//RECCURENCE-ID
	}

	public static function dropAttachements(&$vobject) {
		
	}

	public static function removeConvenience(&$vobject) {
		
	}
}