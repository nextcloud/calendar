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
namespace OCP\Calendar;

use OCA\Calendar\Db\ObjectType;
use OCP\AppFramework\IAppContainer;

abstract class Backend implements IBackendAPI {

	/**
	 * app container for dependency injection
	 * @var \OCP\AppFramework\IAppContainer
	 */
	protected $app;


	/**
	 * backend identifier string
	 * @var string
	 */
	protected $backendIdentifier;


	/**
	 * constants for actions
	 */
	const NOT_IMPLEMENTED = -501;
	const CREATE_CALENDAR =  1;
	const UPDATE_CALENDAR = 2;
	const DELETE_CALENDAR = 4;
	const MOVE_CALENDAR = 8;
	const CREATE_OBJECT = 16;
	const UPDATE_OBJECT = 32;
	const DELETE_OBJECT = 64;
	const FIND_IN_PERIOD = 128;
	const SEARCH_BY_PROPERTIES = 256;
	const PROVIDES_CRON_SCRIPT = 512;


	/**
	 * maps action-constants to method names
	 * @var array
	 */
	private static $actionMapper = array(
		self::CREATE_CALENDAR => 'createCalendar',
		self::UPDATE_CALENDAR => 'updateCalendar',
		self::DELETE_CALENDAR => 'deleteCalendar',
		self::MOVE_CALENDAR => 'moveCalendar',
		self::CREATE_OBJECT => 'createObject',
		self::UPDATE_OBJECT => 'updateObject',
		self::DELETE_OBJECT => 'deleteObject',
		self::FIND_IN_PERIOD => 'findObjectsInPeriod',
		self::SEARCH_BY_PROPERTIES => 'searchByProperties',
	);


	/**
	 * Constructor
	 * @param IAppContainer $app
	 * @param string $backendIdentifier
	 */
	public function __construct(IAppContainer $app, $backendIdentifier){
		$this->app = $app;
		$this->backendIdentifier = $backendIdentifier;
	}


	/**
	 * get the backend's identifier
	 * @return string
	 */
	public function getBackendIdentifier() {
		return $this->backendIdentifier;
	}


	/**
	 * get integer that represents supported actions 
	 * @return integer
	 */
	public function getSupportedActions() {
		$actions = 0;

		foreach(self::$actionMapper as $action => $methodName) {
			if (method_exists($this, $methodName)) {
				$actions |= $action;
			}
		}

		return $actions;
	}


	/**
	 * Check if backend implements certain actions
	 * @param integer $actions
	 * @return bool
	 */
	public function implementsActions($actions) {
		return (bool)($this->getSupportedActions() & $actions);
	}


	/**
	 * returns whether or not a backend can be enabled
	 * @return bool
	 */
	public function canBeEnabled() {
		return true;
	}


	/**
	 * returns whether or not calendar objects should be cached
	 * @param string $calendarURI
	 * @param string $userId
	 * @return bool
	 */
	public function cacheObjects($calendarURI, $userId) {
		return true;
	}


	/**
	 * get information about available prefixes
	 * @return array
	 */
	public function getAvailablePrefixes() {
		return array();
	}


	/**
	 * get information about supported subscription-types
	 * @return array
	 */
    public function getSubscriptionTypes() {
        return array();
    }


	/**
	 * @param ISubscription $subscription
	 * @throws BackendException
	 * @return bool
	 */
	public function validateSubscription(ISubscription &$subscription) {
		throw new BackendException('Subscription is not supported');
	}


	/**
	 * get a certain calendar
	 * @param string $privateuri
	 * @param string $userId
	 * @return ICalendar
	 * @throws DoesNotExistException if $privateuri does not exist
	 * @throws MultipleObjectsReturnedException if multiple calendars exist with given $privateuri
	 */
	abstract public function findCalendar($privateuri, $userId);


	/**
	 * get all calendars of a user
	 * @param string $userId
	 * @param integer $limit
	 * @param integer $offset
	 * @return ICalendarCollection
	 */
	abstract public function findCalendars($userId, $limit, $offset);


	/**
	 * get all calendar-identifiers of a user
	 * @param string $userId
	 * @param integer $limit
	 * @param integer $offset
	 * @return array
	 */
	public function getCalendarIdentifiers($userId, $limit, $offset) {
		$calendars = $this->findCalendars($userId, $limit, $offset);
		$identifiers = array();

		$calendars->iterate(function(ICalendar &$calendar) use (&$identifiers) {
			$identifiers[] = $calendar->getPrivateUri();
		});

		return $identifiers;
	}


	/**
	 * get number of calendar
	 * @param string $userId
	 * @return integer
	 */
	public function countCalendars($userId) {
		return $this->findCalendars($userId, null, null)->count();
	}


	/**
	 * get whether or not a calendar exists
	 * @param string $privateuri
	 * @param string $userId
	 * @return bool
	 */
	public function doesCalendarExist($privateuri, $userId) {
		try {
			$this->findCalendar($privateuri, $userId);
			return true;
		} catch (DoesNotExistException $ex) {
			return false;
		} catch (MultipleObjectsReturnedException $ex) {
			return false;
		}
	}


	/**
	 * get a calendar's ctag
	 * @param string $privateuri
	 * @param string $userId
	 * @return integer
	 * @throws DoesNotExistException if calendar does not exist
	 * @throws MultipleObjectsReturnedException if multiple calendars exist with given $privateuri
	 */
	public function getCalendarsCTag($privateuri, $userId) {
		return $this->findCalendar($privateuri, $userId)->getCTag();
	}


	/**
	 * get a certain object
	 * @param ICalendar $calendar
	 * @param string $objectUri
	 * @param integer $type
	 * @return IObject
	 * @throws DoesNotExistException if calendar does not exist
	 * @throws DoesNotExistException if object does not exist
	 * @throws MultipleObjectsReturnedException if multiple objects exist with given $privateuri and $objectUri
	 */
	abstract public function findObject(ICalendar &$calendar, $objectUri, $type=ObjectType::ALL);


	/**
	 * get all objects in a calendar
	 * @param ICalendar $calendar
	 * @param integer $type
	 * @param integer $limit
	 * @param integer $offset
	 * @return IObjectCollection
	 * @throws DoesNotExistException if calendar does not exist
	 */
	abstract public function findObjects(ICalendar &$calendar, $type=ObjectType::ALL, $limit, $offset);


	/**
	 * get list of objectUris
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
	 * get number of objects in calendar
	 * @param ICalendar $calendar
	 * @return integer
	 * @throws DoesNotExistException if calendar does not exist
	 */
	public function countObjects(ICalendar $calendar) {
		return $this->findObjects($calendar, null, null)->count();
	}


	/**
	 * get whether or not an object exists
	 * @param ICalendar $calendar
	 * @param string $objectUri
	 * @return bool
	 */
	public function doesObjectExist(ICalendar $calendar, $objectUri) {
		try {
			$this->findObject($calendar, $objectUri);
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
	 * @param string $objectUri
	 * @param integer $cruds
	 * @return bool
	 */
	public function doesObjectAllow(ICalendar $calendar, $objectUri, $cruds) {
		return ($cruds & $this->findObject($calendar, $objectUri)->getRuds());
	}


	/**
	 * get object's etag
	 * @param ICalendar $calendar
	 * @param string $objectUri
	 * @return string
	 * @throws DoesNotExistException if calendar does not exist
	 * @throws DoesNotExistException if object does not exist
	 */
	public function getObjectsETag(ICalendar $calendar, $objectUri) {
		return $this->findObject($calendar, $objectUri)->getEtag();
	}


	/**
	 * get whether or not a backend can store a calendar's color
	 * @return bool
	 */
	public function canStoreColor() {
		return false;
	}


	/**
	 * get whether or not a backend can store a calendar's supported components
	 * @return bool
	 */
	public function canStoreComponents() {
		return false;
	}


	/**
	 * get whether or not a backend can store a calendar's description
	 * @return bool
	 */
	public function canStoreDescription() {
		return false;
	}


	/**
	 * get whether or not a backend can store a calendar's displayname
	 * @return bool
	 */
	public function canStoreDisplayname() {
		return false;
	}


	/**
	 * get whether or not a backend can store if a calendar is enabled
	 * @return bool
	 */
	public function canStoreEnabled() {
		return false;
	}


	/**
	 * get whether or not a backend can store a calendar's order
	 * @return bool
	 */
	public function canStoreOrder() {
		return false;
	}
}