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
namespace OCA\Calendar\Cache\Calendar;

use OCA\Calendar\IBackendCollection;

class ChangePropagator {

	/**
	 * @var IBackendCollection
	 */
	protected $backends;


	/**
	 * @var array[]
	 */
	protected $changedCalendars = [];


	/**
	 * @param IBackendCollection $backends
	 */
	public function __construct(IBackendCollection $backends) {
		$this->backends = $backends;
	}


	/**
	 * @param string $backendId
	 * @param string $privateUri
	 * @param string $userId
	 */
	public function addChange($backendId, $privateUri, $userId) {
		$this->changedCalendars[] = [
			'backendId' => $backendId,
			'privateUri' => $privateUri,
			'userId' => $userId,
		];
	}


	/**
	 * @return array[]
	 */
	public function getChanges() {
		return $this->changedCalendars;
	}


	/**
	 * reset registered changes
	 */
	public function resetChanges() {
		$this->changedCalendars = [];
	}


	/**
	 * rescan calendars that changed on backends
	 */
	public function propagateChanges() {
		$changes = $this->getChanges();
		$this->resetChanges();

		foreach ($changes as $c) {
			$scanner = $this->backends->getScanner();

			$scanner->scanCalendar($c['backendId'],
				$c['privateUri'], $c['userId']);
		}
	}
}