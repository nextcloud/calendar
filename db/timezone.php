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

use OCA\Calendar\Sabre\VObject\Component\VCalendar;
use OCA\Calendar\Sabre\VObject\Reader;
use OCA\Calendar\Sabre\VObject\ParseException;
use OCP\Calendar\ITimezone;

class Timezone extends Entity implements ITimezone {

	/**
	 * vobject containing VTIMEZONE
	 * @var VCalendar
	 */
	public $vobject;


	/**
	 * @brief init Timezone object with timezone name
	 * @param string $from
	 */
	public function __construct($from) {
		if ($from instanceof VCalendar) {
			$this->fromVObject($from);
		} elseif (is_string($from)) {
			$this->fromData($from);
		}
	}


	/**
	 * @brief check if object is valid
	 * @return bool
	 */
	public function isValid() {
		if ($this->vobject instanceof VCalendar) {
			return true;
		} else {
			return false;
		}
	}


	/**
	 * @brief set timezone data
	 * @param string $data
	 * @throws DoesNotExistException
	 * @throws MultipleObjectsReturnedException
	 */
	public function fromData($data) {
		if (substr($data, 0, 15) === 'BEGIN:VCALENDAR') {
			$newData  = "\n";
			$newData .= $data;
			$newData .= "\n";
			$newData .= 'END:VCALENDAR';

			$data = $newData;
		}

		try {
			$this->fromVObject(Reader::read($data));
		} catch(ParseException $ex) {}
	}


	/**
	 * @param VCalendar $vcalendar
	 * @return $this
	 * @throws MultipleObjectsReturnedException
	 * @throws DoesNotExistException
	 */
	public function fromVObject(VCalendar $vcalendar) {
		if (!isset($vcalendar->{'VTIMEZONE'})) {
			throw new DoesNotExistException('no vtimezones found');
		}
		if (is_array($vcalendar->{'VTIMEZONE'})) {
			throw new MultipleObjectsReturnedException('multiple vtimezones found');
		}

		$this->vobject = $vcalendar;
		return $this;
	}


	/**
	 * @brief get VObject from Calendar Object
	 * @return \Sabre\VObject\Component\VCalendar object
	 */
	public function getVObject() {
		return $this->vobject;
	}


	/**
	 * @brief get timezone id
	 * @return string
	 */
	public function getTzId() {
		if(!($this->vobject instanceof VCalendar)) {
			return null;
		} else {
			return $this->vobject->{'VTIMEZONE'}->{'TZID'};
		}
	}


	/**
	 * @brief create string representation of object
	 * @return string
	 */
	public function __toString() {
		return $this->vobject->serialize();
	}
}