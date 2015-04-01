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

use OCA\Calendar\Backend\DoesNotExistException;
use OCA\Calendar\Backend\MultipleObjectsReturnedException;

use OCA\Calendar\Backend as BackendUtils;

use OCA\Calendar\Db\CalendarCollection;
use OCA\Calendar\Utility\CalendarUtility;
use OCA\Calendar\CorruptDataException;
use OCA\Calendar\IBackend;
use OCA\Calendar\ICalendar;
use OCA\Calendar\ICalendarCollection;
use OCA\Calendar\Db\ObjectType;
use OCA\Calendar\Db\Permissions;
use OCP\IDBConnection;

class Calendar extends Local implements BackendUtils\ICalendarAPI,
	BackendUtils\ICalendarAPICreate, BackendUtils\ICalendarAPIUpdate, BackendUtils\ICalendarAPIDelete {

	/**
	 * @var \OCA\Calendar\IBackend
	 */
	protected $backend;


	/**
	 * @param IDBConnection $db
	 * @param IBackend $backend
	 * @param string $calendarTableName
	 * @param string $objectTableName
	 */
	public function __construct(IDBConnection $db, IBackend $backend,
								$calendarTableName='clndr_calendars',
								$objectTableName='clndr_objects') {
		parent::__construct($db, $calendarTableName, $objectTableName);
		$this->backend = $backend;
	}


	/**
	 * Find a calendar
	 * @param string $calendarURI
	 * @param string $userId
	 * @throws DoesNotExistException if calendar does not exist
	 * @throws MultipleObjectsReturnedException if more than one result found
	 * @return ICalendar
	 */
	public function find($calendarURI, $userId) {
		$sql  = 'SELECT * FROM `' . $this->getCalendarTableName() . '` ';
		$sql .= 'WHERE `uri` = ? AND `userid` = ?';

		$row = $this->queryOne($sql, [
			$calendarURI,
			$userId
		]);

		return $this->rowToEntity($row);
	}


	/**
	 * Find all calendars
	 * @param string $userId
	 * @param integer $limit
	 * @param integer $offset
	 * @return ICalendarCollection
	 */
	public function findAll($userId, $limit, $offset) {
		$sql  = 'SELECT * FROM `' . $this->getCalendarTableName() . '` ';
		$sql .= 'WHERE `userid` = ? ORDER BY `calendarorder`';

		$result = $this->query($sql, [
			$userId
		], $limit, $offset);

		return $this->resultToCollection($result);
	}


	/**
	 * List all calendars
	 * @param string $userId
	 * @return array
	 */
	public function listAll($userId) {
		$sql  = 'SELECT `uri` FROM `' . $this->getCalendarTableName() . '` ';
		$sql .= 'WHERE `userid` = ?';

		$result = $this->query($sql, [
			$userId
		]);

		$list = [];
		while($row = $result->fetchRow()) {
			$list[] = $row['uri'];
		}

		return $list;
	}


	/**
	 * @param ICalendar $calendar
	 * @return boolean
	 */
	public function hasUpdated(ICalendar $calendar) {
		$sql  = 'SELECT `ctag` FROM `' . $this->getCalendarTableName() . '` ';
		$sql .= 'WHERE `uri` = ? AND `userid` = ?';

		$row = $this->queryOne($sql, [
			$calendar->getPrivateUri(),
			$calendar->getUserId(),
		]);

		return ($row['ctag'] !== $calendar->getCtag());
	}


	/**
	 * Create a calendar
	 * @param ICalendar $calendar
	 * @return ICalendar
	 */
	public function create(ICalendar $calendar) {
		$this->generatePrivateUri($calendar);

		$sql  = 'INSERT INTO `' . $this->getCalendarTableName() . '` ';
		$sql .= '(`userid`, `displayname`, `uri`, `active`, `ctag`, ';
		$sql .= '`calendarorder`, `calendarcolor`, `components`) ';
		$sql .= 'VALUES(?,?,?,?,?,?,?,?)';

		$this->query($sql, $this->getCalendarSqlParams($calendar));

		return $calendar;
	}


	/**
	 * update a calendar
	 * @param ICalendar $calendar
	 * @throws DoesNotExistException if calendar does not exist
	 * @return ICalendar
	 */
	public function update(ICalendar $calendar) {
		$calendarId = $this->getCalendarId($calendar->getPrivateUri(),
			$calendar->getUserId());

		$sql  = 'UPDATE `' . $this->getCalendarTableName() . '` SET ';
		$sql .= '`userid` = ?, `displayname` = ?, `uri` = ?, `active` = ?, ';
		$sql .= '`ctag` = ?, `calendarorder` = ?, `calendarcolor` = ?, ';
		$sql .= '`components` = ? WHERE `id` = ?';

		$params = $this->getCalendarSqlParams($calendar);
		$params[] = $calendarId;

		$this->query($sql, $params);

		return $calendar;
	}


	/**
	 * @param ICalendar $calendar
	 * @return array
	 */
	private function getCalendarSqlParams(ICalendar $calendar) {
		return [
			$calendar->getUserId(),
			$calendar->getDisplayname(),
			$calendar->getPrivateUri(),
			$calendar->getEnabled(),
			$calendar->getCtag(),
			$calendar->getOrder(),
			$calendar->getColor(),
			$this->getTypes($calendar->getComponents(), 'string')
		];
	}


	/**
	 * delete a calendar
	 * @param string $privateUri
	 * @param string $userId
	 * @return boolean
	 * @throws DoesNotExistException
	 */
	public function delete($privateUri, $userId) {
		$calendarId = $this->getCalendarId($privateUri, $userId);

		//delete all objects
		$sql1  = 'DELETE FROM `' . $this->getObjectTableName() . '` ';
		$sql1 .= 'WHERE `calendarid` = ?';
		$this->query($sql1, [
			$calendarId
		]);

		//delete the calendar itself
		$sql2  = 'DELETE FROM `' . $this->getCalendarTableName() . '` ';
		$sql2 .= 'WHERE `id` = ?';
		$this->query($sql2, [
			$calendarId
		]);

		return true;
	}


	/**
	 * generate a private uri
	 * @param ICalendar $calendar
	 */
	private function generatePrivateUri(&$calendar) {
		CalendarUtility::generateURI($calendar, function($suggestedUri, $userId) {
			try {
				$this->find($suggestedUri, $userId);
				return true;
			} catch(\Exception $ex) {
				return false;
			}
		}, false);
	}


	/**
	 * @param array $row
	 * @return ICalendar
	 */
	private function rowToEntity(array $row) {
		$calendar = new \OCA\Calendar\Db\Calendar();

		$calendar->setUserId(strval($row['userid']));
		$calendar->setOwnerId(strval($row['userid']));

		$calendar->setBackend($this->backend);
		$calendar->setPrivateUri(strval($row['uri']));

		$calendar->setDisplayname(strval($row['displayname']));
		$calendar->setComponents($this->getTypes($row['components'], 'int'));
		$calendar->setCtag(intval($row['ctag']));
		$calendar->setColor(strval($row['calendarcolor']));
		$calendar->setOrder(intval($row['calendarorder']));
		//boolval is PHP >= 5.5.0 only
		$calendar->setEnabled((bool) $row['active']);
		$calendar->setCruds(Permissions::ALL);

		return $calendar;
	}


	/**
	 * @param \OC_DB_StatementWrapper $result
	 * @return \OCA\Calendar\ICalendarCollection
	 */
	private function resultToCollection(\OC_DB_StatementWrapper $result) {
		$calendars = new CalendarCollection();

		while($row = $result->fetchRow()) {
			try {
				$calendar = $this->rowToEntity($row);
				$calendars[] = $calendar;
			} catch (CorruptDataException $ex) {
				continue;
			}
		}

		return $calendars;
	}


	/**
	 * get multiple objectTypes
	 * @param mixed (integer|string) $components
	 * @param string $type
	 * @return integer (integer|string)
	 */
	private function getTypes($components, $type) {
		if ($type === 'string') {
			return ObjectType::getAsString($components);
		} else {
			return ObjectType::getTypesByString(strval($components));
		}
	}
}