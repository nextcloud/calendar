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
use OCA\Calendar\Db\ObjectType;
use OCA\Calendar\Db\Permissions;
use OCA\Calendar\Utility\CalendarUtility;
use OCA\Calendar\Utility\ObjectUtility;

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
				'name' => strval(\OC::$server->getL10N('calendar')
					->t('this ownCloud')),
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
		$sql  = 'SELECT * FROM `' . $this->getCalendarTableName() . '` ';
		$sql .= 'WHERE `uri` = ? AND `userid` = ?';

		$row = $this->queryOne($sql, array(
			$calendarURI,
			$userId
		));

		return $this->createCalendarFromRow($row);
	}


	/**
	 * Find all calendars
	 * @param string $userId
	 * @param integer $limit
	 * @param integer $offset
	 * @return ICalendarCollection
	 */
	public function findCalendars($userId, $limit, $offset) {
		$sql  = 'SELECT * FROM `' . $this->getCalendarTableName() . '`';
		$sql .= 'WHERE `userid` = ? ORDER BY `calendarorder`';

		$result = $this->query($sql, array(
			$userId
		), $limit, $offset);

		$calendarCollection = new CalendarCollection();
		while($row = $result->fetchRow()){
			try{
				$calendar = $this->createCalendarFromRow($row);
				$calendarCollection->add($calendar);
			} catch(CorruptDataException $ex) {
				continue;
			}
		}

		return $calendarCollection;
	}


	/**
	 * counts number of calendars
	 * @param string $userId
	 * @return integer
	 */
	public function countCalendars($userId) {
		$sql  = 'SELECT COUNT(*) FROM `' . $this->getCalendarTableName() . '`';
		$sql .= '` WHERE `userid` = ?';

		return $this->queryNumber($sql, array(
			$userId
		));
	}


	/**
	 * check if a calendar exists
	 * @param string $calendarURI
	 * @param string $userId
	 * @return boolean
	 */
	public function doesCalendarExist($calendarURI, $userId) {
		$sql  = 'SELECT COUNT(*) FROM `' . $this->getCalendarTableName() . '`';
		$sql .= ' WHERE `uri` = ? AND `userid` = ?';

		return ($this->queryNumber($sql, array(
			$calendarURI,
			$userId
		)) !== 0);
	}


	/**
	 * get ctag of a calendar
	 * @param string $calendarURI
	 * @param string $userId
	 * @return integer
	 */
	public function getCalendarsCTag($calendarURI, $userId) {
		$sql  = 'SELECT `ctag` FROM `' . $this->getCalendarTableName() . '`';
		$sql .= 'WHERE `uri` = ? AND `userid` = ?';

		return $this->queryNumber($sql, array(
			$calendarURI,
			$userId
		));
	}


	/**
	 * Create a calendar
	 * @param ICalendar $calendar
	 * @throws CacheOutDatedException if calendar already exists
	 */
	public function createCalendar(ICalendar &$calendar) {
		$this->generatePrivateUri($calendar);

		$sql  = 'INSERT INTO `' . $this->getCalendarTableName() . '` ';
		$sql .= '(`userid`, `displayname`, `uri`, `active`, `ctag`, ';
		$sql .= '`calendarorder`, `calendarcolor`, `timezone`, `components`) ';
		$sql .= 'VALUES(?,?,?,?,?,?,?,?,?)';
		$this->query($sql, $this->getCalendarSqlParams($calendar));
	}


	/**
	 * update a calendar
	 * @param ICalendar $calendar
	 * @throws CacheOutDatedException if calendar does not exist
	 * @return ICalendar
	 */
	public function updateCalendar(ICalendar &$calendar) {
		$calendarId = $this->getCaledarIdByCalendarObject($calendar);

		$sql  = 'UPDATE `' . $this->getCalendarTableName() . '` SET ';
		$sql .= '`userid` = ?, `displayname` = ?, `uri` = ?, `active` = ?, ';
		$sql .= '`ctag` = ?, `calendarorder` = ?, `calendarcolor` = ?, ';
		$sql .= '`timezone` = ?, `components` = ? WHERE `id` = ?';

		$params = $this->getCalendarSqlParams($calendar);
		$params[] = $calendarId;

		$this->query($sql, $params);
	}


	/**
	 * @param ICalendar $calendar
	 * @return array
	 */
	private function getCalendarSqlParams(ICalendar $calendar) {
		return array(
			$calendar->getUserId(),
			$calendar->getDisplayname(),
			$calendar->getPrivateUri(),
			$calendar->getEnabled(),
			$calendar->getCtag(),
			$calendar->getOrder(),
			$calendar->getColor(),
			$calendar->getTimezone(),
			$this->getTypes($calendar->getComponents(), 'string')
		);
	}


	/**
	 * delete a calendar
	 * @param string $calendarURI
	 * @param string $userId
	 * @throws CacheOutDatedException
	 */
	public function deleteCalendar($calendarURI, $userId) {
		$calendarId = $this->getCalendarId($calendarURI, $userId);

		$sql1  = 'DELETE FROM `' . $this->getObjectTableName() . '` ';
		$sql1 .= 'WHERE `calendarid` = ?';
		$this->query($sql1, array(
			$calendarId
		));

		$sql2  = 'DELETE FROM `' . $this->getCalendarTableName() . '` ';
		$sql2 .= 'WHERE `id` = ?';
		$this->query($sql2, array(
			$calendarId
		));
	}


	/**
	 * move a calendar aka rename uri
	 * @param ICalendar $calendar
	 * @param string $oldCalendarURI
	 * @param string $oldUserId
	 * @throws CacheOutDatedException
	 */
	public function moveCalendar(ICalendar &$calendar, $oldCalendarURI,
								 $oldUserId) {
		$calendarId = $this->getCalendarId($oldCalendarURI, $oldUserId);

		$sql  = 'UPDATE `' . $this->getCalendarTableName() . '` ';
		$sql .= 'SET `uri` = ? WHERE `id` = ?';
		$this->query($sql, array(
			$calendar->getPrivateUri(),
			$calendarId,
		));
	}


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
		return $this->queryObjects(
			'WHERE `calendarid` = ? AND `uri` =?',
			array(
				$this->getCaledarIdByCalendarObject($calendar),
				$objectURI,
			),
			$calendar,
			true
		);
	}


	/**
	 * Find objects
	 * @param ICalendar $calendar
	 * @param integer $limit
	 * @param integer $offset
	 * @throws CacheOutDatedException
	 * @return IObjectCollection
	 */
	public function findObjects(ICalendar &$calendar, $limit, $offset) {
		return $this->queryObjects(
			'WHERE `calendarid` = ?',
			array(
				$this->getCaledarIdByCalendarObject($calendar),
			),
			$calendar,
			false,
			$limit,
			$offset
		);
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
	public function findObjectsInPeriod(ICalendar $calendar, \DateTime $start,
										\DateTime $end, $limit, $offset){
		return $this->queryObjects(
			'WHERE `calendarid` = ? AND ' . $this->inPeriodQuery() .
			' ORDER BY `repeating`',
			array_merge(
				array($this->getCaledarIdByCalendarObject($calendar)),
				$this->inPeriodParams($start, $end)
			),
			$calendar,
			false,
			$limit,
			$offset
		);
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
	public function findObjectsByType(ICalendar $calendar, $type, $limit,
									  $offset) {
		return $this->queryObjects(
			'WHERE `calendarid` = ? AND `objecttype` = ?',
			array(
				$this->getCaledarIdByCalendarObject($calendar),
				$this->getType($type, 'string'),
			),
			$calendar,
			false,
			$limit,
			$offset
		);
	}


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
	public function findObjectsByTypeInPeriod(ICalendar $calendar, $type,
											  DateTime $start, DateTime $end,
											  $limit, $offset) {
		return $this->queryObjects(
			'WHERE `calendarid` = ? AND ' . $this->inPeriodQuery() .
			' AND `objecttype` = ? ORDER BY `repeating`',
			array_merge(
				array($this->getCaledarIdByCalendarObject($calendar)),
				$this->inPeriodParams($start, $end),
				array($this->getType($type, 'string'))
			),
			$calendar,
			false,
			$limit,
			$offset
		);
	}


	/**
	 * count objects
	 * @param ICalendar $calendar
	 * @return integer
	 */
	public function countObjects(ICalendar $calendar) {
		$calendarId = $this->getCaledarIdByCalendarObject($calendar);

		$table = $this->getObjectTableName();

		$sql  = 'SELECT COUNT(*) FROM `' . $table . '` WHERE `calendarid` = ?';
		return $this->queryNumber($sql, array(
			$calendarId
		));
	}


	/**
	 * check if object exists
	 * @param ICalendar $calendar
	 * @param string $objectURI
	 * @return boolean
	 */
	public function doesObjectExist(ICalendar $calendar, $objectURI) {
		$calendarId = $this->getCaledarIdByCalendarObject($calendar);

		$table = $this->getObjectTableName();

		$sql  = 'SELECT COUNT(*) FROM `' . $table . '` WHERE `calendarid` = ? ';
		$sql .= 'AND `uri` = ?';
		return ($this->queryNumber($sql, array(
			$calendarId,
			$objectURI
		)) !== 0);
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
		$calendar = $object->getCalendar();

		$calendarId = $this->getCaledarIdByCalendarObject($calendar);
		if ($this->doesObjectExist($calendar, $object->getUri())) {
			throw new BackendException('Object already exists');
		}

		$sql  = 'INSERT INTO `' . $this->getObjectTableName() . '` ';
		$sql .= '(`objecttype`,`startdate`,`enddate`,`repeating`,';
		$sql .= '`summary`,`calendardata`,`lastmodified`,`uri`, `calendarid`) ';
		$sql .= 'VALUES(?, ?, ?, ?, ?, ?, ?, ?, ?)';
		$this->query($sql, $this->getObjectSqlParams($object, $calendarId));

		return $object;
	}


	/**
	 * update an object
	 * @param IObject $object
	 * @throws CacheOutDatedException if calendar does not exist
	 * @throws BackendException
	 */

	public function updateObject(IObject &$object) {
		$calendar = $object->getCalendar();

		$calendarId = $this->getCaledarIdByCalendarObject($calendar);
		if (!$this->doesObjectExist($calendar, $object->getUri())) {
			throw new BackendException('Object does not exists');
		}

		$sql  = 'UPDATE `' . $this->getObjectTableName() . '` SET ';
		$sql .= '`objecttype` = ?, `startdate` = ?, `enddate` = ?, ';
		$sql .= '`repeating` = ?, `summary` = ?, `calendardata` = ?, ';
		$sql .= '`lastmodified` = ? WHERE `uri` = ? and `calendarid` = ?';
		$this->query($sql, $this->getObjectSqlParams($object, $calendarId));
	}


	/**
	 * @param IObject $object
	 * @param integer $calendarId
	 * @return array
	 */
	private function getObjectSqlParams(IObject $object, $calendarId) {
		return array(
			$this->getType($object->getType(), 'string'),
			$this->getUTCforMDB($object->getStartDate()),
			$this->getUTCforMDB($object->getEndDate()),
			$object->getRepeating(),
			$object->getSummary(),
			$object->getCalendarData(),
			$this->getUTCforMDB($object->getLastModified()),
			$object->getUri(),
			$calendarId
		);
	}


	/**
	 * move an object to another calendar
	 * @param IObject $object
	 * @param ICalendar $oldCalendar
	 * @throws CacheOutDatedException if calendar does not exist
	 * @return ICalendar
	 */
	public function moveObject(IObject &$object, ICalendar $oldCalendar) {
		$sql  = 'UPDATE `' . $this->getObjectTableName() . '`';
		$sql .= 'SET `calendarid` = ? WHERE `calendarid` = ?';

		$this->query($sql, array(
			$this->getCaledarIdByCalendarObject($object->getCalendar()),
			$this->getCaledarIdByCalendarObject($oldCalendar)
		));
	}


	/**
	 * delete an object
	 * @param IObject $object
	 * @throws CacheOutDatedException if calendar does not exist
	 */
	public function deleteObject(IObject $object){
		$sql  = 'DELETE FROM `' . $this->getObjectTableName() . '`';
		$sql .= '` WHERE `uri` = ? AND `calendarid` = ?';

		$this->query($sql, array(
			$object->getUri(),
			$this->getCaledarIdByCalendarObject($object->getCalendar()),
		));
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
	public function searchByProperties(ICalendar $calendar,
									   array $properties=array(),
									   $limit, $offset) {
		$calendarId = $this->getCaledarIdByCalendarObject($calendar);

		if (empty($properties)) {
			return $this->findObjects($calendar, $limit, $offset);
		}

		$table = $this->getObjectTableName();

		$sql = 'SELECT * FROM `' . $table . '` WHERE `calendarid` = ?';

		$parameters = array(
			$calendarId
		);
		$sqlWhereClauses = array();

		foreach($properties as $key => $value) {
			$key	= strtoupper($key);
			$value	= strtolower($value);

			$sqlWhereClauses[] = 'WHERE UPPER(`calendardata`) LIKE `%?%`';
			$sqlWhereClauses[] = 'WHERE LOWER(`calendardata`) LIKE `%?%`';

			$parameters[] = $key;
			$parameters[] = $value;
		}

		$sql .= 'AND ' . implode(' AND ', $sqlWhereClauses) . ')';

		$result = $this->query($sql, $parameters, $limit, $offset);

		return $this->createObjectCollectionFromResult($result, $calendar);
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
		//boolval is PHP >= 5.5.0 only
		$calendar->setEnabled((bool) $row['active']);
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
	 * @return \OCP\Calendar\IEntity
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
	 * @param integer $component
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
	 * @return integer (integer|string)
	 */
	public function getTypes($components, $type) {
		if ($type === 'string') {
			return ObjectType::getAsString($components);
		} else {
			return ObjectType::getTypesByString(strval($components));
		}
	}


	/**
	 * returns whether or not a backend can store a
	 * calendar's supported components
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


	/**
	 * @param ICalendar $calendar
	 * @return integer
	 */
	private function getCaledarIdByCalendarObject(ICalendar $calendar) {
		$privateuri = $calendar->getPrivateUri();
		$userId = $calendar->getUserId();

		return $this->getCalendarId($privateuri, $userId);
	}


	/**
	 * get calendar id, false if calendar does not exist
	 * @param string $calendarURI
	 * @param string $userId
	 * @param bool $throw
	 * @return integer (boolean|integer)
	 * @throws CacheOutDatedException
	 */
	private function getCalendarId($calendarURI, $userId, $throw=true) {
		$table = $this->getCalendarTableName();

		$sql  = 'SELECT `id` FROM `' . $table . '` ';
		$sql .= 'WHERE `uri` = ? AND `userid` = ?';
		$id = $this->queryNumber($sql, array(
			$calendarURI,
			$userId
		));

		if ($throw && !$id) {
			$msg = 'Calendar not found!';
			throw new CacheOutDatedException($msg);
		}

		return $id;
	}


	/**
	 * @param string $sql
	 * @param array $params
	 * @return mixed
	 * @throws \OCP\Calendar\MultipleObjectsReturnedException
	 * @throws \OCP\Calendar\CacheOutDatedException
	 */
	private function queryOne($sql, $params) {
		$result = DB::prepare($sql)->execute($params);

		if (DB::isError($result)) {
			$this->throwDBError();
		}

		$row = $result->fetchRow();

		if ($row === false || $row === null){
			$msg = 'No matching entry found';
			throw new CacheOutDatedException($msg);
		}

		$row2 = $result->fetchRow();
		if (($row2 === false || $row2 === null ) === false) {
			$msg = 'More than one result';
			throw new MultipleObjectsReturnedException($msg);
		}

		return $row;
	}


	/**
	 * @param string $sql
	 * @param $params
	 * @return integer
	 */
	private function queryNumber($sql, $params) {
		$result	= DB::prepare($sql)->execute($params);

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
	 * @param string $sql
	 * @param $params
	 * @param integer $limit
	 * @param integer $offset
	 * @return int|\OC_DB_StatementWrapper
	 */
	private function query($sql, $params, $limit=null, $offset=null) {
		$result = DB::prepare($sql, $limit, $offset)->execute($params);

		if (DB::isError($result)) {
			$this->throwDBError();
		}

		return $result;
	}


	/**
	 * generate a private uri
	 * @param ICalendar $calendar
	 */
	private function generatePrivateUri(&$calendar) {
		$displayname = $calendar->getDisplayname();
		$publicuri = $calendar->getPublicUri();
		$userId = $calendar->getUserId();

		if ($displayname !== null && trim($displayname) !== '') {
			$suggestedUri = $displayname;
		} else {
			$suggestedUri = $publicuri;
		}

		while($this->doesCalendarExist($suggestedUri, $userId)) {
			$newSuggestedURI = CalendarUtility::suggestURI($suggestedUri);

			if ($newSuggestedURI === $suggestedUri) {
				break;
			}
			$suggestedUri = $newSuggestedURI;
		}

		$calendar->setPrivateUri($suggestedUri);
	}


	/**
	 * @param \OC_DB_StatementWrapper $result
	 * @param ICalendar $calendar
	 * @return IObjectCollection
	 */
	private function createObjectCollectionFromResult(
		\OC_DB_StatementWrapper $result, $calendar) {
		$objectCollection = new ObjectCollection();
		while($row = $result->fetchRow()){
			try{
				$object = $this->createObjectFromRow($row, $calendar);
				$objectCollection->add($object);
			} catch(CorruptDataException $ex) {
				continue;
			}
		}

		return $objectCollection;
	}


	/**
	 * @param string $sql
	 * @param string $params
	 * @param ICalendar $calendar
	 * @param bool $queryOne
	 * @param int|null $limit
	 * @param int|null $offset
	 * @return IObjectCollection|IObject
	 */
	private function queryObjects($sql, $params, ICalendar $calendar,
								  $queryOne=true, $limit=null, $offset=null) {
		$table = $this->getObjectTableName();
		$sqlQuery  = 'SELECT * FROM ' . $table . ' ';
		$sqlQuery .= $sql;

		if ($queryOne) {
			$row = $this->queryOne($sqlQuery, $params);
			return $this->createObjectFromRow($row, $calendar);
		} else {
			$result = $this->query($sqlQuery, $params, $limit, $offset);
			return $this->createObjectCollectionFromResult($result, $calendar);
		}
	}


	/**
	 * @return string
	 */
	private function inPeriodQuery() {
		$sql  = '((`startdate` >= ? AND `enddate` <= ? AND `repeating` = 0)';
        $sql .= ' OR (`enddate` >= ? AND `startdate` <= ? AND `repeating` = 0)';
        $sql .= ' OR (`startdate` <= ? AND `repeating` = 1))';

		return $sql;
	}


	/**
	 * @param DateTime $start
	 * @param DateTime $end
	 * @return array
	 */
	private function inPeriodParams(\DateTime $start, \DateTime $end) {
		$utcStart = $this->getUTCforMDB($start);
		$utcEnd = $this->getUTCforMDB($end);

		return array(
			$utcStart,
			$utcEnd,
			$utcStart,
			$utcEnd,
			$utcEnd,
		);
	}
}