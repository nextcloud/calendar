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

use OCA\Calendar\IBackendCollection;
use OCA\Calendar\ICalendarCollection;
use OCA\Calendar\IBackend;
use OCA\Calendar\ICalendar;

class CalendarCollection extends Collection implements ICalendarCollection {

	/**
	 * get a collection of all enabled calendars within collection
	 * @return ICalendarCollection of all enabled calendars
	 */
	public function enabled() {
		return $this->search('enabled', true);
	}


	/**
	 * get a collection of all disabled calendars within collection
	 * @return ICalendarCollection of all disabled calendars
	 */
	public function disabled() {
		return $this->search('enabled', false);
	}


	/**
	 * get a collection of all calendars owned by a certain user
	 * @param string $userId of owner
	 * @return ICalendarCollection of all calendars owned by user
	 */
	public function ownedBy($userId) {
		return $this->search('ownerId', $userId);
	}


	/**
	 * get a collection of calendars that supports certain components
	 * @param int $component use \OCA\Calendar\Db\ObjectType to get wanted component code
	 * @return ICalendarCollection of calendars that supports certain components
	 */
	public function components($component) {
		$newCollection = new CalendarCollection();

		foreach($this->objects as $object) {
			/** @var ICalendar $object */
			if ($object->getComponents() & $component) {
				$newCollection[] = $object;
			}
		}

		return $newCollection;
	}


	/**
	 * get a collection of calendars with a certain permission
	 * @param int $cruds use \OCA\Calendar\Db\Permissions to get wanted permission code
	 * @return ICalendarCollection of calendars with a certain permission
	 */
	public function permissions($cruds) {
		$newCollection = new CalendarCollection();

		foreach($this->objects as $object) {
			/** @var ICalendar $object */
			if ($object->getCruds() & $cruds) {
				$newCollection[] = $object;
			}
		}

		return $newCollection;
	}


	/**
	 * filter calendars by BackendCollection
	 * @param IBackendCollection $backends
	 * @return ICalendarCollection
	 */
	public function filterByBackends(IBackendCollection $backends) {
		$newCollection = new CalendarCollection();

		foreach($this->objects as $object) {
			/** @var ICalendar $object */
			foreach($backends as $backend) {
				if ($backend instanceof IBackend &&
					$object->getBackend()->getId() === $backend->getId()) {
					$newCollection[] = $object;
				}
			}
		}

		return $newCollection;
	}
}