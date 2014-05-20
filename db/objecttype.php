<?php
/**
 * Copyright (c) 2014 Georg Ehrke <oc.list@georgehrke.com>
 * This file is licensed under the Affero General Public License version 3 or
 * later.
 * See the COPYING-README file.
 */
namespace OCA\Calendar\Db;

class ObjectType extends \OCP\Calendar\ObjectType {

	/**
	 * @brief get type as string
	 * @param integer $type
	 * @return string
	 */
	public static function getAsString($type) {
		$types = array();

		if ($type & self::EVENT) {
			$types[] = 'VEVENT';
		}
		if ($type & self::JOURNAL) {
			$types[] = 'VJOURNAL';
		}
		if ($type & self::TODO) {
			$types[] = 'VTODO';
		}

		$string = implode(',', $types);
		return $string;
	}


	/**
	 * @brief get types as string
	 * @param integer $type
	 * @return string
	 */
	public static function getAsReadableString($type) {
		$types = array();

		if ($type & self::EVENT) {
			$types[] = 'events';
		}
		if ($type & self::JOURNAL) {
			$types[] = 'journals';
		}
		if ($type & self::TODO) {
			$types[] = 'todos';
		}

		$string = implode(', ', $types);
		return $string; 
	}


	/**
	 * @brief get type by string
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
	 * @brief get types by string
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
			case 'OCA\Calendar\Sabre\VObject\Component\VEvent':
				$type = self::EVENT;
				break;

			case 'OCA\Calendar\Sabre\VObject\Component\VJournal':
				$type = self::JOURNAL;
				break;

			case 'OCA\Calendar\Sabre\VObject\Component\VTodo':
				$type = self::TODO;
				break;

			default:
				break;
		}

		return $type;
	}
}