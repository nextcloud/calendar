<?php
/**
 * ownCloud - Calendar App
 *
 * @author Georg Ehrke
 * @copyright 2014 Georg Ehrke <oc.list@georgehrke.com>
 * @author Bart Visscher
 * @copyright 2014 Bart Visscher <bartv@thisnet.nl>
 * @author Jakob Sack
 * @copyright 2014 Jakob Sack <mail@jakobsack.de>
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

use OCP\Calendar\ObjectType;
use OCP\Calendar\Permissions;

use OCP\Calendar\BackendException;
use OCP\Calendar\CacheOutDatedException;
use OCP\Calendar\CorruptDataException;
use OCP\Calendar\DoesNotExistException;
use OCP\Calendar\MultipleObjectsReturnedException;

use OCA\Calendar\Db\Calendar;
use OCA\Calendar\Db\CalendarCollection;
use OCA\Calendar\Db\Object;
use OCA\Calendar\Db\ObjectCollection;
use OCA\Calendar\Db\Timezone;
use OCA\Calendar\Db\TimezoneCollection;

use \OCA\Calendar\Utility\ObjectUtility;

use \DateTime;

class Local extends Backend {

	/**
	 * name of calendar table
	 * @var string
	 */
	private $calTableName;


	/**
	 * name of object table
	 * @var string
	 */
	private $objTableName;


	/**
	 * timezoneMapper object
	 * @var \OCA\Calendar\Db\TimezoneMapper
	 */
	private $timezoneMapper;


	/**
	 * maps values from \OCA\Calendar\Db\ObjectType to strings from db
	 * @var array
	 */
	private static $typeMapper = array(
		ObjectType::EVENT	=> 'VEVENT',
		ObjectType::JOURNAL => 'VJOURNAL',
		ObjectType::TODO	=> 'VTODO',
	);


	/**
	 * constructor
	 * @param IAppContainer $app
	 * @param array $parameters
	 */
	public function __construct(IAppContainer $app, array $parameters){

		$this->calTableName = (array_key_exists('calTableName', $parameters) ? 
									$parameters['calTableName'] : 
									'*PREFIX*clndr_calendars');
		$this->objTableName = (array_key_exists('objTableName', $parameters) ? 
									$parameters['objTableName'] : 
									'*PREFIX*clndr_objects');

		$columns  = '`uri`, `calendarData`';
		$this->columnsToQuery = $columns;

		parent::__construct($app, 'local');
	}


	/**
	 * Shall calendars objects be cached?
	 * @param string $calendarURI
	 * @param string $userId
	 * @return boolean
	 */
	public function cacheObjects($calendarURI, $userId) {
		return false;
	}


	/**
	 * get translated string for createOn dialog
	 * @return string
	 */
	public function getAvailablePrefixes() {
		return array(
			array(
				'name' => 'this ownCloud',
				'l10n' => \OC::$server->getL10N('calendar')->t('this ownCloud'),
				'prefix' => '',
			),
		);
	}


	/**
	 * Find a calendar
	 * @param string $calendarURI
	 * @param string $userId
	 * @throws CacheOutDatedException if calendar does not exist
	 * @throws MultipleObjectsReturnedException if more than one result found
	 * @return Calendar
	 */
	public function findCalendar($calendarURI, $userId) {
		$table = $this->getCalendarTableName();

		$sql  = 'SELECT * FROM `' . $table . '` WHERE `uri` = ? AND `userid` = ?';
		$result = \OCP\DB::prepare($sql)->execute(array(
			$calendarURI,
			$userId
		));
		$row = $result->fetchRow();

		if ($row === false || $row === null){
			$msg  = 'Backend\Local::findCalendar(): Internal Error: ';
			$msg .= 'No matching entry found';
			throw new CacheOutDatedException($msg);
		}

		$row2 = $result->fetchRow();
		if (($row2 === false || $row2 === null ) === false) {
			$msg  = 'Backend\Local::findCalendar(): Internal Error: ';
			$msg .= 'More than one result';
			throw new MultipleObjectsReturnedException($msg);
		}

		$calendar = $this->createCalendarFromRow($row);
		return $calendar;
	}


	/**
	 * Find all calendars
	 * @param string $userId
	 * @param integer/null $limit
	 * @param integer/null $offset
	 * @return CalendarCollection
	 */
	public function findCalendars($userId, $limit, $offset) {
		$table = $this->getCalendarTableName();

		$sql  = 'SELECT * FROM `' . $table . '` ';
		$sql .= 'WHERE `userid` = ? ORDER BY `calendarorder`';
		$result = \OCP\DB::prepare($sql, $limit, $offset)->execute(array(
			$userId
		));

		$calendarCollection = new CalendarCollection();
		while($row = $result->fetchRow()){
			try{
				$calendar = $this->createCalendarFromRow($row);
			} catch(CorruptDataException $ex) {
				
				//log error message
				//if this happened, there is an corrupt entry
				continue;
			}

			$calendarCollection->add($calendar);
		}

		return $calendarCollection;
	}


	/**
	 * counts number of calendars
	 * @param string $userId
	 * @return integer
	 */
	public function countCalendars($userId) {
		$caltbl = $this->getCalendarTableName();

		$sql  = 'SELECT COUNT(*) FROM `' . $caltbl . '` WHERE `userid` = ?';
		$result	= \OCP\DB::prepare($sql)->execute(array(
			$userId
		));
		$count = $result->fetchOne();

		if (gettype($count) !== 'integer') {
			$count = intval($count);
		}

		return $count;
	}


	/**
	 * check if a calendar exists
	 * @param string $calendarURI
	 * @param string $userId
	 * @return boolean
	 */
	public function doesCalendarExist($calendarURI, $userId) {
		$caltbl = $this->calTableName;

		$sql  = 'SELECT COUNT(*) FROM `' . $caltbl . '` ';
		$sql .= 'WHERE `uri` = ? AND `userid` = ?';
		$result	= \OCP\DB::prepare($sql)->execute(array(
			$calendarURI,
			$userId
		));
		$count = $result->fetchOne();

		if (gettype($count) !== 'integer') {
			$count = intval($count);
		}

		if ($count === 0) {
			return false;
		} else {
			return true;
		}
	}


	/**
	 * get calendar id, false if calendar does not exist
	 * @param string $calendarURI
	 * @param string $userId
	 * @return mixed (boolean|integer)
	 */
	private function getCalendarId($calendarURI, $userId) {
		$caltbl = $this->calTableName;

		$sql  = 'SELECT `id` FROM `' . $caltbl . '` ';
		$sql .= 'WHERE `uri` = ? AND `userid` = ?';
		$result	= \OCP\DB::prepare($sql)->execute(array(
			$calendarURI,
			$userId
		));
		$id = $result->fetchOne();

		if ($id === false || $id === null){
			return false;
		}

		if (gettype($id) !== 'integer') {
			$id = intval($id);
		}

		return $id;
	}


	/**
	 * get ctag of a calendar
	 * @param string $calendarURI
	 * @param string $userId
	 * @return integer
	 */
	public function getCalendarsCTag($calendarURI, $userId) {
		$caltbl = $this->calTableName;

		$sql  = 'SELECT `ctag` FROM `' . $caltbl . '` ';
		$sql .= 'WHERE `uri` = ? AND `userid` = ?';
		$result	= \OCP\DB::prepare($sql)->execute(array(
			$calendarURI,
			$userId
		));
		$ctag = $result->fetchOne();

		if (gettype($ctag) !== 'integer') {
			$ctag = intval($ctag);
		}

		return $ctag;
	}


	/**
	 * Create a calendar
	 * @param ICalendar $calendar
	 * @throws CacheOutDatedException if calendar already exists
	 */
	public function createCalendar(ICalendar &$calendar) {
		$calendarURI = $calendar->getUri();
		$userId = $calendar->getUserId();

		if ($this->doesCalendarExist($calendarURI, $userId)) {
			$msg  = 'Backend\Local::createCalendar(): Internal Error: ';
			$msg .= 'Calendar with uri and userid combination already exists!';
			throw new CacheOutDatedException($msg);
		}

		$caltbl = $this->calTableName;

		$sql  = 'INSERT INTO `' . $caltbl . '` ';
		$sql .= '(`userid`, `displayname`, `uri`, `active`, `ctag`, `calendarorder`, ';
		$sql .= '`calendarcolor`, `timezone`, `components`) ';
		$sql .= 'VALUES(?,?,?,?,?,?,?,?,?)';
		$result = \OCP\DB::prepare($sql)->execute(array(
			$calendar->getUserId(),
			$calendar->getDisplayname(),
			$calendar->getUri(),
			$calendar->getEnabled(),
			$calendar->getCtag(),
			$calendar->getOrder(),
			$calendar->getColor(),
			$calendar->getTimezone(),
			$this->getTypes($calendar->getComponents()),
		));
	}


	/**
	 * update a calendar
	 * @param Calendar $calendar
	 * @throws CacheOutDatedException if calendar does not exist
	 * @return Calendar
	 */
	public function updateCalendar(Calendar &$calendar) {
		$calendarURI = $calendar->getUri();
		$userId = $calendar->getUserId();

		$calendarId = $this->getCalendarId($calendarURI, $userId);
		if (!$calendarId) {
			$msg  = 'Backend\Local::updateCalendar(): Internal Error: ';
			$msg .= 'Calendar with uri and userid combination not found!';
			throw new CacheOutDatedException($msg);
		}

		$caltbl = $this->calTableName;

		$sql  = 'UPDATE `' . $caltbl . '` SET ';
		$sql .= '`userid` = ?, `displayname` = ?, `uri` = ?, `active` = ?, ';
		$sql .= '`ctag` = ?, `calendarorder` = ?, `calendarcolor` = ?, ';
		$sql .= '`timezone` = ?, `components` = ? WHERE `id` = ?';
		$result = \OCP\DB::prepare($sql)->execute(array(
			$calendar->getUserId(),
			$calendar->getDisplayname(),
			$calendar->getUri(),
			$calendar->getEnabled(),
			$calendar->getCtag(),
			$calendar->getOrder(),
			$calendar->getColor(),
			$calendar->getTimezone(),
			$this->getTypes($calendar->getComponents()),
			$calendarId
		));
	}


	/**
	 * delete a calendar
	 * @param string $calendarURI
	 * @param string $userId
	 * @throws CacheOutDatedException
	 */
	public function deleteCalendar($calendarURI, $userId) {
		$caltbl = $this->calTableName;
		$objtbl = $this->objTableName;

		$calendarId = $this->getCalendarId($calendarURI, $userId);
		if (!$calendarId) {
			$msg  = 'Backend\Local::findObjects(): Internal Error: ';
			$msg .= 'Calendar not found!';
			throw new CacheOutDatedException($msg);
		}

		$sql1 = 'DELETE FROM `' . $objtbl . '` WHERE `calendarid` = ?';
		$result1 = \OCP\DB::prepare($sql1)->execute(array(
			$calendarId
		));

		$sql2  = 'DELETE FROM `' . $caltbl . '` WHERE `id` = ?';
		$result2 = \OCP\DB::prepare($sql2)->execute(array(
			$calendarId
		));
	}


	/**
	 * merge two calendars
	 * @param Calendar $calendar
	 * @param string $oldCalendarURI
	 * @param string $oldUserId
	 * @throws CacheOutDatedException
	 */
	public function mergeCalendar(Calendar &$calendar, $oldCalendarURI, $oldUserId) {
		$newCalendarURI = $calendar->getUri();
		$newUserId = $calendar->getUserId();

		$newCalendarId = $this->getCalendarId($newCalendarURI, $newUserId);
		if (!$newCalendarId) {
			$msg  = 'Backend\Local::mergeCalendar(): Internal Error: ';
			$msg .= 'New Calendar not found!';
			throw new CacheOutDatedException($msg);
		}

		$oldCalendarId = $this->getCalendarId($oldCalendarURI, $oldUserId);
		if (!$oldCalendarId) {
			$msg  = 'Backend\Local::mergeCalendar(): Internal Error: ';
			$msg .= 'Old Calendar not found!';
			throw new CacheOutDatedException($msg);
		}

		$caltbl = $this->calTableName;
		$objtbl = $this->objTableName;

		$sql1 = 'UPDATE `' . $objtbl . '` SET `calendarid` = ? WHERE `calendarId` = ?';
		$result = \OCP\DB::prepare($sql1)->execute(array(
			$newCalendarId,
			$oldCalendarId
		));

		$sql2  = 'DELETE FROM `' . $caltbl . '` WHERE `id` = ?';
		$result2 = \OCP\DB::prepare($sql2)->execute(array(
			$oldCalendarId
		));

		$sql3 = 'UPDATE `' . $caltbl . '` set `ctag` = `ctag` + 1 WHERE `id` = ?';
		$result3 = \OCP\DB::prepare($sql3)->execute(array(
			$newCalendarId
		));
	}


	/**
	 * move a calendar aka rename uri
	 * @param Calendar $calendar
	 * @param string $oldCalendarURI
	 * @param string $oldUserId
	 * @throws CacheOutDatedException
	 */
	public function moveCalendar(Calendar &$calendar, $oldCalendarURI, $oldUserId) {
		$newCalendarURI = $calendar->getUri();
		$newUserId = $calendar->getUserId();

		$calendarId = $this->getCalendarId($newCalendarURI, $newUserId);
		if (!$calendarId) {
			$msg  = 'Backend\Local::moveCalendar(): Internal Error: ';
			$msg .= 'Calendar not found!';
			throw new CacheOutDatedException($msg);
		}

		$caltbl = $this->calTableName;

		$sql  = 'UPDATE `' . $caltbl . '` SET `uri` = ? WHERE `id` = ?';
		$result = \OCP\DB::prepare($sql)->execute(array(
			$newCalendarURI,
			$calendarId
		));
	}


	/**
	 * transfer a calendar to another user
	 * @param Calendar $calendar
	 * @param string $oldCalendarURI
	 * @param string $oldUserId
	 */
	/*public function transferCalendar(Calendar &$calendar, $oldCalendarURI, $oldUserId) {}*/


	/**
	 * find object
	 * @param Calendar $calendar
	 * @param string $objectURI
	 * @throws CacheOutDatedException if calendar does not exist
	 * @throws DoesNotExistException
	 * @throws MultipleObjectsReturnedException if more than one result found
	 * @return Object
	 */
	public function findObject(ICalendar &$calendar, $objectURI) {
		$calendarURI = $calendar->getUri();
		$userId = $calendar->getUserId();

		$calendarId = $this->getCalendarId($calendarURI, $userId);
		if (!$calendarId) {
			$msg  = 'Backend\Local::findObject(): Internal Error: ';
			$msg .= 'Calendar not found!';
			throw new CacheOutDatedException($msg);
		}

		$objtbl = $this->objTableName;

		$sql = 'SELECT * FROM `' . $objtbl . '` WHERE `calendarid` = ? AND `uri` =? ';
		$result = \OCP\DB::prepare($sql)->execute(array(
			$calendarId,
			$objectURI
		));
		$row = $result->fetchRow();

		if ($row === false || $row === null){
			$msg  = 'Backend\Local::findObject(): Internal Error: ';
			$msg .= 'No matching entry found';
			throw new DoesNotExistException($msg);
		}

		$row2 = $result->fetchRow();
		if (($row2 === false || $row2 === null ) === false) {
			$msg  = 'Backend\Local::findObject(): Internal Error: ';
			$msg .= 'More than one result';
			throw new MultipleObjectsReturnedException($msg);
		}

		$object = $this->createObjectFromRow($row, $calendar);
		return $object;
	}


	/**
	 * Find objecs
	 * @param Calendar $calendar
	 * @param integer $limit
	 * @param integer $offset
	 * @throws CacheOutDatedException
	 * @return ObjectCollection
	 */
	public function findObjects(ICalendar &$calendar, $limit, $offset) {
		$calendarURI = $calendar->getUri();
		$userId = $calendar->getUserId();

		$calendarId = $this->getCalendarId($calendarURI, $userId);
		if (!$calendarId) {
			$msg  = 'Backend\Local::findObjects(): Internal Error: ';
			$msg .= 'Calendar not found!';
			throw new CacheOutDatedException($msg);
		}

		$objtbl = $this->objTableName;

		$sql = 'SELECT * FROM `' . $objtbl . '` WHERE `calendarid` = ?';
		$result = \OCP\DB::prepare($sql, $limit, $offset)->execute(array(
			$calendarId
		));

		$objectCollection = new ObjectCollection();
		while($row = $result->fetchRow()){
			try{
				$object = $this->createObjectFromRow($row, $calendar);
			} catch(CorruptDataException $ex) {
				//log error message
				//if this happened, there is an corrupt entry
				continue;
			}

			$objectCollection->add($object);
		}

		return $objectCollection;
	}


	/**
	 * Find objecs in period
	 * @param Calendar $calendar
	 * @param DateTime $start
	 * @param DateTime $end
	 * @param integer $limit
	 * @param integer $offset
	 * @throws CacheOutDatedException
	 * @return ObjectCollection
	 */
	public function findObjectsInPeriod(ICalendar $calendar, DateTime $start, DateTime $end, $limit, $offset){
		$calendarURI = $calendar->getUri();
		$userId = $calendar->getUserId();

		$calendarId = $this->getCalendarId($calendarURI, $userId);
		if (!$calendarId) {
			$msg  = 'Backend\Local::findObjects(): Internal Error: ';
			$msg .= 'Calendar not found!';
			throw new CacheOutDatedException($msg);
		}

		$objtbl = $this->objTableName;

		$sql  = 'SELECT * FROM `' . $objtbl . '` WHERE `calendarid` = ? AND ';
        $sql .= '((`startdate` >= ? AND `enddate` <= ? AND `repeating` = 0)';
        $sql .= ' OR (`enddate` >= ? AND `startdate` <= ? AND `repeating` = 0)';
        $sql .= ' OR (`startdate` <= ? AND `repeating` = 1)) ORDER BY `repeating`';

		$utcStart = $this->getUTCforMDB($start);
		$utcEnd = $this->getUTCforMDB($end);

		$result	= \OCP\DB::prepare($sql, $limit, $offset)->execute(array(
			$calendarId,
			$utcStart,
			$utcEnd,
			$utcStart,
			$utcEnd,
			$utcEnd
		));

		$objectCollection = new ObjectCollection();
		while($row = $result->fetchRow()){
			try{
				$object = $this->createObjectFromRow($row, $calendar);
			} catch(CorruptDataException $ex) {
				//log error message
				//if this happened, there is an corrupt entry
				continue;
			}
			$objectCollection->add($object);
		}

		return $objectCollection;
	}


	/**
	 * Find objecs by type
	 * @param Calendar $calendar
	 * @param integer $type
	 * @param integer $limit
	 * @param integer $offset
	 * @throws CacheOutDatedException
	 * @return ObjectCollection
	 */
	public function findObjectsByType(Calendar $calendar, $type, $limit, $offset) {
		$calendarURI = $calendar->getUri();
		$userId = $calendar->getUserId();

		$calendarId = $this->getCalendarId($calendarURI, $userId);
		if (!$calendarId) {
			$msg  = 'Backend\Local::findObjects(): Internal Error: ';
			$msg .= 'Calendar not found!';
			throw new CacheOutDatedException($msg);
		}

		$objtbl = $this->objTableName;

		$sql = 'SELECT * FROM `' . $objtbl . '` WHERE `calendarid` = ? AND `objecttype` = ?';
		$result = \OCP\DB::prepare($sql, $limit, $offset)->execute(array(
			$calendarId,
			$this->getType($type)
		));

		$objectCollection = new ObjectCollection();
		while($row = $result->fetchRow()){
			try{
				$object = $this->createObjectFromRow($row, $calendar);
			} catch(CorruptDataException $ex) {
				//log error message
				//if this happened, there is an corrupt entry
				continue;
			}
			$objectCollection->add($object);
		}

		return $objectCollection;
	}


	/**
	 * Find objecs by type in period
	 * @param Calendar $calendar
	 * @param integer $type
	 * @param DateTime $start
	 * @param DateTime $end
	 * @param integer $limit
	 * @param integer $offset
	 * @throws CacheOutDatedException
	 * @return ObjectCollection
	 */
	public function findObjectsByTypeInPeriod(Calendar $calendar, $type, DateTime $start, DateTime $end, $limit, $offset) {
		$calendarURI = $calendar->getUri();
		$userId = $calendar->getUserId();

		$calendarId = $this->getCalendarId($calendarURI, $userId);
		if (!$calendarId) {
			$msg  = 'Backend\Local::findObjects(): Internal Error: ';
			$msg .= 'Calendar not found!';
			throw new CacheOutDatedException($msg);
		}

		$objtbl = $this->objTableName;

		$sql  = 'SELECT * FROM `' . $objtbl . '` WHERE `calendarid` = ? AND ';
        $sql .= '((`startdate` >= ? AND `enddate` <= ? AND `repeating` = 0)';
        $sql .= ' OR (`enddate` >= ? AND `startdate` <= ? AND `repeating` = 0)';
        $sql .= ' OR (`startdate` <= ? AND `repeating` = 1)) AND `objecttype` = ? ';
        $sql .= 'ORDER BY `repeating`';

		$utcStart = $this->getUTCforMDB($start);
		$utcEnd = $this->getUTCforMDB($end);

		$result	= \OCP\DB::prepare($sql, $limit, $offset)->execute(array(
			$calendarId,
			$utcStart,
			$utcEnd,
			$utcStart,
			$utcEnd,
			$utcEnd,
			$this->getType($type)
		));

		$objectCollection = new ObjectCollection();
		while($row = $result->fetchRow()){
			try{
				$object = $this->createObjectFromRow($row, $calendar);
			} catch(CorruptDataException $ex) {
				//log error message
				//if this happened, there is an corrupt entry
				continue;
			}
			$objectCollection->add($object);
		}

		return $objectCollection;
	}


	/**
	 * count objects
	 * @param Calendar $calendar
	 * @return integer
	 */
	public function countObjects(ICalendar $calendar) {
		$calendarURI = $calendar->getUri();
		$userId = $calendar->getUserId();

		$objtbl = $this->objTableName;
		$caltbl = $this->calTableName;

		$sql  = 'SELECT objtbl.* FROM `' . $objtbl . '` AS objtbl, ';
		$sql .= '`' . $caltbl . '` AS caltbl ';
		$sql .= 'WHERE objtbl.`calendarid` = caltbl.`id` ';
		$sql .= 'AND caltbl.`uri` = ? AND caltbl.`userid` = ?';
		$result	= \OCP\DB::prepare($sql)->execute(array(
			$calendarURI,
			$userId
		));
		$count = $result->fetchOne();

		if (gettype($count) !== 'integer') {
			$count = intval($count);
		}

		return $count;
	}


	/**
	 * check if object exists
	 * @param Calendar $calendar
	 * @param string $objectURI
	 * @return boolean
	 */
	public function doesObjectExist(ICalendar $calendar, $objectURI) {
		$calendarURI = $calendar->getUri();
		$userId = $calendar->getUserId();

		$objtbl = $this->objTableName;
		$caltbl = $this->calTableName;

		$sql  = 'SELECT COUNT(objtbl.`id`) FROM `' . $objtbl . '` AS objtbl, ';
		$sql .= '`' . $caltbl . '` AS caltbl ';
		$sql .= 'WHERE objtbl.`calendarid` = caltbl.`id` ';
		$sql .= 'AND caltbl.`uri` = ? AND caltbl.`userid` = ? ';
		$sql .= 'AND objtbl.`uri` = ?';
		$result	= \OCP\DB::prepare($sql)->execute(array(
			$calendarURI,
			$userId,
			$objectURI
		));
		$count = $result->fetchOne();

		if (gettype($count) !== 'integer') {
			$count = intval($count);
		}

		if ($count === 0) {
			return false;
		} else {
			return true;
		}
	}


	/**
	 * check if object allows a certain action
	 * @param integer $cruds
	 * @param Calendar $calendar
	 * @param string $objectURI
	 * @return boolean
	 */
	public function doesObjectAllow(ICalendar $calendar, $objectURI, $cruds) {
		return ($cruds & Permissions::ALL);
	}


	/**
	 * get etag of an object
	 * @param Calendar $calendar
	 * @param string $objectURI
	 * @return integer
	 */
	public function getObjectsETag(ICalendar $calendar, $objectURI) {
		$object = $this->findObject($calendar, $objectURI);
		return $object->generateEtag()->getEtag();
	}


	/**
	 * Create an object
	 * @param Object $object
	 * @throws CacheOutDatedException if calendar already exists
	 * @throws BackendException if object already exists
	 * @return Object
	 */
	public function createObject(Object &$object) {
		$calendarURI = $object->getCalendar()->getUri();
		$userId = $object->getCalendar()->getUserId();

		$calendarId = $this->getCalendarId($calendarURI, $userId);
		if (!$calendarId) {
			$msg  = 'Backend\Local::createObject(): Internal Error: ';
			$msg .= 'Calendar not found!';
			throw new CacheOutDatedException($msg);
		}
		if ($this->doesObjectExist($object->getCalendar(), $object->getObjectURI())) {
			$msg  = 'Backend\Local::createObject(): User Error: ';
			$msg .= 'Object already exists';
			throw new BackendException($msg);
		}

		$objtbl = $this->objTableName;

		$sql  = 'INSERT INTO `' . $objtbl . '` ';
		$sql .= '(`calendarid`,`objecttype`,`startdate`,`enddate`,';
		$sql .= '`repeating`,`summary`,`calendardata`,`uri`,`lastmodified`) ';
		$sql .= 'VALUES(?, ?, ?, ?, ?, ?, ?, ?, ?)';
		$result = \OCP\DB::prepare($sql)->execute(array(
			$calendarId,
			$this->getType($object->getType()),
			$this->getUTCforMDB($object->getStartDate()->getDateTime()),
			$this->getUTCforMDB($object->getEndDate()->getDateTime()),
			$object->getRepeating(),
			$object->getSummary(),
			$object->getCalendarData(),
			$object->getObjectURI(),
			$this->getUTCforMDB($object->getLastModified()),
		));

		return $object;
	}


	/**
	 * update an object
	 * @param Object $object
	 * @throws CacheOutDatedException if calendar does not exist
	 * @throws BackendException
	 * @return Calendar
	 */

	public function updateObject(Object &$object) {
		$calendarURI = $object->getCalendar()->getUri();
		$userId = $object->getCalendar()->getUserId();

		$calendarId = $this->getCalendarId($calendarURI, $userId);
		if (!$calendarId) {
			$msg  = 'Backend\Local::updateObject(): Internal Error: ';
			$msg .= 'Calendar not found!';
			throw new CacheOutDatedException($msg);
		}
		if (!$this->doesObjectExist($object->getCalendar(), $object->getObjectURI())) {
			$msg  = 'Backend\Local::updateObject(): User Error: ';
			$msg .= 'Object does not exists';
			throw new BackendException($msg);
		}

		$objtbl = $this->objTableName;

		$sql  = 'UPDATE `' . $objtbl . '`  SET `objecttype` = ?, `startdate` = ?, ';
		$sql .= '`enddate` = ?, `repeating` = ?, `summary` = ?, `calendardata` = ?, ';
		$sql .= '`lastmodified` = ? WHERE `uri` = ? and `calendarid` = ?';
		$result = \OCP\DB::prepare($sql)->execute(array(
			$this->getType($object->getType()),
			$this->getUTCforMDB($object->getStartDate()->getDateTime()),
			$this->getUTCforMDB($object->getEndDate()->getDateTime()),
			$object->getRepeating(),
			$object->getSummary(),
			$object->getCalendarData(),
			$this->getUTCforMDB($object->getLastModified()),
			$object->getObjectURI(),
			$calendarId,
		));
	}


	/**
	 * move an object to another calendar
	 * @param Object $object
	 * @param Calendar $oldCalendar
	 * @throws CacheOutDatedException if calendar does not exist
	 * @return Calendar
	 */
	public function moveObject(Object &$object, ICalendar $oldCalendar) {
		$newCalendarURI = $object->getCalendar()->getUri();
		$oldCalendarURI = $oldCalendar->getUri();

		$newCalendarId = $this->getCalendarId($newCalendarURI, $userId);
		if (!$calendarId) {
			$msg  = 'Backend\Local::moveObject(): Internal Error: ';
			$msg .= 'Calendar not found!';
			throw new CacheOutDatedException($msg);
		}

		$oldCalendarId = $this->getCalendarId($oldCalendarURI, $userId);
		if (!$calendarId) {
			$msg  = 'Backend\Local::moveObject(): Internal Error: ';
			$msg .= 'Calendar not found!';
			throw new CacheOutDatedException($msg);
		}

		$sql  = 'UPDATE `' . $objtbl . '` SET `calendarid` = ? WHERE `calendarid` = ?';
		$result = \OCP\DB::prepare($sql)->execute(array(
			$newCalendarId,
			$oldCalendarId
		));
	}


	/**
	 * move an object to another user
	 * @param Object $object
	 * @param Calendar $oldCalendar
	 * @throws CacheOutDatedException if calendar does not exist
	 * @return Calendar
	 */
	public function transferObject(IObject &$object, ICalendar $oldCalendar) {
		$newCalendarURI = $object->getCalendar()->getUri();
		$oldCalendarURI = $oldCalendar->getUri();

		$newUserId = $object->getCalendar()->getUserId();
		$oldUserId = $oldCalendar->getUserId();
	}


	/**
	 * delete an object
	 * @param Object $object
	 * @param Calendar $oldCalendar
	 * @throws CacheOutDatedException if calendar does not exist
	 */
	public function deleteObject(IObject $object){
		$calendarURI = $object->getCalendar()->getUri();
		$objectURI = $object->getObjectURI();
		$userId = $object->getCalendar()->getUserId();

		$calendarId = $this->getCalendarId($calendarURI, $userId);
		if (!$calendarId) {
			$msg  = 'Backend\Local::deleteObject(): Internal Error: ';
			$msg .= 'Calendar not found!';
			throw new CacheOutDatedException($msg);
		}

		$objtbl = $this->objTableName;

		$sql  = 'DELETE FROM `' . $objtbl . '` WHERE `uri` = ? AND `calendarid` = ?';
		$result = \OCP\DB::prepare($sql)->execute(array(
			$objectURI,
			$calendarId
		));
	}


	/**
	 * search objects by property
	 * @param Calendar $calendar
	 * @param array $properties
	 * @param integer $limit 
	 * @param integer $offset
	 * @return ObjectCollection
	 */
	public function searchByProperties(ICalendar $calendar, array $properties=array(), $limit, $offset) {
		if (!$this->doesCalendarExist($calendarURI, $userId)) {
			$msg  = 'Backend\Local::createObject(): Internal Error: ';
			$msg .= 'Calendar not fouund!';
			throw new CacheOutDatedException($msg);
		}

		if (empty($properties)) {
			return $this->findObjects($calendarId, $userId);
		}

		$calendarURI = $calendar->getUri();
		$userId = $calendar->getUserId();

		$caltbl = $this->calTableName;
		$objtbl = $this->objTableName;

		$sql  = 'SELECT objtbl.* FROM `' . $objtbl . '` AS objtbl, ';
		$sql .= '`' . $caltbl . '` AS caltbl ';
		$sql .= 'WHERE objtbl.`calendarid` = caltbl.`id` ';
		$sql .= 'AND caltbl.`uri` = ? AND caltbl.`userid` = ? ';


		$parameters = array(
			$calendarURI, 
			$userId
		);
		$sqlWhereClauses = array();

		foreach($properties as $key => $value) {
			$key	= strtoupper($key);
			$value	= strtolower($value);

			//TODO - improve sql clause
			$sqlWhereClauses[] = 'WHERE UPPER(objtbl.`calendardata`) LIKE `%?%`';
			$sqlWhereClauses[] = 'WHERE LOWER(objtbl.`calendardata`) LIKE `%?%`';

			$parameters[] = $key;
			$parameters[] = $value;
			
		}

		$sql .= 'AND ' . implode(' AND ', $sqlWhereClauses) . ')';

		$result = \OCP\DB::prepare($sql, $limit, $offset)->execute(
			$parameters
		);

		$objectCollection = new ObjectCollection();
		while($row = $result->fetchRow()){
			$object = $this->createObjectFromRow($row, $calendar);
			$objectCollection->add($object);
		}

		return $objectCollection;
	}


	/**
	 * get UTC date for database
	 * @param DateTime $datetime
	 * @return string
	 */
	private function getUTCforMDB($datetime){
		return ObjectUtility::getUTCforMDB($datetime);
	}


	/**
	 * create an calendar object from row
	 * @param array $row
	 * @return \OCA\Calendar\Db\Calendar
	 */
	private function createCalendarFromRow(&$row) {
		$calendar = new Calendar();

		$calendar->setUserId(strval($row['userid']));
		$calendar->setOwnerId(strval($row['userid']));
		$calendar->setBackend(strval($this->backend));
		$calendar->setUri(strval($row['uri']));
		$calendar->setDisplayname(strval($row['displayname']));
		$calendar->setComponents($this->getTypes($row['components']));
		$calendar->setCtag(intval($row['ctag']));
		$calendar->setTimezone($this->createTimezoneFromRow($row));
		$calendar->setColor(strval($row['calendarcolor']));
		$calendar->setOrder(intval($row['calendarorder']));
		$calendar->setEnabled((bool) $row['active']); //boolval is PHP >= 5.5.0 only
		$calendar->setCruds(Permissions::ALL);

		return $calendar;
	}


	/**
	 * create an timezone object from row
	 * @param array $row
	 * @return \OCA\Calendar\Db\Timezone
	 */
	private function createTimezoneFromRow(&$row) {
		//TODO - check if timezone is VCALENDAR data
		try {
			return $this->timezoneMapper->find(strval($row['timezone']));
		} catch(DoesNotExistException $ex) {
			return new Timezone('UTC');
		}
	}


	/**
	 * create an object object from row
	 * @param array $row
	 * @param Calendar $calendar
	 * @return Object
	 */
	private function createObjectFromRow(&$row, Calendar &$calendar) {
		$object = new Object();

		$object->setCalendar($calendar);
		$object->setObjectURI(strval($row['uri']));
		$object->setCalendarData(strval($row['calendardata']));

		return $object;
	}


	/**
	 * @brief get a single objectType
	 * @param mixed (integer|string) $type
	 * @return mixed (integer|string)
	 */
	public function getType($type) {
		if (is_int($type)) {
			return ObjectType::getAsString($type);
		} else {
			return ObjectType::getTypeByString(strval($type));
		}
	}


	/**
	 * @brief get multiple objectTypes
	 * @param mixed (integer|string) $type
	 * @return mixed (integer|string)
	 */
	public function getTypes($type) {
		if (is_int($type)) {
			return ObjectType::getAsString($type);
		} else {
			return ObjectType::getTypesByString(strval($type));
		}
	}


	/**
	 * @brief returns whether or not a backend can store a calendar's color
	 * @returns boolean
	 */
	public function canStoreColor() {
		return true;
	}


	/**
	 * @brief returns whether or not a backend can store a calendar's supported components
	 * @returns boolean
	 */
	public function canStoreComponents() {
		return true;
	}


	/**
	 * @brief returns whether or not a backend can store a calendar's displayname
	 * @returns boolean
	 */
	public function canStoreDisplayname() {
		return true;
	}


	/**
	 * @brief returns whether or not a backend can store if a calendar is enabled
	 * @returns boolean
	 */
	public function canStoreEnabled() {
		return true;
	}


	/**
	 * @brief returns whether or not a backend can store a calendar's order
	 * @returns boolean
	 */
	public function canStoreOrder() {
		return true;
	}


	/**
	 * @brief get table name for calendars
	 * @return string
	 */
	private function getCalendarTableName() {
		return $this->calTableName;
	}


	/**
	 * @brief get table name for objects
	 * @return string
	 */
	private function getObjectTableName() {
		return $this->objTableName;
	}
}