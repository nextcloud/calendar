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

use \OCA\Calendar\Db\Calendar;
use \OCA\Calendar\Db\CalendarCollection;

use \OCA\Calendar\Db\Object;
use \OCA\Calendar\Db\ObjectCollection;

use \OCA\Calendar\Db\Timezone;
use \OCA\Calendar\Db\TimezoneCollection;

use \OCA\Calendar\Db\ObjectType;
use \OCA\Calendar\Db\Permissions;

use \DateTime;

class Local extends Backend {
	
	private $calTableName;
	private $objTableName;

	private static $typeMapper = array(
		ObjectType::EVENT	=> 'VEVENT',
		ObjectType::JOURNAL => 'VJOURNAL',
		ObjectType::TODO	=> 'VTODO',
	);

	public function __construct(IAppContainer $api, 
								array $parameters){

		$this->calTableName = (array_key_exists('calTableName', $parameters) ? 
									$parameters['calTableName'] : 
									'*PREFIX*clndr_calendars');
		$this->objTableName = (array_key_exists('objTableName', $parameters) ? 
									$parameters['objTableName'] : 
									'*PREFIX*clndr_objects');

		parent::__construct($api, 'local');
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
	 * Find a calendar
	 * @param string $calendarURI
	 * @param string $userId
	 * @throws CacheOutDatedException if calendar does not exist
	 * @throws MultipleObjectsReturnedException if more than one result found
	 * @return Calendar
	 */
	public function findCalendar($calendarURI, $userId) {
		$sql  = 'SELECT * FROM `?` ';
		$sql .= 'WHERE `uri` = ? AND `userid` = ?';
		$result = \OCP\DB::prepare($sql)->execute(array(
			$this->calTableName,
			$calendarURI,
			$userId
		));
		$row = $result->fetchRow();

		if($row === false || $row === null){
			$msg  = 'Backend\Local::findCalendar(): Internal Error: ';
			$msg .= 'No matching entry found';
			throw new CacheOutDatedException($msg);
		}

		$row2 = $result->fetchRow();
		if(($row2 === false || $row2 === null ) === false) {
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
		$sql  = 'SELECT * FROM `?` ';
		$sql .= 'WHERE `userid` = ? ORDER BY `calendarorder`';
		$result = \OCP\DB::prepare($sql, $limit, $offset)->execute(array(
			$this->calTableName,
			$userId
		));

		$calendarCollection = new CalendarCollection();
		while($row = $result->fetchRow()){
			try{
				$calendar = $this->createCalendarFromRow($row);
			} catch(CorruptCalendarException $ex) {
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
		$sql  = 'SELECT COUNT(*) FROM `?` ';
		$sql .= 'WHERE `userid` = ?';

		$result	= \OCP\DB::prepare($sql)->execute(array(
			$this->calTableName,
			$userId
		));
		$count = $result->fetchOne();

		if(gettype($count) !== 'integer') {
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
		$sql  = 'SELECT COUNT(*) FROM `?` ';
		$sql .= 'WHERE `uri` = ? AND `userid` = ?';

		$result	= \OCP\DB::prepare($sql)->execute(array(
			$this->calTableName,
			$calendarURI,
			$userId
		));
		$count = $result->fetchOne();

		if(gettype($count) !== 'integer') {
			$count = intval($count);
		}

		if($count === 0) {
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
		$sql  = 'SELECT `ctag` FROM `?` ';
		$sql .= 'WHERE `uri` = ? AND `userid` = ?';

		$result	= \OCP\DB::prepare($sql)->execute(array(
			$this->calTableName,
			$calendarURI,
			$userId
		));
		$ctag = $result->fetchOne();

		if(gettype($ctag) !== 'integer') {
			$ctag = intval($ctag);
		}

		return $ctag;
	}

	/**
	 * Create a calendar
	 * @param Calendar $calendar
	 * @throws CacheOutDatedException if calendar already exists
	 * @return Calendar
	 */
	public function createCalendar(Calendar &$calendar) {
		$calendarURI = $calendar->getUri();
		$userId = $calendar->getUserId();

		if($this->doesCalendarExist($calendarURI, $userId) === true) {
			$msg  = 'Backend\Local::createCalendar(): Internal Error: ';
			$msg .= 'Calendar with uri and userid combination already exists!';
			throw new CacheOutDatedException($msg);
		}

		$sql  = 'INSERT INTO `?` ';
		$sql .= '(`userid`, `displayname`, `uri`, `active`, `ctag`, `calendarorder`, ';
		$sql .= '`calendarcolor`, `timezone`, `components`) ';
		$sql .= 'VALUES(?,?,?,?,?,?,?,?,?)';
		$result = \OCP\DB::prepare($sql)->execute(array(
			$this->calTableName,
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

		return $calendar;
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
		if($this->doesCalendarExist($oldCalendarURI, $oldUserId) === false) {
			$msg  = 'Backend\Local::updateCalendar(): Internal Error: ';
			$msg .= 'Calendar with uri and userid combination not found!';
			throw new CacheOutDatedException($msg);
		}

		$sql  = 'UPDATE `?` SET ';
		$sql .= '`userid` = ?, `displayname` = ?, `uri` = ?, `active` = ?, `ctag` = ?, ';
		$sql .= '`calendarorder` = ?, `calendarcolor` = ?, `timezone` = ?, `components` = ? ';
		$sql .= 'WHERE `userid` = ? AND `uri` = ?';
		$result = \OCP\DB::prepare($sql)->execute(array(
			$this->calTableName,
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

		return $calendar;
	}

	/**
	 * delete a calendar
	 * @param string $calendarURI
	 * @param string $userId
	 * @return boolean
	 */
	public function deleteCalendar($calendarURI, $userId) {
		$sql  = 'DELETE FROM `?` ';
		$sql .= '`uri` = ? AND `userid` = ?';
		$result = \OCP\DB::prepare($sql)->execute(array(
			$this->calTableName,
			$calendarURI,
			$userId
		));

		return $result;
	}

	/**
	 * merge two calendars
	 * @param Calendar $calendar
	 * @param string $oldCalendarURI
	 * @param string $oldUserId
	 * @return boolean
	 */
	public function mergeCalendar(Calendar $calendar, $oldCalendarURI, $oldUserId) {
		$newCalendarURI = $calendar->getUri();
		$newUserId = $calendar->getUserId();

		//TODO - implement

		//$this->deleteCalendar($oldCalendarURI, $oldUserId);
	}

	public function moveCalendar(Calendar &$calendar, $oldCalendarURI, $oldUserId) {
		
	}

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

		$sql  = 'SELECT `' . $this->objTableName . '`.* FROM `' . $this->objTableName . '`, `' . $this->calTableName . '` ';
		$sql .= 'WHERE `' . $this->objTableName . '`.`calendarid`=`' . $this->calTableName . '`.`id` ';
		$sql .= 'AND `' . $this->calTableName . '`.`uri` = ? AND `' . $this->calTableName . '`.`userid` = ? ';
		$sql .= 'AND `' . $this->objTableName . '`.`uri`= ?';
		$result = \OCP\DB::prepare($sql)->execute(array($calendarURI, $userId, $objectURI));
		$row = $result->fetchRow();

		if($row === false || $row === null){
			$msg  = 'Backend\Local::findObject(): Internal Error: ';
			$msg .= 'No matching entry found';
			throw new CacheOutDatedException($msg);
		}

		$row2 = $result->fetchRow();
		if(($row2 === false || $row2 === null ) === false) {
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

		$sql  = 'SELECT `' . $this->objTableName . '`.* FROM `' . $this->objTableName . '`, `' . $this->calTableName . '` ';
		$sql .= 'WHERE `' . $this->objTableName . '`.`calendarid`=`' . $this->calTableName . '`.`id` ';
		$sql .= 'AND `' . $this->calTableName . '`.`uri` = ? AND `' . $this->calTableName . '`.`userid` = ?';
		$result = \OCP\DB::prepare($sql, $limit, $offset)->execute(array(
			$calendarURI,
			$userId
		)); //add limit offset thingy

		$objectCollection = new ObjectCollection();
		while($row = $result->fetchRow()){
			try{
				$object = $this->createObjectFromRow($row, $calendar);
			} catch(CorruptObjectException $ex) {
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

		$sql  = 'SELECT `' . $this->objTableName . '`.* FROM `' . $this->objTableName . '`, `' . $this->calTableName . '` ';
		$sql .= 'WHERE `' . $this->objTableName . '`.`calendarid`=`' . $this->calTableName . '`.`id`';
		$sql .= ' AND `' . $this->calTableName . '`.`uri` = ? AND `' . $this->calTableName . '`.`userid` = ?';
        $sql .= ' AND ((`' . $this->objTableName . '.startdate` >= ? AND ';
        $sql .= '`' . $this->objTableName . '.enddate` <= ? AND `' . $this->objTableName . '.repeating` = 0)';
        $sql .= ' OR (`' . $this->objTableName . '.enddate` >= ? AND ';
        $sql .= '`' . $this->objTableName . '.startdate` <= ? AND `' . $this->objTableName . '.repeating` = 0)';
        $sql .= ' OR (`' . $this->objTableName . '.startdate` <= ? AND `' . $this->objTableName . '.repeating` = 1))';

		$start	= $this->getUTCforMDB($start);
		$end	= $this->getUTCforMDB($end);
		$result	= $stmt->execute(array(
					$calendarURI, $userId,
					$start, $end,
					$start, $end,
					$end));

		$objectCollection = new ObjectCollection();
		while($row = $result->fetchRow()){
			try{
				$object = $this->createObjectFromRow($row, $calendar);
			} catch(CorruptObjectException $ex) {
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
		$type = static::$typeMapper[$type];


		$sql  = 'SELECT `' . $this->objTableName . '`.* FROM `' . $this->objTableName . '`, `' . $this->calTableName . '` ';
		$sql .= 'WHERE `' . $this->objTableName . '`.`calendarid`=`' . $this->calTableName . '`.`id` ';
		$sql .= 'AND `' . $this->calTableName . '`.`uri` = ? and `' . $this->calTableName . '`.`userid` = ? AND `' . $this->objTableName . '`.`objecttype` = ?';
		$result = \OCP\DB::prepare($sql)->execute(array($calendarURI, $userId, $type));

		$objectCollection = new ObjectCollection();
		while($row = $result->fetchRow()){
			try{
				$object = $this->createObjectFromRow($row, $calendar);
			} catch(CorruptObjectException $ex) {
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

		$sql  = 'SELECT `' . $this->objTableName . '`.* FROM `' . $this->objTableName . '`, `' . $this->calTableName . '` ';
		$sql .= 'WHERE `' . $this->objTableName . '`.`calendarid`=`' . $this->calTableName . '`.`id`';
		$sql .= ' AND `' . $this->calTableName . '`.`uri` = ? AND `' . $this->calTableName . '`.`userid` = ?';
        $sql .= ' AND ((`' . $this->objTableName . '.startdate` >= ? AND `' . $this->objTableName . '.enddate` <= ? AND `' . $this->objTableName . '.repeating` = 0)';
        $sql .= ' OR (`' . $this->objTableName . '.enddate` >= ? AND `' . $this->objTableName . '.startdate` <= ? AND `' . $this->objTableName . '.repeating` = 0)';
        $sql .= ' OR (`' . $this->objTableName . '.startdate` <= ? AND `' . $this->objTableName . '.repeating` = 1))';
        $sql .= ' AND `' . $this->objTableName . '.objecttype` = ?';

		$start	= $this->getUTCforMDB($start);
		$end	= $this->getUTCforMDB($end);
		$result	= $stmt->execute(array(
					$calendarURI, $userId,
					$start, $end,
					$start, $end,
					$end,
					$type));

		$objectCollection = new ObjectCollection();
		while($row = $result->fetchRow()){
			try{
				$object = $this->createObjectFromRow($row, $calendar);
			} catch(CorruptObjectException $ex) {
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

		$sql  = 'SELECT COUNT(*) FROM `' . $this->objTableName . '`, `' . $this->calTableName . '` ';
		$sql .= 'WHERE `' . $this->objTableName . '`.`calendarid`=`' . $this->calTableName . '`.`id` ';
		$sql .= 'AND `' . $this->calTableName . '`.`uri` = ? AND `' . $this->calTableName . '`.`userid` = ?';

		//TODO validate if sql query is correct

		$result	= \OCP\DB::prepare($sql)->execute(array(
			$calendarURI,
			$userId
		));
		$count = $result->fetchOne();

		if(gettype($count) !== 'integer') {
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

		$sql  = 'SELECT COUNT(*) FROM `' . $this->objTableName . '`, `' . $this->calTableName . '` ';
		$sql .= 'WHERE `' . $this->objTableName . '`.`calendarid`=`' . $this->calTableName . '`.`id` ';
		$sql .= 'AND `' . $this->calTableName . '`.`uri` = ? AND `' . $this->calTableName . '`.`userid` = ?';

		//TODO validate if sql query is correct

		$result	= \OCP\DB::prepare($sql)->execute(array(
			$calendarURI,
			$userId
		));
		$count = $result->fetchOne();

		if(gettype($count) !== 'integer') {
			$count = intval($count);
		}

		if($count === 0) {
			return false;
		} else {
			return true;
		}
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
	 * @return Object
	 */
	public function createObject(Object &$object) {
		$calendarURI = $object->calendar->getri();
		$userId = $object->calendar->getUserId();

		if($this->doesCalendarExist($calendarURI, $userId) === true) {
			$msg  = 'Backend\Local::createObject(): Internal Error: ';
			$msg .= 'Calendar with uri and userid combination already exists!';
			throw new CacheOutDatedException($msg);
		}

		if($this->doesObjectExist($calendarURI, $userId) === true) {
			$msg  = 'Backend\Local::createObject(): User Error: ';
			$msg .= 'Object already exists';
			throw new BackendException($msg);
		}

		//TODO - update to fit new object structure

		$sql  = 'INSERT INTO `' . $this->objTableName . '` ';
		$sql .= '(`calendarid`,`objecttype`,`startdate`,`enddate`,`repeating`,`summary`,`calendardata`,`uri`,`lastmodified`) ';
		$sql .= 'VALUES(?,?,?,?,?,?,?,?,?)';
		$result = \OCP\DB::prepare($sql)->execute(array(
			$calendarDBId,
			$object->getType(),
			$object->getStartDate(),
			$object->getEndDate(),
			$object->getRepeating(),
			$object->getSummary(),
			$object->getCalendarData(),
			$object->getObjectURI(),
			$object->gerLastModified(),
		));

		return $object;
	}

	/**
	 * update a calendar
	 * @param Object $object
	 * @param Calendar $oldCalendar
	 * @throws CacheOutDatedException if calendar does not exist
	 * @return Calendar
	 */
	public function updateObject(Object &$object, Calendar $oldCalendar) {
		$calendarId		= $object->getCalendarid();
		$userId			= $object->getUserId();
		$calendarDBId	= $this->getCalendarDBId($calendarId, $userId);

		$sql  = 'INSERT INTO `' . $this->objTableName . '` ';
		$sql .= '(`calendarid`,`objecttype`,`startdate`,`enddate`,`repeating`,`summary`,`calendardata`,`uri`,`lastmodified`) ';
		$sql .= 'VALUES(?,?,?,?,?,?,?,?,?)';
		$result = \OCP\DB::prepare($sql)->execute(array(
			$calendarDBId,
			$object->getType(),
			$object->getStartDate(),
			$object->getEndDate(),
			$object->getRepeating(),
			$object->getSummary(),
			$object->getCalendarData(),
			$object->getObjectURI(),
			$object->gerLastModified(),
		));

		return $object;
	}

	public function deleteObject(Object $object){
		$userId		= $object->getUserId();
		$calendarId	= $object->getCalendarId();
		$objectURI	= $object->getObjectURI();

		$sql  = 'DELETE * FROM `' . $this->objTableName . '`';
		$sql .= 'LEFT OUTER JOIN `' . $this->calTableName . '` ON ';
		$sql .= '`' . $this->objTableName . '.calendarid`=`' . $this->calTableName . '.id`';
		$sql .= 'WHERE `' . $this->calTableName . '.uri` = ? AND `' . $this->calTableName . '.userid` = ?';
		$sql .= ' AND `' . $this->objTableName . '.uri` = ?';
		$result = \OCP\DB::prepare($sql)->execute(array(
			$calendarId, $userId,
			$objectURI));

		return true;
	}

	public function searchByProperties($properties=array(), $calendarId=null, $userId=null) {
		if($calendarId === null || $userId === null) {
			return array();
		}

		if(empty($properties)) {
			return $this->findObjects($calendarId, $userId);
		}

		$sql  = 'SELECT `' . $this->objTableName . '`.* FROM `' . $this->objTableName . '`, `' . $this->calTableName . '` ';
		$sql .= 'WHERE `' . $this->objTableName . '`.`calendarid`=`' . $this->calTableName . '`.`id` ';
		$sql .= 'AND `' . $this->calTableName . '`.`uri` = ? AND `' . $this->calTableName . '`.`userid` = ?';

		$parameters = array($calendarId, $userId);
		$sqlWhereClauses = array();

		foreach($properties as $key => $value) {
			$key	= strtoupper($key);
			$value	= strtolower($value);

			$sqlWhereClauses[] = 'WHERE UPPER(`' . $this->objTableName . '.calendardata`) LIKE `%?%`';
			$sqlWhereClauses[] = 'WHERE LOWER(`' . $this->objTableName . '.calendardata`) LIKE `%?%`';

			$parameters[] = $key;
			$parameters[] = $value;
			
		}

		$sql .= 'AND (';
		$sql .= implode(' AND ', $sqlWhereClauses);
		$sql .= ')';

		$result = \OCP\DB::prepare($sql)->execute($parameters);

		$objectCollection = array();
		while($row = $result->fetchRow()){
			$entity = new Object($row);
			$this->completeObjectEntity($entity, $row);
			$objectCollection->add($entity);
		}

		return $objectCollection;
	}

	private function getUTCforMDB($datetime){
		return date('Y-m-d H:i:s', $datetime->format('U'));
	}

	private function getCalendarDBId($calendarId=null, $userId=null) {
		if($calendarId === null || $userId === null) {
			return null;
		}

		$sql	= 'SELECT id from `' . $this->calTableName . '` WHERE `uri` = ? AND `userid` = ?';
		$result	= \OCP\DB::prepare($sql)->execute(array($calendarURI, $userId));

		$calendarId	= $result->fetchOne();
		return $calendarId;
	}

	private function createCalendarFromRow(&$row) {
		$calendar = new Calendar();

		$calendar->setUserId((string) $row['userid']);
		$calendar->setOwnerId((string) $row['userid']);
		$calendar->setBackend((string) $this->backend);
		$calendar->setUri((string) $row['uri']);
		$calendar->setDisplayname((string) $row['displayname']);
		$calendar->setComponents((int) ObjectType::getTypesByString($row['components']));
		$calendar->setCtag((int) $row['ctag']);
		$calendar->setTimezone($this->createTimezoneFromRow($row));
		$calendar->setColor(($row['calendarcolor'] === null) ? '#ffffff' : (string) $row['calendarcolor']);
		$calendar->setOrder((int) $row['calendarorder']);
		$calendar->setEnabled((bool) $row['active']);
		$calendar->setCruds(Permissions::ALL);

		$calendar->setComponents((int) $this->createComponentsFromRow($row));

		if($calendar->isValid() !== true) {
			//try to fix the calendar
			$calendar->fix();

			//check again
			if($calendar->isValid() !== true) {
				$msg  = 'Backend\Local::createCalendarFromRow(): Internal Error: ';
				$msg .= 'Received calendar data is not valid and not fixable! ';
				$msg .= '(user:"' . $calendar->getUserId() . '"; ';
				$msg .= 'calendar:"' . $calendar->getUri() . '")';
				throw new CorruptCalendarException($msg);
			}
		}

		return $calendar;
	}

	private function createComponentsFromRow($row) {
		return ObjectType::ALL;
	}

	private function createTimezoneFromRow($row) {
		return new Timezone();
		//return new Timezone($row['timezone');
	}

	private function createObjectFromRow(&$row, $calendar) {
		$object = new Object();
		$object->setCalendar($calendar);
		$object->setObjectURI($row['uri']);
		$object->setRuds(Permissions::ALL);
		$object->setCalendarData($row['calendardata']);

		return $object;
	}

	public function getType($type=null) {
		$typeMapper = static::$typeMapper;
		if(is_string($type)) {
			$typeMapper = array_flip($typeMapper);
		}
		if(array_key_exists($type, $typeMapper)) {
			return $typeMapper[$type];
		}

		return null;
	}

	public function getTypes($type=null) {
		if(is_string($type)) {
			if(substr_count($type, ', ')) {
				$list = explode(', ', $type);
			}
			if(substr_count($type, ',')) {
				$list = explode(',', $type);
			}
			if(substr_count($type, ' ')) {
				$list = explode($type, ' ');
			}
		} elseif(is_int($type)) {
			$newType = array();
			if(ObjectType::EVENT & $type) {
				$newType[] = static::$typeMapper[ObjectType::EVENT];
			}
			if(ObjectType::JOURNAL & $type) {
				$newType[] = static::$typeMapper[ObjectType::EVENT];
			}
			if(ObjectType::TODO & $type) {
				$newType[] = static::$typeMapper[ObjectType::EVENT];
			}
				
		}

		
	}

	public function fetchCalendarPropertiesFromRemote() {
		return true;
	}

	/**
	 * @brief returns whether or not a backend can store a calendar's color
	 * @returns boolean
	 * 
	 * This method returns a boolean
	 * This method is mandatory!
	 */
	public function canStoreColor() {
		return true;
	}

	/**
	 * @brief returns whether or not a backend can store a calendar's supported components
	 * @returns boolean
	 * 
	 * This method returns a boolean
	 * This method is mandatory!
	 */
	public function canStoreComponents() {
		return true;
	}

	/**
	 * @brief returns whether or not a backend can store a calendar's displayname
	 * @returns boolean
	 * 
	 * This method returns a boolean
	 * This method is mandatory!
	 */
	public function canStoreDisplayname() {
		return true;
	}

	/**
	 * @brief returns whether or not a backend can store if a calendar is enabled
	 * @returns boolean
	 * 
	 * This method returns a boolean
	 * This method is mandatory!
	 */
	public function canStoreEnabled() {
		return true;
	}

	/**
	 * @brief returns whether or not a backend can store a calendar's order
	 * @returns boolean
	 * 
	 * This method returns a boolean
	 * This method is mandatory!
	 */
	public function canStoreOrder() {
		return true;
	}
}