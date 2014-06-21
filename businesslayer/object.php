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

use OCP\Calendar\Backend;
use OCP\Calendar\IFullyQualifiedBackend;
use OCP\Calendar\BackendException;
use OCP\Calendar\CacheOutDatedException;
use OCP\Calendar\DoesNotExistException;
use OCP\Calendar\MultipleObjectsReturnedException;
use OCP\Calendar\ICalendar;
use OCP\Calendar\IObject;
use OCP\Calendar\IObjectCollection;

use OCA\Calendar\Db\BackendMapper;
use OCA\Calendar\Db\ObjectMapper;
use OCA\Calendar\Utility\ObjectUtility;

use DateTime;
use OCP\Calendar\Permissions;

class ObjectBusinessLayer extends BusinessLayer {

	/**
	 * @var ObjectMapper
	 */
	protected $mapper;


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
	 * Finds all objects in a calendar
	 * @param ICalendar $calendar
	 * @param int $limit
	 * @param int $offset
	 * @throws BusinessLayerException
	 * @return IObjectCollection
	 */
	public function findAll(ICalendar &$calendar, $limit=null, $offset=null) {
		try {
			$backend = $calendar->getBackend();
			$privateuri = $calendar->getPrivateUri();
			$userId = $calendar->getUserId();

			$api = &$this->backends->find($backend)->getAPI();
			if ($api->cacheObjects($privateuri, $userId)) {
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
	 * Get number of objects in a calendar
	 * @param ICalendar $calendar Calendar object
	 * @throws BusinessLayerException
	 * @return integer
	 */
	public function numberOfObjects(ICalendar &$calendar) {
		try {
			$backend = $calendar->getBackend();
			$privateuri = $calendar->getPrivateUri();
			$userId = $calendar->getUserId();

			$api = &$this->backends->find($backend)->getAPI();
			if ($api->cacheObjects($privateuri, $userId)) {
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
	 * @param ICalendar $calendar
	 * @param string $uri UID of the object
	 * @throws BusinessLayerException
	 * @return IObject
	 */
	public function find(ICalendar &$calendar, $uri) {
		try {
			$backend = $calendar->getBackend();
			$privateuri = $calendar->getPrivateUri();
			$userId = $calendar->getUserId();

			$api = &$this->backends->find($backend)->getAPI();
			if ($api->cacheObjects($privateuri, $userId)) {
				$object = $this->mapper->find($calendar, $uri);
			} else {
				$object = $api->findObject($calendar, $uri);
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
	 * @param ICalendar $calendar
	 * @param string $uri UID of the object
	 * @param integer $type
	 * @throws BusinessLayerException
	 * @return IObject
	 */
	public function findByType(ICalendar &$calendar, $uri, $type) {
		$object = $this->find($calendar, $uri);

		if ($object->getType() !== $type) {
			$msg = 'Object was found but is not of requested type!';
			throw new BusinessLayerException($msg, Http::STATUS_NOT_FOUND);
		}

		return $object;
	}


	/**
	 * Find all objects of a certain type in a calendar
	 * @param ICalendar $calendar
	 * @param integer $type
	 * @param int $limit
	 * @param int $offset
	 * @throws BusinessLayerException
	 * @return IObjectCollection
	 */
	public function findAllByType(ICalendar &$calendar, $type, $limit=null, $offset=null) {
		try {
			$backend = $calendar->getBackend();
			$privateuri = $calendar->getPrivateUri();
			$userId = $calendar->getUserId();

			$api = &$this->backends->find($backend)->getAPI();
			if ($api->cacheObjects($privateuri, $userId)) {
				$objects = $this->mapper->findAllByType($calendar, $type, $limit, $offset);
			} else {
				if ($this->doesBackendSupport($backend, Backend::FIND_OBJECTS_BY_TYPE)) {
					/** @var IFullyQualifiedBackend $api */
					$objects = $api->findObjectsByType($calendar, $type, $limit, $offset);
				} else {
					$objects = $api->findObjects($calendar, null, null);
					$objects->ofType($type);
					$objects->subset($limit, $offset);
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
	 * @param ICalendar $calendar
	 * @param DateTime $start start of time-frame
	 * @param DateTime $end end of time-frame
	 * @param int $limit
	 * @param int $offset
	 * @throws BusinessLayerException
	 * @return IObjectCollection
	 */
	public function findAllInPeriod(ICalendar &$calendar, DateTime $start, DateTime $end, $limit=null, $offset=null) {
		try {
			$backend = $calendar->getBackend();
			$privateuri = $calendar->getPrivateUri();
			$userId = $calendar->getUserId();

			$api = &$this->backends->find($backend)->getAPI();
			if ($api->cacheObjects($privateuri, $userId)) {
				$objects = $this->mapper->findAllInPeriod($calendar, $start, $end, $limit, $offset);
			} else {
				if ($this->doesBackendSupport($backend, Backend::FIND_IN_PERIOD)) {
					/** @var IFullyQualifiedBackend $api */
					$objects = $api->findObjectsInPeriod($calendar, $start, $end, $limit, $offset);
				} else {
					$objects = $api->findObjects($calendar, null, null);
					$objects->inPeriod($start, $end);
					$objects->subset($limit, $offset);
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
	 * @param ICalendar $calendar
	 * @param integer $type
	 * @param DateTime $start start of the time-frame
	 * @param DateTime $end end of the time-frame
	 * @param int $limit
	 * @param int $offset
	 * @throws BusinessLayerException
	 * @return IObjectCollection
	 */
	public function findAllByTypeInPeriod(ICalendar &$calendar, $type, DateTime $start, DateTime $end, $limit=null, $offset=null) {
		try {
			$backend = $calendar->getBackend();
			$privateuri = $calendar->getPrivateUri();
			$userId = $calendar->getUserId();

			$api = &$this->backends->find($backend)->getAPI();
			if ($api->cacheObjects($privateuri, $userId)) {
				$objects = $this->mapper->findAllByTypeInPeriod($calendar, $type, $start, $end, $limit, $offset);
			} else {
				if ($this->doesBackendSupport($backend, Backend::FIND_IN_PERIOD_BY_TYPE)) {
					/** @var IFullyQualifiedBackend $api */
					$objects = $api->findObjectsByTypeInPeriod($calendar, $type, $start, $end, $limit, $offset);
				} else {
					$objects = $api->findObjects($calendar, null, null);
					$objects->ofType($type);
					$objects->inPeriod($start, $end);
					$objects->subset($limit, $offset);
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
	 * Get whether or not an object exists
	 * @param ICalendar $calendar
	 * @param string $uri
	 * @throws BusinessLayerException
	 * @return boolean
	 */
	public function doesExist(ICalendar &$calendar, $uri) {
		try {
			$backend = $calendar->getBackend();
			$privateuri = $calendar->getPrivateUri();
			$userId = $calendar->getUserId();

			$api = &$this->backends->find($backend)->api;
			if ($api->cacheObjects($privateuri, $userId)) {
				$doesExist = $this->mapper->doesExist($calendar, $uri);
			} else {
				$doesExist = $api->doesObjectExist($calendar, $uri);
			}

			return $doesExist;
		} catch(BackendException $ex) {
			throw new BusinessLayerException($ex->getMessage());
		} catch(DoesNotExistException $ex) {
			throw new BusinessLayerException($ex->getMessage());
		}
	}


	/**
	 * Get whether or not an object allows a certain action
	 * @param ICalendar $calendar
	 * @param string $uri
	 * @param integer $cruds
	 * @throws BusinessLayerException
	 * @return boolean
	 */
	public function doesAllow(ICalendar &$calendar, $uri, $cruds) {
		try {
			$backend = $calendar->getBackend();
			$calendarURI = $calendar->getPublicUri();
			$userId = $calendar->getUserId();

			$api = &$this->backends->find($backend)->api;
			if ($api->cacheObjects($calendarURI, $userId)) {
				$doesAllow = $this->mapper->doesAllow($calendar, $uri, $cruds);
			} else {
				$doesAllow =  $api->doesObjectAllow($calendar, $uri, $cruds);
			}

			return $doesAllow;
		} catch(BackendException $ex) {
			throw new BusinessLayerException($ex->getMessage());
		} catch(DoesNotExistException $ex) {
			throw new BusinessLayerException($ex->getMessage());
		}
	}


	/**
	 * Creates an new object
	 * @param IObject $object
	 * @throws BusinessLayerException
	 * @return IObject
	 */
	public function create(IObject &$object) {
		try {
			$calendar = $object->getCalendar();
			$uri = $object->getUri();

			$backend = $calendar->getBackend();
			$privateUri = $calendar->getPrivateUri();
			$userId = $calendar->getUserId();

			$this->checkObjectDoesNotExist($calendar, $uri);
			$this->checkBackendSupports($backend, Backend::CREATE_CALENDAR);
			$this->checkObjectIsValid($object);

			/** @var IFullyQualifiedBackend $api */
			$api = &$this->backends->find($backend)->api;
			$api->createObject($object);
			if ($api->cacheObjects($privateUri, $userId)) {
				$this->mapper->insert($object);
			}

			return $object;
		} catch(BackendException $ex) {
			throw new BusinessLayerException($ex->getMessage());
		}
	}


	/**
	 * create an object from import
	 * @param IObject $object
	 * @throws BusinessLayerException
	 * @return IObject
	 */
	public function createFromImport(IObject &$object) {
		if($object->getUri() === null) {
			$randomURI = ObjectUtility::randomURI();
			$object->setUri($randomURI);
		}

		/*
		 * generate an provisional etag
		 * backends can overwrite it if necessary
		 */
		$object->getEtag(true);

		return $this->create($object);
	}


	/**
	 * Creates a new object from request
	 * @param IObject $object
	 * @throws BusinessLayerException
	 * @return IObject
	 */
	public function createFromRequest(IObject &$object) {
		$object = $this->createFromImport($object);

		/*
		 * TODO:
		 * - scan for attendees and send out invitations (accept/decline requests)
		 * - scan for VALARMs of type email and cache them
		 */

		return $object;
	}


	/**
	 * Creates new objects
	 * @param IObjectCollection $collection
	 * @throws BusinessLayerException
	 * @return IObjectCollection
	 */
	public function createCollection(IObjectCollection $collection) {
		$className = get_class($collection);

		/** @var IObjectCollection $createdObjects */
		$createdObjects = new $className();

		$collection->iterate(function(IObject &$object) use (&$createdObjects) {
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
	 * Creates new objects from import
	 * @param IObjectCollection $collection
	 * @throws BusinessLayerException
	 * @return IObjectCollection
	 */
	public function createCollectionFromImport(IObjectCollection $collection) {
		$className = get_class($collection);

		/** @var IObjectCollection $createdObjects */
		$createdObjects = new $className();

		$collection->iterate(function(IObject &$object) use (&$createdObjects) {
			try {
				$object = $this->createFromImport($object);
			} catch(BusinessLayerException $ex) {
				$this->app->log($ex->getMessage(), 'debug');
				return;
			}
			$createdObjects->add($object);
		});

		return $createdObjects;
	}


	/**
	 * Creates new objects from request
	 * @param IObjectCollection $collection
	 * @throws BusinessLayerException
	 * @return IObjectCollection
	 */
	public function createCollectionFromRequest(IObjectCollection $collection) {
		$className = get_class($collection);

		/** @var IObjectCollection $createdObjects */
		$createdObjects = new $className();

		$collection->iterate(function(IObject &$object) use (&$createdObjects) {
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
	 * Updates an object
	 * @param IObject $newObject
	 * @param ICalendar $oldCalendar
	 * @param string $oldUri
	 * @throws BusinessLayerException
	 * @return IObject
	 */
	public function update(IObject &$newObject, ICalendar &$oldCalendar, $oldUri) {
		try {
			$oldObject = $this->find($oldCalendar, $oldUri);

			$this->checkUsersEqual($newObject->getCalendar()->getUserId(), $oldObject->getCalendar()->getUserId());
			$this->checkBackendEnabled($newObject->getCalendar()->getBackend());
			$this->checkBackendEnabled($oldObject->getCalendar()->getBackend());
			$this->checkObjectIsValid($newObject);

			if ($this->doesNeedTransfer($newObject, $oldObject)) {
				return $this->transfer($newObject, $oldObject);
			} elseif ($this->doesNeedMove($newObject, $oldObject)) {
				return $this->move($newObject, $oldObject);
			} else {
				return $this->updateProperties($newObject);
			}
		} catch(BackendException $ex) {
			throw new BusinessLayerException($ex->getMessage());
		}
	}


	/**
	 * Updates an object from request
	 * @param IObject $object
	 * @param ICalendar $calendar
	 * @param string $uri UID of the object
	 * @param string $eTag
	 * @throws BusinessLayerException
	 * @return Object
	 */
	public function updateFromRequest(IObject $object, ICalendar &$calendar, $uri, $eTag) {
		$oldObject = $this->find($calendar, $uri);

		$this->checkETagsEqual($oldObject->getEtag(), $eTag);

		$oldObject->overwriteWith($object);
		$object = $oldObject;

		return $this->update($object, $calendar, $uri);
	}


	/**
	 * @param IObject $object
 	 * @return IObject
	 */
	public function updateProperties(IObject $object) {
		$calendar = $object->getCalendar();

		$backend = $calendar->getBackend();
		$privateuri = $calendar->getPrivateUri();
		$userId = $calendar->getUserId();

		$this->checkBackendSupports($backend, Backend::UPDATE_OBJECT);
		$this->checkCalendarSupports($calendar, Permissions::UPDATE);

		/** @var IFullyQualifiedBackend $api */
		$api = &$this->backends->find($backend)->api;
		$api->updateObject($object);

		if ($api->cacheObjects($privateuri, $userId)) {
			$this->mapper->update($object);
		}

		return $object;
	}


	/**
	 * move object
	 * @param IObject $newObject
	 * @param IObject $oldObject
	 * @throws BusinessLayerException
	 * @return IObject
	 */
	public function move(IObject &$newObject, IObject &$oldObject) {
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

			$oldObjectFromRemote = $oldBackendsAPI->findObject($oldCalendar, $oldObject->getUri());
			$object = (clone $oldObjectFromRemote);
			$object->setCalendar($newCalendar);

			/** @var IFullyQualifiedBackend $newBackendsAPI */
			$newBackendsAPI->createObject($object);

			/** @var IFullyQualifiedBackend $oldBackendsAPI */
			$oldBackendsAPI->deleteObject($oldObjectFromRemote);

			return $object;
		} catch(BackendException $ex) {
			throw new BusinessLayerException($ex->getMessage(), $ex->getCode(), $ex);
		} catch(DoesNotExistException $ex) {
			throw new BusinessLayerException($ex->getMessage(), $ex->getCode(), $ex);
		} catch(MultipleObjectsReturnedException $ex) {
			throw new BusinessLayerException($ex->getMessage(), $ex->getCode(), $ex);
		} catch(CacheOutDatedException $ex) {
			throw new BusinessLayerException($ex->getMessage(), $ex->getCode(), $ex);
		}
	}


	/**
	 * move object
	 * @param ICalendar $newCalendar
	 * @param ICalendar $oldCalendar
	 * @param integer $limit
	 * @param integer $offset
	 * @throws BusinessLayerException
	 * @return boolean
	 */
	public function moveAll(ICalendar &$newCalendar, ICalendar &$oldCalendar, $limit, $offset) {
		try {
			$newBackend = $newCalendar->getBackend();
			$oldBackend = $oldCalendar->getBackend();

			$this->checkBackendSupports($newBackend, Backend::CREATE_OBJECT);
			$this->checkBackendSupports($oldBackend, Backend::DELETE_OBJECT);

			$this->checkCalendarSupports($newCalendar, Permissions::CREATE);
			$this->checkCalendarSupports($oldCalendar, Permissions::DELETE);

			$oldBackendsAPI = &$this->backends->find($oldBackend)->getAPI();
			$newBackendsAPI = &$this->backends->find($newBackend)->getAPI();

			$oldObjectsFromRemote = $oldBackendsAPI->findObjects($oldCalendar, $limit, $offset);
			$oldObjectsFromRemote->iterate(function(IObject &$oldObjectFromRemote) use (&$newCalendar, &$newBackendsAPI, &$oldBackendsAPI) {
				$object = (clone $oldObjectFromRemote);
				$object->setCalendar($newCalendar);

				/** @var IFullyQualifiedBackend $newBackendsAPI */
				$newBackendsAPI->createObject($object);

				/** @var IFullyQualifiedBackend $oldBackendsAPI */
				$oldBackendsAPI->deleteObject($oldObjectFromRemote);
			});

			return true;
		} catch(BackendException $ex) {
			throw new BusinessLayerException($ex->getMessage(), $ex->getCode(), $ex);
		} catch(DoesNotExistException $ex) {
			throw new BusinessLayerException($ex->getMessage(), $ex->getCode(), $ex);
		} catch(MultipleObjectsReturnedException $ex) {
			throw new BusinessLayerException($ex->getMessage(), $ex->getCode(), $ex);
		} catch(CacheOutDatedException $ex) {
			throw new BusinessLayerException($ex->getMessage(), $ex->getCode(), $ex);
		}
	}


	/**
	 * transfer object to another user
	 * @param IObject $newObject
	 * @param IObject $oldObject
	 * @throws BusinessLayerException
	 * @return IObject
	 */
	public function transfer(IObject &$newObject, IObject &$oldObject) {
		return $this->move($newObject, $oldObject);
	}


	/**
	 * transfer object to another user
	 * @param ICalendar $newCalendar
	 * @param ICalendar $oldCalendar
	 * @param integer $limit
	 * @param integer $offset
	 * @throws BusinessLayerException
	 * @return boolean
	 */
	public function transferAll(ICalendar &$newCalendar, ICalendar &$oldCalendar, $limit, $offset) {
		return $this->moveAll($newCalendar, $oldCalendar, $limit, $offset);
	}


	/**
	 * delete an object from a calendar
	 * @param IObject $object
	 * @throws BusinessLayerException
	 */
	public function delete(IObject &$object) {
		try {
			$calendar = $object->getCalendar();
			$uri = $object->getUri();

			$backend = $calendar->getBackend();
			$calendarURI = $calendar->getPublicUri();
			$userId = $calendar->getUserId();

			$this->checkBackendEnabled($backend);
			$this->checkBackendSupports($backend, Backend::DELETE_OBJECT);

			/** @var IFullyQualifiedBackend $api */
			$api = &$this->backends->find($backend)->api;
			$api->deleteObject($calendarURI, $uri, $userId);
			if ($api->cacheObjects($calendarURI, $userId)) {
				$this->mapper->delete($calendar);
			}
		} catch(BackendException $ex) {
			throw new BusinessLayerException($ex->getMessage());
		}
	}


	/**
	 * delete all objects from a calendar
	 * @param ICalendar $calendar
	 * @param integer $limit
	 * @param integer $offset
	 * @throws BusinessLayerException
	 * @return boolean
	 */
	public function deleteAll(ICalendar &$calendar, $limit, $offset) {
		try {
			$backend = $calendar->getBackend();
			$calendarURI = $calendar->getPublicUri();
			$userId = $calendar->getUserId();

			$this->checkBackendEnabled($backend);

			/** @var IFullyQualifiedBackend $api */
			$api = &$this->backends->find($backend)->api;

			if ($this->doesBackendSupport($backend, Backend::DELETE_ALL_OBJECTS)) {
				$api->deleteAll($calendar, $limit, $offset);
			} elseif($this->doesBackendSupport($backend, Backend::DELETE_OBJECT)) {
				$objects = $api->getObjectIdentifiers($calendar, $limit, $offset);
				foreach($objects as $object) {
					try {
						$api->deleteObject($api->findObject($calendar, $object));
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
	 * @param ICalendar $calendar
	 * @param string $uri
	 * @return bool
	 * @throws BusinessLayerException
	 */
	private function checkObjectDoesNotExist(ICalendar $calendar, $uri) {
		if ($this->doesExist($calendar, $uri)) {
			$msg = 'User Error: Object already exists!';
			throw new BusinessLayerException($msg, Http::STATUS_CONFLICT);
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


	/**
	 * Get whether or not a calendar needs a transfer
	 * @param IObject $newObject
	 * @param IObject $oldObject
	 * @return bool
	 */
	private function doesNeedTransfer(IObject $newObject, IObject $oldObject) {
		return ($newObject->getCalendar()->getUserId() !== $oldObject->getCalendar()->getUserId());
	}


	/**
	 * Get whether or not a calendar needs a move
	 * @param IObject $newObject
	 * @param IObject $oldObject
	 * @return bool
	 */
	private function doesNeedMove(IObject $newObject, IObject $oldObject) {
		return (($newObject->getCalendar()->getPublicUri() !== $oldObject->getCalendar()->getPublicUri()) &&
				 !$this->doesExist($newObject->getCalendar(), $newObject->getUri()));
	}


	/**
	 * @param ICalendar $calendar
	 * @param integer $action
	 * @throws BusinessLayerException
	 * @return bool
	 */
	private function checkCalendarSupports(ICalendar $calendar, $action) {
		if (!$calendar->doesAllow($action)) {
			throw new BusinessLayerException('Action not allowed!', Http::STATUS_FORBIDDEN);
		}
	}
}
