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
namespace OCA\Calendar\Db;

class ObjectType extends \OCP\Calendar\ObjectType {

	/**
	 * get type as string
	 * @param integer $type
	 * @return string
	 */
	public static function getAsString($type) {
		$types = [];

		if ($type & self::EVENT) {
			$types[] = 'VEVENT';
		}
		if ($type & self::JOURNAL) {
			$types[] = 'VJOURNAL';
		}
		if ($type & self::TODO) {
			$types[] = 'VTODO';
		}

		return implode(',', $types);
	}


	/**
	 * get types as string
	 * @param integer $type
	 * @return string
	 */
	public static function getAsReadableString($type) {
		$types = [];

		if ($type & self::EVENT) {
			$types[] = 'events';
		}
		if ($type & self::JOURNAL) {
			$types[] = 'journals';
		}
		if ($type & self::TODO) {
			$types[] = 'todos';
		}

		return implode(', ', $types);
	}


	/**
	 * get type by string
	 * @param string $string
	 * @return integer
	 */
	public static function getTypeByString($string) {
		$type = 0;

		switch($string) {
			case 'VEVENT':
				$type = self::EVENT;
				break;

			case 'VJOURNAL':
				$type = self::JOURNAL;
				break;

			case 'VTODO':
				$type = self::TODO;
				break;

			default:
				break;
		}

		return $type;
	}


	/**
	 * get types by string
	 * @param string $string
	 * @return integer
	 */
	public static function getTypesByString($string) {
		$types = 0;

		$string = strtoupper($string);
		if (substr_count($string, 'VEVENT')) {
			$types += self::EVENT;
		}
		if (substr_count($string, 'VJOURNAL')) {
			$types += self::JOURNAL;
		}
		if (substr_count($string, 'VTODO')) {
			$types += self::TODO;
		}

		return $types;
	}


	/**
	 * get type by sabre classname
	 * @param mixed (string|object) $class
	 * @return integer
	 */
	public static function getTypeBySabreClass($class) {
		$type = 0;

		if (!is_string($class)) {
			$string = get_class($class);
		} else {
			$string = $class;
		}

		switch($string) {
			case 'OCA\\Calendar\\Sabre\\VObject\\Component\\VEvent':
				$type = self::EVENT;
				break;

			case 'OCA\\Calendar\\Sabre\\VObject\\Component\\VJournal':
				$type = self::JOURNAL;
				break;

			case 'OCA\\Calendar\\Sabre\\VObject\\Component\\VTodo':
				$type = self::TODO;
				break;

			default:
				break;
		}

		return $type;
	}
}