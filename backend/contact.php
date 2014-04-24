<?php
/**
 * Copyright (c) 2014 Georg Ehrke <oc.list@georgehrke.com>
 * Copyright (c) 2014 Thomas Tanghus <thomas@tanghus.net>
 * This file is licensed under the Affero General Public License version 3 or
 * later.
 * See the COPYING-README file.
 */
namespace OCA\Calendar\Backend;

use \OCP\AppFramework\IAppContainer;

use \OCA\Calendar\Db\DoesNotExistException;
use \OCA\Calendar\Db\MultipleObjectsReturnedException;
use \OCA\Calendar\Db\CorruptDataException;

use \OCA\Calendar\Db\Calendar;
use \OCA\Calendar\Db\CalendarCollection;

use \OCA\Calendar\Db\Object;
use \OCA\Calendar\Db\ObjectCollection;

use \OCA\Calendar\Db\Timezone;
use \OCA\Calendar\Db\TimezoneCollection;

use \OCA\Calendar\Db\ObjectType;
use \OCA\Calendar\Db\Permissions;

use \OCA\Calendar\Utility\ObjectUtility;

use \DateTime;

class Contact extends Backend {

	public $calendarURIs;

	/**
	 * @brief constructor
	 * @param IAppContainer $app
	 * @param array $parameters
	 */
	public function __construct(IAppContainer $app, array $parameters){
		parent::__construct($app, 'Contact');

		$this->calendarURIs = array(
			'anniversary',
			'birthday',
		);
	}


	/**
	 * @brief returns whether or not a backend can be enabled
	 * @returns boolean
	 */
	public function canBeEnabled() {
		return \OCP\App::isEnabled('contacts');
	}


	/**
	 * @brief returns whether or not calendar objects should be cached
	 * @param string $calendarURI
	 * @param string $userId
	 * @returns boolean
	 */
	public function cacheObjects($uri, $userId) {
		return false;
	}


	/**
	 * @brief returns information about calendar $calendarURI of the user $userId
	 * @param string $calendarURI
	 * @param string $userId
	 * @returns array with \OCA\Calendar\Db\Calendar object
	 * @throws DoesNotExistException if uri does not exist
	 */
	public function findCalendar($calendarURI, $userId) {
		if (!$this->doesCalendarExist($calendarURI, $userId)) {
			$msg  = 'Backend\Contact::findCalendar(): ';
			$msg .= '"' . $calendarURI . '" doesn\'t exist';
			throw new DoesNotExistException($msg);
		}

		$calendar = new Calendar();
		$calendar->setUserId($userId);
		$calendar->setOwnerId($userId);
		$calendar->setBackend($this->backend);
		$calendar->setUri($calendarURI);
		$calendar->setComponents(ObjectType::EVENT);
		$calendar->setCtag(1); //sum of all addressbook ctags
		$calendar->setTimezone(new TimeZone('UTC'));
		$calendar->setCruds(Permissions::READ + Permissions::SHARE);
		$calendar->setColor('#ffffff');
		$calendar->setOrder(0);
		$calendar->setEnabled(true);

		if ($calendarURI === 'anniversary') {
			$calendar->setDisplayname('Anniversary'); //TODO - use translation
		} elseif ($calendarURI === 'birthday') {
			$calendar->setDisplayname('Birthday'); //TODO - use translation
		}

		return $calendar;
	}


	/**
	 * @brief returns all calendars of the user $userId
	 * @param string $userId
	 * @returns \OCA\Calendar\Db\CalendarCollection
	 * @throws DoesNotExistException if uri does not exist
	 */
	public function findCalendars($userId, $limit=null, $offset=null) {
		$calendars = new CalendarCollection();

		foreach($this->calendarURIs as $uri) {
			$calendars->add($this->findCalendar($uri, $userId));
		}

		return $calendars;
	}


	/**
	 * @brief returns number of calendar
	 * @param string $userid
	 * @returns integer
	 */
	public function countCalendars($userId) {
		return count($this->calendarURIs);
	}


	/**
	 * @brief returns whether or not a calendar exists
	 * @param string $calendarURI
	 * @param string $userid
	 * @returns boolean
	 */
	public function doesCalendarExist($calendarURI, $userId) {
		if (in_array($calendarURI, $this->calendarURIs)) {
			return true;
		} else {
			return false;
		}
	}


	/**
	 * @brief returns information about the object (event/journal/todo) with the uid $objectURI in the calendar $calendarURI of the user $userId 
	 * @param string $calendarURI
	 * @param string $objectURI
	 * @param string $userid
	 * @returns \OCA\Calendar\Db\Object object
	 * @throws DoesNotExistException if calendar does not exist
	 * @throws DoesNotExistException if object does not exist
	 */
	public function findObject(Calendar &$calendar, $objectURI) {
		//TODO implement
		throw new DoesNotExistException();
	}


	/**
	 * @brief returns all objects in the calendar $calendarURI of the user $userId
	 * @param string $calendarURI
	 * @param string $userId
	 * @returns \OCA\Calendar\Db\ObjectCollection
	 * @throws DoesNotExistException if calendar does not exist
	 */
	public function findObjects(Calendar &$calendar, $limit, $offset) {
		//TODO implement
		return new ObjectCollection();
	}
}