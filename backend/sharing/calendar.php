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
namespace OCA\Calendar\Backend\Sharing;

use OCP\AppFramework\Db\DoesNotExistException;

use OCA\Calendar\IBackend;
use OCA\Calendar\ICalendar;
use OCA\Calendar\ICalendarAPI;
use OCA\Calendar\ICalendarAPIDelete;
use OCA\Calendar\ICalendarCollection;
use OCP\Share;

use OCA\Calendar\Share\Calendar as CalendarShare;

class Calendar extends Sharing implements ICalendarAPI, ICalendarAPIDelete {

	/**
	 * @var IBackend
	 */
	private $backend;


	/**
	 * @param IBackend $backend
	 */
	public function __construct(IBackend $backend) {
		$this->backend = $backend;
	}


	/**
	 * returns information about calendar $privateUri of the user $userId
	 * @param string $privateUri
	 * @param string $userId
	 * @returns ICalendar
	 * @throws DoesNotExistException if uri does not exist
	 */
	public function find($privateUri, $userId) {
		//TODO
	}


	/**
	 * returns all calendars of the user $userId
	 * @param string $userId
	 * @param integer $limit
	 * @param integer $offset
	 * @returns ICalendarCollection
	 * @throws DoesNotExistException if uri does not exist
	 */
	public function findAll($userId, $limit=null, $offset=null) {
		$calendars = Share::getItemsSharedWithUser('calendar', $userId, CalendarShare::CALENDAR);
		$calendars->setProperty('backend', $this->backend);
		return $calendars;
	}


	/**
	 * @param string $userId
	 * @return array
	 */
	public function listAll($userId) {
		//return Share::getItemsSharedWithUser('calendar', $userId, CalendarShare::CALENDARLIST);
	}


	/**
	 * @param string $privateUri
	 * @param string $userId
	 * @return boolean
	 */
	public function delete($privateUri, $userId) {

	}
}