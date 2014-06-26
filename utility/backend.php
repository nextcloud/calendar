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
namespace OCA\Calendar\Utility;

use OCP\AppFramework\IAppContainer;
use OCP\Util;
use OCP\Calendar\IBackend;
use OCP\Calendar\IBackendCollection;

use OCA\Calendar\Db\BackendCollection;

class BackendUtility extends Utility{


	/**
	 * @param IAppContainer $app
	 * @param IBackendCollection $allBackends
	 * @return IBackendCollection
	 */
	public static function setup(IAppContainer $app, IBackendCollection $allBackends) {
		$backendCollection = new BackendCollection();

		$allBackends->iterate(function(IBackend $backend) use (&$backendCollection, &$app, &$mapper) {
			$className = $backend->getClassname();
			$args = is_array($backend->getArguments()) ? $backend->getArguments() : array();

			if (class_exists($className) === false){
				$msg  = 'BackendBusinessLayer::setupBackends(): ';
				$msg .= '"' . $className . '" not found';
				Util::writeLog('calendar', $msg, Util::DEBUG);
				return false;
			}

			if ($backendCollection->search('backend', $backend->getBackend())->count() > 0) {
				$msg  = 'BackendBusinessLayer::setupBackends(): ';
				$msg .= '"' . $className . '" already initialized. ';
				$msg .= 'Please check for double entries';
				Util::writeLog('calendar', $msg, Util::DEBUG);
				return false;
			}

			$reflectionObj = new \ReflectionClass($className);
			$api = $reflectionObj->newInstanceArgs(array($app, $args));
			$backend->registerAPI($api);
			//check if a backend can enabled
			if ($backend->getAPI()->canBeEnabled()) {
				$backendCollection->add($backend);
			}

			return true;
		});

		if ($backendCollection->count() === 0){
			$msg  = 'BackendBusinessLayer::setupBackends(): ';
			$msg .= 'No backend was setup successfully';
			Util::writeLog('calendar', $msg, Util::ERROR);
		}

		return $backendCollection;
	}
}