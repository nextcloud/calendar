<?php
/**
 * Copyright (c) 2014 Georg Ehrke <oc.list@georgehrke.com>
 * This file is licensed under the Affero General Public License version 3 or
 * later.
 * See the COPYING-README file.
 */
namespace OCA\Calendar\Db;

use \OCP\AppFramework\IAppContainer;

use \OCA\Calendar\Db\Object;

class ObjectMapper extends Mapper {
	/**
	 * @param API $api: Instance of the API abstraction layer
	 */
	public function __construct($app, $tablename = 'clndr_objcache'){
		parent::__construct($app, $tablename);
	}

	/**
	 * Finds an item from user by it's uri
	 * @param string $uid
	 * @param integer $calendarId
	 * @throws DoesNotExistException: if the item does not exist
	 * @return the item
	 */
	public function find($uid, $calendarId){
		$sql = 'SELECT * FROM `'. $this->tableName . '` WHERE `uid` = ? AND `calendarid` = ?';
		$row = $this->findQuery($sql, array($uid, $calendarId));
		return new Object($row);
	}

	/**
	 * Finds all Items of calendar $calendarId
	 * @param integer $calendarId
	 * @return array containing all items
	 */
	public function findAll($calendarId, $limit, $offset){
		$sql = 'SELECT * FROM `'. $this->tableName . '` WHERE `calendarid` = ?';
		return $this->findEntities($sql, array($calendarId), $limit, $offset);
	}

	/**
	 * Finds all Items of calendar $calendarId of type $type
	 * @param integer $calendarId
	 * @param \OCA\Calendar\Db\ObjectType $type
	 * @return array containing all items of type $type
	 */
	public function findAllByType($calendarId, $type, $limit, $offset) {
		$sql = 'SELECT * FROM `'. $this->tableName . '` WHERE `calendarid` = ? AND `type` = ?';
		return $this->findEntities($sql, array($calendarId, $type), $limit, $offset);
	}

	/**
	 * Finds all Items of calendar $calendarId from $start to $end
	 * @param integer $calendarId
	 * @param DateTime $start
	 * @param DateTime $end
	 * @return array containing all items of type $type
	 */
	public function findAllInPeriod($calendarId, $start, $end, $limit, $offset) {
		$utcStart = $this->getUTC($start);
		$utcEnd = $this->getUTC($end);
		$sql =  'SELECT * FROM `'. $this->tableName . '` WHERE `calendarid` = ?';
		$sql .= 'AND ((`startdate` >= ? AND `startdate` <= ?)';
		$sql .= ' OR (`enddate` >= ? AND `enddate` <= ?)';
		$sql .= ' OR (`startdate` <= ? AND `enddate` >= ?)';
		$sql .= ' OR (`lastoccurence` >= ? AND `startdate` <= ? AND `repeating` = 1))';
		return $this->findEntities($sql, array($calendarId,
											   $utcStart, $utcEnd,
											   $utcStart, $utcEnd,
											   $utcStart, $utcEnd,
											   $utcStart, $utcEnd),
											   $limit, $offset);
	}

	/**
	 * Finds all Items of calendar $calendarId of type $type in period from $start to $end
	 * @param integer $calendarId
	 * @param DateTime $start
	 * @param DateTime $end
	 * @param \OCA\Calendar\Db\ObjectType $type
	 * @return array containing all items of type $type
	 */
	public function findAllByTypeInPeriod($calendarId, $start, $end, $type, $limit, $offset) {
		$utcStart = $this->getUTC($start);
		$utcEnd = $this->getUTC($end);
		$sql =  'SELECT * FROM `'. $this->tableName . '` WHERE `calendarid` = ? AND `type` = ?';
		$sql .= 'AND ((`startdate` >= ? AND `startdate` <= ?)';
		$sql .= ' OR (`enddate` >= ? AND `enddate` <= ?)';
		$sql .= ' OR (`startdate` <= ? AND `enddate` >= ?)';
		$sql .= ' OR (`lastoccurence` >= ? AND `startdate` <= ? AND `repeating` = 1))';
		return $this->findEntities($sql, array($calendarId, $type,
											   $utcStart, $utcEnd,
											   $utcStart, $utcEnd,
											   $utcStart, $utcEnd,
											   $utcStart, $utcEnd),
											   $limit, $offset);
	}

	/**
	 * Deletes all objects of calendar $calendarid
	 * @param integer $calendarId
	 */
	public function deleteAll($calendarId) {
		$sql  = 'DELETE FROM `' . $this->getTableName() . '` ';
		$sql .= 'WHERE `calendarid` = ?';

		$this->execute($sql, array($calendarId));
	}

	/**
	 * get UTC from a datetime object
	 * @param DateTime $datetime
	 * @return string
	 */
	private function getUTC($datetime){
		return date('Y-m-d H:i:s', $datetime->format('U'));
	}
}