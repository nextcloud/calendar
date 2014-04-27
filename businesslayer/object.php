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

use \OCA\Calendar\Utility\ObjectUtility;

use \DateTime;

class ObjectBusinessLayer extends BackendDependedBusinessLayer {

	/**
	 * object objectmapper object
	 * @var \OCA\Calendar\Db\ObjectMapper
	 */
	private $omp;


	/**
	 * object objectcachemanager object
	 * @var \OCA\Calendar\Db\ObjectCacheManager
	 */
	private $ocm;


	/**
	 * runtime cache for calendars
	 * @var array
	 */
	private $runtimeCache;


	/**
	 * @param IAppContainer $app
	 * @param BackendMapper $backendMapper
	 * @param ObjectMapper $objectMapper: mapper for objects cache
	 */
	public function __construct(IAppContainer $app,
								BackendBusinessLayer $backendBusinessLayer,
								ObjectMapper $objectMapper){
		parent::__construct($app, $backendBusinessLayer);
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

			if (!$this->backends->find($backend)->getEnabled()) {
				$msg  = 'ObjectBusinessLayer::findAll(): User Error: ';
				$msg .= 'Backend found but not enabled!';
				throw new BusinessLayerException($msg, BusinessLayerException::INTERNAL);
			}

			$api = &$this->backends->find($backend)->api;
			$cacheObjects = $api->cacheObjects($calendarURI, $userId);

			if ($cacheObjects) {
				$objects = $this->omp->findAll($calendar, $limit, $offset);
			} else {
				$objects = $api->findObjects($calendar, $limit, $offset);
			}

			if (!($objects instanceof ObjectCollection)) {
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

			if (!$this->backends->find($backend)->getEnabled()) {
				$msg  = 'ObjectBusinessLayer::findAll(): User Error: ';
				$msg .= 'Backend found but not enabled!';
				throw new BusinessLayerException($msg);
			}

			$api = &$this->backends->find($backend)->api;
			$cacheObjects = $api->cacheObjects($calendarURI, $userId);

			if ($cacheObjects) {
				$number = $this->omp->count($calendar);
			} else {
				$number = $cacheObjects->countObjects($calendar);
			}

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
	 * @return Object
	 */
	public function find(Calendar &$calendar, $objectURI) {
		try {
			$backend = $calendar->getBackend();
			$calendarURI = $calendar->getUri();
			$userId = $calendar->getUserId();

			if (!$this->backends->find($backend)->getEnabled()) {
				$msg  = 'ObjectBusinessLayer::find(): User Error: ';
				$msg .= 'Backend found but not enabled!';
				throw new BusinessLayerException($msg);
			}

			$api = &$this->backends->find($backend)->api;
			$cacheObjects = $api->cacheObjects($calendarURI, $userId);

			if ($cacheObjects) {
				$object = $this->omp->find($calendar, $objectURI);
			} else {
				$object = $api->findObject($calendar, $objectURI);
			}

			if (!($object instanceof Object)) {
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
	 * @param Calendar $calendar
	 * @param string $objectURI UID of the object
	 * @param integer $type
	 * @throws BusinessLayerException
	 * @return Object
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
			var_dump($ex);
			exit;
			throw new BusinessLayerException($ex->getMessage(), Http::STATUS_NOT_FOUND);
		} catch (MultipleObjectsReturnedException $ex) {
			throw new BusinessLayerException($ex->getMessage());
		} catch (BackendException $ex) {
			throw new BusinessLayerException($ex->getMessage());
		}
	}


	/**
	 * Finds all objects of type $type of calendar $calendarId of user $userId
	 * @parm Calendar $calendar
	 * @param integer $type
	 * @param int limit
	 * @param int offset
	 * @throws BusinessLayerException
	 * @return ObjectCollection
	 */
	public function findAllByType(Calendar &$calendar, $type, $limit=null, $offset=null) {
		try {
			$backend = $calendar->getBackend();
			$calendarURI = $calendar->getUri();
			$userId = $calendar->getUserId();

			if (!$this->backends->find($backend)->getEnabled()) {
				$msg  = 'ObjectBusinessLayer::findAllByType(): User Error: ';
				$msg .= 'Backend found but not enabled!';
				throw new BusinessLayerException($msg);
			}

			$api = &$this->backends->find($backend)->api;
			$cacheObjects = $api->cacheObjects($calendarURI, $userId);

			if ($cacheObjects) {
				$objects = $this->omp->findAllByType($calendar, $type, $limit, $offset);
			} else {
				if ($this->doesBackendSupport($backend, \OCA\Calendar\Backend\FIND_OBJECTS_BY_TYPE)) {
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

			if (!($objects instanceof ObjectCollection)) {
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
	 * @param Calendar $calendar
	 * @param DateTime $start start of timeframe
	 * @param DateTime $end end of timeframe
	 * @param int limit
	 * @param int offset
	 * @throws BusinessLayerException
	 * @return ObjectCollection
	 */
	public function findAllInPeriod(Calendar &$calendar, DateTime $start, DateTime $end, $limit=null, $offset=null) {
		try {
			$backend = $calendar->getBackend();
			$calendarURI = $calendar->getUri();
			$userId = $calendar->getUserId();

			if (!$this->backends->find($backend)->getEnabled()) {
				$msg  = 'ObjectBusinessLayer::findAllInPeriod(): User Error: ';
				$msg .= 'Backend found but not enabled!';
				throw new BusinessLayerException($msg);
			}

			$api = &$this->backends->find($backend)->api;
			$cacheObjects = $api->cacheObjects($calendarURI, $userId);

			if ($cacheObjects) {
				$objects = $this->omp->findAllInPeriod($calendar, $start, $end, $limit, $offset);
			} else {
				if ($this->doesBackendSupport($backend, \OCA\Calendar\Backend\FIND_IN_PERIOD)) {
					$objects = $api->findObjectsInPeriod($calendar, $start, $end, $limit, $offset);
				} else {
					//TODO - don't query for all
					//query for subsets until we've got what we want
					$objects = $api->findObjects($calendar);
					$objects = $objects->inPeriod($start, $end)->subset($limit, $offset);
				}
			}

			if (!($objects instanceof ObjectCollection)) {
				$msg  = 'ObjectBusinessLayer::findAllInPeriod(): Internal Error: ';
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
	 * Finds all objects of type $type in timeframe from $start to $end of calendar $calendarId of user $userId
	 * @param Calendar $calendar
	 * @param integer $type
	 * @param DateTime $start start of the timeframe
	 * @param DateTime $end end of the timeframe
	 * @param int limit
	 * @param int offset
	 * @throws BusinessLayerException
	 * @return ObjectCollection
	 */
	public function findAllByTypeInPeriod(Calendar &$calendar, $type, $start, $end, $limit=null, $offset=null) {
		try {
			$backend = $calendar->getBackend();
			$calendarURI = $calendar->getUri();
			$userId = $calendar->getUserId();

			if (!$this->backends->find($backend)->getEnabled()) {
				$msg  = 'ObjectBusinessLayer::findAllInPeriod(): User Error: ';
				$msg .= 'Backend found but not enabled!';
				throw new BusinessLayerException($msg);
			}

			$api = &$this->backends->find($backend)->api;
			$cacheObjects = $api->cacheObjects($calendarURI, $userId);

			if ($cacheObjects) {
				$objects = $this->omp->findAllByTypeInPeriod($calendar, $type, $start, $end, $limit, $offset);
			} else {
				if ($this->doesBackendSupport($backend, \OCA\Calendar\Backend\FIND_IN_PERIOD_BY_TYPE)) {
					$objects = $api->findObjectsByTypeInPeriod($calendar, $type, $start, $end, $limit, $offset);
				} else {
					//TODO - don't query for all
					//query for subsets until we've got what we want
					$objects = $api->findObjects($calendar);
					$objects = $objects->byType($type)->inPeriod($start, $end)->subset($limit, $offset);
				}
			}

			if (!($objects instanceof ObjectCollection)) {
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
	 * checks if an object exists
	 * @param Calendar $calendar
	 * @param string $objectURI
	 * @param boolean $checkRemote
	 * @return boolean
	 */
	public function doesExist(Calendar &$calendar, $objectURI, $checkRemote=false) {
		try {
			$backend = $calendar->getBackend();
			$calendarURI = $calendar->getUri();
			$userId = $calendar->getUserId();

			$api = &$this->backends->find($backend)->api;
			$cacheObjects = $api->cacheObjects($calendarURI, $userId);

			if ($cacheObjects && !$checkRemote) {
				return $this->omp->doesExist($calendar, $objectURI);
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
	 * @return boolean
	 */
	public function doesAllow(Calendar &$calendar, $objectURI, $cruds) {
		try {
			$backend = $calendar->getBackend();
			$calendarURI = $calendar->getUri();
			$userId = $calendar->getUserId();

			$api = &$this->backends->find($backend)->api;
			$cacheObjects = $api->cacheObjects($calendarURI, $userId);

			if ($cacheObjects) {
				return $this->omp->doesAllow($cruds, $calendar, $objectURI);
			} else {
				return $api->doesObjectAllow($cruds, $calendar, $objectURI);
			}
		} catch(BackendException $ex) {
			throw new BusinessLayerException($ex->getMessage());
		} catch(DoesNotExistException $ex) {
			throw new BusinessLayerException($ex->getMessage());
		}
	}


	/**
	 * creates a new object
	 * @param Object $object
	 * @throws BusinessLayerException
	 * @return Object
	 */
	public function create(Object &$object) {
		try {
			$calendar = $object->getCalendar();
			$objectURI = $object->getObjectURI();

			$backend = $calendar->getBackend();
			$calendarURI = $calendar->getUri();
			$userId = $calendar->getUserId();

			if (!$this->backends->find($backend)->getEnabled()) {
				$msg  = 'ObjectBusinessLayer::create(): User Error: ';
				$msg .= 'Backend found but not enabled!';
				throw new BusinessLayerException($msg);
			}
			if ($this->doesExist($calendar, $objectURI)) {
				$msg  = 'ObjectBusinessLayer::create(): User Error: ';
				$msg .= 'Object already exists!';
				throw new BusinessLayerException($msg);
			}
			if (!$this->doesBackendSupport($backend, \OCA\Calendar\Backend\CREATE_OBJECT)) {
				$msg  = 'ObjectBusinessLayer::create(): User Error: ';
				$msg .= 'Backend does not support creating objects!';
				throw new BusinessLayerException($msg);
			}

			if (!$object->isValid()) {
				$msg  = 'ObjectBusinessLayer::create(): User Error: ';
				$msg .= 'Given object data is not valid and not fixable';
				throw new BusinessLayerException($msg);
			}

			$api = &$this->backends->find($backend)->api;
			$api->createObject($object);

			if ($api->cacheObjects($calendarURI, $userId)) {
				$this->omp->insert($object, $calendarURI, $objectURI, $userId);
			}

			return $object;
		} catch(DoesNotImplementException $ex) {
			throw new BusinessLayerException($ex->getMessage());
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
		if($object->getObjectURI() === null) {
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

		$collection->iterate(function($object) use ($createdObjects) {
			try {
				$object = $this->create($object);
			} catch(BusinessLayerException $ex) {
				continue;
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

		$collection->iterate(function($object) use ($createdObjects) {
			try {
				$object = $this->createFromRequest($object);
			} catch(BusinessLayerException $ex) {
				continue;
			}
			$createdObjects->add($object);
		});

		return $createdObjects;
	}


	/**
	 * updates an object
	 * @param Object $object
	 * @param Calendar $calendar
	 * @param string $objectURI UID of the object
	 * @throws BusinessLayerException
	 * @return Object
	 */
	public function update(Object &$object, Calendar &$oldCalendar, $oldObjectURI) {
		try {
			$newCalendar = $object->getCalendar();
			$newObjectURI = $object->getObjectURI();

			$newBackend = $newCalendar->getBackend();
			$oldBackend = $oldCalendar->getBackend();
			$newCalendarURI = $newCalendar->getUri();
			$oldCalendarURI = $oldCalendar->getUri();
			$newUserId = $newCalendar->getUserId();
			$oldUserId = $oldCalendar->getUserId();

			if ($newUserId !== $oldUserId) {
				$msg  = 'ObjectBusinessLayer::update(): Not supported: ';
				$msg .= 'Transferring an object to another user is not supported yet.';
				throw new BusinessLayerException($msg, Http::STATUS_UNPROCESSABLE_ENTITY);
				/* return $this->transfer($object, $oldCalendar, $oldObjectURI); */
			}
			if ($newBackend !== $oldBackend ||
				$newCalendarURI !== $oldCalendarURI ||
				$newObjectURI !== $oldObjectURI) {
				return $this->move($object, $oldCalendar, $oldObjectURI);
			}

			if (!$this->backends->find($newBackend)->getEnabled()) {
				$msg  = 'ObjectBusinessLayer::findAllByType(): User Error: ';
				$msg .= 'Backend found but not enabled!';
				throw new BusinessLayerException($msg);
			}
			if (!$this->doesExist($calendar, $objectURI)) {
				$msg  = 'ObjectBusinessLayer::update(): User Error: ';
				$msg .= 'Object does not exists!';
				throw new BusinessLayerException($msg);
			}
			if (!$this->doesBackendSupport($backend, \OCA\Calendar\Backend\UPDATE_OBJECT)) {
				$msg  = 'CalendarBusinessLayer::update(): User Error: ';
				$msg .= 'Backend does not support updating objects!';
				throw new BusinessLayerException($msg, Http::STATUS_UNPROCESSABLE_ENTITY);
			}

			if (!$object->isValid()) {
				$msg  = 'ObjectBusinessLayer::update(): User Error: ';
				$msg .= 'Given object data is not valid and not fixable';
				throw new BusinessLayerException($msg);
			}

			$api = &$this->backends->find($backend)->api;
			$object = $api->updateObject($object, $calendar);

			if ($api->cacheObjects($calendarURI, $userId)) {
				$this->omp->update($object, $calendarURI, $objectURI, $userId);
			}

			return $object;
		} catch(DoesNotImplementException $ex) {
			throw new BusinessLayerException($ex->getMessage());
		} catch(BackendException $ex) {
			throw new BusinessLayerException($ex->getMessage());
		}
	}


	/**
	 * updates an object from request
	 * @param Object $object
	 * @param Calendar $calendar
	 * @param string $objectURI UID of the object
	 * @param string $etag
	 * @throws BusinessLayerException
	 * @return Object
	 */
	public function updateFromRequest(Object $object, Calendar &$calendar, $objectURI, $etag) {
		$oldObject = $this->find($calendar, $objectURI);

		if ($oldObject->getEtag() !== $etag) {
			$msg  = 'ObjectBusinessLayer::updateFromRequest(): User Error: ';
			$msg .= 'If-Match failed; etags are not equal!';
			throw new BusinessLayerException($msg, Http::STATUS_PRECONDITION_FAILED);
		}

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
			$objectURI = $object->getObjectURI();

			$backend = $calendar->getBackend();
			$calendarURI = $calendar->getUri();


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
	 * delete all objects from a calendar
	 * @param Calendar $calendar
	 * @param integer $limit
	 * @param integer $offset
	 * @throws BusinessLayerException
	 * @return boolean
	 */
	public function deleteAll(Calendar &$calendar, $limit, $offset) {
		
	}


	/**
	 * updates cache manager for a certian calendar
	 * @param Calendar $calendar
	 * @return boolean
	 */
	public function updateCacheManagerFromRemote(Calendar $calendar/*, $limit, $offset*/) {
		$backend = $calendar->getBackend();
		$calendarURI = $calendar->getUri();
		$userId = $calendar->getUserId();

		$api = &$this->backends->find($backend)->api;
		if (!$api->cacheObjects($calendarURI, $userId)) {
			return true;
		}

		$cachedEtags = $this->omp->getUriToEtagMap($calendar, $limit, $offset);
		$remoteEtags = $api->getUriToEtagMap($calendar, $limit, $offset);

		$deletedObjects = array_diff_key($remoteEtags, $cachedEtags);
		$createdObjects = array_diff_key($cachedEtags, $remoteEtags);

		$this->ocm->setDeleted($calendar, $deletedObjects);
		$this->ocm->setCreated($calendar, $createdObjects);

		$otherCachedObjects = array_intersect_assoc(
			$cachedEtags, 
			array_merge($deletedObjects, $createdObjects)
		);

		$otherRemoteObjects = array_intersect_assoc(
			$remoteEtags, 
			array_merge($deletedObjects, $createdObjects)
		);

		$updatedObjects = array_diff_assoc($otherCachedObjects, $otherRemoteObjects);

		$this->ocm->setOutDated($calendar, $updatedObjects);

		return true;
	}


	/**
	 * create objects marked as created in cache manager
	 * @param Calendar $calendar
	 * @param integer $limit
	 * @param integer $offset
	 * @return boolean
	 */
	public function updateCacheFromCacheManagerCreate(Calendar $calendar, $limit, $offset) {
		$backend = $calendar->getBackend();
		$calendarURI = $calendar->getUri();
		$userId = $calendar->getUserId();

		$api = &$this->backends->find($backend)->api;
		$createdObjects = $this->ocm->getCreated($calendar, $limit, $offset);

		foreach($createdObjects as $objectURI) {
			try {
				if($this->doesObjectExist($calendar, $objectURI)) {
					$object = $api->findObject($calendar, $objectURI);
					if($object->isValid()) {
						$this->omp->insert($object);
					}
				}
			} catch(/* some */Exception $ex) {}
			$this->ocm->deleteCreated($calendar, $objectURI);
		}

		return true;
	}


	/**
	 * delete objects marked as deleted in cache manager
	 * @param Calendar $calendar
	 * @param integer $limit
	 * @param integer $offset
	 * @return boolean
	 */
	public function updateCacheFromCacheManagerDelete(Calendar $calendar, $limit, $offset) {
		$backend = $calendar->getBackend();
		$calendarURI = $calendar->getUri();
		$userId = $calendar->getUserId();

		$api = &$this->backends->find($backend)->api;
		$deletedObjects = $this->ocm->getDeleted($calendar, $limit, $offset);

		foreach($deletedObjects as $objectURI) {
			try {
				if($api->doesObjectExist($calendar, $objectURI)) {
					$this->ocm->setOneCreated($calendar, $objectURI);
				} else {
					$object = $this->findObject($calendar, $objectURI);
					$this->omp->delete($object);
				}
			} catch(/* some */Exception $ex) {}
			$this->ocm->deleteDeleted($calendar, $objectURI);
		}

		return true;
	}


	/**
	 * updates objects marked as outdated in cache manager
	 * @param Calendar $calendar
	 * @param integer $limit
	 * @param integer $offset
	 * @return boolean
	 */
	public function updateCacheFromCacheManagerUpdate(Calendar $calendar, $limit, $offset) {
		$backend = $calendar->getBackend();
		$calendarURI = $calendar->getUri();
		$userId = $calendar->getUserId();

		$api = &$this->backends->find($backend)->api;
		$updatedObjects = $this->ocm->getOutDated($calendar, $limit, $offset);

		foreach($updatedObjects as $objectURI) {
			try {
				if($api->doesObjectExist($calendar, $objectURI)) {
					$object = $api->findObject($calendar, $objectURI);
					if($object->isValid()) {
						$this->omp->update($object);
					}
				} else {
					$this->ocm->setOneDeleted($calendar, $objectURI);
				}
			} catch(/* some */Exception $ex) {}
			$this->ocm->deleteUpdated($calendar, $objectURI);
		}

		return true;
	}
}