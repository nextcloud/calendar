<?php
/**
 * Copyright (c) 2014 Georg Ehrke <oc.list@georgehrke.com>
 * This file is licensed under the Affero General Public License version 3 or
 * later.
 * See the COPYING-README file.
 */
namespace OCA\Calendar\Db;

use \OCA\Calendar\Sabre\VObject\Component\VCalendar;
use \OCA\Calendar\Sabre\VObject\Component\VEvent;
use \OCA\Calendar\Sabre\VObject\Component\VJournal;
use \OCA\Calendar\Sabre\VObject\Component\VTodo;

use \OCA\Calendar\Sabre\VObject\Reader;
use \OCA\Calendar\Sabre\VObject\ParseException;
use \OCA\Calendar\Sabre\VObject\EofException;

use \OCA\Calendar\Sabre\VObject\Property\Text as TextProperty;
use \OCA\Calendar\Sabre\VObject\Property\Integer as IntegerProperty;

use \OCA\Calendar\Utility\ObjectUtility;
use \OCA\Calendar\Utility\SabreUtility;
use \OCA\Calendar\Utility\Utility;

use \DateTime;

class Object extends Entity {

	public $id;
	public $calendar;
	public $objectURI;
	public $etag;
	public $ruds;

	public $vObject;

	private $objectName;


	/**
	 * @brief constructor
	 * @param mixed (array|null) $fromRow
	 */
	public function __construct($fromRow=null) {
		$this->addType('objectURI', 'string');
		$this->addType('etag', 'string');
		$this->addType('ruds', 'integer');

		if (is_array($fromRow)) {
			$this->fromRow($fromRow);
		}
		if ($fromRow instanceof VCalendar) {
			$this->fromVObject($fromRow);
		}
	}


	/**
	 * @return array array of updated fields for update query
	 */
	public function getUpdatedFields() {
		$updatedFields = parent::getUpdatedFields();

		$properties = array(
			'objectURI', 'type', 'startDate',
			'endDate', 'calendarId', 'repeating', 
			'summary', 'calendarData', 'lastModified',
		);

		foreach($properties as $property) {
			$updatedFields[$property] = true;
		}

		unset($updatedFields['calendar']);
		unset($updatedFields['vObject']);
		unset($updatedFields['objectName']);

		return $updatedFields;
	}


	/**
	 * @brief take data from VObject and put into this Object object
	 * @param \Sabre\VObject\Component\VCalendar $vcalendar
	 * @return VCalendar Object
	 */
	public function fromVObject(VCalendar $vcalendar) {
		$count = SabreUtility::countUniqueUIDs($vcalendar);

		if ($count !== 1) {
			$msg  = 'Db\Object::fromVObject(): ';
			$msg .= 'Multiple objects can\'t be stored in one resource.';
			throw new MultipleObjectsReturnedException($msg);
		}

		$this->vObject = $vcalendar;
		$this->objectName = SabreUtility::getObjectName($vcalendar);
	}


	/**
	 * @brief get VObject from Calendar Object
	 * @return \Sabre\VObject\Component\VCalendar object
	 */
	public function getVObject() {
		$objectName = $this->objectName;

		if ($this->etag === null) {
			$this->generateEtag();
		}
		$currentETag = $this->etag;

		if (!isset($this->vObject->{$objectName}->{'X-OC-URI'})) {
			$uri = new TextProperty($this->vObject, 'X-OC-URI', $this->objectURI);
			$this->vObject->{$objectName}->add($uri);
		}
		if (!isset($this->vObject->{$objectName}->{'X-OC-ETAG'})) {
			$etag = new TextProperty($this->vObject, 'X-OC-ETAG', $currentETag);
			$this->vObject->{$objectName}->add($etag);
		}
		if ($this->ruds !== null) {
			if (!isset($this->vObject->{$objectName}->{'X-OC-RUDS'})) {
				$ruds = new IntegerProperty($this->vObject, 'X-OC-RUDS', $this->ruds);
				$this->vObject->{$objectName}->add($ruds);
			}
		}

		return $this->vObject;
	}


	/**
	 * @brief set lastModified to now and update ETag
	 * @return $this
	 */
	public function touch() {
		$now = new DateTime();
		$this->vObject->{$objectName}->{'LAST-MODIFIED'}->setDateTime($now);
		$this->generateEtag();
		return $this;
	}



	/**
	 * @brief does an object allow
	 * @return boolean
	 */
	public function doesAllow($cruds) {
		return ($this->cruds & $cruds);
	}


	/**
	 * @brief get text/calendar representation of stored object
	 * @return integer
	 */
	public function getCalendarData() {
		return $this->vObject->serialize();
	}


	/**
	 * set the calendarData
	 * @param string $data CalendarData
	 */
	public function setCalendarData($data) {
		try {
			$vobject = Reader::read($data);
			$this->fromVObject($vobject);
		} catch(ParseException $ex) {
			//TODO implement
		} catch(EofException $ex) {
			//TODO implement
		}
	}


	/**
	 * @brief get etag
	 * @return string
	 */
	public function getEtag($force=false) {
		if($this->etag === null) {
			$this->generateEtag();
		}

		return $this->etag;
	}


	/**
	 * @brief update Etag
	 * @return $this
	 */
	public function generateEtag() {
		$etag  = $this->getObjectURI();
		$etag .= $this->getCalendarData();

		return parent::setEtag(md5($etag));
	}


	/**
	 * @brief get ruds
	 * @param boolean $force return value all the time
	 * @return mixed (integer|null)
	 */
	public function getRuds($force=false) {
		if ($this->ruds !== null) {
			return $this->ruds;
		} else {
			if ($this->calendar instanceof Calendar) {
				$cruds = $this->calendar->getCruds();
				if ($cruds & Permissions::CREATE) {
					$cruds -= Permissions::CREATE;
				}
				return $cruds;
			}
			return null;
		}
	}


	/**
	 * @brief set ruds value
	 */
	public function setRuds($ruds) {
		if ($ruds & Permissions::CREATE) {
			$ruds -= Permissions::CREATE;
		}

		$this->ruds = $ruds;
		return $this;
	}

	/**
	 * @brief get type of stored object
	 * @return integer
	 */
	public function getType() {
		return ObjectType::getTypeByString($this->objectName);
	}


	/**
	 * @brief get startDate
	 * @return DateTime
	 */
	public function getStartDate() {
		$objectName = $this->objectName;
		return SabreUtility::getDTStart($this->vObject->{$objectName});
	}


	/**
	 * @brief get endDate
	 * @return DateTime
	 */
	public function getEndDate() {
		$objectName = $this->objectName;
		return SabreUtility::getDTEnd($this->vObject->{$objectName});
	}


	/**
	 * @brief get whether or not object is repeating
	 * @return boolean
	 */
	public function getRepeating() {
		$objectName = $this->objectName;

		if (isset($this->vObject->{$objectName}->{'RRULE'}) ||
			isset($this->vObject->{$objectName}->{'RDATE'}) ||
			isset($this->vObject->{$objectName}->{'EXRULE'}) ||
			isset($this->vObject->{$objectName}->{'EXDATE'}) ||
			isset($this->vObject->{$objectName}->{'RECURRENCE-ID'})) {
			return true;
		}

		return false;
	}


	/**
	 * @brief get summary of object
	 * @return mixed (string|null)
	 */
	public function getSummary() {
		$objectName = $this->objectName;

		if (isset($this->vObject->{$objectName}->{'SUMMARY'})) {
			return $this->vObject->{$objectName}->{'SUMMARY'}->getValue();
		}

		return null;
	}


	/**
	 * @brief get last modified of object
	 * @return mixed (DateTime|null)
	 */
	public function getLastModified() {
		$objectName = $this->objectName;

		if (isset($this->vObject->{$objectName}->{'LAST-MODIFIED'})) {
			return $this->vObject->{$objectName}->{'LAST-MODIFIED'}->getDateTime();
		}

		return null;
	}


	/**
	 * @brief check if object is valid
	 * @return boolean
	 */
	public function isValid() {
		$stringsOrNulls = array(
			$this->etag
		);

		$strings = array(
			$this->objectURI
		);

		foreach($stringsOrNulls as $stringOrNull) {
			if(is_null($stringOrNull)) {
				continue;
			}

			$strings[] = $stringOrNull;
		}

		foreach($strings as $string) {
			if (!is_string($string)) {
				return false;
			}
			if (trim($string) === '') {
				return false;
			}
		}

		if (!($this->calendar instanceof Calendar)) {
			return false;
		}

		return true;
	}
}