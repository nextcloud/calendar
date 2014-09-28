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
namespace OCP\Calendar;

/**
 * Interface ICalendarAPI
 *
 * @method ICalendar create() create(ICalendar $calendar) create a calendar
 * @method ICalendar update() update(ICalendar $calendar) update a calendar
 * @method boolean delete() delete($privateUri, $userId) delete a calendar
 */
interface ICalendarAPI {

	const CREATE =  'create';
	const UPDATE = 'update';
	const DELETE = 'delete';

	/**
	 * returns information about calendar $privateUri of the user $userId
	 * @param string $privateUri
	 * @param string $userId
	 * @throws \OCP\AppFramework\Db\DoesNotExistException if uri does not exist
	 * @throws \OCP\AppFramework\Db\MultipleObjectsReturnedException
	 * @return ICalendar
	 */
	public function find($privateUri, $userId);


	/**
	 * returns all calendars of the user $userId
	 * @param string $userId
	 * @param integer $limit
	 * @param integer $offset
	 * @return ICalendarCollection
	 * @throws \OCP\AppFramework\Db\DoesNotExistException if uri does not exist
	 */
	public function findAll($userId, $limit, $offset);


	/**
	 * @param string $userId
	 * @return array
	 */
	public function listAll($userId);
}