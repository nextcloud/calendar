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
namespace OCA\Calendar\BusinessLayer;

use OCA\Calendar\Backend as BackendUtils;
use OCA\Calendar\CorruptDataException;
use OCA\Calendar\IBackend;
use OCA\Calendar\ICalendar;
use OCA\Calendar\IObject;
use OCA\Calendar\Db\ObjectType;
use OCA\Calendar\Db\Permissions;
use OCa\Calendar\Utility\ObjectUtility;

use OCP\ILogger;
use OCP\Util;

use DateTime;

class ObjectManager {

	/**
	 * @var \OCA\Calendar\Db\Calendar
	 */
	protected $calendar;


	/**
	 * @var boolean
	 */
	protected $isCachingEnabled;


	/**
	 * @var BackendUtils\IObjectAPI
	 */
	protected $api;


	/**
	 * @var \OCA\Calendar\Cache\Object\Cache
	 */
	protected $cache;


	/**
	 * @var \OCA\Calendar\Cache\Object\Updater
	 */
	protected $updater;


	/**
	 * @var \OCA\Calendar\Cache\Object\Watcher
	 */
	protected $watcher;


	/**
	 * @var ILogger
	 */
	protected $logger;


	/**
	 * @param ICalendar $calendar
	 * @param ILogger $logger
	 */
	public function __construct(ICalendar $calendar, ILogger $logger) {
		$this->calendar = $calendar;
		$this->logger = $logger;

		if ($calendar->getBackend() instanceof IBackend) {
			try {
				$this->api = $calendar->getBackend()
					->getObjectAPI($calendar);
			} catch(BackendUtils\Exception $ex) {
				//TODO
			}

			$this->cache = $calendar->getBackend()
				->getObjectCache($calendar);
			$this->updater = $calendar->getBackend()
				->getObjectUpdater($calendar);
			$this->watcher = $calendar->getBackend()
				->getObjectWatcher($calendar);

			$this->isCachingEnabled = $this->api->cache();
		}
	}


	/**
	 * Finds all objects in a calendar
	 *
	 * @param integer $type
	 * @param integer $limit
	 * @param integer $offset
	 * @throws \OCA\Calendar\BusinessLayer\Exception
	 * @return \OCA\Calendar\IObjectCollection
	 */
	public function findAll($type=ObjectType::ALL, $limit=null, $offset=null) {
		if ($this->isCachingEnabled) {
			if ($this->calendar->checkUpdate()) {
				$this->calendar->propagate();
			}

			return $this->cache->findAll($type, $limit, $offset);
		} else {
			return $this->api->findAll($type, $limit, $offset);
		}
	}


	/**
	 * Get number of objects in a calendar
	 *
	 * @throws \OCA\Calendar\BusinessLayer\Exception
	 * @return array
	 */
	public function listAll() {
		if ($this->isCachingEnabled) {
			if ($this->calendar->checkUpdate()) {
				$this->calendar->propagate();
			}

			return $this->cache->listAll();
		} else {
			return $this->api->listAll();
		  }
	}


	/**
	 * Find all objects in a certain time-frame in a calendar
	 *
	 * @param \DateTime $start start of time-frame
	 * @param \DateTime $end end of time-frame
	 * @param integer $type
	 * @param integer $limit
	 * @param integer $offset
	 * @throws \OCA\Calendar\BusinessLayer\Exception
	 * @return \OCA\Calendar\IObjectCollection
	 */
	public function findAllInPeriod(DateTime $start, DateTime $end,
									$type=ObjectType::ALL,
									$limit=null, $offset=null) {
		if ($this->isCachingEnabled) {
			if ($this->calendar->checkUpdate()) {
				$this->calendar->propagate();
			}

			return $this->cache->findAllInPeriod($start, $end,
				$type, $limit, $offset);
		} else {
			if ($this->api instanceof BackendUtils\IObjectAPIFindInPeriod) {
				return $this->api->findAllInPeriod($start, $end, $type,
					$limit, $offset);
			} else {
				$objects = $this->api->findAll($type);
				$objects->inPeriod($start, $end);
				$objects->subset($limit, $offset);

				return $objects;
			}
		}
	}


	/**
	 * Find a certain object
	 *
	 * @param string $uri UID of the object
	 * @param integer $type
	 * @throws \OCA\Calendar\BusinessLayer\Exception
	 * @return \OCA\Calendar\IObject
	 */
	public function find($uri, $type=ObjectType::ALL) {
		try {
			if ($this->isCachingEnabled) {
				if ($this->watcher->checkUpdate($uri)) {
					$this->updater->propagate($uri);
				}

				return $this->cache->find($uri, $type);
			} else {
				return $this->api->find($uri, $type);
			}
		} catch (BackendUtils\Exception $ex) {
			throw Exception::fromException($ex);
		}
	}


	/**
	 * Creates an new object
	 *
	 * @param \OCA\Calendar\IObject $object
	 * @throws \OCA\Calendar\BusinessLayer\Exception
	 * @return \OCA\Calendar\IObject
	 */
	public function create(IObject $object) {
		try {
			if(is_null($object->getUri())) {
				$object->setUri(ObjectUtility::randomURI());
			}

			$object->setCalendar($this->calendar);
			// generate an provisional etag, backends can overwrite it if necessary
			$object->getEtag(true);

			$this->checkCalendarSupports(Permissions::CREATE);
			if (!($this->api instanceof BackendUtils\IObjectAPICreate)) {
				throw new Exception('Backend does not support creating objects');
			}
			$this->checkObjectIsValid($object);

			Util::emitHook('\OCA\Calendar', 'preCreateObject',
				array($object));

			$object = $this->api->create($object);
			if ($this->isCachingEnabled) {
				$this->updater->propagate($object->getUri());
			}

			Util::emitHook('\OCA\Calendar', 'postCreateObject',
				array($object));

			return $object;
		} catch (BackendUtils\Exception $ex) {
			throw Exception::fromException($ex);
		}
	}


	/**
	 * Updates an object
	 *
	 * @param \OCA\Calendar\IObject $object
	 * @throws \OCA\Calendar\BusinessLayer\Exception
	 * @return \OCA\Calendar\IObject
	 */
	public function update(IObject $object) {
		try {
			if (strval($object->getCalendar()) !== strval($this->calendar)) {
				throw new Exception('Can\'t update object from another calendar');
			}

			$this->checkCalendarSupports(Permissions::UPDATE);
			if (!($this->api instanceof BackendUtils\IObjectAPIUpdate)) {
				throw new Exception('Backend does not support updating objects');
			}
			$this->checkObjectIsValid($object);

			Util::emitHook('\OCA\Calendar', 'preUpdateObject',
				array($object));

			$object = $this->api->update($object);
			if ($this->isCachingEnabled) {
				$this->updater->propagate($object->getUri());
			}

			Util::emitHook('\OCA\Calendar', 'postUpdateObject',
				array($object));

			return $object;
		} catch (BackendUtils\Exception $ex) {
			throw Exception::fromException($ex);
		}
	}


	/**
	 * delete an object from a calendar
	 *
	 * @param \OCA\Calendar\IObject $object
	 * @throws \OCA\Calendar\BusinessLayer\Exception
	 */
	public function delete(IObject $object) {
		try {
			$this->checkCalendarSupports(Permissions::DELETE);
			if (!($this->api instanceof BackendUtils\IObjectAPIDelete)) {
				throw new Exception('Backend does not support deleting objects');
			}

			Util::emitHook('\OCA\Calendar', 'preDeleteObject',
				array($object));

			$this->api->delete($object);
			if ($this->isCachingEnabled) {
				$this->updater->propagate($object->getUri());
			}

			Util::emitHook('\OCA\Calendar', 'postDeleteObject',
				array($object));

		} catch (BackendUtils\Exception $ex) {
			throw Exception::fromException($ex);
		}
	}


	/**
	 * @param integer $action
	 * @throws Exception
	 */
	protected function checkCalendarSupports($action) {
		if (!$this->calendar->doesAllow($action)) {
			switch($action) {
				case Permissions::CREATE:
					throw new Exception('Calendar does not allow creating objects');
					break;

				case Permissions::UPDATE:
					throw new Exception('Calendar does not allow updating objects');
					break;

				case Permissions::DELETE:
					throw new Exception('Calendar does not allow deleting objects');
					break;

				default:
					throw new Exception('Calendar does not support wanted action');
					break;
			}
		}
	}


	/**
	 * @param IObject $object
	 * @throws CorruptDataException
	 */
	protected function checkObjectIsValid(IObject $object) {
		if (!$object->isValid()) {
			throw new CorruptDataException();
		}
	}
}