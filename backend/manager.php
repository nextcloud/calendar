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
namespace OCA\Calendar\Backend;

use OCA\Calendar\Db\BackendCollection;
use OCA\Calendar\IBackend;
use OCA\Calendar\IBackendCollection;

class Manager {
	/**
	 * @var IBackendCollection
	 */
	protected $backends;


	/**
	 * Constructor
	 */
	public function __construct() {
		$this->clear();
	}


	/**
	 * get all registered backends
	 *
	 * @return IBackendCollection
	 */
	public function getAll() {
		return $this->backends;
	}


	/**
	 * add backend to manager
	 *
	 * @param IBackend $backend
	 */
	public function addBackend(IBackend $backend) {
		foreach($this->backends as $registeredBackend) {
			/** @var \OCA\Calendar\IBackend $registeredBackend */
			if ($backend->getId() === $registeredBackend->getId()) {
				\OC::$server->getLogger()->error(
					'{backend} was already registered!',
					[
						'backend' => $backend->getId()
					]
				);
				return;
			}
		}

		$this->backends[] = $backend;
	}


	/**
	 * remove backend from manager
	 *
	 * @param IBackend $backend
	 */
	public function removeBackend(IBackend $backend) {
		if(($key = array_search($backend, $this->backends)) !== false) {
			unset($this->backends[$key]);
		}
	}


	/**
	 * reset already registered backends
	 */
	public function clear() {
		$this->backends = new BackendCollection();
	}
}