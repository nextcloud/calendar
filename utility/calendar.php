<?php
/**
 * Copyright (c) 2014 Georg Ehrke <oc.list@georgehrke.com>
 * This file is licensed under the Affero General Public License version 3 or
 * later.
 * See the COPYING-README file.
 */
namespace OCA\Calendar\Utility;

class CalendarUtility extends Utility{

	/**
	 * seperator for backend and uri
	 * @var string
	 */
	const SEPERATOR = '::';


	/**
	 * @brief suggest a new uri
	 * @param string $calendarURI
	 * @return string $calendarURI
	 */
	public static function suggestURI($calendarURI) {
		if(substr_count($calendarURI, '-') === 0) {
			$calendarURI .= '-1';
		} else {
			$positionLastDash = strrpos($calendarURI, '-');
			$firstPart = substr($calendarURI, 0, $positionLastDash);
			$lastPart = substr($calendarURI, $positionLastDash + 1);
			$pattern = '/^\d+$/';
			if(preg_match($pattern, $lastPart)) {
				$lastPart = (int) $lastPart;
				$lastPart++;
				$calendarURI = $firstPart . '-' . $lastPart;
			} else {
				$calendarURI .= '-1';
			}
		}
		return $calendarURI;
	}


	/**
	 * @brief split $calendarURI
	 * @param string $calendarURI
	 * @return array (backend|uri)
	 */
	public static function splitURI($calendarURI) {
		if ($calendarURI === false || $calendarURI === null || $calendarURI === '') {
			return array(false, false);
		}

		if (substr_count($calendarURI, self::SEPERATOR) === 0){
			return array(false, false);
		}

		return explode(self::SEPERATOR, $calendarURI, 2);
	}


	/**
	 * @brief get uri from backend and calendarURI
	 * @param string $backend
	 * @param string $calendarURI
	 * @return string uri
	 */
	public static function getURI($backend, $calendarURI) {
		return implode(self::SEPERATOR, array(
			$backend,
			$calendarURI,
		));
	}
}