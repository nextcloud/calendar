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

use OCA\Calendar\Backend\TemporarilyNotAvailableException;
use OCP\AppFramework\Db\DoesNotExistException;
use OCP\Calendar\IBackendCollection;
use OCP\Calendar\IBackend;
use OCP\IDb;

class CalendarMapper extends Mapper {

	/**
	 * @var \OCP\Calendar\IBackendCollection
	 */
	protected $backends;


	/**
	 * @var \OCA\Calendar\Db\TimezoneMapper
	 */
	protected $timezones;


	/**
	 * Constructor
	 * @param IDb $db
	 * @param IBackendCollection $backends
	 * @param TimezoneMapper $timezones
	 */
	public function __construct(IDb $db, IBackendCollection $backends,
								TimezoneMapper $timezones){
		parent::__construct($db, 'clndr_calcache');

		$this->backends = $backends;
		$this->timezones = $timezones;
	}


	/**
	 * find all calendars of a user
	 *
	 * @param string $userId
	 * @param integer $limit
	 * @param integer $offset
	 * @return \OCP\Calendar\ICalendarCollection
	 */
	public function findAll($userId, $limit, $offset){
		$sql  = 'SELECT * FROM `' . $this->getTableName() . '` ';
		$sql .= 'WHERE `user_id` = ?';
		$params = [$userId];

		$this->addBackendQuery($sql, $params);
		$sql .= 'ORDER BY `order`';

		return $this->findEntities($sql, $params,
			$limit, $offset);
	}


	/**
	 * list all calendars of a user
	 *
	 * @param string $userId
	 * @return array
	 */
	public function listAll($userId){
		$sql  = 'SELECT * FROM `' . $this->getTableName() . '` ';
		$sql .= 'WHERE `user_id` =  ?';
		$params = [$userId];

		$this->addBackendQuery($sql, $params);
		$sql .= 'ORDER BY `order`';

		return $this->listEntities($sql, $params);
	}


	/**
	 * @param $userId
	 * @return array
	 */
	public function getPrivateUris($userId) {
		$sql  = 'SELECT `backend`, `private_uri` FROM ';
		$sql .= '`' . $this->getTableName() . '` WHERE `user_id` =  ?';
		$params = [$userId];

		$result = $this->execute($sql, $params);

		$privateUris = [];
		while($row = $result->fetch()){
			if (!is_array($privateUris[$row['backend']])) {
				$privateUris[$row['backend']] = [
					$row['privateuri']
				];
			} else {
				$privateUris[$row['backend']][] = $row['privateuri'];
			}
		}

		return $privateUris;
	}


	/**
	 * number of calendars of a user
	 *
	 * @param string $userId
	 * @throws \OCP\AppFramework\Db\DoesNotExistException: if the item does not exist
	 * @return integer
	 */
	public function count($userId){
		$sql  = 'SELECT COUNT(*) AS `count` FROM ';
		$sql .= '`' . $this->getTableName() . '` WHERE `user_id` = ?';
		$params = [$userId];

		$this->addBackendQuery($sql, $params);

		$row = $this->findOneQuery($sql, $params);
		return intval($row['count']);
	}


	/**
	 * find calendar by it's id
	 *
	 * @param integer $id
	 * @param string $userId
	 * @throws \OCP\AppFramework\Db\DoesNotExistException: if the item does not exist
	 * @throws \OCP\AppFramework\Db\MultipleObjectsReturnedException: if more than one item found
	 * @throws TemporarilyNotAvailableException if backend is not available
	 * @return \OCP\Calendar\ICalendar
	 */
	public function find($id, $userId) {
		$sql  = 'SELECT * FROM `' . $this->getTableName() . '` ';
		$sql .= 'WHERE `id` = ? AND `user_id` = ?';

		return $this->findEntity($sql, [
			$id,
			$userId
		]);
	}


	/**
	 * find calendar by it's public uri
	 *
	 * @param string $publicuri
	 * @param string $userId
	 * @throws \OCP\AppFramework\Db\DoesNotExistException: if the item does not exist
	 * @throws \OCP\AppFramework\Db\MultipleObjectsReturnedException: if more than one item found
	 * @throws TemporarilyNotAvailableException if backend is not available
	 * @return \OCP\Calendar\ICalendar
	 */
	public function findByPublicUri($publicuri, $userId){
		$sql  = 'SELECT * FROM `' . $this->getTableName() . '` ';
		$sql .= 'WHERE `public_uri` = ? AND `user_id` = ?';

		return $this->findEntity($sql, [
			$publicuri, $userId
		]);
	}


	/**
	 * find calendar by it's backend's uri
	 *
	 * @param string $backend
	 * @param string $privateuri
	 * @param string $userId
	 * @throws \OCP\AppFramework\Db\DoesNotExistException: if the item does not exist
	 * @throws \OCP\AppFramework\Db\MultipleObjectsReturnedException: if more than one item found
	 * @throws TemporarilyNotAvailableException if backend is not available
	 * @return \OCP\Calendar\ICalendar
	 */
	public function findByPrivateUri($backend, $privateuri, $userId) {
		$sql  = 'SELECT * FROM `' . $this->getTableName() . '` ';
		$sql .= 'WHERE `backend` = ? AND `private_uri` = ? AND `user_id` = ?';

		return $this->findEntity($sql, [
			$backend, $privateuri, $userId
		]);
	}


	/**
	 * does a calendar exist
	 *
	 * @param string $publicuri
	 * @param string $userId
	 * @throws \OCP\AppFramework\Db\DoesNotExistException: if the item does not exist
	 * @return boolean
	 */
	public function doesExist($publicuri, $userId) {
		$sql  = 'SELECT COUNT(*) AS `count` FROM `' . $this->getTableName() . '` ';
		$sql .= 'WHERE `public_uri` = ? AND `user_id` = ?';

		$row = $this->findOneQuery($sql, [
			$publicuri,
			$userId
		]);

		$count = intval($row['count']);
		return ($count !== 0);
	}


	/**
	 * @param string $backend
	 * @param array $privateUris
	 */
	public function deletePrivateUriList($backend, array $privateUris) {
		if (empty($privateUris) === true) {
			return;
		}

		$sql  = 'DELETE FROM `' . $this->getTableName() . '` ';
		$sql .= 'WHERE `backend` = ? AND (';
		$params = [$backend];

		$sqlElements = [];
		foreach($privateUris as $privateUri) {
			$sqlElements[] = '`private_uri` = ?';
			$params[] = $privateUri;
		}

		if (count($sqlElements) === 0) {
			return;
		}

		$sql .= implode(' OR ', $sqlElements);
		$sql .= ')';

		$this->execute($sql, $params);
	}


	/**
	 * Creates an entity from a row. Automatically determines the entity class
	 * from the current mapper name (MyEntityMapper -> MyEntity)
	 * @param array $row the row which should be converted to an entity
	 * @throws TemporarilyNotAvailableException
	 * @return Entity the entity
	 */
	protected function mapRowToEntity($row) {
		$backend = $this->backends->find($row['backend']);

		if (!($backend instanceof IBackend)) {
			throw new TemporarilyNotAvailableException(
				'Unknown backend'
			);
		}
		//replace backend with IBackend
		$row['backend'] = $backend;

		//replace timezone with ITimezone
		try {
			$timezone = $this->timezones->find($row['timezone'], $row['user_id']);
			$row['timezone'] = $timezone;
		} catch(DoesNotExistException $ex) {
			unset($row['timezone']);
		}

		unset($row['last_properties_update']);
		unset($row['last_object_update']);

		return parent::mapRowToEntity($row);
	}


	/**
	 * @param string $sql
	 * @param array $params
	 * @return array
	 */
	private function listEntities($sql, $params) {
		$result = $this->execute($sql, $params);

		$calendars = [];
		while($row = $result->fetch()){
			$calendars[] = $row['public_uri'];
		}

		return $calendars;
	}


	/**
	 * @param string $sql
	 * @param array $params
	 */
	private function addBackendQuery(&$sql, array &$params) {
		$backendSql = [];
		$backendParams = [];

		/** @var IBackend $backend */
		foreach($this->backends as $backend) {
			$backendSql[] =  ' `backend` = ? ';
			$backendParams[] = $backend->getId();
		}

		$backendSqlString = implode('OR', $backendSql);
		if (!empty($backendSql)) {
			$sql .= ' AND (';
			$sql .= $backendSqlString;
			$sql .= ') ';

			$params = array_merge($params, $backendParams);
		}
	}
}