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

class Utility {

	/**
	 * slugify a string
	 * @param string $string
	 * @return string
	 */
	public static function slugify($string) {
		$string = preg_replace('~[^\\pL\d\.]+~u', '-', $string);
		$string = trim($string, '-');

		if (function_exists('iconv')) {
			$string = iconv('utf-8', 'us-ascii//TRANSLIT//IGNORE', $string);
		}

		$string = strtolower($string);
		$string = preg_replace('~[^-\w\.]+~', '', $string);
		$string = preg_replace('~\.+$~', '', $string);

		if (empty($string)) {
			return uniqid();
		}

		return $string;
	}


	/**
	 * @param object $object
	 * @return array
	 */
	public static function getPublicProperties($object) {
		if (gettype($object) !== 'object') {
			return [];
		}

		return get_object_vars($object);
	}
}