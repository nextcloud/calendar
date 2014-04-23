<?php
/**
 * Copyright (c) 2014 Georg Ehrke <oc.list@georgehrke.com>
 * This file is licensed under the Affero General Public License version 3 or
 * later.
 * See the COPYING-README file.
 */
namespace OCA\Calendar\Backend;

use \OCP\AppFramework\IAppContainer;

use \OCA\Calendar\Db\Calendar;

use \OCA\Calendar\Db\ObjectType;
use \OCA\Calendar\Db\Permissions;

//constants
define('OCA\Calendar\Backend\NOT_IMPLEMENTED',  	 	-501);
define('OCA\Calendar\Backend\CREATE_CALENDAR', 			   1);
define('OCA\Calendar\Backend\UPDATE_CALENDAR',			   2);
define('OCA\Calendar\Backend\DELETE_CALENDAR',			   4);
define('OCA\Calendar\Backend\MERGE_CALENDAR',			   8);
define('OCA\Calendar\Backend\MOVE_CALENDAR',			  16);
define('OCA\Calendar\Backend\CREATE_OBJECT',			  32);
define('OCA\Calendar\Backend\UPDATE_OBJECT',			  64);
define('OCA\Calendar\Backend\DELETE_OBJECT',			 128);
define('OCA\Calendar\Backend\FIND_IN_PERIOD',			 256);
define('OCA\Calendar\Backend\FIND_OBJECTS_BY_TYPE',		 512);
define('OCA\Calendar\Backend\FIND_IN_PERIOD_BY_TYPE',	1024);
define('OCA\Calendar\Backend\SEARCH_BY_PROPERTIES',		2048);
define('OCA\Calendar\Backend\PROVIDES_CRON_SCRIPT',		4096);

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
	 * maps action-constants to method names
	 * @var arrray
	 */
	protected $possibleActions = array(
		CREATE_CALENDAR 		=> 'createCalendar',
		UPDATE_CALENDAR			=> 'updateCalendar',
		DELETE_CALENDAR 		=> 'deleteCalendar',
		MERGE_CALENDAR 			=> 'mergeCalendar',
		MOVE_CALENDAR			=> 'moveCalendar',
		CREATE_OBJECT 			=> 'createObject',
		UPDATE_OBJECT 			=> 'updateObject',
		DELETE_OBJECT 			=> 'deleteObject',
		FIND_IN_PERIOD 			=> 'findObjectsInPeriod',
		FIND_OBJECTS_BY_TYPE	=> 'findObjectsByType',
		FIND_IN_PERIOD_BY_TYPE	=> 'findObjectsByTypeInPeriod',
		SEARCH_BY_PROPERTIES	=> 'searchByProperties',
	);

	/**
	 * Constructor
	 * @param \OCP\AppFramework\IAppContainer $api
	 * @param string $backendName
	 */
	public function __construct(IAppContainer $app, $backend=null){
		$this->app = $app;

		if($backend === null) {
			$backend = get_class($this);
		}

		$this->backend = strtolower($backend);
	}

	/**
	 * @brief get integer that represents supported actions 
	 * @returns integer
	 * 
	 * This method returns an integer.
	 * This method is mandatory!
	 */
	public function getSupportedActions() {
		$actions = 0;
		foreach($this->possibleActions as $action => $methodName) {
			if(method_exists($this, $methodName)) {
				$actions |= $action;
			}
		}

		return $actions;
	}

	/**
	 * @brief Check if backend implements actions
	 * @param string $actions
	 * @returns integer
	 * 
	 * This method returns an integer.
	 * If the action is supported, it returns an integer that can be compared with \OC\Calendar\Backend\CREATE_CALENDAR, etc...
	 * If the action is not supported, it returns -501
	 * This method is mandatory!
	 */
	public function implementsActions($actions) {
		return (bool)($this->getSupportedActions() & $actions);
	}

	/**
	 * @brief returns whether or not a backend can be enabled
	 * @returns boolean
	 * 
	 * This method returns a boolean.
	 * This method is mandatory!
	 */
	public function canBeEnabled() {
		return true;
	}

	/**
	 * @brief returns whether or not calendar objects should be cached
	 * @param string $calendarURI
	 * @param string $userId
	 * @returns boolean
	 * 
	 * This method returns a boolen.
	 * This method is mandatory!
	 */
	public function cacheObjects($calendarURI, $userId) {
		return true;
	}

	/**
	 * @brief returns information about calendar $calendarURI of the user $userId
	 * @param string $calendarURI
	 * @param string $userId
	 * @returns array with \OCA\Calendar\Db\Calendar object
	 * @throws DoesNotExistException if uri does not exist
	 * 
	 * This method returns an \OCA\Calendar\Db\Calendar object.
	 * This method is mandatory!
	 */
	abstract public function findCalendar($calendarURI, $userId);

	/**
	 * @brief returns all calendars of the user $userId
	 * @param string $userId
	 * @returns \OCA\Calendar\Db\CalendarCollection
	 * @throws DoesNotExistException if uri does not exist
	 * 
	 * This method returns an \OCA\Calendar\Db\CalendarCollection object.
	 * This method is mandatory!
	 */
	abstract public function findCalendars($userId, $limit, $offset);

	/**
	 * @brief returns number of calendar
	 * @param string $userid
	 * @returns integer
	 * 
	 * This method returns an integer
	 * This method is mandatory!
	 */
	public function countCalendars($userId) {
		return $this->findCalendars($userId)->count();
	}

	/**
	 * @brief returns whether or not a calendar exists
	 * @param string $calendarURI
	 * @param string $userid
	 * @returns boolean
	 * 
	 * This method returns a boolean
	 * This method is mandatory!
	 */
	public function doesCalendarExist($calendarURI, $userId) {
		try {
			$this->findCalendar($calendarURI, $userId);
			return true;
		} catch (Exception $ex) {
			return false;
		}
	}

	/**
	 * @brief returns ctag of a calendar
	 * @param string $calendarURI
	 * @param string $userid
	 * @returns integer
	 * @throws DoesNotExistException if calendar does not exist
	 * 
	 * This method returns a integer
	 * This method is mandatory!
	 */
	public function getCalendarsCTag($calendarURI, $userId) {
		$calendar = $this->findCalendar($calendarURI, $userId)->getCTag();
	}

	/**
	 * @brief returns information about the object (event/journal/todo) with the uid $objectURI in the calendar $calendarURI of the user $userId 
	 * @param string $calendarURI
	 * @param string $objectURI
	 * @param string $userid
	 * @returns \OCA\Calendar\Db\Object object
	 * @throws DoesNotExistException if calendar does not exist
	 * @throws DoesNotExistException if object does not exist
	 *
	 * This method returns an \OCA\Calendar\Db\Object object.
	 * This method is mandatory!
	 */
	abstract public function findObject(Calendar &$calendar, $objectURI);

	/**
	 * @brief returns all objects in the calendar $calendarURI of the user $userId
	 * @param string $calendarURI
	 * @param string $userId
	 * @returns \OCA\Calendar\Db\ObjectCollection
	 * @throws DoesNotExistException if calendar does not exist
	 * 
	 * This method returns an \OCA\Calendar\Db\ObjectCollection object.
	 * This method is mandatory!
	 */
	abstract public function findObjects(Calendar &$calendar, $limit, $offset);

	/**
	 * @brief returns number of objects in calendar
	 * @param string $calendarURI
	 * @param string $userid
	 * @returns integer
	 * @throws DoesNotExistException if calendar does not exist
	 * 
	 * This method returns an integer
	 * This method is mandatory!
	 */
	public function countObjects(Calendar $calendar) {
		return $this->findObjects($calendarURI, $userId)->count();
	}

	/**
	 * @brief returns whether or not an object exists
	 * @param string $calendarURI
	 * @param string $objectURI
	 * @param string $userid
	 * @returns boolean
	 * 
	 * This method returns a boolean
	 * This method is mandatory!
	 */
	public function doesObjectExist(Calendar $calendar, $objectURI) {
		try {
			$this->findObject($calendarURI, $objectURI, $userId);
			return true;
		} catch (Exception $ex) {
			return false;
		}
	}

	/**
	 * @brief returns etag of an object
	 * @param string $calendarURI
	 * @param string $objectURI
	 * @param string $userid
	 * @returns string
	 * @throws DoesNotExistException if calendar does not exist
	 * @throws DoesNotExistException if object does not exist
	 * 
	 * This method returns a string
	 * This method is mandatory!
	 */
	public function getObjectsETag(Calendar $calendar, $objectURI) {
		return $this->find($calendarURI, $objectURI, $userId)->getEtag();
	}

	/**
	 * @brief returns whether or not a backend can store a calendar's color
	 * @returns boolean
	 * 
	 * This method returns a boolean
	 * This method is mandatory!
	 */
	public function canStoreColor() {
		return false;
	}

	/**
	 * @brief returns whether or not a backend can store a calendar's supported components
	 * @returns boolean
	 * 
	 * This method returns a boolean
	 * This method is mandatory!
	 */
	public function canStoreComponents() {
		return false;
	}

	/**
	 * @brief returns whether or not a backend can store a calendar's displayname
	 * @returns boolean
	 * 
	 * This method returns a boolean
	 * This method is mandatory!
	 */
	public function canStoreDisplayname() {
		return false;
	}

	/**
	 * @brief returns whether or not a backend can store if a calendar is enabled
	 * @returns boolean
	 * 
	 * This method returns a boolean
	 * This method is mandatory!
	 */
	public function canStoreEnabled() {
		return false;
	}

	/**
	 * @brief returns whether or not a backend can store a calendar's order
	 * @returns boolean
	 * 
	 * This method returns a boolean
	 * This method is mandatory!
	 */
	public function canStoreOrder() {
		return false;
	}
}