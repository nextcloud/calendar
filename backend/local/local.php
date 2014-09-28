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
use OCP\IDb;

abstract class Local {

	/**
	 * @var \OCP\IDb
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
	 * @param IDb $db
	 * @param string $calendarTableName
	 * @param string $objectTableName
	 */
	public function __construct(IDb $db, $calendarTableName='clndr_calendars',
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
	 * @return \OC_DB_StatementWrapper
	 */
	protected function query($sql, $params, $limit=null, $offset=null) {
		$result = $this->db->prepareQuery($sql, $limit, $offset)->execute($params);

		if (DB::isError($result)) {
			$this->throwDBError();
		}

		return $result;
	}


	/**
	 * @param string $sql
	 * @param $params
	 * @return integer
	 */
	protected function queryNumber($sql, $params) {
		$result = $this->query($sql, $params);

		$count = $result->fetchOne();
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

		$row = $result->fetchRow();

		if ($row === false || $row === null){
			$msg = 'No matching entry found';
			throw new DoesNotExistException($msg);
		}

		$row2 = $result->fetchRow();
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