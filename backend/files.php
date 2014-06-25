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

use OC\Files\FileInfo;

use OCP\AppFramework\IAppContainer;

use OCP\Calendar\Backend;
use OCP\Calendar\BackendException;
use OCP\Calendar\ICalendar;
use OCP\Calendar\ICalendarCollection;
use OCP\Calendar\IObject;
use OCP\Calendar\IObjectCollection;
use OCP\Calendar\ObjectType;
use OCP\Calendar\Permissions;
use OCP\Calendar\DoesNotExistException;
use OCP\Calendar\CorruptDataException;

use OCA\Calendar\Share\Types;
use OCA\Calendar\Db\Calendar;
use OCA\Calendar\Db\CalendarCollection;
use OCA\Calendar\Db\Object;
use OCA\Calendar\Db\ObjectCollection;

class Files extends Backend {

	/**
	 * @var
	 */
	private $fileview;


	/**
	 * @brief constructor
	 * @param IAppContainer $app
	 * @param array $parameters
	 */
	public function __construct(IAppContainer $app, array $parameters){
		parent::__construct($app, 'org.ownCloud.files');
		$this->fileview = $app->getServer()->getUserFolder();
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
		$files = $this->fileview->searchByMime('text/calendar');
		$files = array_slice($files, $offset, $limit);
	}


	/**
	 * @brief returns number of calendar
	 * @param string $userId
	 * @returns integer
	 */
	public function countCalendars($userId) {
		$files = $this->fileview->searchByMime('text/calendar');
		return count($files);
	}


	/**
	 * @brief returns whether or not a calendar exists
	 * @param string $calendarURI
	 * @param string $userId
	 * @returns boolean
	 */
	public function doesCalendarExist($calendarURI, $userId) {
		//TODO: search file with calendarUri is fileId and check if mimetype is text/calendar
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


	/**
	 * @param FileInfo $fileInfo
	 */
	private function createCalendarFromFileInfo(FileInfo $fileInfo) {

	}
}