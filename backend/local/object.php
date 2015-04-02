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

use OCA\Calendar\Backend as BackendUtils;
use OCA\Calendar\Db\ObjectFactory;
use OCA\Calendar\Db\Permissions;
use OCA\Calendar\Utility\ObjectUtility;
use OCA\Calendar\Backend\Exception as BackendException;
use OCA\Calendar\CorruptDataException;
use OCA\Calendar\ICalendar;
use OCA\Calendar\IObject;
use OCA\Calendar\Db\ObjectType;

use OCP\IDBConnection;

class Object extends Local implements BackendUtils\IObjectAPI, BackendUtils\IObjectAPICreate,
	BackendUtils\IObjectAPIUpdate, BackendUtils\IObjectAPIDelete, BackendUtils\IObjectAPIFindInPeriod,
	BackendUtils\IObjectAPISearch {

	/**
	 * @var \OCA\Calendar\ICalendar
	 */
	private $calendar;


	/**
	 * @var integer
	 */
	private $calendarId;


	/**
	 * @var ObjectFactory
	 */
	private $factory;


	/**
	 * @param IDBConnection $db
	 * @param ICalendar $calendar
	 * @param ObjectFactory $factory
	 * @param string $calendarTableName
	 * @param string $objectTableName
	 */
	public function __construct(IDBConnection $db, ICalendar $calendar,
								ObjectFactory $factory,
								$calendarTableName='clndr_calendars',
								$objectTableName='clndr_objects') {
		parent::__construct($db, $calendarTableName, $objectTableName);

		$this->calendar = $calendar;
		$this->calendarId = parent::getCalendarId(
			$calendar->getPrivateUri(),
			$calendar->getUserId()
		);
		$this->factory = $factory;
	}


	/**
	 * {@inheritDoc}
	 */
	public function cache() {
		return false;
	}


	/**
	 * {@inheritDoc}
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
	 * {@inheritDoc}
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
	 * {@inheritDoc}
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
		while($row = $result->fetchColumn()) {
			$uriList[] = $row['uri'];
		}

		return $uriList;
	}


	/**
	 * {@inheritDoc}
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
	 * {@inheritDoc}
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
	 * {@inheritDoc}
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
	 * {@inheritDoc}
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
	 * {@inheritDoc}
	 */
	public function searchByProperties(array $properties=[], $type=ObjectType::ALL, $limit, $offset) {
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
	 * @return \OCA\Calendar\IEntity
	 */
	private function rowToEntity($row) {
		$object = $this->factory->createEntity([
			'calendar' => $this->calendar,
			'uri' => strval($row['uri']),
			'calendarData' => strval($row['calendardata']),
			'ruds' => Permissions::ALL_OBJECT,
		]);

		$object->generateEtag();

		return $object;
	}


	/**
	 * @param \PDOStatement $result
	 * @return \OCA\Calendar\IObjectCollection
	 */
	private function resultToCollection(\PDOStatement $result) {
		$entities = [];

		while($row = $result->fetch()) {
			try {
				$entities[] = $this->rowToEntity($row);
			} catch (CorruptDataException $ex) {
				continue;
			}
		}

		return $this->factory->createCollectionFromEntities($entities);
	}


	/**
	 * get a single objectType
	 * @param integer|string $component
	 * @param string $type
	 * @return integer|string
	 */
	private function getType($component, $type) {
		if ($type === 'string') {
			return ObjectType::getAsString($component);
		} else {
			return ObjectType::getTypeByString(strval($component));
		}
	}


	/**
	 * {@inheritDoc}
	 */
	public function hasUpdated(IObject $object) {
		return true;
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
		} catch(BackendUtils\DoesNotExistException $ex) {
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