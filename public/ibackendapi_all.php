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

use DateTime;

interface IFullyQualifiedBackend extends IBackendAPI {

	/**
	 * Create a calendar
	 * @param ICalendar $calendar
	 * @throws CacheOutDatedException if calendar already exists
	 */
	public function createCalendar(ICalendar &$calendar);


	/**
	 * update a calendar
	 * @param ICalendar $calendar
	 * @throws CacheOutDatedException if calendar does not exist
	 * @return ICalendar
	 */
	public function updateCalendar(ICalendar &$calendar);


	/**
	 * delete a calendar
	 * @param string $calendarURI
	 * @param string $userId
	 * @throws CacheOutDatedException
	 */
	public function deleteCalendar($calendarURI, $userId);


	/**
	 * merge two calendars
	 * @param ICalendar $calendar
	 * @param string $oldCalendarURI
	 * @param string $oldUserId
	 * @throws CacheOutDatedException
	 */
	public function mergeCalendar(ICalendar &$calendar, $oldCalendarURI, $oldUserId);


	/**
	 * move a calendar aka rename uri
	 * @param ICalendar $calendar
	 * @param string $oldCalendarURI
	 * @param string $oldUserId
	 * @throws CacheOutDatedException
	 */
	public function moveCalendar(ICalendar &$calendar, $oldCalendarURI, $oldUserId);


	/**
	 * transfer a calendar to another user
	 * @param ICalendar $calendar
	 * @param string $oldCalendarURI
	 * @param string $oldUserId
	 */
	public function transferCalendar(ICalendar &$calendar, $oldCalendarURI, $oldUserId);


	/**
	 * Find objects in period
	 * @param ICalendar $calendar
	 * @param DateTime $start
	 * @param DateTime $end
	 * @param integer $limit
	 * @param integer $offset
	 * @throws CacheOutDatedException
	 * @return IObjectCollection
	 */
	public function findObjectsInPeriod(ICalendar $calendar, DateTime $start, DateTime $end, $limit, $offset);


	/**
	 * Find objects by type
	 * @param ICalendar $calendar
	 * @param integer $type
	 * @param integer $limit
	 * @param integer $offset
	 * @throws CacheOutDatedException
	 * @return IObjectCollection
	 */
	public function findObjectsByType(ICalendar $calendar, $type, $limit, $offset);


	/**
	 * Find objects by type in period
	 * @param ICalendar $calendar
	 * @param integer $type
	 * @param DateTime $start
	 * @param DateTime $end
	 * @param integer $limit
	 * @param integer $offset
	 * @throws CacheOutDatedException
	 * @return IObjectCollection
	 */
	public function findObjectsByTypeInPeriod(ICalendar $calendar, $type, DateTime $start, DateTime $end, $limit, $offset);


	/**
	 * Create an object
	 * @param IObject $object
	 * @throws CacheOutDatedException if calendar already exists
	 * @throws BackendException if object already exists
	 * @return IObject
	 */
	public function createObject(IObject &$object);


	/**
	 * update an object
	 * @param IObject $object
	 * @throws CacheOutDatedException if calendar does not exist
	 * @throws BackendException
	 */

	public function updateObject(IObject &$object);


	/**
	 * move an object to another calendar
	 * @param IObject $object
	 * @param ICalendar $oldCalendar
	 * @throws CacheOutDatedException if calendar does not exist
	 * @return ICalendar
	 */
	public function moveObject(IObject &$object, ICalendar $oldCalendar);


	/**
	 * move an object to another user
	 * @param IObject $object
	 * @param ICalendar $oldCalendar
	 * @throws CacheOutDatedException if calendar does not exist
	 * @return ICalendar
	 */
	public function transferObject(IObject &$object, ICalendar $oldCalendar);


	/**
	 * delete an object
	 * @param IObject $object
	 * @throws CacheOutDatedException if calendar does not exist
	 */
	public function deleteObject(IObject $object);


	/**
	 * @param ICalendar $calendar
	 */
	public function deleteAll(ICalendar $calendar);


	/**
	 * search objects by property
	 * @param ICalendar $calendar
	 * @param array $properties
	 * @param integer $limit
	 * @param integer $offset
	 * @return IObjectCollection
	 * @throws CacheOutDatedException
	 */
	public function searchByProperties(ICalendar $calendar, array $properties=array(), $limit, $offset);
}