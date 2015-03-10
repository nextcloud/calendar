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

class Watcher {
	const CHECK_ONCE = 0;
	const CHECK_ALWAYS = 1;

	/**
	 * @var integer
	 */
	protected $watchPolicy = self::CHECK_ONCE;


	/**
	 * @var string[]
	 */
	protected $checkedObjectUris = [];


	/**
	 * @var ICalendar
	 */
	protected $calendar;


	/**
	 * @var Cache
	 */
	protected $cache;


	/**
	 * @var Scanner
	 */
	protected $scanner;


	/**
	 * @param ICalendar $calendar
	 */
	public function __construct(ICalendar $calendar) {
		$this->calendar = $calendar;

		$this->cache = $calendar->getBackend()->getObjectCache($calendar);
		$this->scanner = $calendar->getBackend()->getObjectScanner($calendar);
	}


	/**
	 * was an object updated?
	 * @param string $objectUri
	 * @return boolean
	 */
	public function checkUpdate($objectUri) {
		if ($this->watchPolicy === self::CHECK_ALWAYS ||
			($this->watchPolicy === self::CHECK_ONCE && $this->wasObjectChecked($objectUri))) {
			$cachedObject = $this->cache->find($objectUri);
			$this->setCheckedObject($objectUri);

			$objectAPI = $this->calendar->getBackend()->getObjectAPI($this->calendar);
			if ($objectAPI->hasUpdated($cachedObject)) {
				$this->scanner->scanObject($objectUri);
				return true;
			}
			return false;
		} else {
			return false;
		}
	}


	/**
	 * remove deleted objects from cache
	 */
	public function clean() {
		$objectAPI = $this->calendar->getBackend()->getObjectAPI($this->calendar);

		$list = $objectAPI->listAll();
		$cList = $this->cache->listAll();

		$deletedOnRemote = array_diff($cList, $list);

		$this->cache->deleteList($deletedOnRemote);
	}


	/**
	 * @param string $objectUri
	 */
	protected function setCheckedObject($objectUri) {
		$this->checkedObjectUris[$objectUri] = true;
	}


	/**
	 * @param string $objectUri
	 * @return boolean
	 */
	protected function wasObjectChecked($objectUri) {
		if (!array_key_exists($objectUri, $this->checkedObjectUris)) {
			return false;
		}

		return $this->checkedObjectUris[$objectUri] === true;
	}


	/**
	 * set policy for scanning
	 * @param integer $policy
	 */
	public function setPolicy($policy) {
		$this->watchPolicy = $policy;
	}
}