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
namespace OCA\Calendar;

use OCA\Calendar\BusinessLayer\BusinessLayerException;
use OCP\Calendar\IBackend;
use OCP\Calendar\ICalendar;
use OCP\Calendar\IObject;
use OCP\Calendar\ObjectType;
use OCP\Calendar\IObjectAPI;
use OCP\Calendar\Permissions;
use OCP\Util;

use OCA\Calendar\Db\ObjectMapper;

use DateTime;

class ObjectManager {

	/**
	 * @var ICalendar
	 */
	protected $calendar;


	/**
	 * @var boolean
	 */
	protected $caching;


	/**
	 * @var IObjectAPI
	 */
	protected $objectAPI;


	/**
	 * @var ObjectMapper
	 */
	protected $objectCache;


	/**
	 * @param ICalendar $calendar
	 */
	public function __construct(ICalendar $calendar) {
		$this->calendar = $calendar;

		if ($calendar->getBackend() instanceof IBackend) {
			$this->objectAPI = $calendar->getBackend()
				->getObjectAPI($calendar);
			$this->objectCache = $calendar->getBackend()
				->getObjectCache($calendar);

			$this->caching = ($this->objectAPI->cache() &&
				$this->objectCache instanceof ObjectMapper);
		}
	}


	/**
	 * Finds all objects in a calendar
	 *
	 * @param integer $type
	 * @param integer $limit
	 * @param integer $offset
	 * @throws \OCA\Calendar\BusinessLayer\BusinessLayerException
	 * @return \OCP\Calendar\IObjectCollection
	 */
	public function findAll($type=ObjectType::ALL, $limit=null, $offset=null) {
		if ($this->caching) {
			return $this->objectCache->findAll($this->calendar, $type, $limit, $offset);
		} else {
			return $this->objectAPI->findAll($type, $limit, $offset);
		}
	}


	/**
	 * Get number of objects in a calendar
	 *
	 * @throws \OCA\Calendar\BusinessLayer\BusinessLayerException
	 * @return array
	 */
	public function listAll() {
		if ($this->caching) {
			//return $this->objectCache->
			return [];
		} else {
			return $this->objectAPI->listAll();
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
	 * @throws \OCA\Calendar\BusinessLayer\BusinessLayerException
	 * @return \OCP\Calendar\IObjectCollection
	 */
	public function findAllInPeriod(DateTime $start, DateTime $end,
									$type=ObjectType::ALL,
									$limit=null, $offset=null) {
		if ($this->caching) {
			return $this->objectCache->findAllInPeriod($this->calendar,
				$start, $end, $type, $limit, $offset);
		} else {
			if ($this->backendSupports(IObjectAPI::FIND_IN_PERIOD)) {
				return $this->objectAPI->findAllInPeriod($start, $end, $type,
					$limit, $offset);
			} else {
				$objects = $this->objectAPI->findAll($type);
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
	 * @throws \OCA\Calendar\BusinessLayer\BusinessLayerException
	 * @return \OCP\Calendar\IObject
	 */
	public function find($uri, $type=ObjectType::ALL) {
		try {
			if ($this->caching) {
				return $this->objectCache->find($this->calendar, $uri, $type);
			} else {
				return $this->objectAPI->find($uri, $type);
			}
		} catch (Backend\Exception $ex) {
			throw BusinessLayerException::fromException($ex);
		}
	}


	/**
	 * Creates an new object
	 *
	 * @param \OCP\Calendar\IObject $object
	 * @throws \OCA\Calendar\BusinessLayer\BusinessLayerException
	 * @return \OCP\Calendar\IObject
	 */
	public function create(IObject $object) {
		try {
			$object->setCalendar($this->calendar);

			$this->checkCalendarSupports(Permissions::CREATE);
			$this->checkBackendSupports(IObjectAPI::CREATE);
			$this->checkObjectIsValid($object);

			Util::emitHook('\OCP\Calendar', 'preCreateObject',
				array(&$object));

			$object = $this->objectAPI->create($object);
			if ($this->caching) {
				$this->objectCache->insert($object);
			}

			Util::emitHook('\OCP\Calendar', 'postCreateObject',
				array($object));

			return $object;
		} catch (Backend\Exception $ex) {
			throw BusinessLayerException::fromException($ex);
		}
	}


	/**
	 * Updates an object
	 *
	 * @param \OCP\Calendar\IObject $object
	 * @throws \OCA\Calendar\BusinessLayer\BusinessLayerException
	 * @return \OCP\Calendar\IObject
	 */
	public function update(IObject $object) {
		try {
			if (strval($object->getCalendar()) !== strval($this->calendar)) {
				throw new BusinessLayerException('Can\'t update object from another calendar');
			}
			$this->checkBackendSupports(IObjectAPI::UPDATE);
			$this->checkCalendarSupports(Permissions::UPDATE);
			$this->checkObjectIsValid($object);

			Util::emitHook('\OCP\Calendar', 'preUpdateObject',
				array(&$object));

			$object = $this->objectAPI->update($object);
			if ($this->caching) {
				$this->objectCache->update($object);
			}

			Util::emitHook('\OCP\Calendar', 'postUpdateObject',
				array($object));

			return $object;
		} catch (Backend\Exception $ex) {
			throw BusinessLayerException::fromException($ex);
		}
	}


	/**
	 * delete an object from a calendar
	 *
	 * @param \OCP\Calendar\IObject $object
	 * @throws \OCA\Calendar\BusinessLayer\BusinessLayerException
	 */
	public function delete(IObject $object) {
		try {
			$this->checkCalendarSupports(Permissions::DELETE);
			$this->checkBackendSupports(IObjectAPI::DELETE);

			Util::emitHook('\OCP\Calendar', 'preDeleteObject',
				array(&$object));

			$this->objectAPI->delete($object);
			if ($this->caching) {
				$this->objectCache->delete($object);
			}

			Util::emitHook('\OCP\Calendar', 'postDeleteObject',
				array($object));

		} catch (Backend\Exception $ex) {
			throw BusinessLayerException::fromException($ex);
		}
	}


	/**
	 * @param string $method
	 * @return boolean
	 */
	private function backendSupports($method) {
		return is_callable([$this->objectAPI, $method]);
	}


	/**
	 * @param string $method
	 * @throws \Exception
	 */
	private function checkBackendSupports($method) {
		if (!$this->backendSupports($method)) {
			throw new \Exception('Backend does not support action');
		}
	}


	/**
	 * @param integer $action
	 * @return boolean
	 */
	private function calendarSupports($action) {
		return $this->calendar->doesAllow($action);
	}


	/**
	 * @param integer $action
	 * @throws \Exception
	 */
	private function checkCalendarSupports($action) {
		if (!$this->calendarSupports($action)) {
			throw new \Exception('Calendar does not support action');
		}
	}


	/**
	 * @param IObject $object
	 * @throws CorruptDataException
	 */
	private function checkObjectIsValid(IObject $object) {
		if (!$object->isValid()) {
			throw new CorruptDataException();
		}
	}
}