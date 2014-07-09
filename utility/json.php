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
namespace OCA\Calendar\Utility;

use OCP\User;
use OCP\Util;

use OCP\Calendar\ObjectType;
use OCP\Calendar\Permissions;

class JSONUtility extends Utility{

	/**
	 * get json-encoded user-information
	 * @param string $userId
	 * @return array
	 */
	public static function getUserInformation($userId) {
		if ($userId === null) {
			$userId = User::getUser();
		}

		return array(
			'userid' => $userId,
			'displayname' => User::getDisplayName($userId),
		);
	}


	/**
	 * parse json-encoded user-information
	 * @param array $value
	 * @return string $userId
	 */
	public static function parseUserInformation($value) {
		if (is_array($value) === false) {
			return null;
		}

		if (array_key_exists('userid', $value) === false) {
			return null;
		} else {
			return $value['userid'];
		}
	}


	/**
	 * get json-encoded component-information
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
	 * parse json-encoded component-information
	 * @param array $value
	 * @return integer $userId
	 */
	public static function parseComponents($value) {
		$components = 0;

		if (array_key_exists('vevent', $value) && $value['vevent'] === true) {
			$components += ObjectType::EVENT;
		}
		if (array_key_exists('vjournal', $value) && $value['vjournal'] === true) {
			$components += ObjectType::JOURNAL;
		}
		if (array_key_exists('vtodo', $value) && $value['vtodo'] === true) {
			$components += ObjectType::TODO;
		}

		return $components;
	}


	/**
	 * get json-encoded cruds-information
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
	 * get url for calendar
	 * @param string $calendarURI
	 * @return string
	 */
	public static function getURL($calendarURI) {
		$properties = array(
			'calendarId' => $calendarURI,
		);

		$url = Util::linkToRoute('calendar.calendar.show', $properties);
		return Util::linkToAbsolute('', substr($url, 1));
	}


	/**
	 * get caldav url for calendar
	 * @param string $calendarURI
	 * @param string $userId
	 * @return array
	 */
	public static function getCalDAV($calendarURI, $userId) {
		$url  = Util::linkToRemote('caldav');
		$url .= urlencode($userId) . '/';
		$url .= $calendarURI . '/';

		return $url;
	}
}