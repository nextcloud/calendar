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

use OCP\Calendar\IBackend;

class Manager {

	/**
	 * @var array
	 */
	private static $backends=[];


	/**
	 * get all registered backends
	 *
	 * @return array
	 */
	public static function getAll() {
		return self::$backends;
	}


	/**
	 * register backend
	 *
	 * @param $backend
	 * @return void
	 */
	public static function register($backend) {
		if (!($backend instanceof IBackend)) {
			return;
		}

		foreach(self::$backends as $registeredBackend) {
			/** @var \OCP\Calendar\IBackend $registeredBackend */
			if ($backend->getId() === $registeredBackend->getId()) {
				\OC::$server->getLogger()->error(
					'{backend} was already registered!',
					array(
						'backend' => $backend->getId()
					)
				);
				return;
			}
		}

		self::$backends[] = $backend;
	}


	/**
	 * reset already registered backends
	 */
	public static function reset() {
		self::$backends = [];
	}
}