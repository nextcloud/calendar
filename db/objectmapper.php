<?php
/**
 * Copyright (c) 2014 Georg Ehrke <oc.list@georgehrke.com>
 * This file is licensed under the Affero General Public License version 3 or
 * later.
 * See the COPYING-README file.
 */
namespace OCA\Calendar\Db;

use OCP\AppFramework\IAppContainer;
use OCP\Calendar\IObject;
use OCP\Calendar\IObjectCollection;

use OCA\Calendar\Utility\ObjectUtility;

use OCP\Calendar\DoesNotExistException;
use OCP\Calendar\MultipleObjectsReturnedException;

use DateTime;

class ObjectMapper extends Mapper {

	/**
	 * columns that should be queried from database
	 * @var string
	 */
	private $columnsToQuery;


	/**
	 * Constructor
	 * @param IAppContainer $app
	 * @param string $tableName
	 */
	public function __construct(IAppContainer $app, $tableName = 'clndr_objcache'){
		parent::__construct($app, $tableName);

		$columns  = '`objectURI`, `etag`, `ruds`, `calendarData`';
		$this->columnsToQuery = $columns;
	}


	/**
	 * Finds an item from user by it's uri
	 * @param string $uid
	 * @param integer $calendarId
	 * @throws DoesNotExistException: if the item does not exist
	 * @throws MultipleObjectsReturnedException
	 * @return IObject
	 */
	public function find($uid, $calendarId){
		$sql  = 'SELECT ' . $this->columnsToQuery . ' FROM ';
		$sql .= '`'. $this->tableName . '` WHERE `uid` = ? AND `calendarid` = ?';
		$row = $this->findOneQuery($sql, array(
			$uid,
			$calendarId
		));

		return new Object($row);
	}


	/**
	 * Finds all Items of calendar $calendarId
	 * @param integer $calendarId
	 * @param integer $limit
	 * @param integer $offset
	 * @return IObjectCollection
	 */
	public function findAll($calendarId, $limit, $offset){
		$sql  = 'SELECT ' . $this->columnsToQuery . ' FROM ';
		$sql .= '`'. $this->tableName . '` WHERE `calendarid` = ?';
		return $this->findEntities($sql, array(
			$calendarId
		), $limit, $offset);
	}


	/**
	 * Finds all Items of calendar $calendarId of type $type
	 * @param integer $calendarId
	 * @param integer $type
	 * @param integer $limit
	 * @param integer $offset
	 * @return ObjectCollection
	 */
	public function findAllByType($calendarId, $type, $limit, $offset) {
		$sql  = 'SELECT ' . $this->columnsToQuery . ' FROM ';
		$sql .= '`'. $this->tableName . '` WHERE `calendarid` = ? AND `type` = ?';
		return $this->findEntities($sql, array(
			$calendarId,
			$type
		), $limit, $offset);
	}


	/**
	 * Finds all Items of calendar $calendarId from $start to $end
	 * @param integer $calendarId
	 * @param DateTime $start
	 * @param DateTime $end
	 * @param integer $limit
	 * @param integer $offset
	 * @return IObjectCollection
	 */
	public function findAllInPeriod($calendarId, $start, $end, $limit, $offset) {
		$sql  = 'SELECT ' . $this->columnsToQuery . ' FROM `'. $this->tableName . '` ';
		$sql .= 'WHERE `calendarid` = ? ';
		$sql .= 'AND ((`startdate` >= ? AND `startdate` <= ?) ';
		$sql .= 'OR (`enddate` >= ? AND `enddate` <= ?) ';
		$sql .= 'OR (`startdate` <= ? AND `enddate` >= ?) ';
		$sql .= 'OR (`lastoccurence` >= ? AND `startdate` <= ? AND `repeating` = 1)) ';
		$sql .= 'ORDER BY `repeating`';

		$utcStart = $this->getUTC($start);
		$utcEnd = $this->getUTC($end);

		return $this->findEntities($sql, array(
			$calendarId,
			$utcStart,
			$utcEnd,
			$utcStart,
			$utcEnd,
			$utcStart,
			$utcEnd,
			$utcStart,
			$utcEnd
		), $limit, $offset);
	}


	/**
	 * Finds all Items of calendar $calendarId of type $type in period from $start to $end
	 * @param integer $calendarId
	 * @param DateTime $start
	 * @param DateTime $end
	 * @param integer $type
	 * @param integer $limit
	 * @param integer $offset
	 * @return ObjectCollection
	 */
	public function findAllByTypeInPeriod($calendarId, $start, $end, $type, $limit, $offset) {
		$sql  = 'SELECT ' . $this->columnsToQuery . ' FROM `'. $this->tableName . '` ';
		$sql .= 'WHERE `calendarid` = ? AND `type` = ? ';
		$sql .= 'AND ((`startdate` >= ? AND `startdate` <= ?) ';
		$sql .= 'OR (`enddate` >= ? AND `enddate` <= ?) ';
		$sql .= 'OR (`startdate` <= ? AND `enddate` >= ?) ';
		$sql .= 'OR (`lastoccurence` >= ? AND `startdate` <= ? AND `repeating` = 1)) ';
		$sql .= 'ORDER BY `repeating`';

		$utcStart = $this->getUTC($start);
		$utcEnd = $this->getUTC($end);

		return $this->findEntities($sql, array(
			$calendarId,
			$type,
			$utcStart,
			$utcEnd,
			$utcStart,
			$utcEnd,
			$utcStart,
			$utcEnd,
			$utcStart,
			$utcEnd
		), $limit, $offset);
	}


	/**
	 * Deletes all objects of calendar $calendarId
	 * @param integer $calendarId
	 */
	public function deleteAll($calendarId) {
		$sql = 'DELETE FROM `' . $this->getTableName() . '` WHERE `calendarid` = ?';

		$this->execute($sql, array(
			$calendarId
		));
	}


	/**
	 * get UTC from a datetime object
	 * @param DateTime $datetime
	 * @return string
	 */
	private function getUTC($datetime){
		return ObjectUtility::getUTCforMDB($datetime);
	}
}