<?php
/**
 * Copyright (c) 2014 Georg Ehrke <oc.list@georgehrke.com>
 * This file is licensed under the Affero General Public License version 3 or
 * later.
 * See the COPYING-README file.
 */
namespace OCA\Calendar\Db;

use OCA\Calendar\Sabre\VObject\Component\VCalendar;

use OCP\Calendar\ICalendar;
use OCP\Calendar\ITimezone;

use OCA\Calendar\Utility\CalendarUtility;
use OCA\Calendar\Utility\RegexUtility;

class Calendar extends Entity implements ICalendar {

	/**
	 * @var string
	 */
	public $userId;


	/**
	 * @var string
	 */
	public $ownerId;


	/**
	 * @var string
	 */
	public $publicuri;


	/**
	 * @var string
	 */
	public $backend;


	/**
	 * @var string
	 */
	public $privateuri;


	/**
	 * @var string
	 */
	public $displayname;


	/**
	 * @var integer
	 */
	public $components;


	/**
	 * @var integer
	 */
	public $ctag;


	/**
	 * @var ITimezone
	 */
	public $timezone;


	/**
	 * @var string
	 */
	public $color;


	/**
	 * @var integer
	 */
	public $order;


	/**
	 * @var bool
	 */
	public $enabled;


	/**
	 * @var integer
	 */
	public $cruds;


	/**
	 * @var string
	 */
	public $description;


	/**
	 * @brief init Calendar object with data from db row
	 * @param mixed (array / VCalendar) $createFrom
	 */
	public function __construct($createFrom=null){
		$this->addType('userId', 'string');
		$this->addType('ownerId', 'string');
		$this->addType('publicuri', 'string');
		$this->addType('backend', 'string');
		$this->addType('privateuri', 'string');
		$this->addType('displayname', 'string');
		$this->addType('components', 'integer');
		$this->addType('ctag', 'integer');
		$this->addType('color', 'string');
		$this->addType('order', 'integer');
		$this->addType('enabled', 'boolean');
		$this->addType('cruds', 'integer');

		$this->addMandatory('userId');
		$this->addMandatory('ownerId');
		$this->addMandatory('backend');
		$this->addMandatory('privateuri');
		$this->addMandatory('ctag');
		$this->addMandatory('cruds');
		$this->addMandatory('enabled');
		$this->addMandatory('order');

		//create from array
		if (is_array($createFrom)){
			$this->fromRow($createFrom);
		}

		//create from VCalendar
		if ($createFrom instanceof VCalendar) {
			$this->fromVObject($createFrom);
		}
	}


	/**
	 * @param string $backend
	 * @return $this
	 */
	public function setBackend($backend) {
		return $this->setter('backend', array($backend));
	}


	/**
	 * @return string
	 */
	public function getBackend() {
		return $this->getter('backend');
	}


	/**
	 * @param string $calendarId
	 * @return $this
	 */
	public function setCalendarId($calendarId) {
		list($backend, $uri) = CalendarUtility::splitURI($calendarId);

		if ($backend !== false && $uri !== false) {
			$this->setter('backend', array($backend));
			return $this->setter('uri', array($uri));
		} else {
			return $this;
		}
	}


	/**
	 * @return string
	 */
	public function getCalendarId(){
		return CalendarUtility::getURI(
			$this->getBackend(),
			$this->getPublicUri()
		);
	}


	/**
	 * @param string $color
	 * @return $this
	 */
	public function setColor($color) {
		//TODO - fix regex
		if (preg_match(RegexUtility::RGBA, $this->color) === 1) {
			return $this->setter('color', array($color));
		} else {
			return $this;
		}
	}


	/**
	 * @return string
	 */
	public function getColor() {
		return $this->getter('color');
	}


	/**
	 * @param int $cruds
	 * @return $this
	 */
	public function setCruds($cruds) {
		if ($cruds >= 0 && $cruds <= Permissions::ALL) {
			return $this->setter('cruds', array($cruds));
		} else {
			return $this;
		}
	}


	/**
	 * @return int
	 */
	public function getCruds() {
		return $this->getter('cruds');
	}


	/**
	 * @param int $components
	 * @return $this
	 */
	public function setComponents($components) {
		if ($components >= 0 && $components <= ObjectType::ALL) {
			return $this->setter('components', array($components));
		} else {
			return $this;
		}
	}


	/**
	 * @return int
	 */
	public function getComponents() {
		return $this->getter('components');
	}


	/**
	 * @param int $ctag
	 * @return $this
	 */
	public function setCtag($ctag) {
		return $this->setter('ctag', array($ctag));
	}


	/**
	 * @return int
	 */
	public function getCtag() {
		return $this->getter('ctag');
	}


	/**
	 * @param string $description
	 * @return $this
	 */
	public function setDescription($description) {
		return $this->setter('description', array($description));
	}


	/**
	 * @return string
	 */
	public function getDescription() {
		return $this->getter('description');
	}


	/**
	 * @param string $displayname
	 * @return $this
	 */
	public function setDisplayname($displayname) {
		return $this->setter('displayname', array($displayname));
	}


	/**
	 * @return string
	 */
	public function getDisplayname() {
		return $this->getter('displayname');
	}


	/**
	 * @param boolean $enabled
	 */
	public function setEnabled($enabled) {
		$this->setter('enabled', array($enabled));
	}


	/**
	 * @return boolean
	 */
	public function getEnabled() {
		return $this->getter('enabled');
	}


	/**
	 * @param int $order
	 * @return $this
	 */
	public function setOrder($order) {
		$this->setter('order', array($order));
	}


	/**
	 * @return int
	 */
	public function getOrder() {
		return $this->getter('order');
	}


	/**
	 * @param string $ownerId
	 * @return $this
	 */
	public function setOwnerId($ownerId) {
		return $this->setter('ownerId', array($ownerId));
	}


	/**
	 * @return string
	 */
	public function getOwnerId() {
		return $this->getter('ownerId');
	}


	/**
	 * @param ITimezone $timezone
	 * @return $this
	 */
	public function setTimezone(ITimezone $timezone) {
		if ($timezone instanceof ITimezone && $timezone->isValid()) {
			return $this->setter('timezone', array($timezone));
		} else {
			return $this;
		}
	}


	/**
	 * @return ITimezone
	 */
	public function getTimezone() {
		return $this->getter('timezone');
	}


	/**
	 * @param string $uri
	 * @return $this
	 */
	public function setPublicUri($uri) {
		$slugify = CalendarUtility::slugify($uri);
		return $this->setter('publicuri', array($slugify));
	}


	/**
	 * @return string
	 */
	public function getPublicUri() {
		return $this->getter('publicuri');
	}


	/**
	 * @param string $uri
	 * @return $this
	 */
	public function setPrivateUri($uri) {
		$slugify = CalendarUtility::slugify($uri);
		return $this->setter('privateuri', array($slugify));
	}


	/**
	 * @return string
	 */
	public function getPrivateUri() {
		return $this->getter('privateuri');
	}


	/**
	 * @param string $userId
	 * @return $this
	 */
	public function setUserId($userId) {
		return $this->setter('userId', array($userId));
	}


	/**
	 * @return string
	 */
	public function getUserId() {
		return $this->getter('userId');
	}


	/**
	 * @brief create calendar object from VCalendar
	 * @param VCalendar $vcalendar
	 * @return $this
	 */
	public function fromVObject(VCalendar $vcalendar) {
		foreach($vcalendar->select('X-WR-CALNAME') as $displayname) {
			$this->setDisplayname($displayname);
			break;
		}

		foreach($vcalendar->select('X-WR-CALDESC') as $description) {
			$this->setDescription($description);
			break;
		}

		foreach($vcalendar->select('X-WR-TIMEZONE') as $timezone) {
			foreach($vcalendar->select('VTIMEZONE') as $vtimezone) {
				if($vtimezone->TZID === $timezone) {
					$this->setTimezone(new Timezone($vtimezone));
					break;
				}
			}
			break;
		}

		foreach($vcalendar->select('X-APPLE-CALENDAR-COLOR') as $color) {
			$this->setColor($color);
			break;
		}

		return $this;
	}


	/**
	 * @brief get VObject from Calendar Object
	 * @return VCalendar object
	 */
	public function getVObject() {
		$properties = array();
		$add = array();

		$displayname = $this->getDisplayname();
		if ($displayname !== null) {
			$properties['X-WR-CALNAME'] = $displayname;
		}

		$description = $this->getDescription();
		if ($description !== null) {
			$properties['X-WR-CALDESC'] = $description;
		}

		$timezone = $this->getTImezone();
		if ($timezone instanceof ITimezone) {
			$properties['X-WR-TIMEZONE'] = (string) $timezone;
			$add[] = $timezone->getVObject();
		}

		$color = $this->getColor();
		if ($color !== null) {
			$properties['X-APPLE-CALENDAR-COLOR'] = $color;
		}

		$vcalendar = new VCalendar($properties);
		foreach($add as $element) {
			$vcalendar->add($element);
		}

		return $vcalendar;
	}


	/**
	 * @brief does a calendar allow
	 * @param integer $cruds
	 * @return boolean
	 */
	public function doesAllow($cruds) {
		return ($this->cruds & $cruds);
	}


	/**
	 * @brief does a calendar allow a certain component
	 * @param integer $components
	 * @return boolean
	 */
	public function doesSupport($components) {
		return ($this->components & $components);
	}


	/**
	 * @brief increment ctag
	 * @return $this
	 */
	public function touch() {
		$this->ctag++;
		return $this;
	}


	/**
	 * @brief create string representation of object
	 * @return string
	 */
	public function __toString() {
		return $this->userId . '::' . $this->getBackend() . '::' . $this->getPrivateUri();
	}

}