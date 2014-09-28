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
namespace OCA\Calendar\Backend\Local;

use OCA\Calendar\Db\ObjectCollection;
use OCA\Calendar\Utility\ObjectUtility;
use OCA\Calendar\Backend\Exception as BackendException;
use OCA\Calendar\CorruptDataException;
use OCP\Calendar\ICalendar;
use OCP\Calendar\IObject;
use OCP\Calendar\IObjectAPI;
use OCP\Calendar\IObjectCollection;
use OCP\Calendar\CacheOutDatedException;

use OCP\AppFramework\Db\DoesNotExistException;
use OCP\AppFramework\Db\MultipleObjectsReturnedException;
use OCA\Calendar\Db\ObjectType;
use OCP\IDb;

class Object extends Local implements IObjectAPI {

	/**
	 * @var \OCP\Calendar\ICalendar
	 */
	private $calendar;


	/**
	 * @var integer
	 */
	private $calendarId;


	/**
	 * @param IDb $db
	 * @param ICalendar $calendar
	 * @param string $calendarTableName
	 * @param string $objectTableName
	 */
	public function __construct(IDb $db, ICalendar &$calendar,
								$calendarTableName='clndr_calendars',
								$objectTableName='clndr_objects') {
		parent::__construct($db, $calendarTableName, $objectTableName);

		$this->calendar = $calendar;
		$this->calendarId = parent::getCalendarId(
			$calendar->getPrivateUri(),
			$calendar->getUserId()
		);
	}


	/**
	 * @return boolean
	 */
	public function cache() {
		return false;
	}


	/**
	 * find object
	 * @param string $objectURI
	 * @param integer $type
	 * @throws CacheOutDatedException if calendar does not exist
	 * @throws DoesNotExistException
	 * @throws MultipleObjectsReturnedException if more than one result found
	 * @return IObject
	 */
	public function find($objectURI, $type=ObjectType::ALL) {
		$sql  = 'SELECT * FROM `' . $this->getObjectTableName() . '` ';
		$sql .= 'WHERE `calendarid` = ? AND `uri` = ?';
		$params = [
			$this->getCalendarId(),
			$objectURI,
		];

		$this->addTypeQuery($type, $sql, $params);

		$row = $this->queryOne($sql, $params);
		return $this->rowToEntity($row);
	}


	/**
	 * Find objects
	 * @param integer $type
	 * @param integer $limit
	 * @param integer $offset
	 * @throws CacheOutDatedException
	 * @return IObjectCollection
	 */
	public function findAll($type=ObjectType::ALL, $limit=null, $offset=null) {
		$sql  = 'SELECT * FROM `' . $this->getObjectTableName() . '` ';
		$sql .= 'WHERE `calendarid` = ?';
		$params = [
			$this->getCalendarId(),
		];

		$this->addTypeQuery($type, $sql, $params);

		$result = $this->query($sql, $params, $limit, $offset);
		return $this->resultToCollection($result);
	}


	/**
	 * List all objects
	 * @param integer $type
	 * @throws CacheOutDatedException
	 * @return IObjectCollection
	 */
	public function listAll($type=ObjectType::ALL) {
		$sql  = 'SELECT * FROM `' . $this->getObjectTableName() . '` ';
		$sql .= 'WHERE `calendarid` = ?';
		$params = [
			$this->getCalendarId()
		];

		$this->addTypeQuery($type, $sql, $params);

		$result = $this->query($sql, $params);

		$uriList = [];
		while($row = $result->fetchRow()) {
			$uriList[] = $row['uri'];
		}

		return $uriList;
	}


	/**
	 * Find objects in period
	 * @param \DateTime $start
	 * @param \DateTime $end
	 * @param integer $type
	 * @param integer $limit
	 * @param integer $offset
	 * @throws CacheOutDatedException
	 * @return IObjectCollection
	 */
	public function findAllInPeriod(\DateTime $start, \DateTime $end,
									$type=ObjectType::ALL,
									$limit, $offset){
		$sql  = 'SELECT * FROM `' . $this->getObjectTableName() . '` ';
		$sql .= 'WHERE `calendarid` = ?';
		$params = [
			$this->getCalendarId(),
		];

		$this->addPeriodQuery($start, $end, $sql, $params);
		$this->addTypeQuery($type, $sql, $params);

		$sql .= ' ORDER BY `repeating`';

		$result = $this->query($sql, $params, $limit, $offset);
		return $this->resultToCollection($result);
	}


	/**
	 * Create an object
	 * @param IObject $object
	 * @throws CacheOutDatedException if calendar already exists
	 * @throws BackendException if object already exists
	 * @return IObject
	 */
	public function create(IObject $object) {
		$calendarId = $this->getCalendarId();
		if ($this->doesObjectExist($object->getUri())) {
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
	 * @return IObject
	 */
	public function update(IObject $object) {
		$calendarId = $this->getCalendarId();
		if (!$this->doesObjectExist($object->getUri())) {
			throw new BackendException('Object does not exists');
		}

		$sql  = 'UPDATE `' . $this->getObjectTableName() . '` SET ';
		$sql .= '`objecttype` = ?, `startdate` = ?, `enddate` = ?, ';
		$sql .= '`repeating` = ?, `summary` = ?, `calendardata` = ?, ';
		$sql .= '`lastmodified` = ? WHERE `uri` = ? and `calendarid` = ?';
		$this->query($sql, $this->getObjectSqlParams($object, $calendarId));

		return $object;
	}


	/**
	 * @param IObject $object
	 * @param integer $calendarId
	 * @return array
	 */
	private function getObjectSqlParams(IObject $object, $calendarId) {
		return [
			$this->getType($object->getType(), 'string'),
			$this->getUTCforMDB($object->getStartDate()),
			$this->getUTCforMDB($object->getEndDate()),
			$object->getRepeating(),
			$object->getSummary(),
			$object->getCalendarData(),
			$this->getUTCforMDB($object->getLastModified()),
			$object->getUri(),
			$calendarId
		];
	}


	/**
	 * delete an object
	 * @param IObject $object
	 * @throws CacheOutDatedException if calendar does not exist
	 * @return boolean
	 */
	public function delete(IObject $object){
		$sql  = 'DELETE FROM `' . $this->getObjectTableName() . '` ';
		$sql .= 'WHERE `uri` = ? AND `calendarid` = ?';

		$this->query($sql, [
			$object->getUri(),
			$this->getCalendarId()
		]);

		return true;
	}


	/**
	 * search objects by property
	 * @param array $properties
	 * @param integer $limit
	 * @param integer $offset
	 * @return IObjectCollection
	 * @throws CacheOutDatedException
	 */
	public function searchByProperties(array $properties=[], $limit, $offset) {
		if (empty($properties)) {
			return $this->findAll($limit, $offset);
		}

		$table = $this->getObjectTableName();

		$sql = 'SELECT * FROM `' . $table . '` WHERE `calendarid` = ?';

		$parameters = [
			$this->getCalendarId()
		];
		$sqlWhereClauses = [];

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

		return $this->resultToCollection($result);
	}


	/**
	 * get UTC date for database
	 * @param \DateTime $datetime
	 * @return string
	 */
	private function getUTCforMDB(\DateTime $datetime){
		return ObjectUtility::getUTCforMDB($datetime);
	}


	/**
	 * create an object object from row
	 * @param array $row
	 * @return \OCP\Calendar\IEntity
	 */
	private function rowToEntity(&$row) {
		$object = new \OCA\Calendar\Db\Object();

		$object->setUri(strval($row['uri']));
		$object->setCalendarData(strval($row['calendardata']));

		return $object;
	}


	/**
	 * @param \OC_DB_StatementWrapper $result
	 * @return \OCP\Calendar\IObjectCollection
	 */
	private function resultToCollection(\OC_DB_StatementWrapper $result) {
		$objects = new ObjectCollection();

		while($row = $result->fetchRow()) {
			try {
				$object = $this->rowToEntity($row);
				$objects[] = $object;
			} catch (CorruptDataException $ex) {
				continue;
			}
		}

		return $objects;
	}


	/**
	 * get a single objectType
	 * @param integer|string $component
	 * @param string $type
	 * @return integer|string
	 */
	public function getType($component, $type) {
		if ($type === 'string') {
			return ObjectType::getAsString($component);
		} else {
			return ObjectType::getTypeByString(strval($component));
		}
	}


	/**
	 * @param \DateTime $start
	 * @param \DateTime $end
	 * @param string &$sql
	 * @param array &$params
	 */
	private function addPeriodQuery(\DateTime $start, \DateTime $end, &$sql, &$params) {
		$start->modify('-1 day');
		$end->modify('+1 day');

		$sql .= ' AND ((`startdate` >= ? AND `enddate` <= ? AND `repeating` = 0)';
		$sql .= ' OR (`enddate` >= ? AND `startdate` <= ? AND `repeating` = 0)';
		$sql .= ' OR (`startdate` <= ? AND `repeating` = 1))';

		$utcStart = $this->getUTCforMDB($start);
		$utcEnd = $this->getUTCforMDB($end);

		$params = array_merge($params, [
			$utcStart,
			$utcEnd,
			$utcStart,
			$utcEnd,
			$utcEnd,
		]);
	}


	/**
	 * @param integer $type
	 * @param string &$sql
	 * @param array &$params
	 * @return void
	 */
	private function addTypeQuery($type, &$sql, &$params) {
		$sqlElements = [];

		if (ObjectType::EVENT & $type) {
			$sqlElements[] = '`objecttype` = ?';
			$params[] = $this->getType(ObjectType::EVENT, 'string');
		}
		if (ObjectType::JOURNAL & $type) {
			$sqlElements[] = '`objecttype` = ?';
			$params[] = $this->getType(ObjectType::JOURNAL, 'string');
		}
		if (ObjectType::TODO & $type) {
			$sqlElements[] = '`objecttype` = ?';
			$params[] = $this->getType(ObjectType::TODO, 'string');
		}

		if (count($sqlElements) === 0) {
			return;
		}

		$sql .= ' AND (';
		$sql .= implode(' OR ', $sqlElements);
		$sql .= ')';
	}


	/**
	 * @param string $objectUri
	 * @return boolean
	 */
	private function doesObjectExist($objectUri) {
		try {
			$this->find($objectUri);
			return true;
		} catch(DoesNotExistException $ex) {
			return false;
		} catch(CorruptDataException $ex) {
			return false;
		}
	}


	/**
	 * @return integer
	 */
	protected function getCalendarId() {
		return $this->calendarId;
	}
}