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
namespace OCA\Calendar\Db;

use OCP\AppFramework\IAppContainer;
use OCP\Calendar\ICalendar;
use OCP\Calendar\IObject;
use OCP\Calendar\IObjectCollection;
use OCA\Calendar\Utility\ObjectUtility;
use OCP\Calendar\DoesNotExistException;
use OCP\Calendar\MultipleObjectsReturnedException;
use OCP\Calendar\ObjectType;

use DateTime;
use OCP\DB;

class ObjectMapper extends Mapper {


	/**
	 * @var string
	 */
	private $indexTableName;


	/**
	 * Constructor
	 * @param IAppContainer $app
	 * @param string $indexTableName
	 * @param string $dataTableName
	 */
	public function __construct(IAppContainer $app,
								$indexTableName = 'clndr_objcache',
								$dataTableName = 'clndr_objcachedata'){
		parent::__construct($app, $dataTableName);
		$this->indexTableName = '*PREFIX*' . $indexTableName;

	}


	/**
	 * Finds an item from user by it's uri
	 * @param ICalendar $calendar
	 * @param string $uri
	 * @param integer $type
	 * @throws DoesNotExistException: if the item does not exist
	 * @throws MultipleObjectsReturnedException
	 * @return IObject
	 */
	public function find(ICalendar $calendar, $uri, $type){
		$findOneSQL  = $this->getJoinStatement();
		$findOneSQL .= 'WHERE `uri` = ? AND `calendarid` = ?';
		$findOneParams = array(
			$uri,
			$calendar->getId(),
		);

		$this->addTypeQuery($type, $findOneSQL, $findOneParams);

		$row = $this->findOneQuery($findOneSQL, $findOneParams);
		return new Object($row);
	}


	/**
	 * Finds all Items of calendar $calendarId
	 * @param ICalendar $calendar
	 * @param integer $type
	 * @param integer $limit
	 * @param integer $offset
	 * @return IObjectCollection
	 */
	public function findAll(ICalendar $calendar, $type, $limit, $offset){
		$findAllSQL  = $this->getJoinStatement();
		$findAllSQL .= 'WHERE `calendarid` = ?';
		$findAllParams = array(
			$calendar->getId(),
		);

		$this->addTypeQuery($type, $findAllSQL, $findAllParams);

		return $this->findEntities($findAllSQL, $findAllParams,
			$limit, $offset);
	}


	/**
	 * Finds all Items of calendar $calendarId from $start to $end
	 * @param ICalendar $calendar
	 * @param DateTime $start
	 * @param DateTime $end
	 * @param integer $type
	 * @param integer $limit
	 * @param integer $offset
	 * @return IObjectCollection
	 */
	public function findAllInPeriod(ICalendar $calendar, $start, $end, $type,
									$limit, $offset) {
		$findAllInPeriodSQL  = $this->getJoinStatement();
		$findAllInPeriodSQL .= 'WHERE `calendarid` = ? ';
		$findAllInPeriodParams = array(
			$calendar->getId(),
		);

		$this->addTypeQuery($type, $findAllInPeriodSQL, $findAllInPeriodParams);
		$this->addPeriodQuery($start, $end, $findAllInPeriodSQL, $findAllInPeriodParams);

		return $this->findEntities($findAllInPeriodSQL, $findAllInPeriodParams,
			$limit, $offset);
	}


	/**
	 * number of objects in a calendar
	 * @param ICalendar $calendar
	 * @throws DoesNotExistException: if the item does not exist
	 * @return integer
	 */
	public function count(ICalendar $calendar){
		$countSQL  = $this->getJoinStatement('SELECT COUNT(*) AS `count`');
		$countSQL .= 'WHERE `calendarid` = ?';

		$row = $this->findOneQuery($countSQL, array(
			$calendar->getId(),
		));

		return intval($row['count']);
	}


	/**
	 * @param ICalendar $calendar
	 * @param string $uri
	 * @return boolean|null
	 */
	public function doesExist(ICalendar $calendar, $uri) {
		$countSQL  = $this->getJoinStatement('SELECT COUNT(*) AS `count`');
		$countSQL .= 'WHERE `calendarid` = ? AND `uri` = ?';

		$row = $this->findOneQuery($countSQL, array(
			$calendar->getId(),
			$uri,
		));

		return (intval($row['count']) === 1);
	}



	/**
	 * Deletes an entity from the table
	 * @param \OCP\Calendar\IObject $delete the entity that should be deleted
	 */
	public function delete(IObject $delete){
		$sqlQueries = array();

		//delete cached data
		$sqlQueries[] =  'DELETE FROM `' . $this->getDataTableName() . '` WHERE `cacheid` = ?';
		//delete index data
		$sqlQueries[] =  'DELETE FROM `' . $this->getIndexTableName() . '` WHERE `id` = ?';

		foreach ($sqlQueries as $sqlQuery) {
			$this->execute($sqlQuery, array($delete->getId()));
		}
	}


	/**
	 * Creates a new entry in the db from an entity
	 * @param \OCP\Calendar\IObject $object the entity that should be created
	 * @param bool $indexOnly
	 * @return \OCP\Calendar\IObject the saved entity with the set id
	 */
	public function insert(IObject $object, $indexOnly=false){
		$indexSQL  = 'INSERT INTO `' . $this->getIndexTableName() . '` ';
		$indexSQL .= '(`calendarid`, `objecturi`) VALUES(?,?)';

		$this->execute($indexSQL, array(
			$object->getCalendar()->getId(),
			$object->getUri(),
		));

		$object->setId((int) DB::insertid($this->tableName));

		if ($indexOnly === true) {
			return $object;
		}

		$dataSQL  = 'INSERT INTO `' . $this->getDataTableName() . '` ';
		$dataSQL .= '(`cacheid`, `type`, `etag`, `startdate`, `enddate`, ';
		$dataSQL .= '`repeating`, `summary`, `calendardata`, `lastmodified`) ';
		$dataSQL .= 'VALUES(?,?,?,?,?,?,?,?,?)';

		$this->execute($dataSQL, array(
			$object->getId(), $object->getType(), $object->getEtag(true),
			$object->getStartDate(), $object->getEndDate(),
			$object->getRepeating(), $object->getSummary(),
			$object->getCalendarData(), $object->getLastModified()
		));

		return $object;
	}


	/**
	 * Updates an entry in the db from an entity
	 * @throws \InvalidArgumentException if entity has no id
	 * @param \OCP\Calendar\IObject $entity the entity that should be created
	 */
	public function update(IObject $entity) {
		//update calendarid and objecturi if the calendar changed
		if (array_key_exists('calendar', $entity->getUpdatedFields())) {
			$updateIndexSQL  = 'UPDATE `' . $this->getIndexTableName() . '` ';
			$updateIndexSQL .= 'SET `calendarid` = ?, `objecturi` = ?';
			$updateIndexSQL .= 'WHERE `id` = ?';

			$this->execute($updateIndexSQL, array(
				$entity->getCalendar()->getId(),
				$entity->getUri(),
				$entity->getId(),
			));
		}

		$sql  = 'UPDATE `' . $this->getDataTableName() . '` SET ';
		$sql .= '`type` = ?, `etag` = ?, `startdate` = ?, `enddate` = ?, ';
		$sql .= '`repeating` = ?, `summary` = ?, `calendardata` = ?, ';
		$sql .= '`lastmodified` = ? WHERE `cacheid` = ?';

		$this->execute($sql, array(
			$entity->getType(), $entity->getEtag(true),
			$entity->getStartDate(), $entity->getEndDate(),
			$entity->getRepeating(), $entity->getSummary(),
			$entity->getCalendarData(), $entity->getLastModified(),
			$entity->getId()
		));
	}


	/**
	 * @return string
	 */
	private function getDataTableName() {
		return $this->getTableName();
	}


	/**
	 * @return string
	 */
	private function getIndexTableName() {
		return $this->indexTableName;
	}


	/**
	 * get UTC from a datetime object
	 * @param DateTime $datetime
	 * @return string
	 */
	private function getUTC($datetime){
		return ObjectUtility::getUTCforMDB($datetime);
	}


	/**
	 * @param string $query
	 * @return string
	 */
	private function getJoinStatement($query='SELECT *') {
		$sql  = $query . ' FROM `' . $this->getIndexTableName() . '` index ';
		$sql .= 'INNER JOIN `' . $this->getDataTableName() . '` data ';
		$sql .= 'ON index.id = data.cacheid ';

		return $sql;
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
		$sql .= ')';
	}


	/**
	 * @param DateTime $start
	 * @param DateTime $end
	 * @param string &$sql
	 * @param array &$params
	 */
	private function addPeriodQuery(\DateTime $start, \DateTime $end, &$sql, &$params) {
		$sql .= 'AND ((`startdate` >= ? AND `startdate` <= ?) ';
		$sql .= 'OR (`enddate` >= ? AND `enddate` <= ?) ';
		$sql .= 'OR (`startdate` <= ? AND `enddate` >= ?) ';
		$sql .= 'OR (`lastoccurence` >= ? AND `startdate` <= ? AND `repeating` = 1)) ';
		$sql .= 'ORDER BY `repeating`';

		$utcStart = $this->getUTC($start);
		$utcEnd = $this->getUTC($end);

		$params = array_merge($params, array(
			$utcStart,
			$utcEnd,
			$utcStart,
			$utcEnd,
			$utcStart,
			$utcEnd,
			$utcStart,
			$utcEnd
		));
	}
}