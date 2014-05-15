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
	 * @brief Constructor
	 * @param IAppContainer $app
	 * @param string $tablename
	 */
	public function __construct($app, $tablename='clndr_sbscrptns'){
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

		$row = $this->findOneQuery($sql, array(
			$type,
			$name,
			$userId
		));

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


	/**
	 * get possible types
	 * @return array
	 */
	public function getTypes() {
		return array_keys(self::$types);
	}


	/**
	 * get validator for function
	 * @param string $type
	 * @return mixed closure
	 */
	public function getTypeValidator($type) {
		if (!array_key_exists($type, self::$types)) {
			return function($url) {
				return false;
			};
		} else {
			return self::$types[$type];
		}
	}
}


/**
 * @brief validator for caldav address
 * @param string $url
 * @return boolean
 */
SubscriptionMapper::$types['caldav'] = function($url) {
	return \OCA\Calendar\Backend\CalDAV::validateUrl($url);
};


/**
 * @brief validator for webcal address
 * @param string $url
 * @return boolean
 */
SubscriptionMapper::$types['webcal'] = function($url) {
	return \OCA\Calendar\Backend\Webcal::validateUrl($url);
};