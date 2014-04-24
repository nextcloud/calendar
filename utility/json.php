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

use \OCA\Calendar\Db\Timezone;

class JSONUtility extends Utility{

	/**
	 * @brief get json-encoded user-information
	 * @param string $userId
	 * @return array
	 */
	public static function getUserInformation($userId) {
		if($userId === null) {
			$userId = \OCP\User::getUser();
		}

		return array(
			'userid' => $userId,
			'displayname' => \OCP\User::getDisplayName($userId),
		);
	}


	/**
	 * @brief parse json-encoded user-information
	 * @param array $value
	 * @return string $userId
	 */
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


	/**
	 * @brief get json-encoded component-information
	 * @param integer $components
	 * @return array
	 */
	public static function getComponents($components) {
		return array(
			'vevent'	=> (bool) ($components & ObjectType::EVENT),
			'vjournal'	=> (bool) ($components & ObjectType::JOURNAL),
			'vtodo'		=> (bool) ($components & ObjectType::TODO),
		);
	}


	/**
	 * @brief parse json-encoded component-information
	 * @param array $value
	 * @return integer $userId
	 */
	public static function parseComponents($value) {
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


	/**
	 * @brief get json-encoded cruds-information
	 * @param integer $cruds
	 * @return array
	 */
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


	/**
	 * @brief parse json-encoded cruds-information
	 * @param array $value
	 * @return integer $userId
	 */
	public static function parseCruds($value) {
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

		return $code;
	}


	/**
	 * @brief get json-encoded timezone-information
	 * @param Timezone
	 * @return array
	 */
	public static function getTimeZone(Timezone $timezone) {
		$jsonTimezone = new JSONTimezone($timezone);
		return $jsonTimezone->serialize();
	}


	/**
	 * @brief parse json-encoded timezone-information
	 * @param array
	 * @return null
	 */
	public static function parseTimeZone($value) {
		return null;
	}


	/**
	 * @brief get url for calendar
	 * @param string $calendarURI
	 * @return string
	 */
	public static function getURL($calendarURI) {
		$properties = array(
			'calendarId' => $calendarURI,
		);

		$url = \OCP\Util::linkToRoute('calendar.calendar.show', $properties);
		return \OCP\Util::linkToAbsolute('', substr($url, 1));
	}


	/**
	 * @brief get caldav url for calendar
	 * @param string $calendarURI
	 * @param string $userId
	 * @return array
	 */
	public static function getCalDAV($calendarURI, $userId) {
		$url  = \OCP\Util::linkToRemote('caldav');
		$url .= urlencode($userId) . '/';
		$url .= $calendarURI . '/';

		return $url;
	}
}