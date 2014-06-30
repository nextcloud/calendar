<?php
/**
 * ownCloud - Calendar App
 *
 * @author Georg Ehrke
 * @copyright 2014 Georg Ehrke <oc.list@georgehrke.com>
 * @author Thomas Tanghus
 * @copyright 2014 Thomas Tanghus <thomas@tanghus.net>
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
namespace OCA\Calendar\Backend;

use OCP\AppFramework\IAppContainer;
use OCP\Calendar\Backend;
use OCP\Calendar\ICalendar;
use OCP\Calendar\ICalendarCollection;
use OCP\Calendar\IObject;
use OCP\Calendar\IObjectCollection;
use OCP\Calendar\DoesNotExistException;

use OCA\Calendar\Db\Calendar;
use OCA\Calendar\Db\CalendarCollection;
use OCA\Calendar\Db\ObjectCollection;
use OCA\Calendar\Db\Timezone;
use OCA\Calendar\Db\ObjectType;
use OCA\Calendar\Db\Permissions;

class Contact extends Backend {

	public $calendarURIs;

	/**
	 * constructor
	 * @param IAppContainer $app
	 * @param array $parameters
	 */
	public function __construct(IAppContainer $app, array $parameters){
		parent::__construct($app, 'org.ownCloud.contact');

		$this->calendarURIs = array(
			'anniversary',
			'birthday',
		);
	}


	/**
	 * returns whether or not a backend can be enabled
	 * @returns boolean
	 */
	public function canBeEnabled() {
		return true;//return \OCP\App::isEnabled('contacts');
	}


	/**
	 * returns whether or not calendar objects should be cached
	 * @param string $calendarURI
	 * @param string $userId
	 * @returns boolean
	 */
	public function cacheObjects($calendarURI, $userId) {
		return false;
	}


	/**
	 * returns information about calendar $calendarURI of the user $userId
	 * @param string $calendarURI
	 * @param string $userId
	 * @returns ICalendar
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
		$calendar->setBackend($this->getBackendIdentifier());
		$calendar->setPrivateUri($calendarURI);
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
	 * returns all calendars of the user $userId
	 * @param string $userId
	 * @param integer $limit
	 * @param integer $offset
	 * @returns ICalendarCollection
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
	 * returns number of calendar
	 * @param string $userId
	 * @returns integer
	 */
	public function countCalendars($userId) {
		return count($this->calendarURIs);
	}


	/**
	 * returns whether or not a calendar exists
	 * @param string $calendarURI
	 * @param string $userId
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
	 * returns information about the object (event/journal/todo) with the uid $objectURI in the calendar $calendarURI of the user $userId
	 * @param ICalendar $calendar
	 * @param string $objectURI
	 * @returns IObject
	 * @throws DoesNotExistException if calendar does not exist
	 * @throws DoesNotExistException if object does not exist
	 */
	public function findObject(ICalendar &$calendar, $objectURI) {
		//TODO implement
		throw new DoesNotExistException();
	}


	/**
	 * returns all objects in the calendar $calendarURI of the user $userId
	 * @param ICalendar $calendar
	 * @param integer $limit
	 * @param integer $offset
	 * @returns IObjectCollection
	 * @throws DoesNotExistException if calendar does not exist
	 */
	public function findObjects(ICalendar &$calendar, $limit, $offset) {
		//TODO implement
		return new ObjectCollection();
	}
}