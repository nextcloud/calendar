<?php
/**
 * Copyright (c) 2014 Georg Ehrke <oc.list@georgehrke.com>
 * This file is licensed under the Affero General Public License version 3 or
 * later.
 * See the COPYING-README file.
 */
namespace OCA\Calendar\Db;

use \OCP\AppFramework\IAppContainer;

use \OCA\Calendar\Db\Subscription;

class SubscriptionMapper extends Mapper {

	/**
	 * @brief Constructor
	 * @param IAppContainer $app
	 * @param string $tablename
	 */
	public function __construct($app, $tablename='clndr_sbscrptns'){
		parent::__construct($app, $tablename);
	}


	/**
	 * find subscription by type, name, userId
	 * @param string $name
	 * @param string $userId
	 * @throws DoesNotExistException: if the item does not exist
	 * @throws MultipleObjectsReturnedException: if more than one item found
	 * @return Subscription object
	 */
	public function find($name, $userId){
		$sql  = 'SELECT * FROM `' . $this->getTableName() . '` ';
		$sql .= 'WHERE `name` = ? AND `user_id` = ?';

		$row = $this->findOneQuery($sql, array(
			$name,
			$userId
		));

		return new Subscription($row);
	}


	/**
	 * does a subscription exist
	 * @param string $name
	 * @param string $userId
	 * @return boolean
	 */
	public function doesExist($name, $userId) {
		$sql  = 'SELECT COUNT(*) AS `count` FROM `' . $this->tableName . '`';
		$sql .= ' WHERE `name` = ? AND `user_id` = ?';

		$row = $this->findOneQuery($sql, array(
			$name,
			$userId
		));

		$count = intval($row['count']);
		return ($count !== 0);
	}


	/**
	 * find all subscriptions of a user
	 * @param string $userId
	 * @param integer $limit
	 * @param integer $offset
	 * @return SubscriptionCollection
	 */
	public function findAll($userId, $limit, $offset){
		$sql  = 'SELECT * FROM `'. $this->getTableName() . '` ';
		$sql .= 'WHERE `user_id` = ?';

		return $this->findEntities($sql, array(
			$userId
		), $limit, $offset);
	}


	/**
	 * find all subscriptions of a user by type
	 * @param string $userId
	 * @param string $type
	 * @param integer $limit
	 * @param integer $offset
	 * @return SubscriptionCollection
	 */
	public function findAllByType($userId, $type, $limit, $offset){
		$sql  = 'SELECT * FROM `'. $this->getTableName() . '` ';
		$sql .= 'WHERE `user_id` = ? AND `type` = ?';

		return $this->findEntities($sql, array(
			$userId,
			$type
		), $limit, $offset);
	}
}