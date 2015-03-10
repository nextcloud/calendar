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
namespace OCA\Calendar\Cache\Object;

use OCA\Calendar\ICalendar;

class ChangePropagator {

	/**
	 * @var ICalendar
	 */
	protected $calendar;


	/**
	 * @var string[]
	 */
	protected $changedObjects = [];


	/**
	 * @param ICalendar $calendar
	 */
	public function __construct(ICalendar $calendar) {
		$this->calendar = $calendar;
	}


	/**
	 * @param string $objectUri
	 */
	public function addChange($objectUri) {
		$this->changedObjects[] = $objectUri;
	}


	/**
	 * @return string[]
	 */
	public function getChanges() {
		return $this->changedObjects;
	}


	/**
	 * reset registered changes
	 */
	public function resetChanges() {
		$this->changedObjects = [];
	}


	/**
	 * rescan objects that changed and update the corresponding cached calendars
	 */
	public function propagateChanges() {
		$changes = $this->getChanges();
		$this->resetChanges();

		if (empty($changes)) {
			return;
		}

		$backend = $this->calendar->getBackend();
		$scanner = $backend->getObjectScanner($this->calendar);
		foreach ($changes as $objectUri) {
			$scanner->scanObject($objectUri);
		}

		$calendarScanner = $backend->getBackendCollection()->getScanner();

		$backendId = $this->calendar->getBackend()->getId();
		$privateUri = $this->calendar->getPrivateUri();
		$userId = $this->calendar->getUserId();

		$calendarScanner->scanCalendar($backendId, $privateUri, $userId);
	}
}