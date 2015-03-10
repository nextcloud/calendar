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

use OCA\Calendar\IBackend;
use OCA\Calendar\IBackendCollection;

class Watcher {
	const CHECK_ONCE = 0;
	const CHECK_ALWAYS = 1;

	/**
	 * @var integer
	 */
	protected $watchPolicy = self::CHECK_ONCE;


	/**
	 * @var array
	 */
	protected $checkedCalendars = [];


	/**
	 * @var \OCA\Calendar\IBackendCollection
	 */
	protected $backends;


	/**
	 * @var Cache
	 */
	protected $cache;


	/**
	 * @var Scanner
	 */
	protected $scanner;


	/**
	 * @param IBackendCollection $backends
	 */
	public function __construct(IBackendCollection $backends) {
		$this->backends = $backends;

		$this->cache = $backends->getCache();
		$this->scanner = $backends->getScanner();
	}

	/**
	 * was a calendar updated?
	 * @param string $backendId
	 * @param string $privateUri
	 * @param string $userId
	 * @return boolean
	 */
	public function checkUpdate($backendId, $privateUri, $userId) {
		if ($this->watchPolicy === self::CHECK_ALWAYS ||
			($this->watchPolicy === self::CHECK_ONCE && $this->wasCalendarChecked($backendId, $privateUri, $userId))) {
			$backend = $this->backends->find($backendId);
			if (!($backend instanceof IBackend)) {
				return false;
			}

			$cachedCalendar = $this->cache->findByPrivateUri($backendId, $privateUri, $userId);
			$this->setCheckedCalendar($backendId, $privateUri, $userId);

			$calendarAPI = $backend->getCalendarAPI();
			if ($calendarAPI->hasUpdated($cachedCalendar)) {
				$objectScanner = $backend->getObjectScanner($cachedCalendar);
				$objectScanner->scan();

				$this->scanner->scanCalendar($backendId, $privateUri, $userId);
				return true;
			}
			return false;
		} else {
			return false;
		}
	}


	/**
	 * remove deleted calendars from cache
	 * @param string $userId
	 */
	public function clean($userId) {
		/** @var IBackend $backend */
		foreach ($this->backends as $backend) {
			$backendId = $backend->getId();
			$calendarAPI = $backend->getCalendarAPI();
			$cache = $this->backends->getCache();

			$list = $calendarAPI->listAll($userId);
			$cached = $cache->listAllByBackend($backendId, $userId);

			$cList = [];
			foreach ($cached as $c) {
				$cList[] = $c['privateuri'];
			}

			$deletedOnBackend = array_diff($cList, $list);

			$uris = [];
			foreach($deletedOnBackend as $toDelete) {
				$uris[] = [
					'backendId' => $backendId,
					'privateUri' => $toDelete,
					'userId' => $userId,
				];
			}

			$cache->deleteByUris($uris);
		}
	}


	/**
	 * @param string $backendId
	 * @param string $privateUri
	 * @param string $userId
	 */
	protected function setCheckedCalendar($backendId, $privateUri, $userId) {
		if (!isset($this->checkedCalendars[$userId])) {
			$this->checkedCalendars[$userId] = [];
		}
		if (!isset($this->checkedCalendars[$userId][$backendId])) {
			$this->checkedCalendars[$userId][$backendId] = [];
		}
		$this->checkedCalendars[$userId][$backendId][$privateUri] = true;
	}


	/**
	 * @param string $backendId
	 * @param string $privateUri
	 * @param string $userId
	 * @return boolean
	 */
	protected function wasCalendarChecked($backendId, $privateUri, $userId) {
		if (!isset($this->checkedCalendars[$userId][$backendId][$privateUri])) {
			return false;
		}

		return $this->checkedCalendars[$userId][$backendId][$privateUri] === true;
	}


	/**
	 * set policy for scanning
	 * @param integer $policy
	 */
	public function setPolicy($policy) {
		$this->watchPolicy = $policy;
	}
}