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

use OCA\Calendar\Backend as BackendUtils;
use OCA\Calendar\IBackend;
use OCA\Calendar\ICalendar;
use OCA\Calendar\Share\Calendar as CalendarShare;

use OCP\Share;


class Calendar extends Sharing implements BackendUtils\ICalendarAPI, BackendUtils\ICalendarAPIDelete {

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
	 * {@inheritDoc}
	 */
	public function find($privateUri, $userId) {
		//TODO
	}


	/**
	 * {@inheritDoc}
	 */
	public function findAll($userId, $limit=null, $offset=null) {
		$calendars = Share::getItemsSharedWithUser('calendar', $userId, CalendarShare::CALENDAR);
		$calendars->setProperty('backend', $this->backend);
		return $calendars;
	}


	/**
	 * {@inheritDoc}
	 */
	public function listAll($userId) {
		//return Share::getItemsSharedWithUser('calendar', $userId, CalendarShare::CALENDARLIST);
	}


	/**
	 * {@inheritDoc}
	 */
	public function hasUpdated(ICalendar $calendar) {

	}


	/**
	 * {@inheritDoc}
	 */
	public function delete($privateUri, $userId) {

	}
}