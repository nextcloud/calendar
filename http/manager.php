<?php
/**
 * Copyright (c) 2014 Georg Ehrke <oc.list@georgehrke.com>
 * This file is licensed under the Affero General Public License version 3 or
 * later.
 * See the COPYING-README file.
 */
namespace OCA\Calendar\Http;

abstract class Manager {

	protected static $all=array();
	private static $fallback=array();

	/**
	 * @brief get
	 * @param integer $type
	 * @param string $requestedMimeType
	 * @return mixed (boolean|string)
	 */
	public static function get($type, $requestedMimeType) {
		if(!array_key_exists($type, self::$all)) {
			return false;
		}
		if(!array_key_exists($requestedMimeType, self::$all[$type])) {
			return false;
		}
		return self::$all[$type][$requestedMimeType];
	}

	/**
	 * @brief set
	 * @param integer $type
	 * @param string $class
	 * @param string $requestedMimeType
	 * @param boolean $overwrite
	 * @return boolean 
	 */
	public static function set($type, $class, $requestedMimeType, $overwrite=false) {
		if($overwrite === false && self::get($type, $requestedMimeType) !== false) {
			return false;
		}

		self::$all[$type][$requestedMimeType] = $class;
		return true;
	}

	/**
	 * @brief getFallback
	 * @param integer $type
	 * @return mixed (boolean|string)
	 */
	public static function getFallback($type) {
		if(!array_key_exists($type, self::$fallback)) {
			return false;
		}
		return self::$fallback[$type];
	}

	/**
	 * @brief setFallback
	 * @param integer $type
	 * @param string $class
	 * @return mixed (boolean|string)
	 */
	public static function setFallback($type, $class) {
		self::$fallback[$type] = $class;
		return true;
	}
}