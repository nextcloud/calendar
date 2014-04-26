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
	 * array to register types
	 * @var array
	 */
	public static $types=array();


	/**
	 * @param API $api: Instance of the API abstraction layer
	 */
	public function __construct($app, $tablename='clndr_subscriptions'){
		parent::__construct($app, $tablename);
	}


	/**
	 * find subscription by type, name, userId
	 * @param string $type
	 * @param string $name
	 * @param string $userId
	 * @throws DoesNotExistException: if the item does not exist
	 * @throws MultipleObjectsReturnedException: if more than one item found
	 * @return Subscription object
	 */
	public function find($type, $name, $userId){
		$sql  = 'SELECT * FROM `' . $this->getTableName() . '` ';
		$sql .= 'WHERE `type` = ? AND `name` = ? AND `user_id` = ?';

		$row = $this->findOneQuery($sql, array($type, $name, $userId));

		return new Subscription($row);
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

		return $this->findEntities($sql, array($userId), $limit, $offset);
	}
}

SubscriptionMapper::$types[] = 'caldav';
SubscriptionMapper::$types[] = 'webcal';