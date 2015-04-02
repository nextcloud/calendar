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
use OCA\Calendar\ICalendar;

class Updater{

	/**
	 * @var IBackendCollection
	 */
	protected $backends;


	/**
	 * @var \OCA\Calendar\Cache\Calendar\ChangePropagator
	 */
	protected $propagator;


	/**
	 * @param IBackendCollection $backends
	 */
	public function __construct(IBackendCollection $backends) {
		$this->backends = $backends;
		$this->propagator = new ChangePropagator($backends);
	}


	/**
	 * @param string $backendId
	 * @param string $privateUri
	 * @param string $userId
	 * @param ICalendar $newCalendar
	 */
	public function propagate($backendId, $privateUri, $userId, ICalendar $newCalendar=null) {
		$this->propagator->addChange($backendId, $privateUri, $userId, $newCalendar);
		$this->propagator->propagateChanges();
	}


	/**
	 * @param string $backendId
	 * @param string $privateUri
	 * @param string $userId
	 */
	public function remove($backendId, $privateUri, $userId) {
		$cache = $this->backends->getCache();

		$calendar = $cache->findByPrivateUri($backendId, $privateUri, $userId);
		$objectCache = $calendar->getBackend()->getObjectCache($calendar);
		$objectCache->clear();

		$cache->deleteByUris([
			[
				'backendId' => $backendId,
				'privateUri' => $privateUri,
				'userId' => $userId,
			],
		]);
	}


	/**
	 * propagate any leftover changes
	 */
	public function __destruct() {
		$this->propagator->propagateChanges();
	}
}