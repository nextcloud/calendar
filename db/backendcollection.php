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

use OCA\Calendar\Backend as BackendUtils;
use OCA\Calendar\IBackend;
use OCA\Calendar\IBackendCollection;

class BackendCollection extends Collection implements IBackendCollection {

	/**
	 * @var []\closure
	 */
	protected $closures=[];


	/**
	 * @var []
	 */
	protected $initializedCache=[];


	/**
	 * @var []\closure
	 */
	protected $queue=[];


	/**
	 * @param \closure $cache
	 * @param \closure $scanner
	 * @param \closure $updater
	 * @param \closure $watcher
	 */
	public function __construct(\closure $cache, \closure $scanner,
								\closure $updater, \closure $watcher) {
		$this->closures = [
			'cache' => $cache,
			'scanner' => $scanner,
			'updater' => $updater,
			'watcher' => $watcher,
		];
	}


	/**
	 * Search for a backend by it's name
	 * @param string $id
	 * @return IBackend|null
	 */
	public function find($id) {
		/** @var IBackend $object */
		foreach ($this->getObjects() as $object) {
			if ($object->getId() === $id) {
				return $object;
			}
		}

		return null;
	}


	/**
	 * get a backend by a subscription type it supports
	 * @param string $type
	 * @return IBackend
	 */
	public function bySubscriptionType($type) {
		foreach($this->getObjects() as $object) {
			/** @var IBackend $object */
			if (!($object->getBackendAPI() instanceof BackendUtils\IBackendAPI)) {
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
	 * get array of all entities
	 *
	 * @return array of Entities
	 */
	public function getObjects() {
		if (!empty($this->queue)) {
			foreach ($this->queue as $backend) {
				$this->objects[] = call_user_func_array($backend, []);
			}
			$this->queue = [];
		}

		return $this->objects;
	}



	public function queue(\closure $backend) {
		$this->queue[] = $backend;
	}


	/**
	 * @return \OCA\Calendar\Cache\Calendar\Cache
	 */
	public function getCache() {
		return $this->getInitializedCache('cache');
	}


	/**
	 * @return \OCA\Calendar\Cache\Calendar\Scanner
	 */
	public function getScanner() {
		return $this->getInitializedCache('scanner');
	}


	/**
	 * @return \OCA\Calendar\Cache\Calendar\Updater
	 */
	public function getUpdater() {
		return $this->getInitializedCache('updater');
	}


	/**
	 * @return \OCA\Calendar\Cache\Calendar\Watcher
	 */
	public function getWatcher() {
		return $this->getInitializedCache('watcher');
	}

	/**
	 * @param string $item
	 * @return mixed
	 */
	protected function getInitializedCache($item) {
		if (!isset($this->initializedCache[$item])) {
			$this->initializedCache[$item] =
				call_user_func_array($this->closures[$item], [$this]);
		}

		return $this->initializedCache[$item];
	}
}