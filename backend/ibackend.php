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

use OCP\Calendar\ICalendar;
use OCP\Calendar\ICalendarCollection;
use OCP\Calendar\IObject;
use OCP\Calendar\IObjectCollection;

use OCA\Calendar\Db\DoesNotExistException;
use OCA\Calendar\Db\MultipleObjectsReturnedException;

interface IBackend {

	/**
	 * @brief get integer that represents supported actions 
	 * @returns integer
	 * 
	 * This method returns an integer.
	 * This method is mandatory!
	 */
	public function getSupportedActions();


	/**
	 * @brief Check if backend implements actions
	 * @param integer $actions
	 * @returns integer
	 * 
	 * This method returns an integer.
	 * If the action is supported, it returns an integer that can be compared with \OC\Calendar\Backend\CREATE_CALENDAR, etc...
	 * If the action is not supported, it returns -501
	 * This method is mandatory!
	 */
	public function implementsActions($actions);


	/**
	 * @brief returns whether or not a backend can be enabled
	 * @returns boolean
	 * 
	 * This method returns a boolean.
	 * This method is mandatory!
	 */
	public function canBeEnabled();


	/**
	 * @brief returns whether or not calendar objects should be cached
	 * @param string $calendarURI
	 * @param string $userId
	 * @returns bool
	 * 
	 * This method returns a bool.
	 * This method is mandatory!
	 */
	public function cacheObjects($calendarURI, $userId);


	/**
	 * @brief returns list of available uri prefixes
	 * @returns array
	 */
	public function getAvailablePrefixes();


	/**
	 * @brief returns list of subscription types supported by backend
	 * @returns array
	 */
	public function getAvailableSubscriptionTypes();


	/**
	 * @brief returns information about calendar $calendarURI of the user $userId
	 * @param string $calendarURI
	 * @param string $userId
	 * @returns ICalendar
	 * @throws DoesNotExistException if uri does not exist
	 * @throws MultipleObjectsReturnedException
	 * 
	 * This method returns an ICalendar
	 * This method is mandatory!
	 */
	public function findCalendar($calendarURI, $userId);


	/**
	 * @brief returns all calendars of the user $userId
	 * @param string $userId
	 * @param integer $limit
	 * @param integer $offset
	 * @returns ICalendarCollection
	 * @throws DoesNotExistException if uri does not exist
	 * 
	 * This method returns an ICalendarCollection
	 * This method is mandatory!
	 */
	public function findCalendars($userId, $limit, $offset);


	/**
	 * @param string $userId
	 * @param integer $limit
	 * @param integer $offset
	 * @return array
	 */
	public function getCalendarIdentifiers($userId, $limit, $offset);


	/**
	 * @brief returns number of calendar
	 * @param string $userId
	 * @returns integer
	 * 
	 * This method returns an integer
	 * This method is mandatory!
	 */
	public function countCalendars($userId);


	/**
	 * @brief returns whether or not a calendar exists
	 * @param string $calendarURI
	 * @param string $userId
	 * @returns boolean
	 * 
	 * This method returns a boolean
	 * This method is mandatory!
	 */
	public function doesCalendarExist($calendarURI, $userId);


	/**
	 * @brief returns ctag of a calendar
	 * @param string $calendarURI
	 * @param string $userId
	 * @returns integer
	 * @throws DoesNotExistException if calendar does not exist
	 * 
	 * This method returns a integer
	 * This method is mandatory!
	 */
	public function getCalendarsCTag($calendarURI, $userId);


	/**
	 * @brief find object
	 * @param ICalendar $calendar
	 * @param string $objectURI
	 * @returns IObject
	 * @throws DoesNotExistException if calendar does not exist
	 * @throws DoesNotExistException if object does not exist
	 * @throws MultipleObjectsReturnedException
	 *
	 * This method returns an \OCA\Calendar\Db\Object object.
	 * This method is mandatory!
	 */
	public function findObject(ICalendar &$calendar, $objectURI);


	/**
	 * @brief returns all objects in the calendar $calendarURI of the user $userId
	 * @param ICalendar &$calendar
	 * @param integer $limit
	 * @param integer $offset
	 * @returns IObjectCollection
	 * @throws DoesNotExistException if calendar does not exist
	 * 
	 * This method returns an \OCA\Calendar\Db\ObjectCollection object.
	 * This method is mandatory!
	 */
	public function findObjects(ICalendar &$calendar, $limit, $offset);


	/**
	 * @brief get list of objectURIs
	 * @param ICalendar $calendar
	 * @param integer $limit
	 * @param integer $offset
	 * @return array
	 */
	public function getObjectIdentifiers(ICalendar &$calendar, $limit, $offset);


	/**
	 * @brief returns number of objects in calendar
	 * @param ICalendar $calendar
	 * @returns integer
	 * @throws DoesNotExistException if calendar does not exist
	 * 
	 * This method returns an integer
	 * This method is mandatory!
	 */
	public function countObjects(ICalendar $calendar);


	/**
	 * @brief returns whether or not an object exists
	 * @param ICalendar $calendar
	 * @param string $objectURI
	 * @returns boolean
	 * 
	 * This method returns a boolean
	 * This method is mandatory!
	 */
	public function doesObjectExist(ICalendar $calendar, $objectURI);


	/**
	 * check if object allows a certain action
	 * @param ICalendar $calendar
	 * @param string $objectURI
	 * @param integer $cruds
	 * @return boolean
	 */
	public function doesObjectAllow(ICalendar $calendar, $objectURI, $cruds);


	/**
	 * @brief returns etag of an object
	 * @param ICalendar $calendar
	 * @param string $objectURI
	 * @returns string
	 * @throws DoesNotExistException if calendar does not exist
	 * @throws DoesNotExistException if object does not exist
	 * 
	 * This method returns a string
	 * This method is mandatory!
	 */
	public function getObjectsETag(ICalendar $calendar, $objectURI);


	/**
	 * @brief returns whether or not a backend can store a calendar's color
	 * @returns boolean
	 * 
	 * This method returns a boolean
	 * This method is mandatory!
	 */
	public function canStoreColor();


	/**
	 * @brief returns whether or not a backend can store a calendar's supported components
	 * @returns boolean
	 * 
	 * This method returns a boolean
	 * This method is mandatory!
	 */
	public function canStoreComponents();


	/**
	 * @brief returns whether or not a backend can store a calendar's description
	 * @return boolean
	 */
	public function canStoreDescription();


	/**
	 * @brief returns whether or not a backend can store a calendar's displayname
	 * @returns boolean
	 * 
	 * This method returns a boolean
	 * This method is mandatory!
	 */
	public function canStoreDisplayname();


	/**
	 * @brief returns whether or not a backend can store if a calendar is enabled
	 * @returns boolean
	 * 
	 * This method returns a boolean
	 * This method is mandatory!
	 */
	public function canStoreEnabled();


	/**
	 * @brief returns whether or not a backend can store a calendar's order
	 * @returns boolean
	 * 
	 * This method returns a boolean
	 * This method is mandatory!
	 */
	public function canStoreOrder();
}