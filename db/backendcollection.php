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

use OCA\Calendar\Cache\Calendar\Cache;
use OCA\Calendar\Cache\Calendar\Scanner;
use OCA\Calendar\Cache\Calendar\Updater;
use OCA\Calendar\Cache\Calendar\Watcher;
use OCA\Calendar\IBackend;
use OCA\Calendar\IBackendAPI;
use OCA\Calendar\IBackendCollection;

class BackendCollection extends Collection implements IBackendCollection {

	/**
	 * @var Cache
	 */
	protected $cache;


	/**
	 * @var Scanner
	 */
	protected $scanner;


	/**
	 * @var Updater
	 */
	protected $updater;


	/**
	 * @var Watcher
	 */
	protected $watcher;


	/**
	 * @param callable $cache
	 * @param callable $scanner
	 * @param callable $updater
	 * @param callable $watcher
	 */
	public function __construct(\closure $cache, \closure $scanner,
								\closure $updater, \closure $watcher) {
		$this->cache = call_user_func($cache, $this);
		$this->scanner = call_user_func($scanner, $this);
		$this->updater = call_user_func($updater, $this);
		$this->watcher = call_user_func($watcher, $this);
	}


	/**
	 * Search for a backend by it's name
	 * @param string $id
	 * @return IBackend
	 */
	public function find($id) {
		return $this->search('id', $id)[0];
	}


	/**
	 * get a backend by a subscription type it supports
	 * @param string $type
	 * @return IBackend
	 */
	public function bySubscriptionType($type) {
		foreach($this->objects as $object) {
			/** @var IBackend $object */
			if (!($object->getBackendAPI() instanceof IBackendAPI)) {
				continue;
			}

			$subscriptions = $object->getBackendAPI()->getSubscriptionTypes();
			foreach($subscriptions as $subscription) {
				if (isset($subscription['type']) && $subscription['type'] === $type) {
					return $object;
				}
			}
		}

		return null;
	}


	/**
	 * get an array of backends with it's private uris
	 * @param string $userId
	 * @return array
	 */
	public function getPrivateUris($userId) {
		$privateUris = [];

		foreach($this->objects as $object) {
			/** @var IBackend $object */
			try {
				$privateUris[$object->getId()] =
					$object->getCalendarAPI()->listAll($userId);
			} catch(\Exception $ex) {
				\OC::$server->getLogger()->debug($ex->getMessage());
			}
		}

		return $privateUris;
	}


	/**
	 * @return \OCA\Calendar\Cache\Calendar\Cache
	 */
	public function getCache() {
		return $this->cache;
	}


	/**
	 * @return \OCA\Calendar\Cache\Calendar\Scanner
	 */
	public function getScanner() {
		return $this->scanner;
	}


	/**
	 * @return \OCA\Calendar\Cache\Calendar\Updater
	 */
	public function getUpdater() {
		return $this->updater;
	}


	/**
	 * @return \OCA\Calendar\Cache\Calendar\Watcher
	 */
	public function getWatcher() {
		return $this->watcher;
	}
}