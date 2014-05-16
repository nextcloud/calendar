<?php
/**
 * Copyright (c) 2014 Georg Ehrke <oc.list@georgehrke.com>
 * This file is licensed under the Affero General Public License version 3 or
 * later.
 * See the COPYING-README file.
 */
namespace OCA\Calendar\Utility;

use OCP\AppFramework\IAppContainer;
use OCP\Util;

use OCA\Calendar\Db\BackendCollection;
use OCA\Calendar\Db\BackendMapper;

class BackendUtility extends Utility{


	public static function setup(IAppContainer $app, BackendMapper $mapper) {
		$backendCollection = new BackendCollection();

		$enabledBackends = $mapper->findAll()->enabled();
		$enabledBackends->iterate(function($backend) use (&$backendCollection, &$app, &$mapper) {
			$className = $backend->getClassname();
			$args = is_array($backend->getArguments()) ? $backend->getArguments() : array();

			if (class_exists($className) === false){
				$msg  = 'BackendBusinessLayer::setupBackends(): ';
				$msg .= '"' . $className . '" not found';
				Util::writeLog('calendar', $msg, Util::DEBUG);
				$mapper->update($backend->disable());
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
			if ($backend->api->canBeEnabled()) {
				$backendCollection->add($backend);
			}
		});

		if ($backendCollection->count() === 0){
			$msg  = 'BackendBusinessLayer::setupBackends(): ';
			$msg .= 'No backend was setup successfully';
			Util::writeLog('calendar', $msg, Util::ERROR);
		}

		return $backendCollection;
	}
}