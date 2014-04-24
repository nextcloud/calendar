<?php
/**
 * Copyright (c) 2014 Georg Ehrke <oc.list@georgehrke.com>
 * This file is licensed under the Affero General Public License version 3 or
 * later.
 * See the COPYING-README file.
 */
namespace OCA\Calendar\Utility;

class CalendarUtility extends Utility{

	const SEPERATOR = '::';

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

	public static function splitURI($publicURI) {
		if ($publicURI === false || $publicURI === null || $publicURI === '') {
			return array(false, false);
		}

		if (substr_count($publicURI, self::SEPERATOR) === 0){
			return array(false, false);
		}

		list($backend, $realCalendarURI) = explode(self::SEPERATOR, $publicURI, 2);

		return array($backend, $realCalendarURI);
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