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
use OCP\DB;

use OCP\Calendar\Backend;
use OCP\Calendar\ICalendar;
use OCP\Calendar\ICalendarCollection;
use OCP\Calendar\IObject;
use OCP\Calendar\IObjectCollection;

use OCA\Calendar\Db\ObjectType;
use OCA\Calendar\Db\Permissions;

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
	 * constructor
	 * @param IAppContainer $app
	 * @param array $parameters
	 */
	public function __construct(IAppContainer $app, array $parameters){
		parent::__construct($app, 'org.ownCloud.local');

		$this->calTableName = (array_key_exists('calTableName', $parameters) ? 
									$parameters['calTableName'] : 
									'*PREFIX*clndr_calendars');
		$this->objTableName = (array_key_exists('objTableName', $parameters) ? 
									$parameters['objTableName'] : 
									'*PREFIX*clndr_objects');

		$columns  = '`uri`, `calendarData`';
		$this->columnsToQuery = $columns;
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
	 * @return array
	 */
	public function getAvailablePrefixes() {
		return array(
			array(
				'name' => 'this ownCloud',
				'l10n' => strval(\OC::$server->getL10N('calendar')->t('this ownCloud')),
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
	 * @return ICalendar
	 */
	public function findCalendar($calendarURI, $userId) {
		$table = $this->getCalendarTableName();

		$sql  = 'SELECT * FROM `' . $table . '` WHERE `uri` = ? AND `userid` = ?';
		$result = DB::prepare($sql)->execute(array(
			$calendarURI,
			$userId
		));

		if (DB::isError($result)) {
			$this->throwDBError();
		}

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
	 * @param integer $limit
	 * @param integer $offset
	 * @return ICalendarCollection
	 */
	public function findCalendars($userId, $limit, $offset) {
		$table = $this->getCalendarTableName();

		$sql  = 'SELECT * FROM `' . $table . '` ';
		$sql .= 'WHERE `userid` = ? ORDER BY `calendarorder`';
		$result = DB::prepare($sql, $limit, $offset)->execute(array(
			$userId
		));

		if (DB::isError($result)) {
			$this->throwDBError();
		}

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
		$table = $this->getCalendarTableName();

		$sql  = 'SELECT COUNT(*) FROM `' . $table . '` WHERE `userid` = ?';
		$result	= DB::prepare($sql)->execute(array(
			$userId
		));

		if (DB::isError($result)) {
			$this->throwDBError();
		}

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
		$table = $this->getCalendarTableName();

		$sql  = 'SELECT COUNT(*) FROM `' . $table . '` ';
		$sql .= 'WHERE `uri` = ? AND `userid` = ?';
		$result	= DB::prepare($sql)->execute(array(
			$calendarURI,
			$userId
		));

		if (DB::isError($result)) {
			$this->throwDBError();
		}

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
		$table = $this->getCalendarTableName();

		$sql  = 'SELECT `id` FROM `' . $table . '` ';
		$sql .= 'WHERE `uri` = ? AND `userid` = ?';
		$result	= DB::prepare($sql)->execute(array(
			$calendarURI,
			$userId
		));

		if (DB::isError($result)) {
			$this->throwDBError();
		}

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
		$table = $this->getCalendarTableName();

		$sql  = 'SELECT `ctag` FROM `' . $table . '` ';
		$sql .= 'WHERE `uri` = ? AND `userid` = ?';
		$result	= DB::prepare($sql)->execute(array(
			$calendarURI,
			$userId
		));

		if (DB::isError($result)) {
			$this->throwDBError();
		}

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
		// TODO -- IMPORTANT
		// TODO check if provisional privateuri is already taken
		// TODO -- IMPORTANT
		$calendarURI = $calendar->getPublicUri();
		$userId = $calendar->getUserId();

		if ($this->doesCalendarExist($calendarURI, $userId)) {
			$msg  = 'Backend\Local::createCalendar(): Internal Error: ';
			$msg .= 'Calendar with uri and userid combination already exists!';
			throw new CacheOutDatedException($msg);
		}

		$table = $this->getCalendarTableName();

		$sql  = 'INSERT INTO `' . $table . '` ';
		$sql .= '(`userid`, `displayname`, `uri`, `active`, `ctag`, `calendarorder`, ';
		$sql .= '`calendarcolor`, `timezone`, `components`) ';
		$sql .= 'VALUES(?,?,?,?,?,?,?,?,?)';
		$result = DB::prepare($sql)->execute(array(
			$calendar->getUserId(),
			$calendar->getDisplayname(),
			$calendar->getPublicUri(),
			$calendar->getEnabled(),
			$calendar->getCtag(),
			$calendar->getOrder(),
			$calendar->getColor(),
			$calendar->getTimezone(),
			$this->getTypes($calendar->getComponents(), 'string'),
		));

		if (DB::isError($result)) {
			$this->throwDBError();
		}
	}


	/**
	 * update a calendar
	 * @param ICalendar $calendar
	 * @throws CacheOutDatedException if calendar does not exist
	 * @return ICalendar
	 */
	public function updateCalendar(ICalendar &$calendar) {
		$calendarURI = $calendar->getPublicUri();
		$userId = $calendar->getUserId();

		$calendarId = $this->getCalendarId($calendarURI, $userId);
		if (!$calendarId) {
			$msg  = 'Backend\Local::updateCalendar(): Internal Error: ';
			$msg .= 'Calendar with uri and userid combination not found!';
			throw new CacheOutDatedException($msg);
		}

		$table = $this->getCalendarTableName();

		$sql  = 'UPDATE `' . $table . '` SET ';
		$sql .= '`userid` = ?, `displayname` = ?, `uri` = ?, `active` = ?, ';
		$sql .= '`ctag` = ?, `calendarorder` = ?, `calendarcolor` = ?, ';
		$sql .= '`timezone` = ?, `components` = ? WHERE `id` = ?';
		$result = DB::prepare($sql)->execute(array(
			$calendar->getUserId(),
			$calendar->getDisplayname(),
			$calendar->getPublicUri(),
			$calendar->getEnabled(),
			$calendar->getCtag(),
			$calendar->getOrder(),
			$calendar->getColor(),
			$calendar->getTimezone(),
			$this->getTypes($calendar->getComponents(), 'string'),
			$calendarId
		));

		if (DB::isError($result)) {
			$this->throwDBError();
		}
	}


	/**
	 * delete a calendar
	 * @param string $calendarURI
	 * @param string $userId
	 * @throws CacheOutDatedException
	 */
	public function deleteCalendar($calendarURI, $userId) {
		$calendarTable = $this->getCalendarTableName();
		$objectTable = $this->getObjectTableName();

		$calendarId = $this->getCalendarId($calendarURI, $userId);
		if (!$calendarId) {
			$msg  = 'Backend\Local::findObjects(): Internal Error: ';
			$msg .= 'Calendar not found!';
			throw new CacheOutDatedException($msg);
		}

		$sql1 = 'DELETE FROM `' . $objectTable . '` WHERE `calendarid` = ?';
		$result1 = DB::prepare($sql1)->execute(array(
			$calendarId
		));

		if (DB::isError($result1)) {
			$this->throwDBError();
		}

		$sql2  = 'DELETE FROM `' . $calendarTable . '` WHERE `id` = ?';
		$result2 = DB::prepare($sql2)->execute(array(
			$calendarId
		));

		if (DB::isError($result2)) {
			$this->throwDBError();
		}
	}


	/**
	 * merge two calendars
	 * @param ICalendar $calendar
	 * @param string $oldCalendarURI
	 * @param string $oldUserId
	 * @throws CacheOutDatedException
	 */
	public function mergeCalendar(ICalendar &$calendar, $oldCalendarURI, $oldUserId) {
		$newCalendarURI = $calendar->getPublicUri();
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

		$calendarTable = $this->getCalendarTableName();
		$objectTable = $this->getObjectTableName();

		$sql1 = 'UPDATE `' . $objectTable . '` SET `calendarid` = ? WHERE `calendarId` = ?';
		$result1 = DB::prepare($sql1)->execute(array(
			$newCalendarId,
			$oldCalendarId
		));

		if (DB::isError($result1)) {
			$this->throwDBError();
		}

		$sql2  = 'DELETE FROM `' . $calendarTable . '` WHERE `id` = ?';
		$result2 = DB::prepare($sql2)->execute(array(
			$oldCalendarId
		));

		if (DB::isError($result2)) {
			$this->throwDBError();
		}


		$sql3 = 'UPDATE `' . $calendarTable . '` set `ctag` = `ctag` + 1 WHERE `id` = ?';
		$result3 = DB::prepare($sql3)->execute(array(
			$newCalendarId
		));

		if (DB::isError($result3)) {
			$this->throwDBError();
		}
	}


	/**
	 * move a calendar aka rename uri
	 * @param ICalendar $calendar
	 * @param string $oldCalendarURI
	 * @param string $oldUserId
	 * @throws CacheOutDatedException
	 */
	public function moveCalendar(ICalendar &$calendar, $oldCalendarURI, $oldUserId) {
		$newCalendarURI = $calendar->getPublicUri();
		//$newUserId = $calendar->getUserId();

		$calendarId = $this->getCalendarId($oldCalendarURI, $oldUserId);
		if (!$calendarId) {
			$msg  = 'Backend\Local::moveCalendar(): Internal Error: ';
			$msg .= 'Calendar not found!';
			throw new CacheOutDatedException($msg);
		}

		$table = $this->getCalendarTableName();

		$sql  = 'UPDATE `' . $table . '` SET `uri` = ? WHERE `id` = ?';
		$result = DB::prepare($sql)->execute(array(
			$newCalendarURI,
			$calendarId
		));

		if (DB::isError($result)) {
			$this->throwDBError();
		}
	}


	/**
	 * transfer a calendar to another user
	 * @param ICalendar $calendar
	 * @param string $oldCalendarURI
	 * @param string $oldUserId
	 */
	/*public function transferCalendar(Calendar &$calendar, $oldCalendarURI, $oldUserId) {}*/


	/**
	 * find object
	 * @param ICalendar $calendar
	 * @param string $objectURI
	 * @throws CacheOutDatedException if calendar does not exist
	 * @throws DoesNotExistException
	 * @throws MultipleObjectsReturnedException if more than one result found
	 * @return IObject
	 */
	public function findObject(ICalendar &$calendar, $objectURI) {
		$calendarURI = $calendar->getPublicUri();
		$userId = $calendar->getUserId();

		$calendarId = $this->getCalendarId($calendarURI, $userId);
		if (!$calendarId) {
			$msg  = 'Backend\Local::findObject(): Internal Error: ';
			$msg .= 'Calendar not found!';
			throw new CacheOutDatedException($msg);
		}

		$table = $this->getObjectTableName();

		$sql = 'SELECT * FROM `' . $table . '` WHERE `calendarid` = ? AND `uri` =? ';
		$result = DB::prepare($sql)->execute(array(
			$calendarId,
			$objectURI
		));

		if (DB::isError($result)) {
			$this->throwDBError();
		}

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
	 * @param ICalendar $calendar
	 * @param integer $limit
	 * @param integer $offset
	 * @throws CacheOutDatedException
	 * @return IObjectCollection
	 */
	public function findObjects(ICalendar &$calendar, $limit, $offset) {
		$calendarURI = $calendar->getPublicUri();
		$userId = $calendar->getUserId();

		$calendarId = $this->getCalendarId($calendarURI, $userId);
		if (!$calendarId) {
			$msg  = 'Backend\Local::findObjects(): Internal Error: ';
			$msg .= 'Calendar not found!';
			throw new CacheOutDatedException($msg);
		}

		$table = $this->getObjectTableName();

		$sql = 'SELECT * FROM `' . $table . '` WHERE `calendarid` = ?';
		$result = DB::prepare($sql, $limit, $offset)->execute(array(
			$calendarId
		));

		if (DB::isError($result)) {
			$this->throwDBError();
		}

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
	 * Find objects in period
	 * @param ICalendar $calendar
	 * @param DateTime $start
	 * @param DateTime $end
	 * @param integer $limit
	 * @param integer $offset
	 * @throws CacheOutDatedException
	 * @return IObjectCollection
	 */
	public function findObjectsInPeriod(ICalendar $calendar, DateTime $start, DateTime $end, $limit, $offset){
		$calendarURI = $calendar->getPublicUri();
		$userId = $calendar->getUserId();

		$calendarId = $this->getCalendarId($calendarURI, $userId);
		if (!$calendarId) {
			$msg  = 'Backend\Local::findObjects(): Internal Error: ';
			$msg .= 'Calendar not found!';
			throw new CacheOutDatedException($msg);
		}

		$table = $this->objTableName;

		$sql  = 'SELECT * FROM `' . $table . '` WHERE `calendarid` = ? AND ';
        $sql .= '((`startdate` >= ? AND `enddate` <= ? AND `repeating` = 0)';
        $sql .= ' OR (`enddate` >= ? AND `startdate` <= ? AND `repeating` = 0)';
        $sql .= ' OR (`startdate` <= ? AND `repeating` = 1)) ORDER BY `repeating`';

		$utcStart = $this->getUTCforMDB($start);
		$utcEnd = $this->getUTCforMDB($end);

		$result	= DB::prepare($sql, $limit, $offset)->execute(array(
			$calendarId,
			$utcStart,
			$utcEnd,
			$utcStart,
			$utcEnd,
			$utcEnd
		));

		if (DB::isError($result)) {
			$this->throwDBError();
		}

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
	 * Find objects by type
	 * @param ICalendar $calendar
	 * @param integer $type
	 * @param integer $limit
	 * @param integer $offset
	 * @throws CacheOutDatedException
	 * @return IObjectCollection
	 */
	public function findObjectsByType(ICalendar $calendar, $type, $limit, $offset) {
		$calendarURI = $calendar->getPublicUri();
		$userId = $calendar->getUserId();

		$calendarId = $this->getCalendarId($calendarURI, $userId);
		if (!$calendarId) {
			$msg  = 'Backend\Local::findObjects(): Internal Error: ';
			$msg .= 'Calendar not found!';
			throw new CacheOutDatedException($msg);
		}

		$table = $this->getObjectTableName();

		$sql = 'SELECT * FROM `' . $table . '` WHERE `calendarid` = ? AND `objecttype` = ?';
		$result = DB::prepare($sql, $limit, $offset)->execute(array(
			$calendarId,
			$this->getType($type, 'string')
		));

		if (DB::isError($result)) {
			$this->throwDBError();
		}

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
	 * @param ICalendar $calendar
	 * @param integer $type
	 * @param DateTime $start
	 * @param DateTime $end
	 * @param integer $limit
	 * @param integer $offset
	 * @throws CacheOutDatedException
	 * @return IObjectCollection
	 */
	public function findObjectsByTypeInPeriod(ICalendar $calendar, $type, DateTime $start, DateTime $end, $limit, $offset) {
		$calendarURI = $calendar->getPublicUri();
		$userId = $calendar->getUserId();

		$calendarId = $this->getCalendarId($calendarURI, $userId);
		if (!$calendarId) {
			$msg  = 'Backend\Local::findObjects(): Internal Error: ';
			$msg .= 'Calendar not found!';
			throw new CacheOutDatedException($msg);
		}

		$table = $this->getObjectTableName();

		$sql  = 'SELECT * FROM `' . $table . '` WHERE `calendarid` = ? AND ';
        $sql .= '((`startdate` >= ? AND `enddate` <= ? AND `repeating` = 0)';
        $sql .= ' OR (`enddate` >= ? AND `startdate` <= ? AND `repeating` = 0)';
        $sql .= ' OR (`startdate` <= ? AND `repeating` = 1)) AND `objecttype` = ? ';
        $sql .= 'ORDER BY `repeating`';

		$utcStart = $this->getUTCforMDB($start);
		$utcEnd = $this->getUTCforMDB($end);

		$result	= DB::prepare($sql, $limit, $offset)->execute(array(
			$calendarId,
			$utcStart,
			$utcEnd,
			$utcStart,
			$utcEnd,
			$utcEnd,
			$this->getType($type, 'string')
		));

		if (DB::isError($result)) {
			$this->throwDBError();
		}

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
	 * @param ICalendar $calendar
	 * @return integer
	 */
	public function countObjects(ICalendar $calendar) {
		$calendarURI = $calendar->getPublicUri();
		$userId = $calendar->getUserId();

		$objectTable = $this->getObjectTableName();
		$calendarTable = $this->getCalendarTableName();

		$sql  = 'SELECT objtbl.* FROM `' . $objectTable . '` AS objtbl, ';
		$sql .= '`' . $calendarTable . '` AS caltbl ';
		$sql .= 'WHERE objtbl.`calendarid` = caltbl.`id` ';
		$sql .= 'AND caltbl.`uri` = ? AND caltbl.`userid` = ?';
		$result	= DB::prepare($sql)->execute(array(
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
	 * @param ICalendar $calendar
	 * @param string $objectURI
	 * @return boolean
	 */
	public function doesObjectExist(ICalendar $calendar, $objectURI) {
		$calendarURI = $calendar->getPublicUri();
		$userId = $calendar->getUserId();

		$objectTable = $this->getObjectTableName();
		$calendarTable = $this->getCalendarTableName();

		$sql  = 'SELECT COUNT(objtbl.`id`) FROM `' . $objectTable . '` AS objtbl, ';
		$sql .= '`' . $calendarTable . '` AS caltbl ';
		$sql .= 'WHERE objtbl.`calendarid` = caltbl.`id` ';
		$sql .= 'AND caltbl.`uri` = ? AND caltbl.`userid` = ? ';
		$sql .= 'AND objtbl.`uri` = ?';
		$result	= DB::prepare($sql)->execute(array(
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
	 * @param ICalendar $calendar
	 * @param string $objectURI
	 * @return boolean
	 */
	public function doesObjectAllow(ICalendar $calendar, $objectURI, $cruds) {
		return ($cruds & Permissions::ALL);
	}


	/**
	 * get etag of an object
	 * @param ICalendar $calendar
	 * @param string $objectURI
	 * @return integer
	 */
	public function getObjectsETag(ICalendar $calendar, $objectURI) {
		$object = $this->findObject($calendar, $objectURI);
		return $object->generateEtag()->getEtag();
	}


	/**
	 * Create an object
	 * @param IObject $object
	 * @throws CacheOutDatedException if calendar already exists
	 * @throws BackendException if object already exists
	 * @return IObject
	 */
	public function createObject(IObject &$object) {
		$calendarURI = $object->getCalendar()->getPublicUri();
		$userId = $object->getCalendar()->getUserId();

		$calendarId = $this->getCalendarId($calendarURI, $userId);
		if (!$calendarId) {
			$msg  = 'Backend\Local::createObject(): Internal Error: ';
			$msg .= 'Calendar not found!';
			throw new CacheOutDatedException($msg);
		}
		if ($this->doesObjectExist($object->getCalendar(), $object->getUri())) {
			$msg  = 'Backend\Local::createObject(): User Error: ';
			$msg .= 'Object already exists';
			throw new BackendException($msg);
		}

		$table = $this->getObjectTableName();

		$sql  = 'INSERT INTO `' . $table . '` ';
		$sql .= '(`calendarid`,`objecttype`,`startdate`,`enddate`,';
		$sql .= '`repeating`,`summary`,`calendardata`,`uri`,`lastmodified`) ';
		$sql .= 'VALUES(?, ?, ?, ?, ?, ?, ?, ?, ?)';
		$result = DB::prepare($sql)->execute(array(
			$calendarId,
			$this->getType($object->getType(), 'string'),
			$this->getUTCforMDB($object->getStartDate()),
			$this->getUTCforMDB($object->getEndDate()),
			$object->getRepeating(),
			$object->getSummary(),
			$object->getCalendarData(),
			$object->getUri(),
			$this->getUTCforMDB($object->getLastModified()),
		));

		if (DB::isError($result)) {
			$this->throwDBError();
		}

		return $object;
	}


	/**
	 * update an object
	 * @param IObject $object
	 * @throws CacheOutDatedException if calendar does not exist
	 * @throws BackendException
	 */

	public function updateObject(IObject &$object) {
		$calendarURI = $object->getCalendar()->getPublicUri();
		$userId = $object->getCalendar()->getUserId();

		$calendarId = $this->getCalendarId($calendarURI, $userId);
		if (!$calendarId) {
			$msg  = 'Backend\Local::updateObject(): Internal Error: ';
			$msg .= 'Calendar not found!';
			throw new CacheOutDatedException($msg);
		}
		if (!$this->doesObjectExist($object->getCalendar(), $object->getUri())) {
			$msg  = 'Backend\Local::updateObject(): User Error: ';
			$msg .= 'Object does not exists';
			throw new BackendException($msg);
		}

		$table = $this->getObjectTableName();

		$sql  = 'UPDATE `' . $table . '`  SET `objecttype` = ?, `startdate` = ?, ';
		$sql .= '`enddate` = ?, `repeating` = ?, `summary` = ?, `calendardata` = ?, ';
		$sql .= '`lastmodified` = ? WHERE `uri` = ? and `calendarid` = ?';
		$result = DB::prepare($sql)->execute(array(
			$this->getType($object->getType(), 'string'),
			$this->getUTCforMDB($object->getStartDate()),
			$this->getUTCforMDB($object->getEndDate()),
			$object->getRepeating(),
			$object->getSummary(),
			$object->getCalendarData(),
			$this->getUTCforMDB($object->getLastModified()),
			$object->getUri(),
			$calendarId,
		));

		if (DB::isError($result)) {
			$this->throwDBError();
		}
	}


	/**
	 * move an object to another calendar
	 * @param IObject $object
	 * @param ICalendar $oldCalendar
	 * @throws CacheOutDatedException if calendar does not exist
	 * @return ICalendar
	 */
	public function moveObject(IObject &$object, ICalendar $oldCalendar) {
		$newCalendarURI = $object->getCalendar()->getPublicUri();
		$newUserId = $object->getCalendar()->getUserId();
		$oldCalendarURI = $oldCalendar->getPublicUri();
		$oldUserId = $oldCalendar->getUserId();

		$newCalendarId = $this->getCalendarId($newCalendarURI, $newUserId);
		if (!$newCalendarId) {
			$msg  = 'Backend\Local::moveObject(): Internal Error: ';
			$msg .= 'Calendar not found!';
			throw new CacheOutDatedException($msg);
		}

		$oldCalendarId = $this->getCalendarId($oldCalendarURI, $oldUserId);
		if (!$oldCalendarId) {
			$msg  = 'Backend\Local::moveObject(): Internal Error: ';
			$msg .= 'Calendar not found!';
			throw new CacheOutDatedException($msg);
		}

		$table = $this->getObjectTableName();

		$sql  = 'UPDATE `' . $table . '` SET `calendarid` = ? WHERE `calendarid` = ?';
		$result = DB::prepare($sql)->execute(array(
			$newCalendarId,
			$oldCalendarId
		));

		if (DB::isError($result)) {
			$this->throwDBError();
		}
	}


	/**
	 * move an object to another user
	 * @param IObject $object
	 * @param ICalendar $oldCalendar
	 * @throws CacheOutDatedException if calendar does not exist
	 * @return ICalendar
	 */
	/*public function transferObject(IObject &$object, ICalendar $oldCalendar) {
		$newCalendarURI = $object->getCalendar()->getUri();
		$oldCalendarURI = $oldCalendar->getUri();

		$newUserId = $object->getCalendar()->getUserId();
		$oldUserId = $oldCalendar->getUserId();
	}*/


	/**
	 * delete an object
	 * @param IObject $object
	 * @throws CacheOutDatedException if calendar does not exist
	 */
	public function deleteObject(IObject $object){
		$calendarURI = $object->getCalendar()->getPublicUri();
		$objectURI = $object->getUri();
		$userId = $object->getCalendar()->getUserId();

		$calendarId = $this->getCalendarId($calendarURI, $userId);
		if (!$calendarId) {
			$msg  = 'Backend\Local::deleteObject(): Internal Error: ';
			$msg .= 'Calendar not found!';
			throw new CacheOutDatedException($msg);
		}

		$table = $this->getObjectTableName();

		$sql  = 'DELETE FROM `' . $table . '` WHERE `uri` = ? AND `calendarid` = ?';
		$result = DB::prepare($sql)->execute(array(
			$objectURI,
			$calendarId
		));

		if (DB::isError($result)) {
			$this->throwDBError();
		}
	}


	/**
	 * search objects by property
	 * @param ICalendar $calendar
	 * @param array $properties
	 * @param integer $limit 
	 * @param integer $offset
	 * @return IObjectCollection
	 * @throws CacheOutDatedException
	 */
	public function searchByProperties(ICalendar $calendar, array $properties=array(), $limit, $offset) {
		$calendarURI = $calendar->getPublicUri();
		$userId = $calendar->getUserId();

		if (!$this->doesCalendarExist($calendarURI, $userId)) {
			$msg  = 'Backend\Local::createObject(): Internal Error: ';
			$msg .= 'Calendar not found!';
			throw new CacheOutDatedException($msg);
		}

		if (empty($properties)) {
			return $this->findObjects($calendar, $limit, $offset);
		}

		$calendarURI = $calendar->getPublicUri();
		$userId = $calendar->getUserId();

		$calendarTable = $this->getCalendarTableName();
		$objectTable = $this->getObjectTableName();

		$sql  = 'SELECT objtbl.* FROM `' . $objectTable . '` AS objtbl, ';
		$sql .= '`' . $calendarTable . '` AS caltbl ';
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

		$result = DB::prepare($sql, $limit, $offset)->execute(
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
		$calendar->setBackend(strval($this->getBackendIdentifier()));
		$calendar->setPrivateUri(strval($row['uri']));
		$calendar->setDisplayname(strval($row['displayname']));
		$calendar->setComponents($this->getTypes($row['components'], 'int'));
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
		try {
		 	$timezone = new Timezone($row['timezone']);

			if ($timezone->isValid()) {
				return $timezone;
			} else {
				if ($this->timezoneMapper === null) {
					$this->timezoneMapper = $this->app->query('TimezoneMapper');
				}
				return $this->timezoneMapper->find(
					strval($row['timezone']),
					strval($row['userid'])
				);
			}
		} catch(DoesNotExistException $ex) {
			return new Timezone('UTC');
		}
	}


	/**
	 * create an object object from row
	 * @param array $row
	 * @param ICalendar $calendar
	 * @return IObject
	 */
	private function createObjectFromRow(&$row, ICalendar &$calendar) {
		$object = new Object();

		$object->setCalendar($calendar);
		$object->setUri(strval($row['uri']));
		$object->setCalendarData(strval($row['calendardata']));

		return $object;
	}


	/**
	 * get a single objectType
	 * @param mixed (integer|string) $component
	 * @param string $type
	 * @return mixed (integer|string)
	 */
	public function getType($component, $type) {
		if ($type === 'string') {
			return ObjectType::getAsString($component);
		} else {
			return ObjectType::getTypeByString(strval($component));
		}
	}


	/**
	 * get multiple objectTypes
	 * @param mixed (integer|string) $components
	 * @param string $type
	 * @return mixed (integer|string)
	 */
	public function getTypes($components, $type) {
		if ($type === 'string') {
			return ObjectType::getAsString($components);
		} else {
			return ObjectType::getTypesByString(strval($components));
		}
	}


	/**
	 * returns whether or not a backend can store a calendar's supported components
	 * @return boolean
	 */
	public function canStoreComponents() {
		return true;
	}


	/**
	 * returns whether or not a backend can store a calendar's displayname
	 * @return boolean
	 */
	public function canStoreDisplayname() {
		return true;
	}


	/**
	 * returns whether or not a backend can store if a calendar is enabled
	 * @return boolean
	 */
	public function canStoreEnabled() {
		return true;
	}


	/**
	 * returns whether or not a backend can store a calendar's order
	 * @return boolean
	 */
	public function canStoreOrder() {
		return true;
	}


	/**
	 * get table name for calendars
	 * @return string
	 */
	private function getCalendarTableName() {
		return $this->calTableName;
	}


	/**
	 * get table name for objects
	 * @return string
	 */
	private function getObjectTableName() {
		return $this->objTableName;
	}


	/**
	 * throw db error msg
	 * @throws \OCP\Calendar\BackendException
	 */
	private function throwDBError() {
		throw new BackendException('An database error occurred!');
	}
}