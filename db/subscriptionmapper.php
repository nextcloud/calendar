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

use OCP\IDb;

class SubscriptionMapper extends Mapper {

	/**
	 * @param IDb $db
	 */
	public function __construct(IDb $db){
		parent::__construct($db, 'clndr_sbscrptns');
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

		return $this->findEntities($sql, [
			$userId
		], $limit, $offset);
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

		return $this->findEntities($sql, [
			$userId,
			$type
		], $limit, $offset);
	}


	/**
	 * @param string $userId
	 * @return array
	 */
	public function listAll($userId) {
		//TODO
	}


	/**
	 * @param string $type
	 * @param string $userId
	 * @return array
	 */
	public function listAllByType($type, $userId) {
		//TODO
	}


	/**
	 * find subscription by id, userId
	 * @param int $id
	 * @param string $userId
	 * @throws \OCP\AppFramework\Db\DoesNotExistException: if the item does not exist
	 * @throws \OCP\AppFramework\Db\MultipleObjectsReturnedException: if more than one item found
	 * @return Subscription object
	 */
	public function find($id, $userId){
		$sql  = 'SELECT * FROM `' . $this->getTableName() . '` ';
		$sql .= 'WHERE `id` = ? AND `user_id` = ?';
		$params = [$id, $userId];

		$row = $this->findOneQuery($sql, $params);
		return new Subscription($row);
	}


	/**
	 * find subscription by id, type, userId
	 * @param int $id
	 * @param string $type
	 * @param string $userId
	 * @throws \OCP\AppFramework\Db\DoesNotExistException: if the item does not exist
	 * @throws \OCP\AppFramework\Db\MultipleObjectsReturnedException: if more than one item found
	 * @return Subscription object
	 */
	public function findByType($id, $type, $userId){
		$sql  = 'SELECT * FROM `' . $this->getTableName() . '` ';
		$sql .= 'WHERE `id` = ? AND `type` = ? AND `user_id`= ?';
		$params = [$id, $type, $userId];

		$row = $this->findOneQuery($sql, $params);
		return new Subscription($row);
	}


	/**
	 * does a subscription exist
	 * @param int $id
	 * @param string $userId
	 * @return boolean
	 */
	public function doesExist($id, $userId) {
		$sql  = 'SELECT COUNT(*) AS `count` FROM `' . $this->tableName . '` ';
		$sql .= 'WHERE `id` = ? AND `user_id` = ?';
		$params = [$id, $userId];

		$row = $this->findOneQuery($sql, $params);
		$count = intval($row['count']);
		return ($count !== 0);
	}


	/**
	 * does a subscription of a certain type exist
	 * @param int $id
	 * @param string $type
	 * @param string $userId
	 * @return boolean
	 */
	public function doesExistOfType($id, $type, $userId) {
		$sql  = 'SELECT COUNT(*) AS `count` FROM `' . $this->tableName . '` ';
		$sql .= 'WHERE `id` = ? AND `type` = ? AND `user_id` = ?';
		$params = [$id, $type, $userId];

		$row = $this->findOneQuery($sql, $params);
		$count = intval($row['count']);
		return ($count !== 0);
	}
}