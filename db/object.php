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

use OCP\Calendar\CorruptDataException;
use OCP\Calendar\ICalendar;
use OCP\Calendar\IObject;

use OCA\Calendar\Sabre\VObject\Component\VCalendar;

use OCA\Calendar\Sabre\VObject\Reader;
use OCA\Calendar\Sabre\VObject\ParseException;

use OCA\Calendar\Sabre\VObject\Property\Text as TextProperty;
use OCA\Calendar\Sabre\VObject\Property\Integer as IntegerProperty;

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
	public $vobject;


	/**
	 * @var string
	 */
	private $objectName;


	/**
	 * @brief constructor
	 * @param mixed (array|null) $from
	 */
	public function __construct($from=null) {
		$this->addType('calendar', 'OCP\\Calendar\\ICalendar');
		$this->addType('uri', 'string');
		$this->addType('etag', 'string');
		$this->addType('ruds', 'integer');
		$this->addType('vobject', 'OCA\\Calendar\\Sabre\\vobject\\Component\\VCalendar');

		$this->addMandatory('calendar');
		$this->addMandatory('uri');
		$this->addMandatory('etag');
		$this->addMandatory('vobject');

		if (is_array($from)) {
			$this->fromRow($from);
		}
		if ($from instanceof VCalendar) {
			$this->fromvobject($from);
		}
	}


	/**
	 * @brief take data from vobject and put into this Object object
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
		return $this->setter('calendar', $calendar);
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
		return $this->setter('uri', $uri);
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
		return $this->setter('etag', $etag);
	}


	/**
	 * @param bool $force generate etag if none stored
	 * @return mixed (string|null)
	 */
	public function getEtag($force=false) {
		$etag = $this->getter('etag');

		if(!$force) {
			return $etag;
		} else {
			if ($etag === null) {
				$this->generateEtag();
			}
			return $this->getEtag(false);
		}
	}


	/**
	 * @param integer $ruds
	 * @return $this
	 */
	public function setRuds($ruds) {
		if ($ruds & Permissions::CREATE) {
			$ruds -= Permissions::CREATE;
		}

		$this->setter('ruds', $ruds);
	}


	/**
	 * @param boolean $force return value all the time
	 * @return mixed (integer|null)
	 */
	public function getRuds($force=false) {
		$ruds = $this->getter('ruds');

		if (!$force) {
			return $ruds;
		} else {
			if ($ruds === null) {
				if ($this->calendar instanceof ICalendar) {
					$cruds = $this->calendar->getCruds();
					if ($cruds & Permissions::CREATE) {
						$ruds = $cruds - Permissions::CREATE;
					} else {
						$ruds = $cruds;
					}
				}
			}
			return $ruds;
		}
	}


	/**
	 * @param VCalendar $vobject
	 * @throws CorruptDataException
	 * @return $this
	 */
	public function setVobject(VCalendar $vobject) {
		$uidCount = SabreUtility::countUniqueUIDs($vobject);
		$objectName = SabreUtility::getObjectName($vobject);

		if ($uidCount === 0) {
			$msg = 'Object can\'t be empty!';
			throw new CorruptDataException($msg);
		}
		if ($uidCount > 1) {
			$msg = 'Multiple objects can\'t be stored in one resource!';
			throw new CorruptDataException($msg);
		}

		$this->setter('vobject', $vobject);
		return $this->setter('objectName', $objectName);
	}


	/**
	 * @return VCalendar
	 */
	public function getVobject() {
		$vobject =  $this->getter('vobject');
		$objectName = $this->getObjectName();

		$uri = $this->getUri();
		$etag = $this->getEtag(true);
		$ruds = $this->getRuds();

		if ($uri !== null) {
			$vobject->{$objectName}->remove('X-OC-URI');
			$uriProperty = new TextProperty($vobject, 'X-OC-URI', $uri);
			$vobject->{$objectName}->add($uriProperty);
		}
		if ($etag !== null) {
			$vobject->{$objectName}->remove('X-OC-ETAG');
			$etagProperty = new TextProperty($vobject, 'X-OC-ETAG', $etag);
			$vobject->{$objectName}->add($etagProperty);
		}
		if ($ruds !== null) {
			$vobject->{$objectName}->remove('X-OC-RUDS');
			$rudsProperty = new IntegerProperty($vobject, 'X-OC-RUDS', $ruds);
			$vobject->{$objectName}->add($rudsProperty);
		}

		return $vobject;
	}


	/**
	 * @return array array of updated fields for update query
	 */
	public function getUpdatedFields() {
		$updatedFields = parent::getUpdatedFields();

		$properties = array(
			'uri', 'type', 'startDate',
			'endDate', 'calendarId', 'repeating', 
			'summary', 'calendarData', 'lastModified',
		);

		foreach($properties as $property) {
			$updatedFields[$property] = true;
		}

		unset($updatedFields['calendar']);
		unset($updatedFields['vobject']);
		unset($updatedFields['objectName']);

		return $updatedFields;
	}


	/**
	 * @brief set lastModified to now and update ETag
	 * @return $this
	 */
	public function touch() {
		$now = new DateTime();
		$this->vobject->{$this->getObjectName()}->{'LAST-MODIFIED'}->setDateTime($now);
		$this->generateEtag();
		return $this;
	}


	/**
	 * @brief does an object allow
	 * @param integer $cruds
	 * @return boolean
	 */
	public function doesAllow($cruds) {
		return ($this->ruds & $cruds);
	}


	/**
	 * @brief get text/calendar representation of stored object
	 * @return integer
	 */
	public function getCalendarData() {
		return $this->vobject->serialize();
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
	 * @brief update Etag
	 * @return $this
	 */
	public function generateEtag() {
		$etag  = $this->getUri();
		$etag .= $this->getCalendarData();

		return $this->setter('etag', md5($etag));
	}




	/**
	 * @brief get type of stored object
	 * @return integer
	 */
	public function getType() {
		return ObjectType::getTypeByString(
			$this->getObjectName()
		);
	}


	/**
	 * @brief get startDate
	 * @return DateTime
	 */
	public function getStartDate() {
		return SabreUtility::getDTStart(
			$this->vobject->{$this->getObjectName()}
		);
	}


	/**
	 * @brief get endDate
	 * @return DateTime
	 */
	public function getEndDate() {
		return SabreUtility::getDTEnd(
			$this->vobject->{$this->getObjectName()}
		);
	}


	/**
	 * @brief get whether or not object is repeating
	 * @return boolean
	 */
	public function getRepeating() {
		$objectName = $this->getObjectName();

		return (isset($this->vobject->{$objectName}->{'RRULE'}) ||
				isset($this->vobject->{$objectName}->{'RDATE'}) ||
				isset($this->vobject->{$objectName}->{'EXRULE'}) ||
				isset($this->vobject->{$objectName}->{'EXDATE'}) ||
				isset($this->vobject->{$objectName}->{'RECURRENCE-ID'}));
	}


	/**
	 * @brief get summary of object
	 * @return mixed (string|null)
	 */
	public function getSummary() {
		$objectName = $this->getObjectName();

		if (isset($this->vobject->{$objectName}->{'SUMMARY'})) {
			return $this->vobject->{$objectName}->{'SUMMARY'}->getValue();
		}

		return null;
	}


	/**
	 * @brief get last modified of object
	 * @return mixed (DateTime|null)
	 */
	public function getLastModified() {
		$objectName = $this->getObjectName();

		if (isset($this->vobject->{$objectName}->{'LAST-MODIFIED'})) {
			return $this->vobject->{$objectName}->{'LAST-MODIFIED'}->getDateTime();
		}

		return null;
	}


	/**
	 * @brief get name of property inside $this->vobject
	 * @return string
	 */
	private function getObjectName() {
		return $this->objectName;
	}
}