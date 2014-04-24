<?php
/**
 * Copyright (c) 2014 Georg Ehrke <oc.list@georgehrke.com>
 * This file is licensed under the Affero General Public License version 3 or
 * later.
 * See the COPYING-README file.
 */
namespace OCA\Calendar\Utility;

use \DateTimeZone;

class TimezoneUtility extends Utility {

	/**
	 * @brief check if a timezone identifier is supported
	 * @param string $timezone
	 * @return boolean
	 */
	public static function isTimezoneSupported($timezone) {
		$supportedTimezones = DateTimeZone::listIdentifiers();
		return in_array($timezone, $supportedTimezones);
	}
}