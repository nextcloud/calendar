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

use OCP\AppFramework\IAppContainer;
use OCP\Calendar\ICalendar;
use OCP\Calendar\IObject;
use OCP\Calendar\IObjectCollection;

use OCA\Calendar\Utility\ObjectUtility;

use OCP\Calendar\DoesNotExistException;
use OCP\Calendar\MultipleObjectsReturnedException;

use DateTime;

class ObjectMapper extends Mapper {

	/**
	 * columns that should be queried from database
	 * @var string
	 */
	private $columnsToQuery;


	/**
	 * Constructor
	 * @param IAppContainer $app
	 * @param string $tableName
	 */
	public function __construct(IAppContainer $app, $tableName = 'clndr_objcachedata'){
		parent::__construct($app, $tableName);

		$columns  = '`objectURI`, `etag`, `ruds`, `calendarData`';
		$this->columnsToQuery = $columns;
	}


	/**
	 * Finds an item from user by it's uri
	 * @param ICalendar $calendar
	 * @param string $uri
	 * @throws DoesNotExistException: if the item does not exist
	 * @throws MultipleObjectsReturnedException
	 * @return IObject
	 */
	public function find(ICalendar $calendar, $uri){
		$sql  = 'SELECT ' . $this->columnsToQuery . ' FROM ';
		$sql .= '`'. $this->tableName . '` WHERE `uri` = ? AND `calendarid` = ?';
		$row = $this->findOneQuery($sql, array(
			$uri,
			$calendar->getId()
		));

		return new Object($row);
	}


	/**
	 * Finds all Items of calendar $calendarId
	 * @param ICalendar $calendar
	 * @param integer $limit
	 * @param integer $offset
	 * @return IObjectCollection
	 */
	public function findAll(ICalendar $calendar, $limit, $offset){
		$sql  = 'SELECT ' . $this->columnsToQuery . ' FROM ';
		$sql .= '`'. $this->tableName . '` WHERE `calendarid` = ?';
		return $this->findEntities($sql, array(
			$calendar->getId()
		), $limit, $offset);
	}


	/**
	 * Finds all Items of calendar $calendarId of type $type
	 * @param ICalendar $calendar
	 * @param integer $type
	 * @param integer $limit
	 * @param integer $offset
	 * @return ObjectCollection
	 */
	public function findAllByType(ICalendar $calendar, $type, $limit, $offset) {
		$sql  = 'SELECT ' . $this->columnsToQuery . ' FROM ';
		$sql .= '`'. $this->tableName . '` WHERE `calendarid` = ? AND `type` = ?';
		return $this->findEntities($sql, array(
			$calendar->getId(),
			$type
		), $limit, $offset);
	}


	/**
	 * Finds all Items of calendar $calendarId from $start to $end
	 * @param ICalendar $calendar
	 * @param DateTime $start
	 * @param DateTime $end
	 * @param integer $limit
	 * @param integer $offset
	 * @return IObjectCollection
	 */
	public function findAllInPeriod(ICalendar $calendar, $start, $end, $limit, $offset) {
		$sql  = 'SELECT ' . $this->columnsToQuery . ' FROM `'. $this->tableName . '` ';
		$sql .= 'WHERE `calendarid` = ? ';
		$sql .= 'AND ((`startdate` >= ? AND `startdate` <= ?) ';
		$sql .= 'OR (`enddate` >= ? AND `enddate` <= ?) ';
		$sql .= 'OR (`startdate` <= ? AND `enddate` >= ?) ';
		$sql .= 'OR (`lastoccurence` >= ? AND `startdate` <= ? AND `repeating` = 1)) ';
		$sql .= 'ORDER BY `repeating`';

		$utcStart = $this->getUTC($start);
		$utcEnd = $this->getUTC($end);

		return $this->findEntities($sql, array(
			$calendar->getId(),
			$utcStart,
			$utcEnd,
			$utcStart,
			$utcEnd,
			$utcStart,
			$utcEnd,
			$utcStart,
			$utcEnd
		), $limit, $offset);
	}


	/**
	 * Finds all Items of calendar $calendarId of type $type in period from $start to $end
	 * @param ICalendar $calendar
	 * @param integer $type
	 * @param DateTime $start
	 * @param DateTime $end
	 * @param integer $limit
	 * @param integer $offset
	 * @return ObjectCollection
	 */
	public function findAllByTypeInPeriod(ICalendar $calendar, $type, $start, $end, $limit, $offset) {
		$sql  = 'SELECT ' . $this->columnsToQuery . ' FROM `'. $this->tableName . '` ';
		$sql .= 'WHERE `calendarid` = ? AND `type` = ? ';
		$sql .= 'AND ((`startdate` >= ? AND `startdate` <= ?) ';
		$sql .= 'OR (`enddate` >= ? AND `enddate` <= ?) ';
		$sql .= 'OR (`startdate` <= ? AND `enddate` >= ?) ';
		$sql .= 'OR (`lastoccurence` >= ? AND `startdate` <= ? AND `repeating` = 1)) ';
		$sql .= 'ORDER BY `repeating`';

		$utcStart = $this->getUTC($start);
		$utcEnd = $this->getUTC($end);

		return $this->findEntities($sql, array(
			$calendar->getId(),
			$type,
			$utcStart,
			$utcEnd,
			$utcStart,
			$utcEnd,
			$utcStart,
			$utcEnd,
			$utcStart,
			$utcEnd
		), $limit, $offset);
	}


	/**
	 * number of objects in a calendar
	 * @param ICalendar $calendar
	 * @throws DoesNotExistException: if the item does not exist
	 * @return integer
	 */
	public function count(ICalendar $calendar){
		$sql  = 'SELECT COUNT(*) AS `count` FROM ';
		$sql .= '`' . $this->getTableName() . '` WHERE `calendarid` = ?';

		$row = $this->findOneQuery($sql, array(
			$calendar->getId()
		));

		return intval($row['count']);
	}


	/**
	 * @param ICalendar $calendar
	 * @param string $uri
	 * @return bool
	 */
	public function doesExist(ICalendar $calendar, $uri) {

	}


	/**
	 * @param ICalendar $calendar
	 * @param string $uri
	 * @param int $cruds
	 * @return bool
	 */
	public function doesAllow(ICalendar $calendar, $uri, $cruds) {

	}


	/**
	 * Deletes all objects of calendar $calendarId
	 * @param ICalendar $calendar
	 */
	public function deleteAll(ICalendar $calendar) {
		$sql = 'DELETE FROM `' . $this->getTableName() . '` WHERE `calendarid` = ?';

		$this->execute($sql, array(
			$calendar->getId()
		));
	}


	/**
	 * get UTC from a datetime object
	 * @param DateTime $datetime
	 * @return string
	 */
	private function getUTC($datetime){
		return ObjectUtility::getUTCforMDB($datetime);
	}
}