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
namespace OCA\Calendar\Cache\Object;

use OCA\Calendar\Db\Mapper;
use OCA\Calendar\Db\ObjectFactory;
use OCA\Calendar\Db\ObjectType;
use OCA\Calendar\ICalendar;
use OCA\Calendar\Utility\ObjectUtility;
use OCA\Calendar\IObject;
use OCA\Calendar\IObjectCollection;

use OCP\AppFramework\Db\DoesNotExistException;
use OCP\AppFramework\Db\MultipleObjectsReturnedException;
use OCP\IDBConnection;

class Cache extends Mapper {

	/**
	 * @var ICalendar
	 */
	protected $calendar;


	/**
	 * attributes to query
	 * @var string
	 */
	protected $attributes;


	/**
	 * @param IDBConnection $db
	 * @param ICalendar $calendar
	 * @param ObjectFactory $objectFactory
	 * @throws \InvalidArgumentException
	 */
	public function __construct(IDBConnection $db, ICalendar $calendar,
								ObjectFactory $objectFactory){
		parent::__construct($db, 'clndr_objcache', $objectFactory);
		$this->calendar = $calendar;

		if ($calendar->getId() === null) {
			throw new \InvalidArgumentException(
				'Given calendar parameter is missing Id property!'
			);
		}

		$this->generateAttributes();
	}


	/**
	 * @param IObject $object
	 * @return IObject
	 */
	public function insert(IObject $object) {
		$calendarId = $this->calendar->getId();

		//TODO - (maybe) check if uri exists already

		$sql  = 'INSERT INTO `' . $this->getTableName() . '` ';
		$sql .= '(`calendarid`,`uri`,`type`,`etag`,';
		$sql .= '`startdate`,`enddate`,`repeating`,`summary`, `calendardata`, `lastmodified`) ';
		$sql .= 'VALUES(?, ?, ?, ?, ?, ?, ?, ?, ?, ?)';

		$stmt = $this->execute($sql, [
			$calendarId, $object->getUri(), $object->getType(),
			$object->getEtag(true), $this->getUTC($object->getStartDate()), $this->getUTC($object->getEndDate()),
			$object->getRepeating(), $object->getSummary(), $object->getCalendarData(),
			$this->getUTC($object->getLastModified())
		]);

		$object->setId((int) $this->db->lastInsertId($this->getTableName()));

		$stmt->closeCursor();

		return $object;
	}


	/**
	 * @param IObject $object
	 * @return IObject
	 */
	public function update(IObject $object) {
		$calendarId = $this->calendar->getId();

		//TODO - (maybe) check uri exists already

		$sql  = 'UPDATE `' . $this->getTableName() . '` SET ';
		$sql .= '`type` = ?, `etag` = ?, `startdate` = ?, `enddate` = ?, ';
		$sql .= '`repeating` = ?, `summary` = ?, `calendardata` = ?, ';
		$sql .= '`lastmodified` = ? WHERE `uri` = ? and `calendarid` = ?';

		$stmt = $this->execute($sql, [
			$object->getType(), $object->getEtag(true), $this->getUTC($object->getStartDate()), $this->getUTC($object->getEndDate()),
			$object->getRepeating(), $object->getSummary(), $object->getCalendarData(),
			$this->getUTC($object->getLastModified()), $object->getUri(), $calendarId
		]);
		$stmt->closeCursor();

		return $object;
	}


	/**
	 * Finds an item from user by it's uri
	 * @param string $uri
	 * @param integer $type
	 * @throws DoesNotExistException: if the item does not exist
	 * @throws MultipleObjectsReturnedException
	 * @return IObject
	 */
	public function find($uri, $type=ObjectType::ALL){
		//TODO - add $this->calendar to returned object
		$sql  = 'SELECT ' . $this->attributes . ' FROM `' . $this->getTableName() . '` ';
		$sql .= 'WHERE `uri` = ? AND `calendarid` = ?';
		$params = [$uri, $this->calendar->getId()];

		$this->addTypeQuery($type, $sql, $params);

		return $this->findEntity($sql, $params);
	}


	/**
	 * Finds all Items of calendar $calendarId
	 * @param integer $type
	 * @param integer $limit
	 * @param integer $offset
	 * @return IObjectCollection
	 */
	public function findAll($type=ObjectType::ALL, $limit=null, $offset=null){
		$sql  = 'SELECT ' . $this->attributes . ' FROM `' . $this->getTableName() . '` ';
		$sql .= 'WHERE `calendarid` = ?';
		$params = [$this->calendar->getId()];

		$this->addTypeQuery($type, $sql, $params);

		return $this->findEntities($sql, $params, $limit, $offset);
	}


	/**
	 * Finds all Items of calendar $calendarId
	 * @param integer $type
	 * @return array
	 */
	public function listAll($type=ObjectType::ALL){
		$sql  = 'SELECT `uri` FROM `' . $this->getTableName() . '` ';
		$sql .= 'WHERE `calendarid` = ?';
		$params = [$this->calendar->getId()];

		$this->addTypeQuery($type, $sql, $params);
		$result = $this->execute($sql, $params);

		$list = [];
		while($row = $result->fetch()){
			$list[] = $row['uri'];
		}

		return $list;
	}


	/**
	 * Finds all Items of calendar $calendarId from $start to $end
	 * @param \DateTime $start
	 * @param \DateTime $end
	 * @param integer $type
	 * @param integer $limit
	 * @param integer $offset
	 * @return IObjectCollection
	 */
	public function findAllInPeriod(\DateTime $start, \DateTime $end,
									$type=ObjectType::ALL,
									$limit=null, $offset=null) {
		$sql  = 'SELECT ' . $this->attributes . ' FROM `' . $this->getTableName() . '` ';
		$sql .= 'WHERE `calendarid` = ?';
		$params = [$this->calendar->getId()];

		$this->addTypeQuery($type, $sql, $params);
		$this->addPeriodQuery($start, $end, $sql, $params);

		return $this->findEntities($sql, $params, $limit, $offset);
	}


	/**
	 * number of objects in a calendar
	 * @throws DoesNotExistException: if the item does not exist
	 * @return integer
	 */
	public function count(){
		$sql  = 'SELECT COUNT(*) AS `count` ';
		$sql .= 'FROM `' . $this->getTableName() . '` ';
		$sql .= 'WHERE `calendarid` = ?';
		$params = [$this->calendar->getId()];

		$row = $this->findOneQuery($sql, $params);
		return intval($row['count']);
	}


	/**
	 * delete multiple objects based on their objectUris
	 * @param array $objectUris
	 */
	public function deleteList(array $objectUris=[]) {
		if (empty($objectUris) === true) {
			return;
		}

		$sql  = 'DELETE FROM `' . $this->getTableName() . '` ';
		$sql .= 'WHERE `calendarid` = ? AND (';
		$params = [$this->calendar->getId()];

		$sqlElements = [];
		foreach($objectUris as $objectUri) {
			$sqlElements[] = '`uri` = ?';
			$params[] = $objectUri;
		}

		if (count($sqlElements) === 0) {
			return;
		}

		$sql .= implode(' OR ', $sqlElements);
		$sql .= ')';

		$this->execute($sql, $params);
	}


	/**
	 * delete all objects from cache
	 */
	public function clear() {
		$sql  = 'DELETE FROM `' . $this->getTableName() . '` ';
		$sql .= 'WHERE `calendarid` = ?';
		$params = [$this->calendar->getId()];

		$this->execute($sql, $params);
	}


	/**
	 * get UTC from a datetime object
	 * @param \DateTime $datetime
	 * @return string
	 */
	private function getUTC(\DateTime $datetime){
		return ObjectUtility::getUTCforMDB($datetime);
	}


	/**
	 * @param integer $type
	 * @param string &$sql
	 * @param array &$params
	 * @return void
	 */
	private function addTypeQuery($type, &$sql, &$params) {
		$sqlElements = array();

		if (ObjectType::EVENT & $type) {
			$sqlElements[] = '`type` = ?';
			$params[] = ObjectType::EVENT;
		}
		if (ObjectType::JOURNAL & $type) {
			$sqlElements[] = '`type` = ?';
			$params[] = ObjectType::JOURNAL;
		}
		if (ObjectType::TODO & $type) {
			$sqlElements[] = '`type` = ?';
			$params[] = ObjectType::TODO;
		}

		if (count($sqlElements) === 0) {
			return;
		}

		$sql .= ' AND (';
		$sql .= implode(' OR ', $sqlElements);
		$sql .= ') ';
	}


	/**
	 * @param \DateTime $start
	 * @param \DateTime $end
	 * @param string &$sql
	 * @param array &$params
	 */
	private function addPeriodQuery(\DateTime $start, \DateTime $end, &$sql, &$params) {
		$sql .= ' AND ((`startdate` >= ? AND `startdate` <= ?) ';
		$sql .= 'OR (`enddate` >= ? AND `enddate` <= ?) ';
		$sql .= 'OR (`startdate` <= ? AND `enddate` >= ?) ';
		$sql .= 'OR (`startdate` <= ? AND `repeating` = 1)) ';
		$sql .= 'ORDER BY `repeating` ';

		$utcStart = $this->getUTC($start);
		$utcEnd = $this->getUTC($end);

		$params = array_merge($params, array(
			$utcStart,
			$utcEnd,
			$utcStart,
			$utcEnd,
			$utcStart,
			$utcEnd,
			$utcEnd
		));
	}


	/**
	 * generate attributes to query
	 */
	private function generateAttributes() {
		$this->attributes = implode(', ', [
			'`id`',
			'`uri`',
			'`etag`',
			'`calendardata`'
		]);
	}
}