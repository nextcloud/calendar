<?php
/**
 * Copyright (c) 2014 Georg Ehrke <oc.list@georgehrke.com>
 * This file is licensed under the Affero General Public License version 3 or
 * later.
 * See the COPYING-README file.
 */
namespace OCA\Calendar\Db;

use \OCA\Calendar\Sabre\VObject\Component\VCalendar;

use \OCA\Calendar\Utility\Utility;

class Timezone extends Entity {

	protected $timezone;

	/**
	 * @brief init Timezone object with timezone name
	 * @param string $timezone
	 */
	public function __construct($timezone='UTC') {
		if(Utility::isTimezoneSupported($timezone)) {
			$this->timezone = new \DateTimeZone($timezone);
		} else {

			$msg = '';
			throw new /* some */Exception($msg);
		}
	}


	/**
	 * @brief check if object is valid
	 * @return boolean
	 */
	public function isValid() {
		return true;
	}


	/**
	 * @brief take data from VObject and put into this Timezone object
	 * @param \Sabre\VObject\Component\VCalendar $vcalendar
	 * @return $this
	 */
	public function fromVObject(VCalendar $vcalendar) {
		//TODO implement		
	}


	/**
	 * @brief get VObject from Calendar Object
	 * @return \Sabre\VObject\Component\VCalendar object
	 */
	public function getVObject() {
		//TODO implement
	}


	public function __toString() {
		return $this->timezone->getName();
	}
}