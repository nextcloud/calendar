<?php
/**
 * Copyright (c) 2014 Georg Ehrke <oc.list@georgehrke.com>
 * This file is licensed under the Affero General Public License version 3 or
 * later.
 * See the COPYING-README file.
 */
namespace OCA\Calendar\Db;

use \OCP\AppFramework\IAppContainer;

use \OCA\Calendar\Db\Calendar;

class CalendarMapper extends Mapper {

	/**
	 * timezoneMapper object
	 * @var \OCA\Calendar\Db\TimezoneMapper
	 */
	private $timezoneMapper;


	/**
	 * @param API $api: Instance of the API abstraction layer
	 */
	public function __construct($app, $tablename='clndr_calcache'){
		parent::__construct($app, $tablename);
		$this->timezoneMapper = $app->query('TimezoneMapper');
	}

	/**
	 * find calendar by backend, uri and userId
	 * @param string $backend
	 * @param string $uri
	 * @param string $userId
	 * @throws DoesNotExistException: if the item does not exist
	 * @throws MultipleObjectsReturnedException: if more than one item found
	 * @return calendar object
	 */
	public function find($backend, $uri, $userId){
		$sql  = 'SELECT * FROM `' . $this->getTableName() . '` ';
		$sql .= 'WHERE `backend` = ? AND `uri` = ? AND `user_id` = ?';

		$row = $this->findOneQuery($sql, array($backend, $uri, $userId));

		return new Calendar($row);
	}

	/**
	 * find all calendars of a user
	 * @param string $userId
	 * @param integer $limit
	 * @param integer $offset
	 * @return CalendarCollection
	 */
	public function findAll($userId, $limit, $offset){
		$sql  = 'SELECT * FROM `'. $this->getTableName() . '` ';
		$sql .= 'WHERE `user_id` = ? ORDER BY `order`';

		return $this->findEntities($sql, array($userId), $limit, $offset);
	}

	/**
	 * find all calendars of a user on a backend
	 * @param string $backend
	 * @param string $userId
	 * @param integer $limit
	 * @param integer $offset
	 * @return CalendarCollection
	 */
	public function findAllOnBackend($backend, $userId, $limit, $offset) {
		$sql  = 'SELECT * FROM `'. $this->getTableName() . '` ';
		$sql .= 'WHERE `backend` = ? AND `user_id` = ? ORDER BY `order`';

		return $this->findEntities($sql, array($backend, $userId), $limit, $offset);
	}

	/**
	 * number of calendars by user
	 * @param string $userId
	 * @throws DoesNotExistException: if the item does not exist
	 * @return integer
	 */
	public function count($userId){
		$sql  = 'SELECT COUNT(*) AS `count` FROM ';
		$sql .= '`' . $this->getTableName() . '` WHERE `user_id` = ?';

		$row = $this->findOneQuery($sql, array($userId));

		return intval($row['count']);
	}

	/**
	 * number of calendars by user on a backend
	 * @param string $backend
	 * @param string $userId
	 * @throws DoesNotExistException: if the item does not exist
	 * @return integer
	 */
	public function countOnBackend($backend, $userId) {
		$sql  = 'SELECT COUNT(*) AS `count` FROM ';
		$sql .= '`' . $this->getTableName() . '` WHERE `backend` = ? AND `user_id` = ?';

		$row = $this->findOneQuery($sql, array($backend, $userId));

		return intval($row['count']);
	}

	/**
	 * does a calendar exist
	 * @param string $backend
	 * @param string $calendarURI
	 * @param string $userId
	 * @throws DoesNotExistException: if the item does not exist
	 * @return boolean
	 */
	public function doesExist($backend, $calendarURI, $userId) {
		$sql  = 'SELECT COUNT(*) AS `count` FROM `' . $this->tableName . '`';
		$sql .= ' WHERE `backend` = ? AND `uri` = ? AND `user_id` = ?';

		$row = $this->findOneQuery($sql, array($backend, $calendarURI, $userId));

		$count = intval($row['count']);
		if ($count === 0) {
			return false;
		} else {
			return true;
		}
	}

	/**
	 * checks if a calendar allows a certain action
	 * @param integer $cruds
	 * @param string $backend
	 * @param string $calendarURI
	 * @param string $userId
	 * @throws DoesNotExistException: if the item does not exist
	 * @return boolean
	 */
	public function doesAllow($cruds, $backend, $calendarURI, $userId) {
		$sql  = 'SELECT COUNT(*) AS `count` FROM `' . $this->tableName . '`';
		$sql .= ' WHERE `cruds` & ? AND `backend` = ? AND `uri` = ? AND `user_id` = ?';

		$row = $this->findOneQuery($sql, array($cruds, $backend, $calendarURI, $userId));

		$count = intval($row['count']);
		if ($count === 0) {
			return false;
		} else {
			return true;
		}
	}

	/**
	 * checks if a calendar supports a certian component
	 * @param integer $component
	 * @param string $backend
	 * @param string $calendarURI
	 * @param string $userId
	 * @throws DoesNotExistException: if the item does not exist
	 * @return boolean
	 */
	public function doesSupport($component, $backend, $calendarURI, $userId) {
		$sql  = 'SELECT COUNT(*) AS `count` FROM `' . $this->tableName . '`';
		$sql .= ' WHERE `components` & ? AND `backend` = ? AND `uri` = ? AND `user_id` = ?';

		$row = $this->findOneQuery($sql, array($component, $backend, $calendarURI, $userId));

		$count = intval($row['count']);
		if ($count === 0) {
			return false;
		} else {
			return true;
		}
	}
}