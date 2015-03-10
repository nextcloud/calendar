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
namespace OCA\Calendar\Cache\Calendar;

use OCA\Calendar\Db\CalendarFactory;
use OCA\Calendar\Db\CalendarCollectionFactory;
use OCA\Calendar\Db\Mapper;
use OCA\Calendar\IBackendCollection;
use OCA\Calendar\ICalendar;
use OCA\Calendar\ICalendarCollection;
use OCP\IDBConnection;

/**
 * Class Cache
 *
 * @package OCA\Calendar\Cache\Calendar
 */
class Cache extends Mapper {

	/**
	 * @var IBackendCollection[]
	 */
	protected $backends;


	/**
	 * @var string
	 */
	private $backendSQL;


	/**
	 * @var array
	 */
	private $backendParams;


	/**
	 * @param IBackendCollection $backends
	 * @param IDBConnection $db
	 * @param CalendarFactory $entityFactory
	 * @param CalendarCollectionFactory $collectionFactory
	 */
	public function __construct(IBackendCollection $backends, IDBConnection $db,
								CalendarFactory $entityFactory,
								CalendarCollectionFactory $collectionFactory) {
		parent::__construct($db, 'clndr_calcache', $entityFactory, $collectionFactory);
		$this->backends = $backends;

		$this->prepareBackendQuery();
	}


	/**
	 * @param integer $id
	 * @param string $userId
	 * @return ICalendar
	 */
	public function findById($id, $userId) {
		$sql  = 'SELECT * FROM `' . $this->getTableName() . '` ';
		$sql .= 'WHERE `id` = ? AND `user_id` = ?';

		return $this->findEntity($sql, [
			$id,
			$userId
		]);
	}


	/**
	 * @param string $publicUri
	 * @param string $userId
	 * @return ICalendar
	 */
	public function findByPublicUri($publicUri, $userId) {
		$sql  = 'SELECT * FROM `' . $this->getTableName() . '` ';
		$sql .= 'WHERE `public_uri` = ? AND `user_id` = ?';

		return $this->findEntity($sql, [
			$publicUri, $userId
		]);
	}


	/**
	 * @param string $backendId
	 * @param string $privateUri
	 * @param string $userId
	 * @return ICalendar
	 */
	public function findByPrivateUri($backendId, $privateUri, $userId) {
		$sql  = 'SELECT * FROM `' . $this->getTableName() . '` ';
		$sql .= 'WHERE `backend` = ? AND `private_uri` = ? AND `user_id` = ?';

		return $this->findEntity($sql, [
			$backendId, $privateUri, $userId
		]);
	}


	/**
	 * @param string $userId
	 * @param integer $limit
	 * @param integer $offset
	 * @return ICalendarCollection
	 */
	public function findAll($userId, $limit=null, $offset=null) {
		$sql  = 'SELECT * FROM `' . $this->getTableName() . '` ';
		$sql .= 'WHERE `user_id` = ?';
		$params = [$userId];

		$this->addBackendQuery($sql, $params);
		$sql .= 'ORDER BY `order`';

		return $this->findEntities($sql, $params,
			$limit, $offset);
	}


	/**
	 * @param string $userId
	 * @return array[]
	 */
	public function listAll($userId){
		$sql  = 'SELECT * FROM `' . $this->getTableName() . '` ';
		$sql .= 'WHERE `user_id` = ?';
		$params = [$userId];

		$this->addBackendQuery($sql, $params);
		$sql .= 'ORDER BY `order`';

		$result = $this->execute($sql, $params);

		$list = [];
		while($row = $result->fetch()){
			$row['backendId'] = $row['backend'];
			$list[] = [
				$row['public_uri'],
				$row['backendId'],
				$row['private_uri'],
				$row['user_id'],
			];
		}

		return $list;
	}


	/**
	 * @param string $backendId
	 * @param string $userId
	 * @return array
	 */
	public function listAllByBackend($backendId, $userId) {
		$sql  = 'SELECT * FROM `' . $this->getTableName() . '` ';
		$sql .= 'WHERE `user_id` = ? AND `backend` = ?';
		$params = [$userId, $backendId];

		$this->addBackendQuery($sql, $params);
		$sql .= 'ORDER BY `order`';

		$result = $this->execute($sql, $params);

		$list = [];
		while($row = $result->fetch()){
			$row['backendId'] = $row['backend'];
			$list[] = [
				$row['public_uri'],
				$row['backendId'],
				$row['private_uri'],
				$row['user_id'],
			];
		}

		return $list;
	}


	/**
	 * @param string $userId
	 * @return integer
	 * @throws \OCP\AppFramework\Db\DoesNotExistException
	 * @throws \OCP\AppFramework\Db\MultipleObjectsReturnedException
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
	 * @param string $publicUri
	 * @param string $userId
	 * @return bool
	 * @throws \OCP\AppFramework\Db\DoesNotExistException
	 * @throws \OCP\AppFramework\Db\MultipleObjectsReturnedException
	 */
	public function doesExist($publicUri, $userId) {
		$sql  = 'SELECT COUNT(*) AS `count` FROM `' . $this->getTableName() . '` ';
		$sql .= 'WHERE `public_uri` = ? AND `user_id` = ?';

		$row = $this->findOneQuery($sql, [
			$publicUri,
			$userId
		]);

		$count = intval($row['count']);
		return ($count !== 0);
	}


	/**
	 * @param array[] $properties
	 */
	public function deleteByUris($properties=[]) {
		if (!is_array($properties) || empty($properties)) {
			return;
		}

		$sql  = 'DELETE FROM `' . $this->getTableName() . '` ';
		$sql .= 'WHERE ';

		$sqlElements = [];
		$params = [];

		foreach($properties as $property) {
			if (!isset($property['backend']) && !$property['privateUri'] && !$property['userId']) {
				continue;
			}

			$sqlElements[] = '(`backend` = ? AND `private_uri` = ? AND `user_id` = ?)';
			$params[] = $property['backendId'];
			$params[] = $property['privateUri'];
			$params[] = $property['userId'];
		}

		if (empty($sqlElements)) {
			return;
		}

		$sql .= implode(' OR ', $sqlElements);
		$this->execute($sql, $params);
	}


	/**
	 * remove all entries for the given backends
	 */
	public function clear() {
		$sql  = 'DELETE FROM `' . $this->getTableName() . '` ';
		$sql .= 'WHERE ' . $this->backendSQL;

		$this->execute($sql, $this->backendParams);
	}


	/**
	 * @return ICalendar|null
	 */
	public function getIncomplete() {

	}


	/**
	 * @param string $sql
	 * @param array $params
	 */
	protected function addBackendQuery(&$sql, array &$params) {
		//TODO remove hack:
		$this->prepareBackendQuery();

		if (!empty($this->backendParams)) {
			$sql .= ' AND ' . $this->backendSQL;
			$params = array_merge($params, $this->backendParams);
		}
	}


	/**
	 * prepare backend query added to majority of sql calls
	 * we only want to query for calendars on backends that are inside
	 * the given IBackendCollection, therefore we add this
	 * to almost every sql query.
	 */
	private function prepareBackendQuery() {
		$backendSql = [];
		$backendParams = [];

		foreach($this->backends as $backend) {
			$backendSql[] =  ' `backend` = ? ';
			$backendParams[] = $backend->getId();
		}

		if (!empty($backendSql)) {
			$this->backendSQL = '(' . implode('OR', $backendSql) . ') ';
			$this->backendParams = $backendParams;
		} else {
			$this->backendSQL = '';
			$this->backendParams = [];
		}
	}
}