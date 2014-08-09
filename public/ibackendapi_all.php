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
	 * Update a calendar
	 * @param ICalendar $calendar
	 * @throws CacheOutDatedException if calendar does not exist
	 * @return ICalendar
	 */
	public function updateCalendar(ICalendar &$calendar);


	/**
	 * Delete a calendar
	 * @param string $calendarURI
	 * @param string $userId
	 * @throws CacheOutDatedException
	 */
	public function deleteCalendar($calendarURI, $userId);


	/**
	 * move a calendar aka rename uri
	 * @param ICalendar $calendar
	 * @param string $oldCalendarURI
	 * @param string $oldUserId
	 * @throws CacheOutDatedException
	 */
	public function moveCalendar(ICalendar &$calendar, $oldCalendarURI,
								 $oldUserId);


	/**
	 * Find objects in period
	 * @param ICalendar $calendar
	 * @param DateTime $start
	 * @param DateTime $end
	 * @param integer $type
	 * @param integer $limit
	 * @param integer $offset
	 * @throws CacheOutDatedException
	 * @return IObjectCollection
	 */
	public function findObjectsInPeriod(ICalendar $calendar, DateTime $start,
										DateTime $end, $type=ObjectType::ALL,
										$limit, $offset);


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
	 * delete an object
	 * @param IObject $object
	 * @throws CacheOutDatedException if calendar does not exist
	 */
	public function deleteObject(IObject $object);


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