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
namespace OCA\Calendar\BusinessLayer;

use OCA\Calendar\Db\SubscriptionMapper;
use OCP\AppFramework\Db\DoesNotExistException;
use OCP\AppFramework\Db\MultipleObjectsReturnedException;
use OCP\AppFramework\Http;
use OCA\Calendar\ISubscription;

class Subscription extends BusinessLayer {

	/**
	 * @var \OCA\Calendar\Db\SubscriptionMapper
	 */
	protected $mapper;


	/**
	 * @param SubscriptionMapper $mapper
	 */
	public function __construct(SubscriptionMapper $mapper) {
		$this->mapper = $mapper;
	}


	/**
	 * get all subscriptions of a user
	 *
	 * @param string $userId
	 * @param integer $limit
	 * @param integer $offset
	 * @return \OCA\Calendar\ISubscriptionCollection
	 */
	public function findAll($userId, $limit, $offset) {
		return $this->mapper->findAll($userId, $limit, $offset);
	}


	/**
	 * get all subscriptions of a certain type
	 *
	 * @param string $userId
	 * @param string $type
	 * @param integer $limit
	 * @param integer $offset
	 * @return \OCA\Calendar\ISubscriptionCollection
	 */
	public function findAllByType($userId, $type, $limit, $offset) {
		return $this->mapper->findAllByType($userId, $type, $limit, $offset);
	}


	/**
	 * list all subscriptions of a user
	 *
	 * @param string $userId
	 * @return array
	 */
	public function listAll($userId) {
		return $this->mapper->listAll($userId);
	}


	/**
	 * list all subscriptions of a certain type
	 *
	 * @param string $userId
	 * @param string $type
	 * @return integer
	 */
	public function listAllByType($userId, $type) {
		return $this->mapper->listAllByType($userId, $type);
	}


	/**
	 * get a subscription
	 *
	 * @param integer $id
	 * @param string $userId
	 * @throws \OCA\Calendar\BusinessLayer\Exception
	 * @return \OCA\Calendar\ISubscription
	 */
	public function find($id, $userId) {
		try {
			return $this->mapper->find($id, $userId);
		} catch(DoesNotExistException $ex) {
			throw Exception::fromException($ex);
		} catch(MultipleObjectsReturnedException $ex) {
			throw Exception::fromException($ex);
		}
	}


	/**
	 * get a subscription by type
	 *
	 * @param integer $id
	 * @param string $type
	 * @param string $userId
	 * @throws \OCA\Calendar\BusinessLayer\Exception
	 * @return \OCA\Calendar\ISubscription
	 */
	public function findByType($id, $type, $userId) {
		try {
			return $this->mapper->findByType($id, $type, $userId);
		} catch(DoesNotExistException $ex) {
			throw Exception::fromException($ex);
		} catch(MultipleObjectsReturnedException $ex) {
			throw Exception::fromException($ex);
		}
	}


	/**
	 * get whether or not a subscription exists
	 *
	 * @param integer $id
	 * @param string $userId
	 * @return boolean
	 */
	public function doesExist($id, $userId) {
		return $this->mapper->doesExist($id, $userId);
	}


	/**
	 * get whether or not a subscription exists of a certain type
	 *
	 * @param integer $id
	 * @param string $type
	 * @param string $userId
	 * @return boolean
	 */
	public function doesExistOfType($id, $type, $userId) {
		return $this->mapper->doesExistOfType($id, $type, $userId);
	}


	/**
	 * create a new subscription
	 *
	 * @param \OCA\Calendar\ISubscription $subscription
	 * @throws \OCA\Calendar\BusinessLayer\Exception
	 * @return \OCA\Calendar\ISubscription
	 */
	public function create(ISubscription $subscription) {
		$this->checkIsValid($subscription);
		return $this->mapper->insert($subscription);
	}


	/**
	 * update a subscription
	 *
	 * @param \OCA\Calendar\ISubscription $subscription
	 * @throws \OCA\Calendar\BusinessLayer\Exception
	 * @return \OCA\Calendar\ISubscription
	 */
	public function update(ISubscription $subscription) {
		$this->checkIsValid($subscription);
		$this->mapper->update($subscription);
		return $subscription;
	}


	/**
	 * delete a subscription
	 * 
	 * @param \OCA\Calendar\ISubscription $subscription
	 */
	public function delete(ISubscription $subscription) {
		$this->mapper->delete($subscription);
	}
}