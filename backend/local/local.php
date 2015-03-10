<?php
/**
 * ownCloud - Calendar App
 *
 * @author Georg Ehrke
 * @copyright 2014 Georg Ehrke <oc.list@georgehrke.com>
 * @author Bart Visscher
 * @copyright 2014 Bart Visscher <bartv@thisnet.nl>
 * @author Jakob Sack
 * @copyright 2014 Jakob Sack <mail@jakobsack.de>
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
namespace OCA\Calendar\Backend\Local;

use OCP\AppFramework\Db\MultipleObjectsReturnedException;
use OCP\AppFramework\Db\DoesNotExistException;
use OCP\DB;
use OCP\IDBConnection;

abstract class Local {

	/**
	 * @var \OCP\IDbConnection
	 */
	protected $db;


	/**
	 * @var string
	 */
	protected $calendarTableName;


	/**
	 * @var string
	 */
	protected $objectTableName;


	/**
	 * @param IDBConnection $db
	 * @param string $calendarTableName
	 * @param string $objectTableName
	 */
	public function __construct(IDBConnection $db, $calendarTableName='clndr_calendars',
								$objectTableName='clndr_objects') {
		$this->db = $db;
		$this->calendarTableName = $this->prependPrefix($calendarTableName);
		$this->objectTableName = $this->prependPrefix($objectTableName);
	}


	/**
	 * @return string
	 */
	protected function getCalendarTableName() {
		return $this->calendarTableName;
	}


	/**
	 * @return mixed
	 */
	protected function getObjectTableName() {
		return $this->objectTableName;
	}


	/**
	 * @param $privateUri
	 * @param $userId
	 * @return int
	 */
	protected function getCalendarId($privateUri, $userId) {
		$table = $this->getCalendarTableName();

		$sql  = 'SELECT `id` FROM `' . $table . '` ';
		$sql .= 'WHERE `uri` = ? AND `userid` = ?';
		$id = $this->queryNumber($sql, array(
			$privateUri,
			$userId
		));

		return $id;
	}


	/**
	 * @param string $tableName
	 * @return string
	 */
	private function prependPrefix($tableName) {
		return '*PREFIX*' . $tableName;
	}


	/**
	 * @param string $sql
	 * @param $params
	 * @param integer $limit
	 * @param integer $offset
	 * @return \PDOStatement
	 */
	protected function query($sql, $params, $limit=null, $offset=null) {
		$query = $this->db->prepare($sql, $limit, $offset);
		$query->execute($params);

		if (DB::isError($query)) {
			$this->throwDBError();
		}

		return $query;
	}


	/**
	 * @param string $sql
	 * @param $params
	 * @return integer|bool
	 */
	protected function queryNumber($sql, $params) {
		$result = $this->query($sql, $params);

		$count = $result->fetchColumn();
		if (gettype($count) === 'bool') {
			return $count;
		}

		if (gettype($count) !== 'integer') {
			$count = intval($count);
		}

		return $count;
	}


	/**
	 * @param string $sql
	 * @param array $params
	 * @return mixed
	 * @throws \OCP\AppFramework\Db\MultipleObjectsReturnedException
	 * @throws \OCP\AppFramework\Db\DoesNotExistException
	 */
	protected function queryOne($sql, $params) {
		$result = $this->query($sql, $params);

		$row = $result->fetch();

		if ($row === false || $row === null){
			$msg = 'No matching entry found';
			throw new DoesNotExistException($msg);
		}

		$row2 = $result->fetch();
		if (($row2 === false || $row2 === null ) === false) {
			$msg = 'More than one result';
			throw new MultipleObjectsReturnedException($msg);
		}

		return $row;
	}


	/**
	 * throw db error msg
	 * @throws \OCA\Calendar\Backend\Exception
	 */
	private function throwDBError() {
		throw new \OCA\Calendar\Backend\Exception('An database error occurred!');
	}
}