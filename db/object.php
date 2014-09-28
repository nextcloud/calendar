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

use OCA\Calendar\CorruptDataException;
use OCP\Calendar\ICalendar;
use OCP\Calendar\IObject;
use OCA\Calendar\Sabre\VObject\Component\VCalendar;
use OCA\Calendar\Sabre\VObject\Reader;
use OCA\Calendar\Sabre\VObject\ParseException;
use OCA\Calendar\Sabre\VObject\Property\Text as TextProperty;
use OCA\Calendar\Sabre\VObject\Property\Integer as IntegerProperty;
use OCA\Calendar\Sabre\VObject\Property\ICalendar\DateTime as SDateTime;
use OCA\Calendar\Sabre\VObject\Property\ICalendar\Date as SDate;
use OCA\Calendar\Utility\SabreUtility;
use DateTime;

class Object extends Entity implements IObject {

	/**
	 * @var integer
	 */
	public $id;


	/**
	 * @var ICalendar
	 */
	public $calendar;


	/**
	 * @var string
	 */
	public $uri;


	/**
	 * @var string
	 */
	public $etag;


	/**
	 * @var integer
	 */
	public $ruds;


	/**
	 * @var VCalendar
	 */
	public $vObject;


	/**
	 * @var string
	 */
	private $objectName;


	/**
	 * take data from vobject and put into this Object object
	 * @param VCalendar $vcalendar
	 * @throws CorruptDataException
	 * @return $this
	 */
	public function fromVObject(VCalendar $vcalendar) {
		return $this->setVobject($vcalendar);
	}


	/**
	 * @param ICalendar $calendar
	 * @return $this
	 */
	public function setCalendar(ICalendar $calendar) {
		return $this->setter('calendar', [$calendar]);
	}


	/**
	 * @return ICalendar
	 */
	public function getCalendar() {
		return $this->getter('calendar');
	}


	/**
	 * @param string $uri
	 * @return $this
	 */
	public function setUri($uri) {
		return $this->setter('uri', [$uri]);
	}


	/**
	 * @return string
	 */
	public function getUri() {
		return $this->getter('uri');
	}


	/**
	 * @param string $etag
	 * @return $this
	 */
	public function setEtag($etag) {
		return $this->setter('etag', [$etag]);
	}


	/**
	 * @param bool $force generate etag if none stored
	 * @return mixed (string|null)
	 */
	public function getEtag($force=false) {
		if ($force && $this->etag === null) {
			$this->generateEtag();
		}

		return $this->getter('etag');
	}


	/**
	 * @param integer $ruds
	 * @return $this
	 */
	public function setRuds($ruds) {
		if ($ruds & Permissions::CREATE) {
			$ruds -= Permissions::CREATE;
		}

		$this->setter('ruds', [$ruds]);
	}


	/**
	 * @param boolean $force return value all the time
	 * @return mixed (integer|null)
	 */
	public function getRuds($force=false) {
		if ($force && $this->ruds === null) {
			if ($this->calendar instanceof ICalendar) {
				$cruds = $this->calendar->getCruds();
				if ($cruds & Permissions::CREATE) {
					return $cruds - Permissions::CREATE;
				} else {
					return $cruds;
				}
			}
		}

		return $this->getter('ruds');
	}


	/**
	 * @param VCalendar $vobject
	 * @throws CorruptDataException
	 * @return $this
	 */
	public function setVObject(VCalendar $vobject) {
		$uidCount = SabreUtility::countUniqueUIDs($vobject);
		$objectName = SabreUtility::getObjectName($vobject);

		if ($uidCount === 0) {
			throw new CorruptDataException(
				'Object may not be empty!'
			);
		}
		if ($uidCount > 1) {
			throw new CorruptDataException(
				'Resource can\'t store multiple objects'
			);
		}

		$this->setter('vObject', [$vobject]);
		$this->objectName = $objectName;
		return $this;
	}


	/**
	 * @return VCalendar
	 */
	public function getVObject() {
		$vobject =  $this->getter('vObject');
		$objectName = $this->getObjectName();

		$props = [
			new TextProperty($vobject, 'X-OC-URI', $this->getUri()),
			new TextProperty($vobject, 'X-OC-ETAG', $this->getEtag(true)),
			new IntegerProperty($vobject, 'X-OC-RUDS', $this->getRuds())
		];

		/** @var \OCA\Calendar\Sabre\vobject\Component\VCalendar $vobject */
		$_objects = $vobject->select($objectName);
		$vobject->remove($objectName);
		foreach($_objects as &$_object) {
			/** @var \OCA\Calendar\Sabre\VObject\Component $_object */
			foreach ($props as $prop) {
				/** @var \OCA\Calendar\Sabre\VObject\Property $prop */
				if ($prop->getValue() === null) {
					continue;
				} else {
					$_object->remove($prop->name);
					$_object->add($prop);
				}
			}
			$vobject->add($_object);
		}

		return $vobject;
	}


	/**
	 * @return array array of updated fields for update query
	 */
	public function getUpdatedFields() {
		$updatedFields = parent::getUpdatedFields();

		$properties = [
			'uri', 'type', 'startDate',
			'endDate', 'calendarId', 'repeating', 
			'summary', 'calendarData', 'lastModified',
		];

		foreach($properties as $property) {
			$updatedFields[$property] = true;
		}

		unset($updatedFields['calendar']);
		unset($updatedFields['vobject']);
		unset($updatedFields['objectName']);

		return $updatedFields;
	}


	/**
	 * set lastModified to now and update ETag
	 * @return $this
	 */
	public function touch() {
		$now = new DateTime();
		//TODO - fix for multiple objects
		$this->vObject->{$this->getObjectName()}->{'LAST-MODIFIED'}->setDateTime($now);
		$this->generateEtag();
		return $this;
	}


	/**
	 * does an object allow
	 * @param integer $cruds
	 * @return integer
	 */
	public function doesAllow($cruds) {
		return ($this->ruds & $cruds);
	}


	/**
	 * get text/calendar representation of stored object
	 * @return integer
	 */
	public function getCalendarData() {
		return $this->vObject->serialize();
	}


	/**
	 * set the calendarData
	 * @param string $data CalendarData
	 * @throws CorruptDataException
	 * @return $this
	 */
	public function setCalendarData($data) {
		try {
			$vobject = Reader::read($data);
			if (!($vobject instanceof VCalendar)) {
				$msg = 'CalendarData is not actual calendar-data!';
				throw new CorruptDataException($msg);
			}
			return $this->fromVobject($vobject);
		} catch(ParseException $ex) {
			throw new CorruptDataException($ex->getMessage(), $ex->getCode(), $ex);
		}
	}


	/**
	 * update Etag
	 * @return $this
	 */
	public function generateEtag() {
		$etag  = $this->getUri();
		$etag .= $this->getCalendarData();

		return $this->setter('etag', [md5($etag)]);
	}




	/**
	 * get type of stored object
	 * @return integer
	 */
	public function getType() {
		return ObjectType::getTypeByString(
			$this->getObjectName()
		);
	}


	/**
	 * get startDate
	 * @return DateTime
	 */
	public function getStartDate() {
		/** @var \OCA\Calendar\Sabre\VObject\Component $object */
		$object = $this->vObject->{$this->getObjectName()};
		$realStart = SabreUtility::getDTStart($object);
		if ($realStart instanceof SDateTime || $realStart instanceof SDate) {
			return $realStart->getDateTime();
		} else {
			return null;
		}
	}


	/**
	 * get endDate
	 * @return DateTime
	 */
	public function getEndDate() {
		/** @var \OCA\Calendar\Sabre\VObject\Component $object */
		$object = $this->vObject->{$this->getObjectName()};
		$realEnd = SabreUtility::getDTEnd($object);
		if ($realEnd instanceof SDateTime || $realEnd instanceof SDate) {
			return $realEnd->getDateTime();
		} else {
			return null;
		}
	}


	/**
	 * get whether or not object is repeating
	 * @return boolean
	 */
	public function getRepeating() {
		$objectName = $this->getObjectName();

		//TODO - fix for multiple objects
		return (isset($this->vObject->{$objectName}->{'RRULE'}) ||
				isset($this->vObject->{$objectName}->{'RDATE'}));
	}


	/**
	 * get summary of object
	 * @return mixed (string|null)
	 */
	public function getSummary() {
		$objectName = $this->getObjectName();

		if (isset($this->vObject->{$objectName}->{'SUMMARY'})) {
			return $this->vObject->{$objectName}->{'SUMMARY'}->getValue();
		}

		return null;
	}


	/**
	 * get last modified of object
	 * @return mixed (DateTime|null)
	 */
	public function getLastModified() {
		$objectName = $this->getObjectName();

		//TODO - fix for multiple objects
		if (isset($this->vObject->{$objectName}->{'LAST-MODIFIED'})) {
			return $this->vObject->{$objectName}->{'LAST-MODIFIED'}->getDateTime();
		}

		return null;
	}


	/**
	 * @param DateTime $start
	 * @param DateTime $end
	 * @return boolean
	 */
	public function isInTimeRange(DateTime $start, DateTime $end) {
		$objectName = $this->getObjectName();
		return $this->vObject->{$objectName}->isInTimeRange($start, $end);
	}


	/**
	 * get name of property inside $this->vobject
	 * @return string
	 */
	private function getObjectName() {
		return $this->objectName;
	}


	/**
	 * register field types
	 */
	protected function registerTypes() {
		$this->addType('uri', 'string');
		$this->addType('etag', 'string');
		$this->addType('ruds', 'integer');

		$this->addAdvancedFieldType('calendar',
			'OCP\\Calendar\\ICalendar');
		$this->addAdvancedFieldType('vObject',
			'OCA\\Calendar\\Sabre\\vobject\\Component\\VCalendar');
	}


	/**
	 * register mandatory fields
	 */
	protected function registerMandatory() {
		$this->addMandatory('calendar');
		$this->addMandatory('uri');
		$this->addMandatory('vObject');
	}
}