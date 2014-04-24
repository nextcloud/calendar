<?php
/**
 * Copyright (c) 2014 Georg Ehrke <oc.list@georgehrke.com>
 * This file is licensed under the Affero General Public License version 3 or
 * later.
 * See the COPYING-README file.
 */
namespace OCA\Calendar\BusinessLayer;

use \OCP\AppFramework\IAppContainer;
use \OCP\AppFramework\Http;

use \OCA\Calendar\Db\DoesNotExistException;
use \OCA\Calendar\Db\MultipleObjectsReturnedException;

use \OCA\Calendar\Db\BackendMapper;
use \OCA\Calendar\Db\ObjectMapper;

use \OCA\Calendar\Db\Calendar;
use \OCA\Calendar\Db\CalendarCollection;

use \OCA\Calendar\Db\Object;
use \OCA\Calendar\Db\ObjectCollection;

use \OCA\Calendar\Db\Timezone;
use \OCA\Calendar\Db\TimezoneCollection;

use \OCA\Calendar\Backend\BackendException;
use \OCA\Calendar\Backend\DoesNotImplementException;

class ObjectBusinessLayer extends BusinessLayer {

	private $omp;

	private $runTimeCache=array();
	private $remoteObjectObjectCache=array();

	/**
	 * @param ObjectMapper $objectMapper: mapper for objects cache
	 * @param CalendarBusinessLayer $calendarBusinessLayer
	 * @param BackendBusinessLayer $backendBusinessLayer
	 * @param API $api: an api wrapper instance    return new ObjectBusinessLayer($c, $bbl, $omp);
	 */
	public function __construct(IAppContainer $app,
								BackendMapper $backendMapper,
								ObjectMapper $objectMapper){
		parent::__construct($app, $backendMapper);
		$this->omp = $objectMapper;
	}


	/**
	 * Finds all objects of calendar $calendarId of user $userId
	 * @param Calendar $calendar;
	 * @param int limit
	 * @param int offset
	 * @throws BusinessLayerException
	 * @return ObjectCollection
	 */
	public function findAll(Calendar &$calendar, $limit=null, $offset=null) {
		try {
			$backend = $calendar->getBackend();
			$calendarURI = $calendar->getUri();
			$userId = $calendar->getUserId();

			if ($this->isBackendEnabled($backend) !== true) {
				$msg  = 'ObjectBusinessLayer::findAll(): User Error: ';
				$msg .= 'Backend found but not enabled!';
				throw new BusinessLayerException($msg, BusinessLayerException::INTERNAL);
			}

			$api = &$this->backends->find($backend)->api;

			$cacheObjects = $api->cacheObjects($calendarURI, $userId);
			if ($cacheObjects === true) {
				$objects = $this->omp->findAll($calendar, $limit, $offset);
			} else {
				$objects = $api->findObjects($calendar, $limit, $offset);
			}

			//check if $calendars is a CalendarCollection, if not throw an exception
			if (($objects instanceof ObjectCollection) === false) {
				$msg  = 'ObjectBusinessLayer::findAll(): Internal Error: ';
				$msg .= ($cacheObjects ? 'ObjectCache' : 'Backend') . ' returned unrecognised format!';
				throw new BusinessLayerException($msg, BusinessLayerException::INTERNAL);
			}

			return $objects;
		} catch (DoesNotExistException $ex) {
			throw new BusinessLayerException($ex->getMessage());
		} catch (BackendException $ex) {
			throw new BusinessLayerException($ex->getMessage());
		}
	}


	/**
	 * get the number how many calendars a user has
	 * @param Calendar &$calendar Calendar object
	 * @throws BusinessLayerException
	 * @return integer
	 */
	public function numberOfObjects(Calendar &$calendar) {
		try {
			$backend = $calendar->getBackend();
			$calendarURI = $calendar->getUri();
			$userId = $calendar->getUserId();

			if ($this->isBackendEnabled($backend) !== true) {
				$msg  = 'ObjectBusinessLayer::findAll(): User Error: ';
				$msg .= 'Backend found but not enabled!';
				throw new BusinessLayerException($msg);
			}

			$api = &$this->backends->find($backend)->api;

			$cacheObjects = $api->cacheObjects($calendarURI, $userId);
			//TODO implement
			if ($cacheObjects === true) {
				$number = 0;
			} else {
				$number = 0;
			}

			//check if number is an integer, if not throw an exception
			if (gettype($number) !== 'integer') {
				$msg  = 'CalendarBusinessLayer::numberOfObjects(): Internal Error: ';
				$msg .= ($cacheObjects ? 'ObjectCache' : 'Backend') . ' returned unrecognised format!';
				throw new BusinessLayerException($msg);
			}

			return $number;
		} catch (DoesNotExistException $ex) {
			throw new BusinessLayerException($ex->getMessage());
		}
	}

	/**
	 * Find the object $objectURI of calendar $calendarId of user $userId
	 * @param string $calendarId global uri of calendar e.g. local-work
	 * @param string $objectURI UID of the object
	 * @throws BusinessLayerException
	 * @return object
	 */
	public function find(Calendar &$calendar, $objectURI) {
		try {
			$backend = $calendar->getBackend();
			$calendarURI = $calendar->getUri();
			$userId = $calendar->getUserId();

			if ($this->isBackendEnabled($backend) !== true) {
				$msg  = 'ObjectBusinessLayer::find(): User Error: ';
				$msg .= 'Backend found but not enabled!';
				throw new BusinessLayerException($msg);
			}

			$api = &$this->backends->find($backend)->api;

			$cacheObjects = $api->cacheObjects($calendarURI, $userId);
			if ($cacheObjects === true) {
				$object = $this->omp->find($calendar, $objectURI);
			} else {
				$object = $api->findObject($calendar, $objectURI);
			}

			if (($object instanceof Object) === false) {
				$msg  = 'ObjectBusinessLayer::find(): Internal Error: ';
				$msg .= ($cacheObjects ? 'ObjectCache' : 'Backend') . ' returned unrecognised format!';
				throw new BusinessLayerException($msg);
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
	 * Find the object $objectURI of type $type of calendar $calendarId of user $userId
	 * @param string $calendarId global uri of calendar e.g. local-work
	 * @param string $objectURI UID of the object
	 * @param string $type type of the searched objects, use OCA\Calendar\Db\ObjectType
	 * @param string $userId
	 * @throws BusinessLayerException
	 * @return object
	 */
	public function findByType(Calendar &$calendar, $objectURI, $type) {
		try {
			$object = $this->find($calendar, $objectURI);

			if ($object->getType() !== $type) {
				$msg  = 'ObjectBusinessLayer::find(): User Error: ';
				$msg .= 'Requested object exists but is of different type!';
				throw new BusinessLayerException($msg);
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
	 * Finds all objects of type $type of calendar $calendarId of user $userId
	 * @param string $calendarId global uri of calendar e.g. local-work
	 * @param string $type type of the searched objects, use OCA\Calendar\Db\ObjectType
	 * @param string $userId
	 * @param int limit
	 * @param int offset
	 * @throws BusinessLayerException
	 * @return array containing all items
	 */
	public function findAllByType(Calendar &$calendar, $type, $limit=null, $offset=null) {
		try {
			$backend = $calendar->getBackend();
			$calendarURI = $calendar->getUri();
			$userId = $calendar->getUserId();

			if ($this->isBackendEnabled($backend) !== true) {
				$msg  = 'ObjectBusinessLayer::findAllByType(): User Error: ';
				$msg .= 'Backend found but not enabled!';
				throw new BusinessLayerException($msg);
			}

			$api = &$this->backends->find($backend)->api;

			$cacheObjects = $api->cacheObjects($calendarURI, $userId);
			if ($cacheObjects === true) {
				$objects = $this->omp->findAllByType($calendar, $type, $limit, $offset);
			} else {
				$api = &$this->backends->find($backend)->api;

				$doesBackendSupport = $this->doesBackendSupport($backend, \OCA\Calendar\Backend\FIND_OBJECTS_BY_TYPE);
				if ($doesBackendSupport === true) {
					$objects = $api->findObjectsByType($calendar, $type, $limit, $offset);
				} else {
					//TODO - don't query for all
					//query for subsets until we've got what we want
					$objects = $api->findObjects($calendar);
					if ($objects instanceof ObjectCollection) {
						$objects = $objects->byType($type)->subset($limit, $offset);
					}
				}
			}

			//check if $objects is a ObjectCollection, if not throw an exception
			if (($objects instanceof ObjectCollection) === false) {
				$msg  = 'ObjectBusinessLayer::findAllByType(): Internal Error: ';
				$msg .= ($cacheObjects ? 'ObjectCache' : 'Backend') . ' returned unrecognised format!';
				throw new BusinessLayerException($msg);
			}

			return $objects;
		} catch (DoesNotExistException $ex) {
			throw new BusinessLayerException($ex->getMessage());
		} catch (BackendException $ex) {
			throw new BusinessLayerException($ex->getMessage());
		}
	}

	/**
	 * Finds all objects in timespan from $start to $end of calendar $calendarId of user $userId
	 * @param string $calendarId global uri of calendar e.g. local-work
	 * @param DateTime $start start of timeframe
	 * @param DateTime $end end of timeframe
	 * @param string $userId
	 * @param int limit
	 * @param int offset
	 * @throws BusinessLayerException
	 * @return array containing all items
	 */
	public function findAllInPeriod(Calendar &$calendar, $start, $end, $limit=null, $offset=null) {
		try {
			$backend = $calendar->getBackend();
			$calendarURI = $calendar->getUri();
			$userId = $calendar->getUserId();

			if ($this->isBackendEnabled($backend) !== true) {
				$msg  = 'ObjectBusinessLayer::findAllInPeriod(): User Error: ';
				$msg .= 'Backend found but not enabled!';
				throw new BusinessLayerException($msg);
			}

			$cacheObjects = $api->cacheObjects($calendarURI, $userId);
			if ($cacheObjects === true) {
				$objects = $this->omp->findAllInPeriod($calendar, $start, $end, $limit, $offset);

				//check if $objects is a ObjectCollection, if not throw an exception
				if (($objects instanceof ObjectCollection) === false) {
					$msg  = 'ObjectBusinessLayer::findAllInPeriod(): Internal Error: ';
					$msg .= 'ObjectCache returned unrecognised format!';
					throw new BusinessLayerException($msg);
				}
			} else {
				$api = &$this->backends->find($backend)->api;

				$doesBackendSupport = $this->doesBackendSupport($backend, \OCA\Calendar\Backend\FIND_IN_PERIOD);
				if ($doesBackendSupport === true) {
					$objects = $api->findObjectsInPeriod($calendar, $type, $limit, $offset);
				} else {
					$objects = $api->findObjects($calendar);
				}

				//check if $objects is a ObjectCollection, if not throw an exception
				if (($objects instanceof ObjectCollection) === false) {
					$msg  = 'ObjectBusinessLayer::findAllByType(): Internal Error: ';
					$msg .= 'Backend returned unrecognised format!';
					throw new BusinessLayerException($msg);
				}

				if ($doesBackendSupport === false) {
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
	 * Finds all objects of type $type in timeframe from $start to $end of calendar $calendarId of user $userId
	 * @param string $calendarId global uri of calendar e.g. local-work
	 * @param string $type type of the searched objects, use OCA\Calendar\Db\ObjectType
	 * @param DateTime $start start of the timeframe
	 * @param DateTime $end end of the timeframe
	 * @param string $userId
	 * @param boolean $expand expand if repeating event
	 * @param DateTime $expandStart don't return repeating events earlier than $expandStart
	 * @param DateTime $expandEnd  don't return repeating events later than $expandEnd
	 * @param int limit
	 * @param int offset
	 * @throws BusinessLayerException
	 * @return array containing all items
	 */
	public function findAllByTypeInPeriod(Calendar &$calendar, $type, $start, $end, $limit=null, $offset=null) {
		try {
			$backend = $calendar->getBackend();
			$calendarURI = $calendar->getUri();
			$userId = $calendar->getUserId();

			if ($this->isBackendEnabled($backend) !== true) {
				$msg  = 'ObjectBusinessLayer::findAllInPeriod(): User Error: ';
				$msg .= 'Backend found but not enabled!';
				throw new BusinessLayerException($msg);
			}

			$cacheObjects = $api->cacheObjects($calendarURI, $userId);
			if ($cacheObjects === true) {
				$objects = $this->omp->findAllByTypeInPeriod($calendar, $start, $end, $type);

				//check if $objects is a ObjectCollection, if not throw an exception
				if (($objects instanceof ObjectCollection) === false) {
					$msg  = 'ObjectBusinessLayer::findAllByTypeInPeriod(): Internal Error: ';
					$msg .= 'ObjectCache returned unrecognised format!';
					throw new BusinessLayerException($msg);
				}
			} else {
				$api = &$this->backends->find($backend)->api;

				$doesBackendSupport = $this->doesBackendSupport($backend, \OCA\Calendar\Backend\FIND_IN_PERIOD_BY_TYPE);
				if ($doesBackendSupport === true) {
					$objects = $api->findObjectsByTypeInPeriod($calendar, $start, $end, $type);
				} else {
					$objects = $api->findObjects($calendar);
				}

				//check if $objects is a ObjectCollection, if not throw an exception
				if (($objects instanceof ObjectCollection) === false) {
					$msg  = 'ObjectBusinessLayer::findAllByType(): Internal Error: ';
					$msg .= 'Backend returned unrecognised format!';
					throw new BusinessLayerException($msg);
				}

				if ($doesBackendSupport === false) {
					$objects = $objects->byType($type)->inPeriod($start, $end)->subset($limit, $offset);
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
	 * creates a new object
	 * @param Object $object
	 * @throws BusinessLayerException
	 * @return array containing all items
	 */
	public function create(Object &$object) {
		try {
			$backend = $object->calendar->getBackend();
			$calendarURI = $object->calendar->getUri();
			$objectURI = $object->getObjectURI();

			if ($this->isBackendEnabled($backend) !== true) {
				$msg  = 'ObjectBusinessLayer::create(): User Error: ';
				$msg .= 'Backend found but not enabled!';
				throw new BusinessLayerException($msg);
			}
			//validate that calendar exists
			if ($this->doesObjectExist($calendarId, $objectURI, $userId) !== false) {
				$msg  = 'ObjectBusinessLayer::create(): User Error: ';
				$msg .= 'Object already exists!';
				throw new BusinessLayerException($msg);
			}
			if ($this->doesBackendSupport($backend, \OCA\Calendar\Backend\CREATE_OBJECT) !== true) {
				$msg  = 'ObjectBusinessLayer::create(): User Error: ';
				$msg .= 'Backend does not support creating objects!';
				throw new BusinessLayerException($msg);
			}

			if ($object->isValid() !== true) {
				//try to fix the object
				$object->fix();

				//check again
				if ($object->isValid() !== true) {
					$msg  = 'ObjectBusinessLayer::create(): User Error: ';
					$msg .= 'Given object data is not valid and not fixable';
					throw new BusinessLayerException($msg);
				}
			}

			$api->createObject($object, $calendarURI, $objectURI, $userId);

			$cacheObjects = $api->cacheObjects($calendarURI, $userId);
			if ($cacheObjects === true) {
				$this->omp->insert($object, $calendarURI, $objectURI, $userId);
			}

			$this->calendarBusinessLayer->touch($calendarId, $userId);

			return $object;
		} catch(DoesNotImplementException $ex) {
			throw new BusinessLayerException($ex->getMessage());
		} catch(BackendException $ex) {
			throw new BusinessLayerException($ex->getMessage());
		}
	}

	public function createFromRequest(Object &$object) {
		
	}

	/**
	 * updates an object
	 * @param Object $object 
	 * @param string $calendarId global uri of calendar e.g. local-work
	 * @param string $objectURI UID of the object
	 * @param string $userId
	 * @throws BusinessLayerException
	 * @return array containing all items
	 */
	public function update(Object &$object, Calendar &$calendar, $objectURI) {
		try {
			if (is_array($calendarId)) {
				$backend = $calendarId[0];
				$calendarURI = $calendarId[1];
			} else {
				list($backend, $calendarURI) = $this->splitCalendarURI($calendarId);
			}

			if ($this->isBackendEnabled($backend) !== true) {
				$msg  = 'ObjectBusinessLayer::findAllByType(): User Error: ';
				$msg .= 'Backend found but not enabled!';
				throw new BusinessLayerException($msg);
			}

			if ($object->getBackend() !== $backend || $object->getUri() !== $calendarURI) {
				return $this->move($object, $calendarId, $objectURI, $userId);
			}

			$this->checkBackendSupports($backend, \OCA\Calendar\Backend\UPDATE_OBJECT);

			$api = &$this->backends->find($backend)->api;

			if ($object->isValid() === false) {
				$object->fix();
			}

			$object = $api->updateObject($object, $calendarURI, $objectURI, $userId);
			$cacheObjects = $api->cacheObjects($calendarURI, $userId);
			if ($cacheObjects) {
				$this->omp->update($object, $calendarURI, $objectURI, $userId);
			}

			$this->calendarBusinessLayer->touch($calendarId, $userId);

			return $object;
		} catch(DoesNotImplementException $ex) {
			throw new BusinessLayerException($ex->getMessage());
		} catch(BackendException $ex) {
			throw new BusinessLayerException($ex->getMessage());
		}
	}


	public function updateFromRequest(Object $object, Calendar &$calendar, $objectURI, $etag) {
		$oldObject = $this->find($calendar, $objectURI);

		if ($oldObject->getEtag() !== $etag) {
			$msg  = 'ObjectBusinessLayer::updateFromRequest(): User Error: ';
			$msg .= 'If-Match failed; etags are not equal!';
			throw new BusinessLayerException($msg, Http::STATUS_PRECONDITION_FAILED);
		}

		return $this->update($object, $calendar, $objectURI);
	}

	/**
	 * delete an object from a calendar
	 * @param string $calendarId global uri of calendar e.g. local-work
	 * @param string $objectURI UID of the object
	 * @param string $userId
	 * @throws BusinessLayerException
	 * @return boolean
	 */
	public function delete(Calendar $calendar, $objectURI, $userId) {
		try {
			if (is_array($calendarId)) {
				$backend = $calendarId[0];
				$calendarURI = $calendarId[1];
			} else {
				list($backend, $calendarURI) = $this->splitCalendarURI($calendarId);
			}


			$this->checkBackendEnabled($backend);

			$this->checkBackendSupports($backend, \OCA\Calendar\Backend\DELETE_OBJECT);

			$api = &$this->backends->find($backend)->api;
			$api->deleteObject($calendarURI, $objectURI, $userId);

			if ($api->cacheObjects($calendarURI, $userId)) {
				$this->omp->delete($calendar);
			}

			$this->calendarBusinessLayer->touch($calendarId, $userId);

			return true;
		} catch(DoesNotImplementException $ex) {
			throw new BusinessLayerException($ex->getMessage());
		} catch(BackendException $ex) {
			throw new BusinessLayerException($ex->getMessage());
		}
	}

	/**
	 * moves an object from one to another calendar
	 * @param Object $object
	 * @param string $calendarId global uri of calendar e.g. local-work
	 * @param string $objectURI UID of the object
	 * @param string $userId
	 * @throws BusinessLayerException
	 * @return array containing all items
	 */
	public function move($object, Calendar $calendar, $objectURI, $userId) {
		try {
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
				$this->omp->delete($object, $calendarURI, $objectURI, $userId);
			}

			$cacheObjectsInNewBackend = $newBackendsAPI->cacheObjects($calendarURI, $userId);
			if ($cacheObjectsInNewBackend === true) {
				//dafuq
				$this->omp->create($object, $object->getCalendarUri(), $object->getObjectUri(), $userId);
			}

			$this->calendarBusinessLayer->touch($calendarId, $userId);
			$this->calendarBusinessLayer->touch($object->getCalendarId(), $userId);

			return $object;
		} catch(DoesNotImplementException $ex) {
			throw new BusinessLayerException($ex->getMessage());
		} catch(BackendException $ex) {
			throw new BusinessLayerException($ex->getMessage());
		}
	}

	public function moveAll() {
						/*if ($this->doesBackendSupport($oldBackend, \OCA\Calendar\Backend\DELETE_OBJECT) !== true) {
					$msg  = 'CalendarBusinessLayer::update(): User Error: ';
					$msg .= 'Backend does not support deleting objects!';
					throw new BusinessLayerException($msg);
				}
				if ($this->doesBackendSupport($newBackend, \OCA\Calendar\Backend\CREATE_OBJECT) !== true) {
					$msg  = 'CalendarBusinessLayer::update(): User Error: ';
					$msg .= 'Backend does not support creating objects!';
					throw new BusinessLayerException($msg);
				}*/
	}

	public function deleteAll() {
		
	}

	/**
	 * touch an object
	 * @param string $calendarId global uri of calendar e.g. local-work
	 * @param string $objectURI UID of the object
	 * @param string $userId
	 * @throws BusinessLayerException
	 * @return array containing all items
	 */
	public function touch(Calendar $calendar, $objectURI, $userId) {
		try {
			if (is_array($calendarId)) {
				$backend = $calendarId[0];
				$calendarURI = $calendarId[1];
			} else {
				list($backend, $calendarURI) = $this->splitCalendarURI($calendarId);
			}

			$this->checkBackendEnabled($backend);

			$object = $this->find($calendarId, $objectURI, $userid);
			$object->touch();

			$this->update($object, $calendarId, $userId);
		} catch(DoesNotImplementException $ex) {
			throw new BusinessLayerException($ex->getMessage());
		} catch(BackendException $ex) {
			throw new BusinessLayerException($ex->getMessage());
		}
	}

	/**
	 * make sure that uri does not already exist when creating a new object
	 * @param string $backend
	 * @param string $calendarURI
	 * @param string $userId
	 * @return boolean
	 * @throws BusinessLayerException if uri is already taken
	 */
	private function allowNoObjectURITwice($backend, $calendarURI, $objectURI, $userId){
		if ($this->isObjectURIAvailable($backend, $calendarURI, $objectURI, $userId, true) === false) {
			throw new BusinessLayerException('Can not add object: UID already exists');
		}
	}

	/**
	 * checks if a uri is available
	 * @param string $backend
	 * @param string $calendarURI
	 * @param string $objectURI
	 * @param string $userId
	 * @return boolean
	 */
	private function isObjectURIAvailable($backend, $calendarURI, $objectURI, $userId, $checkRemote=false) {
		$existingObjects = $this->omp->find($backend, $calendarURI, $objectURI, $userId);
		if (count($existingObjects) !== 0) {
			return false;
		}

		if ($checkRemote === true) {
			$existingRemoteObjects = $this->backends->find($backend)->api->findObject($calendarURI, $objectURI, $userId);
			if (count($existingRemoteObjects) !== 0) {
				return false;
			}
		}

		return true;
	}

	/**
	 * update a specific calendar
	 * @param string $userId
	 * @return boolean
	 */
	public function updateCacheForCalendarFromRemote($calendarId, $userId=null) {
		try{
			if (is_array($calendarId)) {
				$backend = $calendarId[0];
				$calendarURI = $calendarId[1];
			} else {
				list($backend, $calendarURI) = $this->splitCalendarURI($calendarId);
			}

			

			return true;
		}catch(BackendException $ex) {
			
		}
	}

	/**
	 * update a specific calendar
	 * @param string $userId
	 * @return boolean
	 */
	public function updateCacheForObjectFromRemote($calendarId, $objectURI, $userId) {
		try{
			if (is_array($calendarId)) {
				$backend = $calendarId[0];
				$calendarURI = $calendarId[1];
			} else {
				list($backend, $calendarURI) = $this->splitCalendarURI($calendarId);
			}

			$remoteAPI = &$this->backends->find($backend)->api;

			$doesObjectExistCached = $this->doesExist(array($backend, $calendarURI), $objectURI, $userId, false);
			$doesObjectExistRemote = $remoteAPI->doesObjectExist($calendarURI, $objectURI, $userId);

			if ($doesObjectExistCached === false && $doesObjectExistRemote === false) {
				$msg  = 'ObjectBusinessLayer::updateCacheForObjectFromRemote(): ';
				$msg .= '"b:' . $backend . ';cu:' . $calendarURI . ';ou:' . $objectURI . '" doesn\'t exist';
				$msg .= 'Neither cached nor remote!';
				throw new DoesNotExistException($msg);
			}

			if ($doesObjectExistRemote === false) {
				$msg  = 'ObjectBusinessLayer::updateCacheForObjectFromRemote(): ';
				$msg .= 'Object vanished from remote - removing object from cache!';
				//TODO - log debug message

				$cachedObject = $this->find(array($backend, $calendarURI), $objectURI, $userId);

				$this->omp->delete($cachedObject);
				return true;
			}

			$remoteObject = $remoteAPI->findObject($calendarURI, $objectURI, $userId);

			if ($doesCalendarExistCached === false) {
				$msg  = 'ObjectBusinessLayer::updateCacheForObjectFromRemote(): ';
				$msg .= 'Object not cached - creating object from remote!';
				//TODO - log debug message

				$this->omp->insert($remoteCalendar);
				return true;
			}

			if ($cachedObject === null) {
				$cachedObject = $this->find(array($backend, $calendarURI), $objectURI, $userId);
			}

			if ($cachedObject->getEtag() === $remoteObject->getEtag()) {
				return true;
			}

			$this->omp->update($cachedCalendar);

			return true;
		}catch(BackendException $ex) {
			
		}
	}
}