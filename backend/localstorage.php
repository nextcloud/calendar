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
/*use OCP\Calendar\IObjectCollection;*/

use OCA\Calendar\Db\DoesNotExistException;
/*use OCA\Calendar\Db\MultipleObjectsReturnedException;
use OCA\Calendar\Db\CorruptDataException;*/

use OCA\Calendar\Db\Calendar;
use OCA\Calendar\Db\CalendarCollection;
/*use OCA\Calendar\Db\Object;*/
use OCA\Calendar\Db\ObjectCollection;
/*use OCA\Calendar\Db\Timezone;
use OCA\Calendar\Db\TimezoneCollection;

use OCA\Calendar\Db\ObjectType;
use OCA\Calendar\Db\Permissions;

use OCA\Calendar\Utility\ObjectUtility;

use DateTime;*/

class LocalStorage extends Backend {

	/**
	 * @brief constructor
	 * @param IAppContainer $app
	 * @param array $parameters
	 */
	public function __construct(IAppContainer $app, array $parameters){
		parent::__construct($app, 'LocalStorage');
	}


	/**
	 * @brief returns information about calendar $calendarURI of the user $userId
	 * @param string $calendarURI
	 * @param string $userId
	 * @returns ICalendar
	 * @throws DoesNotExistException if uri does not exist
	 */
	public function findCalendar($calendarURI, $userId) {
		return new Calendar();
	}


	/**
	 * @brief returns all calendars of the user $userId
	 * @param string $userId
	 * @param integer $limit
	 * @param integer $offset
	 * @returns ICalendarCollection
	 * @throws DoesNotExistException if uri does not exist
	 */
	public function findCalendars($userId, $limit=null, $offset=null) {
		return new CalendarCollection();
	}


	/**
	 * @brief returns number of calendar
	 * @param string $userId
	 * @returns integer
	 */
	public function countCalendars($userId) {
		return 0;
	}


	/**
	 * @brief returns whether or not a calendar exists
	 * @param string $calendarURI
	 * @param string $userId
	 * @returns boolean
	 */
	public function doesCalendarExist($calendarURI, $userId) {
		return false;
	}


	/**
	 * @brief returns information about the object (event/journal/todo) with the uid $objectURI in the calendar $calendarURI of the user $userId 
	 * @param ICalendar $calendar
	 * @param string $objectURI
	 * @returns IObject
	 * @throws DoesNotExistException if calendar does not exist
	 * @throws DoesNotExistException if object does not exist
	 */
	public function findObject(ICalendar &$calendar, $objectURI) {
		throw new DoesNotExistException();
	}


	/**
	 * @brief returns all objects in the calendar $calendarURI of the user $userId
	 * @param ICalendar $calendar
	 * @param integer $limit
	 * @param integer $offset
	 * @returns \OCA\Calendar\Db\ObjectCollection
	 * @throws DoesNotExistException if calendar does not exist
	 */
	public function findObjects(ICalendar &$calendar, $limit, $offset) {
		return new ObjectCollection();
	}
}