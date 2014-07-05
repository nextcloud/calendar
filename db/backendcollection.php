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

use OCP\Calendar\IBackend;
use OCP\Calendar\IBackendAPI;
use OCP\Calendar\IBackendCollection;

class BackendCollection extends Collection implements IBackendCollection {

	/**
	 * Get a collection of all enabled backends within collection
	 * @return BackendCollection of all enabled backends
	 */
	public function enabled() {
		return $this->search('enabled', true);
	}


	/**
	 * Get a collection of all disabled backends within collection
	 * @return BackendCollection of all disabled backends
	 */
	public function disabled() {
		return $this->search('enabled', false);
	}


	/**
	 * get a backend by a subscription type it supports
	 * @param string $type
	 * @return IBackend
	 */
	public function bySubscriptionType($type) {
		$b = null;

		$this->iterate(function(IBackend $backend) use ($type, &$b) {
			if (!($backend->getAPI() instanceof IBackendAPI)) {
				return true;
			}

			$api = $backend->getAPI();
			$subscriptions = $api->getSubscriptionTypes();
			foreach($subscriptions as $subscription) {
				if (isset($subscription['type']) &&
					$subscription['type'] === $type) {
					$b = $backend;
					return false;
				}
			}

			return true;
		});

		return $b;
	}


	/**
	 * Search for a backend by it's name
	 * @param $backendName
	 * @return Backend
	 */
	public function find($backendName) {
		return $this->search('backend', $backendName)->reset();
	}


	/**
	 * Check if backend is enabled
	 * @param string $backendName
	 * @return bool
	 */
	public function isEnabled($backendName) {
		return $this->find($backendName)->getEnabled();
	}
}