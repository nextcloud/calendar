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
namespace OCA\Calendar\Backend;

use OCP\AppFramework\IAppContainer;

use OCP\Calendar\ICalendar;
use OCP\Calendar\ICalendarCollection;
use OCP\Calendar\IObject;
use OCP\Calendar\IObjectCollection;

use OCA\Calendar\Db\DoesNotExistException;
use OCA\Calendar\Db\MultipleObjectsReturnedException;


abstract class Backend implements IBackend {

	/**
	 * app container for dependency injection
	 * @var \OCP\AppFramework\IAppContainer
	 */
	protected $app;


	/**
	 * backend name
	 * @var string
	 */
	protected $backend;


	/**
	 * constants for actions
	 */
	const NOT_IMPLEMENTED = -501;
	const CREATE_CALENDAR =  1;
	const UPDATE_CALENDAR = 2;
	const DELETE_CALENDAR = 4;
	const MERGE_CALENDAR = 8;
	const MOVE_CALENDAR = 16;
	const CREATE_OBJECT = 32;
	const UPDATE_OBJECT = 64;
	const DELETE_OBJECT = 128;
	const DELETE_ALL_OBJECTS = 8192;
	const FIND_IN_PERIOD = 256;
	const FIND_OBJECTS_BY_TYPE = 512;
	const FIND_IN_PERIOD_BY_TYPE = 1024;
	const SEARCH_BY_PROPERTIES = 2048;
	const PROVIDES_CRON_SCRIPT = 4096;


	/**
	 * maps action-constants to method names
	 * @var array
	 */
	protected $possibleActions = array(
		self::CREATE_CALENDAR => 'createCalendar',
		self::UPDATE_CALENDAR => 'updateCalendar',
		self::DELETE_CALENDAR => 'deleteCalendar',
		self::MERGE_CALENDAR => 'mergeCalendar',
		self::MOVE_CALENDAR => 'moveCalendar',
		self::CREATE_OBJECT => 'createObject',
		self::UPDATE_OBJECT => 'updateObject',
		self::DELETE_OBJECT => 'deleteObject',
		self::DELETE_ALL_OBJECTS => 'deleteAll',
		self::FIND_IN_PERIOD => 'findObjectsInPeriod',
		self::FIND_OBJECTS_BY_TYPE => 'findObjectsByType',
		self::FIND_IN_PERIOD_BY_TYPE => 'findObjectsByTypeInPeriod',
		self::SEARCH_BY_PROPERTIES => 'searchByProperties',
	);


	/**
	 * Constructor
	 * @param IAppContainer $app
	 * @param string $backend
	 */
	public function __construct(IAppContainer $app, $backend=null){
		$this->app = $app;

		if ($backend === null) {
			$backend = get_class($this);
		}

		$this->backend = strtolower($backend);
	}


	/**
	 * @brief get integer that represents supported actions 
	 * @returns integer
	 */
	public function getSupportedActions() {
		$actions = 0;
		foreach($this->possibleActions as $action => $methodName) {
			if (method_exists($this, $methodName)) {
				$actions |= $action;
			}
		}

		return $actions;
	}


	/**
	 * @brief Check if backend implements actions
	 * @param string $actions
	 * @returns integer
	 */
	public function implementsActions($actions) {
		return (bool)($this->getSupportedActions() & $actions);
	}


	/**
	 * @brief returns whether or not a backend can be enabled
	 * @returns boolean
	 */
	public function canBeEnabled() {
		return true;
	}


	/**
	 * @brief returns whether or not calendar objects should be cached
	 * @param string $calendarURI
	 * @param string $userId
	 * @returns boolean
	 */
	public function cacheObjects($calendarURI, $userId) {
		return true;
	}


	/**
	 * @brief returns list of available uri prefixes
	 * @returns array
	 */
	public function getAvailablePrefixes() {
		return array();
	}


	/**
	 * @brief returns list of subscription types supported by backend
	 * @returns array
	 */
	public function getAvailableSubscriptionTypes() {
		return array();
	}


	/**
	 * @brief returns information about calendar $calendarURI of the user $userId
	 * @param string $calendarURI
	 * @param string $userId
	 * @returns ICalendar
	 * @throws DoesNotExistException if uri does not exist
	 * @throws MultipleObjectsReturnedException
	 */
	abstract public function findCalendar($calendarURI, $userId);


	/**
	 * @brief returns all calendars of the user $userId
	 * @param string $userId
	 * @param integer $limit
	 * @param integer $offset
	 * @returns ICalendarCollection
	 * @throws DoesNotExistException if uri does not exist
	 */
	abstract public function findCalendars($userId, $limit, $offset);


	/**
	 * @param string $userId
	 * @param integer $limit
	 * @param integer $offset
	 * @return array
	 */
	public function getCalendarIdentifiers($userId, $limit, $offset) {
		$calendars = $this->findCalendars($userId, $limit, $offset);
		$identifiers = array();

		$calendars->iterate(function(ICalendar &$calendar) use (&$identifiers) {
			$identifiers[] = $calendar->getPublicUri();
		});

		return $identifiers;
	}


	/**
	 * @brief returns number of calendar
	 * @param string $userId
	 * @returns integer
	 */
	public function countCalendars($userId) {
		return $this->findCalendars($userId, null, null)->count();
	}


	/**
	 * @brief returns whether or not a calendar exists
	 * @param string $calendarURI
	 * @param string $userId
	 * @returns boolean
	 */
	public function doesCalendarExist($calendarURI, $userId) {
		try {
			$this->findCalendar($calendarURI, $userId);
			return true;
		} catch (DoesNotExistException $ex) {
			return false;
		} catch (MultipleObjectsReturnedException $ex) {
			return false;
		}
	}


	/**
	 * @brief returns ctag of a calendar
	 * @param string $calendarURI
	 * @param string $userId
	 * @returns integer
	 * @throws DoesNotExistException if calendar does not exist
	 * @throws MultipleObjectsReturnedException
	 */
	public function getCalendarsCTag($calendarURI, $userId) {
		return $this->findCalendar($calendarURI, $userId)->getCTag();
	}


	/**
	 * @brief find object
	 * @param ICalendar $calendar
	 * @param string $objectURI
	 * @returns IObject
	 * @throws DoesNotExistException if calendar does not exist
	 * @throws DoesNotExistException if object does not exist
	 * @throws MultipleObjectsReturnedException
	 */
	abstract public function findObject(ICalendar &$calendar, $objectURI);


	/**
	 * @brief returns all objects in the calendar $calendarURI of the user $userId
	 * @param ICalendar $calendar
	 * @param integer $limit
	 * @param integer $offset
	 * @returns IObjectCollection
	 * @throws DoesNotExistException if calendar does not exist
	 */
	abstract public function findObjects(ICalendar &$calendar, $limit, $offset);


	/**
	 * @brief get list of objectURIs
	 * @param ICalendar $calendar
	 * @param integer $limit
	 * @param integer $offset
	 * @return array
	 */
	public function getObjectIdentifiers(ICalendar &$calendar, $limit, $offset) {
		$objects = $this->findObjects($calendar, $limit, $offset);
		$identifiers = array();

		$objects->iterate(function(IObject &$object) use (&$identifiers) {
			$identifiers[] = $object->getUri();
		});

		return $identifiers;
	}


	/**
	 * @brief returns number of objects in calendar
	 * @param ICalendar $calendar
	 * @returns integer
	 * @throws DoesNotExistException if calendar does not exist
	 */
	public function countObjects(ICalendar $calendar) {
		return $this->findObjects($calendar, null, null)->count();
	}


	/**
	 * @brief returns whether or not an object exists
	 * @param ICalendar $calendar
	 * @param string $objectURI
	 * @returns boolean
	 */
	public function doesObjectExist(ICalendar $calendar, $objectURI) {
		try {
			$this->findObject($calendar, $objectURI);
			return true;
		} catch (DoesNotExistException $ex) {
			return false;
		} catch (MultipleObjectsReturnedException $ex) {
			return false;
		}
	}


	/**
	 * check if object allows a certain action
	 * @param ICalendar $calendar
	 * @param string $objectURI
	 * @param integer $cruds
	 * @return boolean
	 */
	public function doesObjectAllow(ICalendar $calendar, $objectURI, $cruds) {
		return ($cruds & $this->findObject($calendar, $objectURI)->getRuds());
	}


	/**
	 * @brief returns eTag of an object
	 * @param ICalendar $calendar
	 * @param string $objectURI
	 * @returns string
	 * @throws DoesNotExistException if calendar does not exist
	 * @throws DoesNotExistException if object does not exist
	 */
	public function getObjectsETag(ICalendar $calendar, $objectURI) {
		return $this->findObject($calendar, $objectURI)->getEtag();
	}


	/**
	 * @brief returns whether or not a backend can store a calendar's color
	 * @returns boolean
	 */
	public function canStoreColor() {
		return false;
	}


	/**
	 * @brief returns whether or not a backend can store a calendar's supported components
	 * @returns boolean
	 */
	public function canStoreComponents() {
		return false;
	}


	/**
	 * @brief returns whether or not a backend can store a calendar's description
	 * @return boolean
	 */
	public function canStoreDescription() {
		return false;
	}


	/**
	 * @brief returns whether or not a backend can store a calendar's displayname
	 * @returns boolean
	 */
	public function canStoreDisplayname() {
		return false;
	}


	/**
	 * @brief returns whether or not a backend can store if a calendar is enabled
	 * @returns boolean
	 */
	public function canStoreEnabled() {
		return false;
	}


	/**
	 * @brief returns whether or not a backend can store a calendar's order
	 * @returns boolean
	 */
	public function canStoreOrder() {
		return false;
	}
}