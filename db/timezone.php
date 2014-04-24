<?php
/**
 * Copyright (c) 2014 Georg Ehrke <oc.list@georgehrke.com>
 * This file is licensed under the Affero General Public License version 3 or
 * later.
 * See the COPYING-README file.
 */
namespace OCA\Calendar\Db;

use \OCA\Calendar\Sabre\VObject\Component\VCalendar;
use \OCA\Calendar\Sabre\VObject\Reader;
use \OCA\Calendar\Sabre\VObject\ParseException;
use \OCA\Calendar\Sabre\VObject\EofException;

use \OCA\Calendar\Utility\Utility;

class Timezone extends Entity {

	public $tzId;
	public $vobject;

	/**
	 * @brief init Timezone object with timezone name
	 * @param string $timezone
	 */
	public function __construct($tzId, $tzData) {
		$this->addType('tzId', 'string');
		$this->addType('tzData', 'string');

		if(!is_null($tzId)) {
			$this->setTzId($tzId);
		}
		if(!is_null($tzData)) {
			$this->setTzData($tzData);
		}
	}


	/**
	 * @brief check if object is valid
	 * @return boolean
	 */
	public function isValid() {
		$strings = array('tzId', 'tzData');
		foreach($strings as $string) {
			if(is_null($this->$string)) {
				return false;
			}
			if($this->$string === '') {
				return false;
			}
		}
	}

	public function setTzData($data) {
		$tzData  = "BEGIN:VCALENDAR\n";
		$tzData .= $data;
		$tzData .= "END:VCALENDAR";
		$this->vobject = Reader::read($tzData);
	}

	/**
	 * @brief take data from VObject and put into this Timezone object
	 * @param \Sabre\VObject\Component\VCalendar $vcalendar
	 * @return $this
	 */
	public function fromVObject(VCalendar $vcalendar) {
		if(!isset($vcalendar->{'VTIMEZONE'})) {
			throw new DoesNotExistException('no vtimezones found');
		}
		if(is_array($vcalendar->{'VTIMEZONE'})) {
			throw new MultipleObjectsReturnedException('multiple vtimezones found');
		}
		$this->vobject = $vcalendar;

	}


	/**
	 * @brief get VObject from Calendar Object
	 * @return \Sabre\VObject\Component\VCalendar object
	 */
	public function getVObject() {
		return $this->vobject;
	}


	public function __toString() {
		return $this->tzId;
	}
}