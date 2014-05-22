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

use OCP\AppFramework\IAppContainer;
use OCP\AppFramework\Http;

use OCA\Calendar\Db\DoesNotExistException;
use OCA\Calendar\Db\MultipleObjectsReturnedException;

use OCA\Calendar\Backend\Backend;

use OCA\Calendar\Db\BackendMapper;
use OCA\Calendar\Db\Calendar;
use OCA\Calendar\Db\Object;
use OCA\Calendar\Db\ObjectCollection;
use OCA\Calendar\Db\ObjectMapper;

use OCA\Calendar\Backend\BackendException;

use OCA\Calendar\Utility\ObjectUtility;

use DateTime;

class ObjectBusinessLayer extends BusinessLayer {

    /**
     * @param IAppContainer $app
     * @param BackendMapper $backendMapper
     * @param ObjectMapper $objectMapper
     */
    public function __construct(IAppContainer $app,
								BackendMapper $backendMapper,
								ObjectMapper $objectMapper) {
		parent::__construct($app, $objectMapper);
		parent::initBackendSystem($backendMapper);
	}


	/**
	 * Finds all objects of a calendar
	 * @param Calendar $calendar
	 * @param int $limit
	 * @param int $offset
	 * @throws BusinessLayerException
	 * @return ObjectCollection
	 */
	public function findAll(Calendar &$calendar, $limit, $offset) {
		try {
			$backend = $calendar->getBackend();
			$calendarURI = $calendar->getUri();
			$userId = $calendar->getUserId();

			$this->checkBackendEnabled($backend);

			$api = &$this->backends->find($backend)->api;
			if ($api->cacheObjects($calendarURI, $userId)) {
				$objects = $this->mapper->findAll($calendar, $limit, $offset);
			} else {
				$objects = $api->findObjects($calendar, $limit, $offset);
			}

			return $objects;
		} catch (DoesNotExistException $ex) {
			throw new BusinessLayerException($ex->getMessage());
		} catch (BackendException $ex) {
			throw new BusinessLayerException($ex->getMessage());
		}
	}


	/**
	 * number of objects in a calendar
	 * @param Calendar $calendar Calendar object
	 * @throws BusinessLayerException
	 * @return integer
	 */
	public function numberOfObjects(Calendar &$calendar) {
		try {
			$backend = $calendar->getBackend();
			$calendarURI = $calendar->getUri();
			$userId = $calendar->getUserId();

			$this->checkBackendEnabled($backend);

			$api = &$this->backends->find($backend)->api;
			if ($api->cacheObjects($calendarURI, $userId)) {
				$number = $this->mapper->count($calendar);
			} else {
				$number = $api->countObjects($calendar);
			}

			return $number;
		} catch (DoesNotExistException $ex) {
			throw new BusinessLayerException($ex->getMessage());
		}
	}


	/**
	 * Find a certain object
	 * @param Calendar $calendar
	 * @param string $objectURI UID of the object
	 * @throws BusinessLayerException
	 * @return Object
	 */
	public function find(Calendar &$calendar, $objectURI) {
		try {
			$backend = $calendar->getBackend();
			$calendarURI = $calendar->getUri();
			$userId = $calendar->getUserId();

			$this->checkBackendEnabled($backend);

			$api = &$this->backends->find($backend)->api;
			if ($api->cacheObjects($calendarURI, $userId)) {
				$object = $this->mapper->find($calendar, $objectURI);
			} else {
				$object = $api->findObject($calendar, $objectURI);
			}

			return $object;
		} catch (DoesNotExistException $ex) {
			throw new BusinessLayerException($ex->getMessage());
		} catch (MultipleObjectsReturnedException $ex) {
			throw new BusinessLayerException($ex->getMessage());
		} catch (BackendException $ex) {
			throw new BusinessLayerException($ex->getMessage());
		}
	}


	/**
	 * Find a certain object by type
	 * @param Calendar $calendar
	 * @param string $objectURI UID of the object
	 * @param integer $type
	 * @throws BusinessLayerException
	 * @return Object
	 */
	public function findByType(Calendar &$calendar, $objectURI, $type) {
		$object = $this->find($calendar, $objectURI);

		if ($object->getType() !== $type) {
			throw new BusinessLayerException('Object is of wrong type', Http::STATUS_NOT_FOUND);
		}

		return $object;
	}


	/**
	 * Find all objects of a certain type in a calendar
	 * @param Calendar $calendar
	 * @param integer $type
	 * @param int $limit
	 * @param int $offset
	 * @throws BusinessLayerException
	 * @return ObjectCollection
	 */
	public function findAllByType(Calendar &$calendar, $type, $limit=null, $offset=null) {
		try {
			$backend = $calendar->getBackend();
			$calendarURI = $calendar->getUri();
			$userId = $calendar->getUserId();

			$this->checkBackendEnabled($backend);

			$api = &$this->backends->find($backend)->api;
			if ($api->cacheObjects($calendarURI, $userId)) {
				$objects = $this->mapper->findAllByType($calendar, $type, $limit, $offset);
			} else {
				if ($this->doesBackendSupport($backend, Backend::FIND_OBJECTS_BY_TYPE)) {
					$objects = $api->findObjectsByType($calendar, $type, $limit, $offset);
				} else {
					//TODO - improve me
					$objects = $api->findObjects($calendar, null, null);
					$objects = $objects->ofType($type)->subset($limit, $offset);
				}
			}

			return $objects;
		} catch (DoesNotExistException $ex) {
			throw new BusinessLayerException($ex->getMessage());
		} catch (BackendException $ex) {
			throw new BusinessLayerException($ex->getMessage());
		}
	}


	/**
	 * Find all objects in a certain time-frame in a calendar
	 * @param Calendar $calendar
	 * @param DateTime $start start of time-frame
	 * @param DateTime $end end of time-frame
	 * @param int $limit
	 * @param int $offset
	 * @throws BusinessLayerException
	 * @return ObjectCollection
	 */
	public function findAllInPeriod(Calendar &$calendar, DateTime $start, DateTime $end, $limit=null, $offset=null) {
		try {
			$backend = $calendar->getBackend();
			$calendarURI = $calendar->getUri();
			$userId = $calendar->getUserId();

			$this->checkBackendEnabled($backend);

			$api = &$this->backends->find($backend)->api;
			if ($api->cacheObjects($calendarURI, $userId)) {
				$objects = $this->mapper->findAllInPeriod($calendar, $start, $end, $limit, $offset);
			} else {
				if ($this->doesBackendSupport($backend, Backend::FIND_IN_PERIOD)) {
					$objects = $api->findObjectsInPeriod($calendar, $start, $end, $limit, $offset);
				} else {
					//TODO - improve me
					$objects = $api->findObjects($calendar, null, null);
					$objects = $objects->inPeriod($start, $end)->subset($limit, $offset);
				}
			}

			return $objects;
		} catch (DoesNotExistException $ex) {
			throw new BusinessLayerException($ex->getMessage());
		} catch (BackendException $ex) {
			throw new BusinessLayerException($ex->getMessage());
		}
	}


	/**
	 * Find all objects in a certain time-frame of a type in a calendar
	 * @param Calendar $calendar
	 * @param integer $type
	 * @param DateTime $start start of the time-frame
	 * @param DateTime $end end of the time-frame
	 * @param int $limit
	 * @param int $offset
	 * @throws BusinessLayerException
	 * @return ObjectCollection
	 */
	public function findAllByTypeInPeriod(Calendar &$calendar, $type, $start, $end, $limit=null, $offset=null) {
		try {
			$backend = $calendar->getBackend();
			$calendarURI = $calendar->getUri();
			$userId = $calendar->getUserId();

			$this->checkBackendEnabled($backend);

			$api = &$this->backends->find($backend)->api;
			if ($api->cacheObjects($calendarURI, $userId)) {
				$objects = $this->mapper->findAllByTypeInPeriod($calendar, $type, $start, $end, $limit, $offset);
			} else {
				if ($this->doesBackendSupport($backend, Backend::FIND_IN_PERIOD_BY_TYPE)) {
					$objects = $api->findObjectsByTypeInPeriod($calendar, $type, $start, $end, $limit, $offset);
				} else {
					//TODO - improve me
					$objects = $api->findObjects($calendar, null, null);
					$objects = $objects->ofType($type)->inPeriod($start, $end)->subset($limit, $offset);
				}
			}

			return $objects;
		} catch (DoesNotExistException $ex) {
			throw new BusinessLayerException($ex->getMessage());
		} catch (BackendException $ex) {
			throw new BusinessLayerException($ex->getMessage());
		}
	}


	/**
	 * checks if an object exists
	 * @param Calendar $calendar
	 * @param string $objectURI
	 * @param boolean $checkRemote
	 * @throws BusinessLayerException
	 * @return boolean
	 */
	public function doesExist(Calendar &$calendar, $objectURI, $checkRemote=false) {
		try {
			$backend = $calendar->getBackend();
			$calendarURI = $calendar->getUri();
			$userId = $calendar->getUserId();

			$api = &$this->backends->find($backend)->api;
			if ($api->cacheObjects($calendarURI, $userId) && !$checkRemote) {
				return $this->mapper->doesExist($calendar, $objectURI);
			}

			return $api->doesObjectExist($calendar, $objectURI);
		} catch(BackendException $ex) {
			throw new BusinessLayerException($ex->getMessage());
		} catch(DoesNotExistException $ex) {
			throw new BusinessLayerException($ex->getMessage());
		}
	}


	/**
	 * checks if an object allows a certain action
	 * @param Calendar $calendar
	 * @param string $objectURI
	 * @param integer $cruds
	 * @throws BusinessLayerException
	 * @return boolean
	 */
	public function doesAllow(Calendar &$calendar, $objectURI, $cruds) {
		try {
			$backend = $calendar->getBackend();
			$calendarURI = $calendar->getUri();
			$userId = $calendar->getUserId();

			$api = &$this->backends->find($backend)->api;
			if ($api->cacheObjects($calendarURI, $userId)) {
				$doesAllow = $this->mapper->doesAllow($calendar, $objectURI, $cruds);
			} else {
				$doesAllow =  $api->doesObjectAllow($calendar, $objectURI, $cruds);
			}

			return $doesAllow;
		} catch(BackendException $ex) {
			throw new BusinessLayerException($ex->getMessage());
		} catch(DoesNotExistException $ex) {
			throw new BusinessLayerException($ex->getMessage());
		}
	}


	/**
	 * creates an new object
	 * @param Object $object
	 * @throws BusinessLayerException
	 * @return Object
	 */
	public function create(Object &$object) {
		try {
			$calendar = $object->getCalendar();
			$objectURI = $object->getUri();

			$backend = $calendar->getBackend();
			$calendarURI = $calendar->getUri();
			$userId = $calendar->getUserId();

			$this->checkBackendEnabled($backend);
			$this->checkObjectDoesNotExist($calendar, $objectURI);
			$this->checkBackendSupports($backend, Backend::CREATE_CALENDAR);
			$this->checkObjectIsValid($object);

			$api = &$this->backends->find($backend)->api;
			$api->createObject($object);
			if ($api->cacheObjects($calendarURI, $userId)) {
				$this->mapper->insert($object, $calendarURI, $objectURI, $userId);
			}

			return $object;
		} catch(BackendException $ex) {
			throw new BusinessLayerException($ex->getMessage());
		}
	}


	/**
	 * creates a new object from request
	 * @param Object $object
	 * @throws BusinessLayerException
	 * @return Object
	 */
	public function createFromRequest(Object &$object) {
		/* Create random URI if no URI is given */
		if($object->getUri() === null) {
			$randomURI = ObjectUtility::randomURI();
			$object->setObjectURI($randomURI);
		}

		return $this->create($object);
	}


	/**
	 * creates new objects
	 * @param ObjectCollection $collection
	 * @throws BusinessLayerException
	 * @return ObjectCollection
	 */
	public function createCollection(ObjectCollection $collection) {
		$createdObjects = new ObjectCollection();

		$collection->iterate(function(&$object) use (&$createdObjects) {
			try {
				$object = $this->create($object);
			} catch(BusinessLayerException $ex) {
				$this->app->log($ex->getMessage(), 'debug');
				return;
			}
			$createdObjects->add($object);
		});

		return $createdObjects;
	}


	/**
	 * creates new objects from request
	 * @param ObjectCollection $collection
	 * @throws BusinessLayerException
	 * @return ObjectCollection
	 */
	public function createCollectionFromRequest(ObjectCollection $collection) {
		$createdObjects = new ObjectCollection();

		$collection->iterate(function(&$object) use (&$createdObjects) {
			try {
				$object = $this->createFromRequest($object);
			} catch(BusinessLayerException $ex) {
				$this->app->log($ex->getMessage(), 'debug');
				return;
			}
			$createdObjects->add($object);
		});

		return $createdObjects;
	}


	/**
	 * updates an object
	 * @param Object $object
	 * @param Calendar $oldCalendar
	 * @param string $oldObjectURI
	 * @throws BusinessLayerException
	 * @return Object
	 */
	public function update(Object &$object, Calendar &$oldCalendar, $oldObjectURI) {
		try {
			$newCalendar = $object->getCalendar();
			$newObjectURI = $object->getUri();
			$newBackend = $newCalendar->getBackend();
			$newCalendarURI = $newCalendar->getUri();
			$newUserId = $newCalendar->getUserId();

			$oldBackend = $oldCalendar->getBackend();
			$oldCalendarURI = $oldCalendar->getUri();
			$oldUserId = $oldCalendar->getUserId();

			if ($newUserId !== $oldUserId) {
				return $this->transfer(
					$object,
					$oldCalendar,
					$oldObjectURI
				);
			} elseif ($newBackend !== $oldBackend ||
					  $newCalendarURI !== $oldCalendarURI ||
					  $newObjectURI !== $oldObjectURI) {
				return $this->move(
					$object,
					$oldCalendar,
					$oldObjectURI
				);
			} else {
				$this->checkBackendEnabled($newBackend);
				$this->checkObjectDoesExist($newCalendar, $newObjectURI);
				$this->checkBackendSupports($newBackend, Backend::UPDATE_OBJECT);
				$this->checkObjectIsValid($object);

				$api = &$this->backends->find($oldBackend)->api;
				$api->updateObject($object, $oldCalendar);

				if ($api->cacheObjects($oldCalendarURI, $oldUserId)) {
					$this->mapper->update($object);
				}

				return $object;
			}
		} catch(BackendException $ex) {
			throw new BusinessLayerException($ex->getMessage());
		}
	}


	/**
	 * updates an object from request
	 * @param Object $object
	 * @param Calendar $calendar
	 * @param string $objectURI UID of the object
	 * @param string $eTag
	 * @throws BusinessLayerException
	 * @return Object
	 */
	public function updateFromRequest(Object $object, Calendar &$calendar, $objectURI, $eTag) {
		$oldObject = $this->find($calendar, $objectURI);

		$this->checkETagsEqual($oldObject->getEtag(), $eTag);

		$oldObject->overwriteWith($object);
		$object = $oldObject;

		return $this->update($object, $calendar, $objectURI);
	}


	/**
	 * move object
	 * @param Object $object 
	 * @param Calendar $calendar
	 * @param string $objectURI UID of the object
	 * @throws BusinessLayerException
	 * @return Object
	 */
	public function move(Object &$object, Calendar &$oldCalendar, $oldObjectURI) {
		//TODO - implement
		/*try {
			if (is_array($calendarId)) {
				$backend = $calendarId[0];
				$calendarURI = $calendarId[1];
			} else {
				list($backend, $calendarURI) = $this->splitCalendarURI($calendarId);
			}

			$oldBackend = $backend;
			$newBackend = $calendar->getBackend();

			$oldCalendarURI = $calendarURI;
			$newCalendarURI = $object->getCalendarURI();

			$oldObjectURI = $objectURI;
			$newObjectURI = $object->getURI();

			$this->checkBackendEnabled($oldBackend);
			$this->checkBackendEnabled($newBackend);

			$this->allowNoObjectURITwice($newBackend, $newCalendarURI, $newObjectURI, $userId);

			$oldBackendsAPI = &$this->backends->find($oldBackend)->api;
			$newBackendsAPI = &$this->backends->find($newBackend)->api;

			$doesBackendSupportMovingEvents = $oldBackendsAPI->implementsActions(\OCA\Calendar\Backend\MOVE_OBJECT);

			if ($oldBackend == $newBackend && $doesBackendSupportMovingEvents === true) {
				$object = $newBackendsAPI->moveObject($object, $calendarURI, $objectURI, $userId);
			} else {
				$this->checkBackendSupports($oldBackend, \OCA\Calendar\Backend\DELETE_OBJECT);
				$this->checkBackendSupports($newBackend, \OCA\Calendar\Backend\CREATE_OBJECT);

				$status = $newBackendsAPI->createObject($object);
				if ($status === true) {
					$object = $this->backends->find($object->getBackend())->api->createObject();
				} else {
					throw new BusinessLayerException('Could not move object to another calendar.');
				}
			}

			$cacheObjectsInOldBackend = $oldBackendsAPI->cacheObjects($calendarURI, $userId);
			if ($cacheObjectsInOldBackend === true) {
				//dafuq
				$this->mapper->delete($object, $calendarURI, $objectURI, $userId);
			}

			$cacheObjectsInNewBackend = $newBackendsAPI->cacheObjects($calendarURI, $userId);
			if ($cacheObjectsInNewBackend === true) {
				//dafuq
				$this->mapper->create($object, $object->getCalendarUri(), $object->getUri(), $userId);
			}

			$this->calendarBusinessLayer->touch($calendarId, $userId);
			$this->calendarBusinessLayer->touch($object->getCalendarId(), $userId);

			return $object;
		} catch(DoesNotImplementException $ex) {
			throw new BusinessLayerException($ex->getMessage());
		} catch(BackendException $ex) {
			throw new BusinessLayerException($ex->getMessage());
		}*/
	}


	/**
	 * move object
	 * @param Calendar $newCalendar
	 * @param Calendar $oldCalendar
	 * @param integer $limit
	 * @param integer $offset
	 * @throws BusinessLayerException
	 * @return boolean
	 */
	public function moveAll(Calendar &$newCalendar, Calendar &$oldCalendar, $limit, $offset) {
		//TODO - implement
	}


	/**
	 * transfer object to another user
	 * @param Object $object 
	 * @param Calendar $calendar
	 * @param string $objectURI UID of the object
	 * @throws BusinessLayerException
	 * @return Object
	 */
	public function transfer(Object &$object, Calendar &$oldCalendar, $oldObjectURI) {
		//TODO - implement
	}


	/**
	 * transfer object to another user
	 * @param Calendar $newCalendar
	 * @param Calendar $oldCalendar
	 * @param integer $limit
	 * @param integer $offset
	 * @throws BusinessLayerException
	 * @return boolean
	 */
	public function transferAll(Calendar &$newCalendar, Calendar &$oldCalendar, $limit, $offset) {
		//TODO - implement
	}


	/**
	 * delete an object from a calendar
	 * @param Object $object
	 * @throws BusinessLayerException
	 * @return boolean
	 */
	public function delete(Object &$object) {
		try {
			$calendar = $object->getCalendar();
			$objectURI = $object->getUri();

			$backend = $calendar->getBackend();
			$calendarURI = $calendar->getUri();
			$userId = $calendar->getUserId();

			$this->checkBackendEnabled($backend);
			$this->checkBackendSupports($backend, Backend::DELETE_OBJECT);

			$api = &$this->backends->find($backend)->api;
			$api->deleteObject($calendarURI, $objectURI, $userId);
			if ($api->cacheObjects($calendarURI, $userId)) {
				$this->mapper->delete($calendar);
			}

			return true;
		} catch(BackendException $ex) {
			throw new BusinessLayerException($ex->getMessage());
		}
	}


	/**
	 * delete all objects from a calendar
	 * @param Calendar $calendar
	 * @param integer $limit
	 * @param integer $offset
	 * @throws BusinessLayerException
	 * @return boolean
	 */
	public function deleteAll(Calendar &$calendar, $limit, $offset) {
		try {
			$backend = $calendar->getBackend();
			$calendarURI = $calendar->getUri();
			$userId = $calendar->getUserId();

			$this->checkBackendEnabled($backend);
			$api = &$this->backends->find($backend)->api;

			if ($this->doesBackendSupport($backend, Backend::DELETE_ALL_OBJECTS)) {
				$api->deleteAll($calendar, $limit, $offset);
			} elseif($this->doesBackendSupport($backend, Backend::DELETE_OBJECT)) {
				$objects = $api->getObjectIdentifiers($calendar, $limit, $offset);
				foreach($objects as $object) {
					try {
						$api->deleteObject($calendarURI, $object, $userId);
					} catch(DoesNotExistException $ex) {
						continue;
					} catch(BackendException $ex) {
						continue;
					}
				}
			} else {
				$this->checkBackendSupports($backend, Backend::DELETE_OBJECT);
			}

			if ($api->cacheObjects($calendarURI, $userId)) {
				$this->mapper->deleteAll($calendar);
			}
			return true;
		} catch(BackendException $ex) {
			throw new BusinessLayerException($ex->getMessage());
		}
	}


	/**
	 * @brief throw exception if object exists
	 * @param Calendar $calendar
	 * @param string $objectURI
	 * @return bool
	 * @throws BusinessLayerException
	 */
	private function checkObjectDoesNotExist(Calendar $calendar, $objectURI) {
		if ($this->doesExist($calendar, $objectURI)) {
			$msg = 'User Error: Object already exists!';
			throw new BusinessLayerException($msg, Http::STATUS_CONFLICT);
		}

		return true;
	}


	/**
	 * @brief throw exception if object does not exist
	 * @param Calendar $calendar
	 * @param string $objectURI
	 * @return bool
	 * @throws BusinessLayerException
	 */
	private function checkObjectDoesExist(Calendar $calendar, $objectURI) {
		if (!$this->doesExist($calendar, $objectURI)) {
			$msg = 'User Error: Object does not exist!';
			throw new BusinessLayerException($msg, Http::STATUS_NOT_FOUND);
		}

		return true;
	}



	/**
	 * @brief throw exception if eTags are not equal
	 * @param string $firstETag
	 * @param string $secondETag
	 * @return bool
	 * @throws BusinessLayerException
	 */
	private function checkETagsEqual($firstETag, $secondETag) {
		if ($firstETag !== $secondETag) {
			$msg = 'If-Match failed; eTags are not equal!';
			throw new BusinessLayerException($msg, Http::STATUS_PRECONDITION_FAILED);
		}

		return true;
	}
}
