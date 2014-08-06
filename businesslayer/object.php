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

use OCP\AppFramework\Http;
use OCP\Calendar\Backend;
use OCP\Calendar\BackendException;
use OCP\Calendar\DoesNotExistException;
use OCP\Calendar\MultipleObjectsReturnedException;
use OCP\Calendar\ICalendar;
use OCP\Calendar\IObject;
use OCP\Calendar\Permissions;
use OCP\Util;

use OCA\Calendar\Db\ObjectMapper;

use DateTime;

class ObjectBusinessLayer extends BackendCollectionBusinessLayer {

	/**
	 * @var ObjectMapper
	 */
	protected $mapper;


	/**
	 * Finds all objects in a calendar
	 * @param \OCP\Calendar\ICalendar $calendar
	 * @param integer $limit
	 * @param integer $offset
	 * @throws \OCA\Calendar\BusinessLayer\BusinessLayerException
	 * @return \OCP\Calendar\IObjectCollection
	 */
	public function findAll(ICalendar &$calendar, $limit=null, $offset=null) {
		try {
			list ($backend, $calUri, $userId) = $this->getBasicProps($calendar);

			$api = $this->backends->find($backend)->getAPI();
			if ($api->cacheObjects($calUri, $userId)) {
				$objects = $this->mapper->findAll($calendar, $limit, $offset);
			} else {
				$objects = $api->findObjects($calendar, $limit, $offset);
			}

			return $objects;
		} catch (DoesNotExistException $ex) {
			return $this->throwBusinessLayerException($ex);
		} catch (BackendException $ex) {
			return $this->throwBusinessLayerException($ex);
		}
	}


	/**
	 * Get number of objects in a calendar
	 * @param \OCP\Calendar\ICalendar $calendar Calendar object
	 * @throws \OCA\Calendar\BusinessLayer\BusinessLayerException
	 * @return integer
	 */
	public function numberOfObjects(ICalendar &$calendar) {
		try {
			list ($backend, $calUri, $userId) = $this->getBasicProps($calendar);

			$api = $this->backends->find($backend)->getAPI();
			if ($api->cacheObjects($calUri, $userId)) {
				$number = $this->mapper->count($calendar);
			} else {
				$number = $api->countObjects($calendar);
			}

			return $number;
		} catch (DoesNotExistException $ex) {
			return $this->throwBusinessLayerException($ex);
		} catch (BackendException $ex) {
			return $this->throwBusinessLayerException($ex);
		}
	}


	/**
	 * Find a certain object
	 * @param \OCP\Calendar\ICalendar $calendar
	 * @param string $uri UID of the object
	 * @throws \OCA\Calendar\BusinessLayer\BusinessLayerException
	 * @return \OCP\Calendar\IObject
	 */
	public function find(ICalendar &$calendar, $uri) {
		try {
			list ($backend, $calUri, $userId) = $this->getBasicProps($calendar);

			$api = $this->backends->find($backend)->getAPI();
			if ($api->cacheObjects($calUri, $userId)) {
				$object = $this->mapper->find($calendar, $uri);
			} else {
				$object = $api->findObject($calendar, $uri);
			}

			return $object;
		} catch (DoesNotExistException $ex) {
			return $this->throwBusinessLayerException($ex);
		} catch (MultipleObjectsReturnedException $ex) {
			return $this->throwBusinessLayerException($ex);
		} catch (BackendException $ex) {
			return $this->throwBusinessLayerException($ex);
		}
	}


	/**
	 * Find a certain object by type
	 * @param \OCP\Calendar\ICalendar $calendar
	 * @param string $uri UID of the object
	 * @param integer $type
	 * @throws \OCA\Calendar\BusinessLayer\BusinessLayerException
	 * @return \OCP\Calendar\IObject
	 */
	public function findByType(ICalendar &$calendar, $uri, $type) {
		$object = $this->find($calendar, $uri);

		if ($object->getType() !== $type) {
			throw new BusinessLayerException(
				'Object was found but is not of requested type!',
				Http::STATUS_NOT_FOUND
			);
		}

		return $object;
	}


	/**
	 * Find all objects of a certain type in a calendar
	 * @param \OCP\Calendar\ICalendar $calendar
	 * @param integer $type
	 * @param integer $limit
	 * @param integer $offset
	 * @throws \OCA\Calendar\BusinessLayer\BusinessLayerException
	 * @return \OCP\Calendar\IObjectCollection
	 */
	public function findAllByType(ICalendar &$calendar, $type,
								  $limit=null, $offset=null) {
		try {
			list ($backend, $calUri, $userId) = $this->getBasicProps($calendar);

			$api = $this->backends->find($backend)->getAPI();
			if ($api->cacheObjects($calUri, $userId)) {
				$objects = $this->mapper->findAllByType($calendar,
					$type, $limit, $offset);
			} else {
				if ($this->doesBackendSupport($backend,
											  Backend::FIND_OBJECTS_BY_TYPE)) {
					$objects = $api->findObjectsByType($calendar,
						$type, $limit, $offset);
				} else {
					$objects = $api->findObjects($calendar, null, null);
					$objects->ofType($type);
					$objects->subset($limit, $offset);
				}
			}

			return $objects;
		} catch (DoesNotExistException $ex) {
			return $this->throwBusinessLayerException($ex);
		} catch (BackendException $ex) {
			return $this->throwBusinessLayerException($ex);
		}
	}


	/**
	 * Find all objects in a certain time-frame in a calendar
	 * @param \OCP\Calendar\ICalendar $calendar
	 * @param \DateTime $start start of time-frame
	 * @param \DateTime $end end of time-frame
	 * @param integer $limit
	 * @param integer $offset
	 * @throws \OCA\Calendar\BusinessLayer\BusinessLayerException
	 * @return \OCP\Calendar\IObjectCollection
	 */
	public function findAllInPeriod(ICalendar &$calendar, DateTime $start,
									DateTime $end, $limit=null, $offset=null) {
		try {
			list ($backend, $calUri, $userId) = $this->getBasicProps($calendar);

			$api = $this->backends->find($backend)->getAPI();
			if ($api->cacheObjects($calUri, $userId)) {
				$objects = $this->mapper->findAllInPeriod($calendar,
					$start, $end, $limit, $offset);
			} else {
				if ($this->doesBackendSupport($backend,
											  Backend::FIND_IN_PERIOD)) {
					$objects = $api->findObjectsInPeriod($calendar,
						$start, $end, $limit, $offset);
				} else {
					$objects = $api->findObjects($calendar, null, null);
					$objects->inPeriod($start, $end);
					$objects->subset($limit, $offset);
				}
			}

			return $objects;
		} catch (DoesNotExistException $ex) {
			return $this->throwBusinessLayerException($ex);
		} catch (BackendException $ex) {
			return $this->throwBusinessLayerException($ex);
		}
	}


	/**
	 * Find all objects in a certain time-frame of a type in a calendar
	 * @param \OCP\Calendar\ICalendar $calendar
	 * @param integer $type
	 * @param \DateTime $start start of the time-frame
	 * @param \DateTime $end end of the time-frame
	 * @param integer $limit
	 * @param integer $offset
	 * @throws \OCA\Calendar\BusinessLayer\BusinessLayerException
	 * @return \OCP\Calendar\IObjectCollection
	 */
	public function findAllByTypeInPeriod(ICalendar &$calendar, $type,
										  DateTime $start, DateTime $end,
										  $limit=null, $offset=null) {
		try {
			list ($backend, $calUri, $userId) = $this->getBasicProps($calendar);

			$api = $this->backends->find($backend)->getAPI();
			if ($api->cacheObjects($calUri, $userId)) {
				$objects = $this->mapper->findAllByTypeInPeriod($calendar,
					$type, $start, $end, $limit, $offset);
			} else {
				if ($this->doesBackendSupport($backend,
											  Backend::FIND_IN_PERIOD_BY_TYPE)) {
					$objects = $api->findObjectsByTypeInPeriod($calendar,
						$type, $start, $end, $limit, $offset);
				} else {
					$objects = $api->findObjects($calendar, null, null);
					$objects->ofType($type);
					$objects->inPeriod($start, $end);
					$objects->subset($limit, $offset);
				}
			}

			return $objects;
		} catch (DoesNotExistException $ex) {
			return $this->throwBusinessLayerException($ex);
		} catch (BackendException $ex) {
			return $this->throwBusinessLayerException($ex);
		}
	}


	/**
	 * Get whether or not an object exists
	 * @param \OCP\Calendar\ICalendar $calendar
	 * @param string $uri
	 * @throws \OCA\Calendar\BusinessLayer\BusinessLayerException
	 * @return boolean
	 */
	public function doesExist(ICalendar &$calendar, $uri) {
		try {
			list ($backend, $calUri, $userId) = $this->getBasicProps($calendar);

			$api = $this->backends->find($backend)->getAPI();
			if ($api->cacheObjects($calUri, $userId)) {
				$doesExist = $this->mapper->doesExist($calendar, $uri);
			} else {
				$doesExist = $api->doesObjectExist($calendar, $uri);
			}

			return $doesExist;
		} catch(BackendException $ex) {
			return $this->throwBusinessLayerException($ex);
		} catch(DoesNotExistException $ex) {
			return $this->throwBusinessLayerException($ex);
		}
	}


	/**
	 * Creates an new object
	 * @param \OCP\Calendar\IObject $object
	 * @throws \OCA\Calendar\BusinessLayer\BusinessLayerException
	 * @return \OCP\Calendar\IObject
	 */
	public function create(IObject &$object) {
		try {
			$calendar = $object->getCalendar();
			list ($backend, $calUri, $userId) = $this->getBasicProps($calendar);

			$this->checkBackendSupports($backend, Backend::CREATE_CALENDAR);
			$this->checkIsValid($object);

			Util::emitHook('\OCP\Calendar', 'preCreateObject',
				array(
					&$object
				)
			);

			$api = $this->backends->find($backend)->getAPI();
			$api->createObject($object);

			if ($api->cacheObjects($calUri, $userId)) {
				$this->mapper->insert($object,
					$api->cacheObjects($calUri, $userId));
			}

			Util::emitHook('\OCP\Calendar', 'postCreateObject',
				array(
					$object
				)
			);

			return $object;
		} catch(BackendException $ex) {
			return $this->throwBusinessLayerException($ex);
		}
	}


	/**
	 * Updates an object
	 * @param \OCP\Calendar\IObject $newObject
	 * @param \OCP\Calendar\ICalendar $oldCalendar
	 * @param string $oldUri
	 * @throws \OCA\Calendar\BusinessLayer\BusinessLayerException
	 * @return \OCP\Calendar\IObject
	 */
	public function update(IObject &$newObject, ICalendar &$oldCalendar,
						   $oldUri) {
		try {
			$oldObject = $this->find($oldCalendar, $oldUri);

			$this->checkUsersEqual($newObject->getCalendar()->getUserId(),
				$oldObject->getCalendar()->getUserId());
			$this->checkBackendEnabled($newObject->getCalendar()->getBackend());
			$this->checkBackendEnabled($oldObject->getCalendar()->getBackend());
			$this->checkIsValid($newObject);

			Util::emitHook('\OCP\Calendar', 'preUpdateObject',
				array(
					&$newObject
				)
			);

			if ($this->doesNeedMove($newObject, $oldObject)) {
				$newObject = $this->move($newObject, $oldObject);
			} else {
				$newObject = $this->updateData($newObject);
			}

			Util::emitHook('\OCP\Calendar', 'postUpdateObject',
				array(
					$newObject
				)
			);

			return $newObject;
		} catch(BackendException $ex) {
			return $this->throwBusinessLayerException($ex);
		}
	}


	/**
	 * @param \OCP\Calendar\IObject $object
 	 * @return \OCP\Calendar\IObject
	 */
	private function updateData(IObject $object) {
		$calendar = $object->getCalendar();

		$backend = $calendar->getBackend();
		$privateuri = $calendar->getPrivateUri();
		$userId = $calendar->getUserId();

		$this->checkBackendSupports($backend, Backend::UPDATE_OBJECT);
		$this->checkCalendarSupports($calendar, Permissions::UPDATE);

		$api = $this->backends->find($backend)->getAPI();
		$api->updateObject($object);

		if ($api->cacheObjects($privateuri, $userId)) {
			$this->mapper->update($object);
		}

		return $object;
	}


	/**
	 * move object
	 * @param \OCP\Calendar\IObject $newObject
	 * @param \OCP\Calendar\IObject $oldObject
	 * @throws \OCA\Calendar\BusinessLayer\BusinessLayerException
	 * @return \OCP\Calendar\IObject
	 */
	private function move(IObject &$newObject, IObject &$oldObject) {
		try {
			$newCalendar = $newObject->getCalendar();
			$newBackend = $newCalendar->getBackend();

			$oldCalendar = $oldObject->getCalendar();
			$oldBackend = $oldCalendar->getBackend();

			$this->checkBackendSupports($newBackend, Backend::CREATE_OBJECT);
			$this->checkBackendSupports($oldBackend, Backend::DELETE_OBJECT);

			$this->checkCalendarSupports($newCalendar, Permissions::CREATE);
			$this->checkCalendarSupports($oldCalendar, Permissions::DELETE);

			$oldBackendsAPI = &$this->backends->find($oldBackend)->getAPI();
			$newBackendsAPI = &$this->backends->find($newBackend)->getAPI();

			$oldObjectFromRemote = $oldBackendsAPI->findObject($oldCalendar,
				$oldObject->getUri());
			$object = (clone $oldObjectFromRemote);
			$object->setCalendar($newCalendar);

			$newBackendsAPI->createObject($object);
			$oldBackendsAPI->deleteObject($oldObjectFromRemote);

			return $object;
		} catch(BackendException $ex) {
			return $this->throwBusinessLayerException($ex);
		} catch(DoesNotExistException $ex) {
			return $this->throwBusinessLayerException($ex);
		} catch(MultipleObjectsReturnedException $ex) {
			return $this->throwBusinessLayerException($ex);
		}
	}


	/**
	 * delete an object from a calendar
	 * @param \OCP\Calendar\IObject $object
	 * @throws \OCA\Calendar\BusinessLayer\BusinessLayerException
	 */
	public function delete(IObject &$object) {
		try {
			$calendar = $object->getCalendar();
			$uri = $object->getUri();

			list ($backend, $calUri, $userId) = $this->getBasicProps($calendar);

			$this->checkBackendEnabled($backend);
			$this->checkBackendSupports($backend, Backend::DELETE_OBJECT);

			Util::emitHook('\OCP\Calendar', 'preDeleteObject',
				array(
					&$object
				)
			);

			$api = $this->backends->find($backend)->getAPI();
			$api->deleteObject($calUri, $uri, $userId);
			if ($api->cacheObjects($calUri, $userId)) {
				$this->mapper->delete($calendar);
			}

			Util::emitHook('\OCP\Calendar', 'postDeleteObject',
				array(
					$object
				)
			);

		} catch(BackendException $ex) {
			$this->throwBusinessLayerException($ex);
		}
	}


	/**
	 * Get whether or not a calendar needs a move
	 * @param \OCP\Calendar\IObject $newObject
	 * @param \OCP\Calendar\IObject $oldObject
	 * @return bool
	 */
	private function doesNeedMove(IObject $newObject, IObject $oldObject) {
		$newCalendar = $newObject->getCalendar();
		$oldCalendar = $oldObject->getCalendar();

		return (
			(
				$newCalendar->getPublicUri() !== $oldCalendar->getPublicUri() &&
				!$this->doesExist($newCalendar, $newObject->getUri())
			)
			||
			$newCalendar->getUserId() !== $oldCalendar->getUserId()
		);
	}


	/**
	 * check if a calendar supports a certain action
	 * @param \OCP\Calendar\ICalendar $calendar
	 * @param integer $action
	 * @throws \OCA\Calendar\BusinessLayer\BusinessLayerException
	 * @return bool
	 */
	private function checkCalendarSupports(ICalendar $calendar, $action) {
		if (!$calendar->doesAllow($action)) {
			throw new BusinessLayerException(
				'Action not allowed!',
				Http::STATUS_FORBIDDEN
			);
		}
	}


	/**
	 * get the basic properties for a calendar
	 * - name of backend
	 * - private uri
	 * - userId
	 * @param \OCP\Calendar\ICalendar $calendar
	 * @return array
	 */
	private function getBasicProps(ICalendar $calendar) {
		return array(
			$calendar->getBackend(),
			$calendar->getPrivateUri(),
			$calendar->getUserId()
		);
	}


	/**
	 * throws an BusinessLayerException based on an exception
	 * @param \Exception $ex
	 * @return null
	 * @throws \OCA\Calendar\BusinessLayer\BusinessLayerException
	 */
	private function throwBusinessLayerException(\Exception $ex) {
		throw new BusinessLayerException(
			$ex->getMessage(),
			$ex->getCode(),
			$ex
		);
	}
}
