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

use OCA\Calendar\Backend as BackendUtils;
use OCA\Calendar\CorruptDataException;
use OCA\Calendar\Db\CalendarFactory;
use OCA\Calendar\Db\ObjectType;
use OCA\Calendar\Db\Permissions;
use OCA\Calendar\IBackend;
use OCA\Calendar\ICalendar;
use OCA\Calendar\Utility\CalendarUtility;

use OCP\IDBConnection;

class Calendar extends Local implements BackendUtils\ICalendarAPI,
	BackendUtils\ICalendarAPICreate, BackendUtils\ICalendarAPIUpdate, BackendUtils\ICalendarAPIDelete {

	/**
	 * @var IBackend
	 */
	protected $backend;


	/**
	 * @var CalendarFactory
	 */
	protected $factory;


	/**
	 * @param IDBConnection $db
	 * @param IBackend $backend
	 * @param CalendarFactory $calendarFactory
	 * @param string $calendarTableName
	 * @param string $objectTableName
	 */
	public function __construct(IDBConnection $db, IBackend $backend, CalendarFactory $calendarFactory,
								$calendarTableName='clndr_calendars', $objectTableName='clndr_objects') {
		parent::__construct($db, $calendarTableName, $objectTableName);
		$this->backend = $backend;
		$this->factory = $calendarFactory;
	}


	/**
	 * {@inheritDoc}
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
	 * {@inheritDoc}
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
	 * {@inheritDoc}
	 */
	public function listAll($userId) {
		$sql  = 'SELECT `uri` FROM `' . $this->getCalendarTableName() . '` ';
		$sql .= 'WHERE `userid` = ?';

		$result = $this->query($sql, [
			$userId
		]);

		$list = [];
		while($row = $result->fetch()) {
			$list[] = $row['uri'];
		}

		return $list;
	}


	/**
	 * {@inheritDoc}
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
	 * {@inheritDoc}
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
	 * {@inheritDoc}
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
	 * {@inheritDoc}
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
		return $this->factory->createEntity([
			'userId' => strval($row['userid']),
			'ownerId' => strval($row['userid']),
			'backend' => $this->backend,
			'privateUri' => strval($row['uri']),
			'displayname' => strval($row['displayname']),
			'components' => $this->getTypes($row['components'], 'int'),
			'ctag' => intval($row['ctag']),
			'color' => strval($row['calendarcolor']),
			'order' => intval($row['calendarorder']),
			'enabled' => (bool) $row['active'],
			'cruds' => Permissions::ALL,
		]);
	}


	/**
	 * @param \PDOStatement $result
	 * @return \OCA\Calendar\ICalendarCollection
	 */
	private function resultToCollection(\PDOStatement $result) {
		$entities = [];

		while($row = $result->fetch()) {
			try {
				$entities[] = $this->rowToEntity($row);
			} catch (CorruptDataException $ex) {
				continue;
			}
		}

		return $this->factory->createCollectionFromEntities($entities);
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