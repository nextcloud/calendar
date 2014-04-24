<?php
/**
 * Copyright (c) 2014 Georg Ehrke <oc.list@georgehrke.com>
 * This file is licensed under the Affero General Public License version 3 or
 * later.
 * See the COPYING-README file.
 */
namespace OCA\Calendar\Db;

require_once(__DIR__ . '/../3rdparty/VObject/includes.php');

use \BadFunctionCallException;
use \DateTime;
use \OCA\Calendar\Sabre\VObject\Component\VCalendar;
use \OCA\Calendar\Sabre\VObject\Reader;
use \OCA\Calendar\Sabre\VObject\ParseException;
use \OCA\Calendar\Sabre\VObject\EofException;

use \OCA\Calendar\Sabre\VObject\Component\VEvent;
use \OCA\Calendar\Sabre\VObject\Component\VJournal;
use \OCA\Calendar\Sabre\VObject\Component\VTodo;

use \OCA\Calendar\Utility\ObjectUtility;
use \OCA\Calendar\Utility\SabreUtility;
use \OCA\Calendar\Utility\Utility;

use \OCA\Calendar\Sabre\VObject\Property\Text as TextProperty;
use \OCA\Calendar\Sabre\VObject\Property\Integer as IntegerProperty;

class Object extends Entity {

	public $id;
	public $calendar;
	public $objectURI;
	public $etag;
	public $ruds;

	public $vObject;

	private $objectName;

	/**
	 * @brief init Object object with data from db row
	 * @param array $fromRow
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
	 * Maps the keys of the row array to the attributes
	 * @param array $row the row to map onto the entity
	 */
	public function fromRow(array $row) {
		foreach($row as $key => $value) {
			$prop = $this->columnToProperty($key);
			if (property_exists($this, $prop)) {
				if ($value !== null && array_key_exists($prop, $this->fieldTypes)){
					settype($value, $this->fieldTypes[$prop]);
					
				}
				$this->$prop = $value;
			}
		}

		if (array_key_exists('calendarData', $row) && trim($row['calendarData'] !== '')) {
			$this->setCalendarData($row['calendarData']);
		}

		return $this;
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
			
		} catch(EofException $ex) {
			
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
		if (!isset($this->vObject->{$objectName}->{'X-OC-URI'})) {
			$uri = new TextProperty($this->vObject, 'X-OC-URI', $this->objectURI);
			$this->vObject->{$objectName}->add($uri);
		}
		if (!isset($this->vObject->{$objectName}->{'X-OC-ETAG'})) {
			if ($this->etag === null) {
				$this->generateEtag();
			}
			$etag = new TextProperty($this->vObject, 'X-OC-ETAG', $this->etag);
			$this->vObject->{$objectName}->add($etag);
		}
		if (!isset($this->vObject->{$objectName}->{'X-OC-RUDS'})) {
			$ruds = new IntegerProperty($this->vObject, 'X-OC-RUDS', $this->ruds);
			$this->vObject->{$objectName}->add($ruds);
		}

		return $this->vObject;
	}

	/**
	 * @brief expand an Array
	 * @param DateTime $start 
	 * @param DateTime $end
	 * @return $this
	 */
	public function expand(DateTime $start, DateTime $end) {
		try {
			$this->vObject->expand($start, $end);
		} catch(/* some */Exception $ex) {
			//log debug msg;
		}

		return $this;
	}

	/**
	 * @brief set lastModified to now and update ETag
	 */
	public function touch() {
		$now = new DateTime();
		$this->vObject->{$objectName}->{'LAST-MODIFIED'}->setDateTime($now);
		$this->generateEtag();
	}

	/**
	 * @brief update Etag
	 */
	public function generateEtag() {
		$etag  = $this->getObjectURI();
		$etag .= $this->getCalendarData();

		$this->etag = md5($etag);
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
		   isset($this->vObject->{$objectName}->{'RECURRENCE-ID'})) {
			return true;
		}

		return false;
	}

	/**
	 * @brief get last occurence of repeating object
	 * @return mixed DateTime/null
	 */
	public function getLastOccurence() {
		if ($this->isRepeating() === false) {
			return null;
		}

		//THIS SHOULD DEFINITELY BE CACHED!!

		$lastOccurences = array();

		if (isset($this->vObject->{$objectName}->{'RRULE'})) {
			$rrule = $this->vObject->{$objectName}->{'RRULE'};
			//https://github.com/fruux/sabre-vobject/wiki/Sabre-VObject-Property-Recur
			$parts = $rrule->getParts();
			if (!array_key_exists('COUNT', $parts) && array_key_exists('UNTIL', $parts)) {
				return null;
			}
			//$lastOccurences[] = DateTime of last occurence
		}
		if (isset($this->vObject->{$objectName}->{'RDATE'})) {
			//$lastOccurences[] = DateTime of last occurence
		}
	}

	/**
	 * @brief get summary of object
	 * @return string
	 */
	public function getSummary() {
		$objectName = $this->objectName;

		if (isset($this->vObject->{$objectName}->{'SUMMARY'})) {
			return $this->vObject->{$objectName}->{'SUMMARY'}->getValue();
		}

		return null;
	}

	/**
	 * @brief get text/calendar representation of stored object
	 * @return integer
	 */
	public function getCalendarData() {
		try {
			return $this->vObject->serialize();
		} catch(/* some */Exception $ex) {
			//log debug msg;
			return null;
		}
	}

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

	public function setRuds($ruds) {
		if ($ruds & Permissions::CREATE) {
			$ruds -= Permissions::CREATE;
		}

		$this->ruds = $ruds;
	}

	/**
	 * @brief get last modified of object
	 * @return DateTime
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
		$strings = array(
			$this->objectURI
		);

		if($this->etag !== null) {
			$strings[] = $this->etag;
		}

		foreach($strings as $string) {
			if (is_string($string) === false) {
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
		$isVObjectValid = $this->vObject->validate();
		//TODO - finish implementation
	}

	private function iterateOverObjects() {
		
	}
}