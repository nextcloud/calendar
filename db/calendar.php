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

use OCP\Calendar\ICalendar;
use OCP\Calendar\ITimezone;
use OCA\Calendar\Sabre\VObject\Component\VCalendar;
use OCA\Calendar\Utility\CalendarUtility;
use OCA\Calendar\Utility\ColorUtility;
use OCA\Calendar\Utility\SabreUtility;

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
	 * @var integer
	 */
	public $fileId;

	/**
	 * @var string
	 */
	public $description;


	/**
	 * @var integer
	 */
	public $lastPropertiesUpdate;


	/**
	 * @var integer
	 */
	public $lastObjectUpdate;


	/**
	 * @var array
	 */
	private $icsMapper = array(
		'displayname' => 'X-WR-CALNAME',
		'description' => 'X-WR-CALDESC',
		'color' => 'X-APPLE-CALENDAR-COLOR',
	);


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
		if (ColorUtility::isValid($color)) {
			$rgba = ColorUtility::getRGBA($color);
			return $this->setter('color', array($rgba));
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
	 * @return $this
	 */
	public function setEnabled($enabled) {
		return $this->setter('enabled', array($enabled));
	}


	/**
	 * @return boolean
	 */
	public function getEnabled() {
		return $this->getter('enabled');
	}


	/**
	 * @param int $lastPropertiesUpdate - unix time of last update
	 * @return $this
	 */
	public function setLastPropertiesUpdate($lastPropertiesUpdate) {
		return $this->setter('lastPropertiesUpdate', array($lastPropertiesUpdate));
	}


	/**
	 * @return boolean
	 */
	public function getLastPropertiesUpdate() {
		return $this->getter('lastPropertiesUpdate');
	}


	/**
	 * @param int $lastObjectUpdate - unix time of last update
	 * @return $this
	 */
	public function setLastObjectUpdate($lastObjectUpdate) {
		return $this->setter('lastObjectUpdate', array($lastObjectUpdate));
	}


	/**
	 * @return boolean
	 */
	public function getLastObjectUpdate() {
		return $this->getter('lastObjectUpdate');
	}


	/**
	 * @param int $order
	 * @return $this
	 */
	public function setOrder($order) {
		return $this->setter('order', array($order));
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
	 * @param int $fileId
	 * @return $this
	 */
	public function setFileId($fileId) {
		return $this->setter('fileId', array($fileId));
	}


	/**
	 * @return int
	 */
	public function getFileId() {
		return $this->getter('fileId');
	}


	/**
	 * create calendar object from VCalendar
	 * @param VCalendar $vcalendar
	 * @return $this
	 */
	public function fromVObject(VCalendar $vcalendar) {
		foreach ($this->icsMapper as $classvar => $icsproperty) {
			$setter = 'set' . ucfirst($classvar);
			$value = $vcalendar->select($icsproperty);
			if (!empty($value)) {
				$this->$setter(reset($value));
			}
		}

		$tzIds = $vcalendar->select('X-WR-TIMEZONE');
		$tzId = reset($tzIds);
		$tz = SabreUtility::getTimezoneFromVObject($vcalendar, $tzId);
		if ($tz) {
			$this->setTimezone($tz);
		}

		return $this;
	}


	/**
	 * get VObject from Calendar Object
	 * @return VCalendar object
	 */
	public function getVObject() {
		$vcalendar = new VCalendar();

		foreach ($this->icsMapper as $classvar => $icsproperty) {
			if ($this->$classvar !== null) {
				$vcalendar->$icsproperty = $this->$classvar;
			}
		}

		if ($this->timezone instanceof ITimezone) {
			$vcalendar->{'X-WR-TIMEZONE'} = strval($this->timezone);
			$vcalendar->add($this->timezone->getVObject());
		}

		return $vcalendar;
	}


	/**
	 * does a calendar allow
	 * @param integer $cruds
	 * @return integer
	 */
	public function doesAllow($cruds) {
		return ($this->cruds & $cruds);
	}


	/**
	 * does a calendar allow a certain component
	 * @param integer $components
	 * @return integer
	 */
	public function doesSupport($components) {
		return ($this->components & $components);
	}


	/**
	 * increment ctag
	 * @return $this
	 */
	public function touch() {
		$this->ctag++;
		return $this;
	}


	/**
	 * create string representation of object
	 * @return string
	 */
	public function __toString() {
		return implode(
			'::',
			array(
				$this->getUserId(),
				$this->getBackend(),
				$this->getPrivateUri()
			)
		);
	}


	/**
	 * register field types
	 */
	protected function registerTypes() {
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
		$this->addType('lastPropertiesUpdate', 'integer');
		$this->addType('lastObjectUpdate', 'integer');
	}


	/**
	 * register mandatory fields
	 */
	protected function registerMandatory() {
		$this->addMandatory('userId');
		$this->addMandatory('ownerId');
		$this->addMandatory('backend');
		$this->addMandatory('privateuri');
		$this->addMandatory('ctag');
		$this->addMandatory('cruds');
		$this->addMandatory('enabled');
		$this->addMandatory('order');
	}
}