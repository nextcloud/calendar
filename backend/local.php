<?php
/**
 * Copyright (c) 2014 Georg Ehrke <oc.list@georgehrke.com>
 * Copyright (c) 2014 Bart Visscher <bartv@thisnet.nl>
 * Copyright (c) 2014 Jakob Sack <mail@jakobsack.de>
 * This file is licensed under the Affero General Public License version 3 or
 * later.
 * See the COPYING-README file.
 */
namespace OCA\Calendar\Backend;

use \OCP\AppFramework\IAppContainer;

use \OCA\Calendar\Db\DoesNotExistException;
use \OCA\Calendar\Db\MultipleObjectsReturnedException;
use \OCA\Calendar\Db\CorruptDataException;

use \OCA\Calendar\Db\Calendar;
use \OCA\Calendar\Db\CalendarCollection;

use \OCA\Calendar\Db\Object;
use \OCA\Calendar\Db\ObjectCollection;

use \OCA\Calendar\Db\Timezone;
use \OCA\Calendar\Db\TimezoneCollection;

use \OCA\Calendar\Db\ObjectType;
use \OCA\Calendar\Db\Permissions;

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
	 * constructur
	 * @param \OCP\AppFramework\IAppContainer $app
	 * @param array $paramters
	 */
	public function __construct(IAppContainer $app, array $parameters){

		$this->calTableName = (array_key_exists('calTableName', $parameters) ? 
									$parameters['calTableName'] : 
									'*PREFIX*clndr_calendars');
		$this->objTableName = (array_key_exists('objTableName', $parameters) ? 
									$parameters['objTableName'] : 
									'*PREFIX*clndr_objects');

		$this->timezoneMapper = $app->query('TimezoneMapper');

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
				'l10n' => 'this ownCloud', //
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
		$caltbl = $this->calTableName;

		$sql  = 'SELECT * FROM `' . $caltbl . '` ';
		$sql .= 'WHERE `uri` = ? AND `userid` = ?';

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
		$caltbl = $this->calTableName;

		$sql  = 'SELECT * FROM `' . $caltbl . '` ';
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
		$caltbl = $this->calTableName;

		$sql  = 'SELECT COUNT(*) FROM `' . $caltbl . '` ';
		$sql .= 'WHERE `userid` = ?';

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
	 * @param Calendar $calendar
	 * @throws CacheOutDatedException if calendar already exists
	 */
	public function createCalendar(Calendar &$calendar) {
		$calendarURI = $calendar->getUri();
		$userId = $calendar->getUserId();

		if ($this->doesCalendarExist($calendarURI, $userId) === true) {
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
			$calendar->getComponents(),
		));
	}


	/**
	 * update a calendar
	 * @param Calendar $calendar
	 * @param string $oldCalendarURI
	 * @param string $oldUserId
	 * @throws CacheOutDatedException if calendar does not exist
	 * @return Calendar
	 */
	public function updateCalendar(Calendar &$calendar) {
		if ($this->doesCalendarExist($oldCalendarURI, $oldUserId) === false) {
			$msg  = 'Backend\Local::updateCalendar(): Internal Error: ';
			$msg .= 'Calendar with uri and userid combination not found!';
			throw new CacheOutDatedException($msg);
		}

		$caltbl = $this->calTableName;

		$sql  = 'UPDATE `' . $caltbl . '` SET ';
		$sql .= '`userid` = ?, `displayname` = ?, `uri` = ?, `active` = ?, ';
		$sql .= '`ctag` = ?, `calendarorder` = ?, `calendarcolor` = ?, ';
		$sql .= '`timezone` = ?, `components` = ? ';
		$sql .= 'WHERE `userid` = ? AND `uri` = ?';

		$result = \OCP\DB::prepare($sql)->execute(array(
			$calendar->getUserId(),
			$calendar->getDisplayname(),
			$calendar->getUri(),
			$calendar->getEnabled(),
			$calendar->getCtag(),
			$calendar->getOrder(),
			$calendar->getColor(),
			$calendar->getTimezone(),
			$calendar->getComponents(),
			$oldUserId,
			$oldCalendarURI,
		));
	}


	/**
	 * delete a calendar
	 * @param string $calendarURI
	 * @param string $userId
	 * @return boolean
	 */
	public function deleteCalendar($calendarURI, $userId) {
		$caltbl = $this->calTableName;
		$objtbl = $this->objTableName;

		$sql1  = 'DELETE FROM `' . $objtbl . '` WHERE EXISTS ';
		$sql1 .= '(SELECT caltbl.`id` FROM `' . $caltbl . '` AS caltbl ';
		$sql1 .= 'WHERE caltbl.`id` = `' . $objtbl . '`.`calendarId` AND ';
		$sql1 .= 'caltbl.`uri` = ? AND caltbl.`userid` = ?)';

		$result1 = \OCP\DB::prepare($sql1)->execute(array(
			$calendarURI,
			$userId
		));

		$sql2  = 'DELETE FROM `' . $caltbl . '` WHERE ';
		$sql2 .= '`uri` = ? AND `userid` = ?';

		$result2 = \OCP\DB::prepare($sql2)->execute(array(
			$calendarURI,
			$userId
		));
	}


	/**
	 * merge two calendars
	 * @param Calendar $calendar
	 * @param string $oldCalendarURI
	 * @param string $oldUserId
	 */
	public function mergeCalendar(Calendar &$calendar, $oldCalendarURI, $oldUserId) {
		$newCalendarURI = $calendar->getUri();
		$newUserId = $calendar->getUserId();

		$caltbl = $this->calTableName;
		$objtbl = $this->objTableName;

		$sql  = 'UPDATE `' . $objtbl . '` SET `calendarid` = ';
		$sql .= '(SELECT `id` FROM `' . $caltbl . '` WHERE `uri` = ? AND `userid` = ?) ';
		$sql .= 'WHERE `calendarid` = ';
		$sql .= '(SELECT `id` FROM `' . $caltbl . '` WHERE `uri` = ? AND `userid` = ?)';

		$result = \OCP\DB::prepare($sql)->execute(array(
			$newCalendarURI,
			$newUserId,
			$oldCalendarURI,
			$oldUserId
		));

		$this->deleteCalendar($oldCalendarURI, $oldUserId);

		$calendar->touch();
		$this->updateCalendar($calendar);
	}


	/**
	 * move a calendar aka rename uri
	 * @param Calendar $calendar
	 * @param string $oldCalendarURI
	 * @param string $oldUserId
	 */
	public function moveCalendar(Calendar &$calendar, $oldCalendarURI, $oldUserId) {
		$newCalendarURI = $calendar->getUri();
		$newUserId = $calendar->getUserId();

		$caltbl = $this->calTableName;

		$sql  = 'UPDATE `' . $caltbl . '` SET `uri` = ?, `userid` = ? WHERE ';
		$sql .= '`uri` = ? AND `userId` = ?';

		$result = \OCP\DB::prepare($sql)->execute(array(
			$newCalendarURI,
			$newUserId,
			$oldCalendarURI,
			$oldUserId,
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
	 * @throws MultipleObjectsReturnedException if more than one result found
	 * @return Object
	 */
	public function findObject(Calendar &$calendar, $objectURI) {
		$calendarURI = $calendar->getUri();
		$userId = $calendar->getUserId();

		$caltbl = $this->calTableName;
		$objtbl = $this->objTableName;

		$sql  = 'SELECT objtbl.* FROM `' . $objtbl . '` AS objtbl, ';
		$sql .= '`' . $caltbl . '` AS caltbl ';
		$sql .= 'WHERE objtbl.`calendarid` = caltbl.`id` ';
		$sql .= 'AND caltbl.`uri` = ? AND caltbl.`userid` = ? ';
		$sql .= 'AND objtbl.`uri`= ?';

		$result = \OCP\DB::prepare($sql)->execute(array(
			$calendarURI,
			$userId,
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
	 * @param integer/null $limit
	 * @param integer/null $offset
	 * @return ObjectCollection
	 */
	public function findObjects(Calendar &$calendar, $limit, $offset) {
		$calendarURI = $calendar->getUri();
		$userId = $calendar->getUserId();

		$caltbl = $this->calTableName;
		$objtbl = $this->objTableName;

		$sql  = 'SELECT objtbl.* FROM `' . $objtbl . '` AS objtbl, ';
		$sql .= '`' . $caltbl . '` AS caltbl ';
		$sql .= 'WHERE objtbl.`calendarid` = caltbl.`id` ';
		$sql .= 'AND caltbl.`uri` = ? AND caltbl.`userid` = ?';

		$result = \OCP\DB::prepare($sql, $limit, $offset)->execute(array(
			$calendarURI,
			$userId
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
	 * @param integer/null $limit
	 * @param integer/null $offset
	 * @return ObjectCollection
	 */
	public function findObjectsInPeriod(Calendar $calendar, DateTime $start, DateTime $end, $limit, $offset){
		$calendarURI = $calendar->getUri();
		$userId = $calendar->getUserId();

		$caltbl = $this->calTableName;
		$objtbl = $this->objTableName;

		$sql  = 'SELECT objtbl.* FROM `' . $objtbl . '` AS objtbl, ';
		$sql .= '`' . $caltbl . '` AS caltbl ';
		$sql .= 'WHERE objtbl.`calendarid` = caltbl.`id`';
		$sql .= ' AND caltbl.`uri` = ? AND caltbl.`userid` = ?';
        $sql .= ' AND ((objtbl.`startdate` >= ? AND ';
        $sql .= 'objtbl.`enddate` <= ? AND objtbl.`repeating` = 0)';
        $sql .= ' OR (objtbl.`enddate` >= ? AND ';
        $sql .= 'objtbl.`startdate` <= ? AND objtbl.`repeating` = 0)';
        $sql .= ' OR (objtbl.`startdate` <= ? AND objtbl.`repeating` = 1))';
        $sql .= ' ORDER BY objtbl.`repeating`';

		$result	= \OCP\DB::prepare($sql, $limit, $offset)->execute(array(
			$calendarURI,
			$userId,
			$this->getUTCforMDB($start),
			$this->getUTCforMDB($end),
			$this->getUTCforMDB($start),
			$this->getUTCforMDB($end),
			$this->getUTCforMDB($end),
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
	 * @param integer/null $limit
	 * @param integer/null $offset
	 * @return ObjectCollection
	 */
	public function findObjectsByType(Calendar $calendar, $type, $limit, $offset) {
		$calendarURI = $calendar->getUri();
		$userId = $calendar->getUserId();

		$caltbl = $this->calTableName;
		$objtbl = $this->objTableName;

		$sql  = 'SELECT objtbl.* FROM `' . $objtbl . '` AS objtbl, ';
		$sql .= '`' . $caltbl . '` AS caltbl ';
		$sql .= 'WHERE objtbl.`calendarid` = caltbl.`id` ';
		$sql .= 'AND caltbl.`uri` = ? and caltbl.`userid` = ? AND objtbl.`objecttype` = ?';

		$result = \OCP\DB::prepare($sql, $limit, $offset)->execute(array(
			$calendarURI,
			$userId,
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
	 * @param integer/null $limit
	 * @param integer/null $offset
	 * @return ObjectCollection
	 */
	public function findObjectsByTypeInPeriod(Calendar $calendar, $type, DateTime $start, DateTime $end, $limit, $offset) {
		$calendarURI = $calendar->getUri();
		$userId = $calendar->getUserId();

		$objtbl = $this->objTableName;
		$caltbl = $this->calTableName;

		$sql  = 'SELECT objtbl.* FROM `' . $objtbl . '` AS objtbl, ';
		$sql .= '`' . $caltbl . '` AS caltbl ';
		$sql .= 'WHERE objtbl.`calendarid` = caltbl.`id`';
		$sql .= ' AND caltbl.`uri` = ? AND caltbl.`userid` = ?';
        $sql .= ' AND ((objtbl.`startdate` >= ? AND objtbl.`enddate` <= ? AND objtbl.`repeating` = 0)';
        $sql .= ' OR (objtbl.`enddate` >= ? AND objtbl.`startdate` <= ? AND objtbl.`repeating` = 0)';
        $sql .= ' OR (objtbl.`startdate` <= ? AND objtbl.`repeating` = 1))';
        $sql .= ' AND objtbl.`objecttype` = ?';
        $sql .= ' ORDER BY objtbl.`repeating`';

		$result	= \OCP\DB::prepare($sql, $limit, $offset)->execute(array(
			$calendarURI,
			$userId,
			$this->getUTCforMDB($start),
			$this->getUTCforMDB($end),
			$this->getUTCforMDB($start),
			$this->getUTCforMDB($end),
			$this->getUTCforMDB($end),
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
	public function countObjects(Calendar $calendar) {
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
	 * @return boolean
	 */
	public function doesObjectExist(Calendar $calendar, $objectURI) {
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
	public function doesObjectAllow($cruds, Calendar $calendar, $objectURI) {
		return ($cruds & Permissions::ALL);
	}


	/**
	 * get etag of an object
	 * @param Calendar $calendar
	 * @param string $objectURI
	 * @return integer
	 */
	public function getObjectsETag(Calendar $calendar, $objectURI) {
		$object = $this->findObject($calendar, $objectURI);
		return $object->generateEtag()->getEtag();
	}


	/**
	 * Create an object
	 * @param Object $object
	 * @throws CacheOutDatedException if calendar already exists
	 * @throws BackendException if object already exists
	 */
	public function createObject(Object &$object) {
		$calendarURI = $object->getCalendar()->getUri();
		$userId = $object->getCalendar()->getUserId();

		if (!$this->doesCalendarExist($calendarURI, $userId)) {
			$msg  = 'Backend\Local::createObject(): Internal Error: ';
			$msg .= 'Calendar not found!';
			throw new CacheOutDatedException($msg);
		}
		if ($this->doesObjectExist($object->getCalendar(), $object->getObjectURI())) {
			$msg  = 'Backend\Local::createObject(): User Error: ';
			$msg .= 'Object already exists';
			throw new BackendException($msg);
		}

		$caltbl = $this->calTableName;
		$objtbl = $this->objTableName;

		$sql  = 'INSERT INTO `' . $objtbl . '` ';
		$sql .= '(`calendarid`,`objecttype`,`startdate`,`enddate`,';
		$sql .= '`repeating`,`summary`,`calendardata`,`uri`,`lastmodified`) ';
		$sql .= 'SELECT caltbl.`id`, ?, ?, ?, ?, ?, ?, ?, ? ';
		$sql .= 'FROM `' . $caltbl . '` AS caltbl ';
		$sql .= 'WHERE caltbl.`userid` = ? AND caltbl.`uri` = ?';

		$result = \OCP\DB::prepare($sql)->execute(array(
			$this->getType($object->getType()),
			$this->getUTCforMDB($object->getStartDate()->getDateTime()),
			$this->getUTCforMDB($object->getEndDate()->getDateTime()),
			$object->getRepeating(),
			$object->getSummary(),
			$object->getCalendarData(),
			$object->getObjectURI(),
			$this->getUTCforMDB($object->getLastModified()),
			$userId,
			$calendarURI
		));
	}


	/**
	 * update an object
	 * @param Object $object
	 * @throws CacheOutDatedException if calendar does not exist
	 * @return Calendar
	 */
	public function updateObject(Object &$object) {
		$calendarURI = $object->getCalendar()->getUri();
		$userId = $object->getCalendar()->getUserId();

		if (!$this->doesCalendarExist($calendarURI, $userId)) {
			$msg  = 'Backend\Local::updateObject(): Internal Error: ';
			$msg .= 'Calendar not found!';
			throw new CacheOutDatedException($msg);
		}
		if (!$this->doesObjectExist($object->getCalendar(), $object->getObjectURI())) {
			$msg  = 'Backend\Local::updateObject(): User Error: ';
			$msg .= 'Object does not exists';
			throw new BackendException($msg);
		}

		$caltbl = $this->calTableName;
		$objtbl = $this->objTableName;

		$sql  = 'UPDATE objtbl SET `objecttype` = ?, `startdate` = ?, ';
		$sql .= '`enddate` = ?, `repeating` = ?, `summary` = ?, `calendardata` = ?, ';
		$sql .= '`lastmodified` = ? FROM `' . $objtbl . '` AS objtbl, ';
		$sql .= '`' . $caltbl . '` AS caltbl WHERE objtbl.`calendarid` = caltbl.`id` ';
		$sql .= 'AND caltbl.`uri` = ? AND caltbl.`userid` = ? AND objtbl.`uri` = ?';

		$result = \OCP\DB::prepare($sql)->execute(array(
			$this->getType($object->getType()),
			$this->getUTCforMDB($object->getStartDate()->getDateTime()),
			$this->getUTCforMDB($object->getEndDate()->getDateTime()),
			$object->getRepeating(),
			$object->getSummary(),
			$object->getCalendarData(),
			$this->getUTCforMDB($object->getLastModified()),
			$calendarURI,
			$userId,
			$object->getObjectURI()
		));
	}


	/**
	 * move an object to another calendar
	 * @param Object $object
	 * @param Calendar $oldCalendar
	 * @throws CacheOutDatedException if calendar does not exist
	 * @return Calendar
	 */
	public function moveObject(Object &$object, Calendar $oldCalendar) {
		$newCalendarURI = $object->getCalendar()->getUri();
		$oldCalendarURI = $oldCalendar->getUri();
	}


	/**
	 * move an object to another user
	 * @param Object $object
	 * @param Calendar $oldCalendar
	 * @throws CacheOutDatedException if calendar does not exist
	 * @return Calendar
	 */
	public function transferObject(Object &$object, Calendar $oldCalendar) {
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
	public function deleteObject(Object $object){
		$calendarURI = $object->getCalendar()->getUri();
		$objectURI = $object->getObjectURI();
		$userId = $object->getCalendar()->getUserId();

		if (!$this->doesCalendarExist($calendarURI, $userId)) {
			$msg  = 'Backend\Local::createObject(): Internal Error: ';
			$msg .= 'Calendar not fouund!';
			throw new CacheOutDatedException($msg);
		}

		$sql  = 'DELETE * FROM obltbl ';
		$sql .= 'FROM `' . $objtbl . '` AS objtbl, `' . $caltbl . '` AS caltbl ';
		$sql .= 'WHERE objtbl.`uri` = ? AND objtbl.`calendarid` = caltbl.`id` AND ';
		$sql .= 'caltbl.uri = ? AND caltbl.userid = ?';

		$result = \OCP\DB::prepare($sql)->execute(array(
			$objectURI,
			$calendarURI,
			$userid
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
	public function searchByProperties(Calendar $calendar, array $properties=array(), $limit, $offset) {
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
		return date('Y-m-d H:i:s', $datetime->format('U'));
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
		try {
			//return $this->timezoneMapper->find(strval($row['timezone']));
		} catch(DoesNotExistException $ex) {
			return new Timezone('UTC');
		}
	}


	/**
	 * create an object object from row
	 * @param array $row
	 * @return \OCA\Calendar\Db\Object
	 */
	private function createObjectFromRow(&$row, &$calendar) {
		$object = new Object();

		$object->setCalendar($calendar);
		$object->setObjectURI(strval($row['uri']));
		$object->setCalendarData(strval($row['calendardata']));

		return $object;
	}


	/**
	 * @brief get a single objectType
	 * @param mixed (integer|string) $type
	 * @param mixed (integer|string)
	 */
	public function getType($type) {
		if (is_int($type)) {
			return ObjectType::getAsString($type);
		} else {
			return ObjectType::getTypeByString($type);
		}
	}


	/**
	 * @brief get multiple objectTypes
	 * @param mixed (integer|string) $type
	 * @param mixed (integer|string)
	 */
	public function getTypes($type) {
		if (is_int($type)) {
			return ObjectType::getAsString($type);
		} else {
			return ObjectType::getTypesByString($type);
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
}