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

use \OCA\Calendar\Db\Calendar;

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
	 * @param string $actions
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
	 * @returns boolean
	 * 
	 * This method returns a boolen.
	 * This method is mandatory!
	 */
	public function cacheObjects($calendarURI, $userId);

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
	public function findCalendar($calendarURI, $userId);

	/**
	 * @brief returns all calendars of the user $userId
	 * @param string $userId
	 * @returns \OCA\Calendar\Db\CalendarCollection
	 * @throws DoesNotExistException if uri does not exist
	 * 
	 * This method returns an \OCA\Calendar\Db\CalendarCollection object.
	 * This method is mandatory!
	 */
	public function findCalendars($userId, $limit, $offset);

	/**
	 * @brief returns number of calendar
	 * @param string $userid
	 * @returns integer
	 * 
	 * This method returns an integer
	 * This method is mandatory!
	 */
	public function countCalendars($userId);

	/**
	 * @brief returns whether or not a calendar exists
	 * @param string $calendarURI
	 * @param string $userid
	 * @returns boolean
	 * 
	 * This method returns a boolean
	 * This method is mandatory!
	 */
	public function doesCalendarExist($calendarURI, $userId);

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
	public function getCalendarsCTag($calendarURI, $userId);

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
	public function findObject(Calendar &$calendar, $objectURI);

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
	public function findObjects(Calendar &$calendar, $limit, $offset);

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
	public function countObjects(Calendar $calendar);

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
	public function doesObjectExist(Calendar $calendar, $objectURI);

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
	public function getObjectsETag(Calendar $calendar, $objectURI);

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