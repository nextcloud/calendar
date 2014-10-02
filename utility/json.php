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

use OCP\Calendar\ObjectType;
use OCP\Calendar\Permissions;
use OCP\User;

class JSONUtility extends Utility {

	/**
	 * get json-encoded user-information
	 * @param string $userId
	 * @return array
	 */
	public static function getUserInformation($userId) {
		return [
			'userid' => $userId,
			'displayname' => User::getDisplayName($userId),
		];
	}


	/**
	 * get json-encoded component-information
	 * @param integer $components
	 * @return array
	 */
	public static function getComponents($components) {
		return [
			'vevent'	=> (bool) ($components & ObjectType::EVENT),
			'vjournal'	=> (bool) ($components & ObjectType::JOURNAL),
			'vtodo'		=> (bool) ($components & ObjectType::TODO),
		];
	}


	/**
	 * get json-encoded cruds-information
	 * @param integer $cruds
	 * @return array
	 */
	public static function getCruds($cruds) {
		return [
			'create' =>	(bool) ($cruds & Permissions::CREATE),
			'read' => 	(bool) ($cruds & Permissions::READ),
			'update' =>	(bool) ($cruds & Permissions::UPDATE),
			'delete' =>	(bool) ($cruds & Permissions::DELETE),
			'share' =>	(bool) ($cruds & Permissions::SHARE),
		];
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
}