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

use OCA\Calendar\Backend\DoesNotExistException;
use OCA\Calendar\Backend\MultipleObjectsReturnedException;
use OCA\Calendar\Backend\TemporarilyNotAvailableException;
use OCA\Calendar\CorruptDataException;
use OCA\Calendar\IBackend;
use OCA\Calendar\ICalendar;
use OCA\Calendar\IObject;

use OCA\Calendar\IObjectAPI;
use OCP\ILogger;

use OCP\AppFramework\Db\DoesNotExistException as DoesNotExistMapperException;
use OCP\AppFramework\Db\MultipleObjectsReturnedException as MultipleObjectsReturnedMapperException;

class Scanner {

	/**
	 * @var ICalendar
	 */
	protected $calendar;


	/**
	 * @var \OCA\Calendar\Cache\Object\Cache
	 */
	protected $cache;


	/**
	 * @var \OCA\Calendar\IObjectAPI
	 */
	protected $objectAPI;


	/**
	 * @var ILogger
	 */
	protected $logger;


	/**
	 * @param ICalendar $calendar
	 */
	public function __construct(ICalendar $calendar) {
		$this->calendar = $calendar;

		$backend = $this->calendar->getBackend();
		if (!($backend instanceof IBackend)) {
			$identifier = implode('::', [
				$this->calendar->getUserId(),
				'?',
				$this->calendar->getPrivateUri(),
			]);

			$this->logger->error('Backend of calendar \'' . $identifier . '\' not found');
		} else {
			$this->cache = $backend->getObjectCache($calendar);
			$this->objectAPI = $backend->getObjectAPI($calendar);
		}
	}


	/**
	 * @param $objectUri
	 */
	public function scanObject($objectUri) {
		if (!$this->isCalendarsBackendValid()) {
			return;
		}

		$object = $this->getRemoteAndDeleteIfNecessary($objectUri);
		if (!$object) {
			return;
		}

		$cached = $this->getCached($objectUri);
		if ($cached) {
			$object->setId($cached->getId());
			$this->updateCache($object);
		} else {
			$this->addToCache($object);
		}
	}


	/**
	 * @param $objectUri
	 * @return null|IObject
	 */
	protected function getRemoteAndDeleteIfNecessary($objectUri) {
		try {
			return $this->objectAPI->find($objectUri);
		} catch(DoesNotExistException $ex) {
			//$this->logger->debug($msg);

			$this->removeFromCache($objectUri);
			return null;
		} catch(MultipleObjectsReturnedException $ex) {
			//$this->logger->warn($msg);

			$this->removeFromCache($objectUri);
			return null;
		} catch(TemporarilyNotAvailableException $ex) {
			//$this->logger->debug($msg);

			return null;
		} catch(CorruptDataException $ex) {
			//$this->logger->debug($msg);

			$this->removeFromCache($objectUri);
			return null;
		}
	}


	/**
	 * @param $objectUri
	 * @return null|IObject
	 */
	protected function getCached($objectUri) {
		try {
			return $this->cache->find($objectUri);
		} catch(DoesNotExistMapperException $ex) {
			return null;
		} catch(MultipleObjectsReturnedMapperException $ex) {
			//$this->logger->warn($msg);
			return null;
		}
	}


	/**
	 * @param IObject $object
	 */
	protected function addToCache(IObject $object) {
		$this->cache->insert($object);
	}


	/**
	 * @param IObject $object
	 */
	protected function updateCache(IObject $object) {
		$this->cache->update($object);
	}


	/**
	 * @param string $objectUri
	 */
	protected function removeFromCache($objectUri) {
		$this->cache->deleteList([$objectUri]);
	}


	/**
	 * scan calendar for changed objects
	 */
	public function scan() {
		if (!$this->isCalendarsBackendValid()) {
			return;
		}

		$list = $this->objectAPI->listAll();
		foreach($list as $l) {
			$this->scanObject($l);
		}
	}


	/**
	 * @return boolean
	 */
	private function isCalendarsBackendValid() {
		return ($this->objectAPI instanceof IObjectAPI && $this->cache instanceof Cache);
	}
}