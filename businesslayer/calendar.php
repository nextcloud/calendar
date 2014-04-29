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

use \OCA\Calendar\Backend\BackendException;
use \OCA\Calendar\Backend\IBackend;

use \OCA\Calendar\Db\Calendar;
use \OCA\Calendar\Db\CalendarCollection;
use \OCA\Calendar\Db\CalendarMapper;

use \OCA\Calendar\Db\ObjectType;
use \OCA\Calendar\Db\Permissions;

use \OCA\Calendar\Db\BackendMapper;
use \OCA\Calendar\Db\DoesNotExistException;
use \OCA\Calendar\Db\MultipleObjectsReturnedException;

use \OCA\Calendar\Utility\CalendarUtility;

class CalendarBusinessLayer extends BackendDependedBusinessLayer {

	/**
	 * object calendarmapper object
	 * @var \OCA\Calendar\Db\CalendarMapper
	 */
	private $cmp;


	/**
	 * object objectbusinesslayer object
	 * @var \OCA\Calendar\BusinessLayer\ObjectBusinessLayer
	 */
	private $obl;


	/**
	 * runtime cache for calendars
	 * @var array
	 */
	private $runtimeCache;


	/**
	 * @param IAppContainer $app
	 * @param BackendMapper $backendMapper
	 * @param CalendarMapper $objectMapper: mapper for objects cache
	 * @param ObjectBusinessLayer $objectBusinessLayer
	 * @param API $api: an api wrapper instance
	 */
	public function __construct(IAppContainer $app,
								BackendBusinessLayer $backendBusinessLayer,
								CalendarMapper $calendarMapper,
								ObjectBusinessLayer $objectBusinessLayer){

		parent::__construct($app, $backendBusinessLayer);

		$this->cmp = $calendarMapper;
		$this->obl = $objectBusinessLayer;
	}


	/**
	 * Find calendars of user $userId
	 * @param string $userId
	 * @param integer $limit
	 * @param integer $offset
	 * @param boolean $filterBackends
	 * @throws BusinessLayerException
	 * @return \OCA\Calendar\Db\CalendarCollection
	 */
	public function findAll($userId, $limit=null, $offset=null, $filterBackends=true) {
		try {
			$calendars = $this->cmp->findAll($userId, $limit, $offset);
			if (!($calendars instanceof CalendarCollection)) {
				$msg  = 'CalendarBusinessLayer::findAll(): Internal Error: ';
				$msg .= 'CalendarCache returned unrecognised format!';
				throw new BusinessLayerException($msg);
			}

			if ($filterBackends) {
				$backends = $this->backends->enabled();
				$calendars = $calendars->filterByBackends($backends);
			}

			return $calendars;
		} catch (BackendException $ex) {
			throw new BusinessLayerException($ex->getMessage());
		}
	}


	/**
	 * number of calendars
	 * @param string $userId
	 * @param boolean $filterBackends
	 * @throws BusinessLayerException
	 * @return integer
	 */
	public function numberOfCalendars($userId, $filterBackends=true) {
		try {
			if (!$filterBackends) {
				$number = $this->cmp->count($userId);
				if (gettype($number) !== 'integer') {
					$msg  = 'CalendarBusinessLayer::numberOfAllCalendars(): Internal Error: ';
					$msg .= 'CalendarCache returned unrecognised format!';
					throw new BusinessLayerException($msg);
				}

				return $number;
			} else {
				$this->findAll($userId, null, null, true)->count();
			}
		} catch (DoesNotExistException $ex) {
			throw new BusinessLayerException($ex->getMessage());
		}
	}


	/**
	 * Find all calendars of user $userId on a backend
	 * @param string $backend
	 * @param string $userId
	 * @param integer $limit
	 * @param integer $offset
	 * @throws BusinessLayerException
	 * @return \OCA\Calendar\Db\CalendarCollection
	 */
	public function findAllOnBackend($backend, $userId, $limit=null, $offset=null) {
		try {
			$calendars = $this->cmp->findAllOnBackend($backend, $userId, $limit, $offset);
			if (!($calendars instanceof CalendarCollection)) {
				$msg  = 'CalendarBusinessLayer::findAllOnBackend(): Internal Error: ';
				$msg .= 'CalendarCache returned unrecognised format!';
				throw new BusinessLayerException($msg);
			}

			return $calendars;
		} catch (DoesNotExistException $ex) {
			throw new BusinessLayerException($ex->getMessage());
		} catch (BackendException $ex) {
			throw new BusinessLayerException($ex->getMessage());
		}
	}


	/**
	 * number of calendars on a backend
	 * @param string $backend
	 * @param string $userId
	 * @throws BusinessLayerException
	 * @return integer
	 */
	public function numberOfCalendarsOnBackend($backend, $userId) {
		try {
			$number = $this->cmp->countOnBackend($backend, $userId);
			if (gettype($number) !== 'integer') {
				$msg  = 'CalendarBusinessLayer::numberOfAllCalendarsOnBackend(): Internal Error: ';
				$msg .= 'CalendarCache returned unrecognised format!';
				throw new BusinessLayerException($msg);
			}

			return $number;
		} catch (DoesNotExistException $ex) {
			throw new BusinessLayerException($ex->getMessage());
		}
	}


	/**
	 * Find calendar $calendarId of user $userId
	 * @param string $calendarId global uri of calendar e.g. local::work
	 * @param string $userId
	 * @throws BusinessLayerException if backend does not exist
	 * @throws BusinessLayerException if backend is disabled
	 * @return \OCA\Calendar\Db\Calendar object
	 */
	public function find($calendarId, $userId) {
		try {
			list($backend, $calendarURI) = (is_array($calendarId)) ? $calendarId :
											$this->splitCalendarURI($calendarId);

			if (!$this->backends->find($backend)->getEnabled()) {
				$msg  = 'CalendarBusinessLayer::find(): User Error: ';
				$msg .= 'Backend found but not enabled';
				throw new BusinessLayerException($msg, Http::STATUS_FORBIDDEN);
			}

			$calendar = $this->cmp->find($backend, $calendarURI, $userId);
			if (!($calendar instanceof Calendar)) {
				$msg  = 'CalendarBusinessLayer::find(): Internal Error: ';
				$msg .= 'CalendarCache returned unrecognised format!';
				throw new BusinessLayerException($msg);
			}

			return $calendar;
		} catch (DoesNotExistException $ex) {
			$msg  = 'CalendarBusinessLayer::find(): User Error: ';
			$msg .= 'No matching calendar entry found!';
			throw new BusinessLayerException($msg, Http::STATUS_NOT_FOUND, $ex);
		} catch (MultipleObjectsReturnedException $ex) {
			$msg  = 'CalendarBusinessLayer::find(): Internal Error: ';
			$msg .= 'Multiple matching calendar entries found!';
			throw new BusinessLayerException($msg, Http::STATUS_INTERNAL_SERVER_ERROR, $ex);
		} catch (BackendException $ex) {
			throw new BusinessLayerException($ex->getMessage());
		}
	}


	/**
	 * checks if a calendar exists
	 * @param string $calendarId
	 * @param string $userId
	 * @param boolean $checkRemote
	 * @return boolean
	 */
	public function doesExist($calendarId, $userId, $checkRemote=false) {
		try {
			list($backend, $calendarURI) = (is_array($calendarId)) ? $calendarId :
											$this->splitCalendarURI($calendarId);

			$doesExistCached = $this->cmp->doesExist($backend, $calendarURI, $userId);
			if (!$checkRemote) {
				return $doesExistCached;
			}

			$doesExistRemote = $this->backends->find($backend)->api->doesCalendarExist($calendarURI, $userId);
			//TODO - rethink: should the cache be updated here?
			if ($doesExistCached !== $doesExistRemote) {
				$this->updateCacheForCalendarFromRemote(array($backend, $calendarURI), $userId);
			}

			return $doesExistRemote;
		} catch(BackendException $ex) {
			throw new BusinessLayerException($ex->getMessage());
		} catch(DoesNotExistException $ex) {
			throw new BusinessLayerException($ex->getMessage());
		}
	}


	/**
	 * checks if a calendar allows a certain action
	 * @param integer $cruds
	 * @param string $calendarId
	 * @param string $userId
	 * @return boolean
	 */
	public function doesAllow($cruds, $calendarId, $userId) {
		try {
			list($backend, $calendarURI) = (is_array($calendarId)) ? $calendarId :
											$this->splitCalendarURI($calendarId);

			return $this->cmp->doesAllow($cruds, $backend, $calendarURI, $userId);
		} catch(BackendException $ex) {
			throw new BusinessLayerException($ex->getMessage());
		} catch(DoesNotExistException $ex) {
			throw new BusinessLayerException($ex->getMessage());
		}
	}


	/**
	 * checks if a calendar supports a certian component
	 * @param integer $component
	 * @param string $calendarId
	 * @param string $userId
	 * @return boolean
	 */
	public function doesSupport($component, $calendarId, $userId) {
		try {
			list($backend, $calendarURI) = (is_array($calendarId)) ? $calendarId :
											$this->splitCalendarURI($calendarId);

			return $this->cmp->doesSupport($component, $backend, $calendarURI, $userId);
		} catch(BackendException $ex) {
			throw new BusinessLayerException($ex->getMessage());
		} catch(DoesNotExistException $ex) {
			throw new BusinessLayerException($ex->getMessage());
		}
	}


	/**
	 * create a new calendar
	 * @param Calendar $calendar
	 * @throws BusinessLayerException if name exists already
	 * @throws BusinessLayerException if backend does not exist
	 * @throws BusinessLayerException if backend is disabled
	 * @throws BusinessLayerException if backend does not implement creating a calendar
	 * @return \OCA\Calendar\Db\Calendar $calendar - calendar object
	 */
	public function create(Calendar $calendar) {
		try {
			$backend = $calendar->getBackend();
			$calendarURI = $calendar->getUri();
			$userId = $calendar->getUserId();

			if (!$calendar->isValid()) {
				$msg  = 'CalendarBusinessLayer::create(): User Error: ';
				$msg .= 'Given calendar data is not valid!';
				throw new BusinessLayerException($msg, Http::STATUS_UNPROCESSABLE_ENTITY);
			}

			if (!$this->backends->find($backend)->getEnabled()) {
				$msg  = 'CalendarBusinessLayer::create(): User Error: ';
				$msg .= 'Backend found but not enabled!';
				throw new BusinessLayerException($msg, Http::STATUS_UNPROCESSABLE_ENTITY);
			}
			if ($this->doesExist(array($backend, $calendarURI), $userId)) {
				$msg  = 'CalendarBusinessLayer::create(): User Error: ';
				$msg .= 'Calendar already exists!';
				throw new BusinessLayerException($msg, Http::STATUS_CONFLICT);
			}
			if (!$this->doesBackendSupport($backend, \OCA\Calendar\Backend\CREATE_CALENDAR)) {
				$msg  = 'CalendarBusinessLayer::create(): User Error: ';
				$msg .= 'Backend does not support creating calendars!';
				throw new BusinessLayerException($msg, Http::STATUS_UNPROCESSABLE_ENTITY);
			}

			$this->backends->find($backend)->api->createCalendar($calendar);
			$this->cmp->insert($calendar);

			return $calendar;
		} catch (DoesNotImplementException $ex) {
			throw new BusinessLayerException($ex->getMessage());
		} catch (BackendException $ex) {
			throw new BusinessLayerException($ex->getMessage());
		} catch (CacheOutDatedException $ex) {
			$this->updateCacheForCalendarFromRemote(array($backend, $calendarURI), $userId);
			throw new BusinessLayerException($ex->getMessage());
		}
	}


	/**
	 * create a new calendar from request
	 * @param Calendar $calendar
	 * @return \OCA\Calendar\Db\Calendar $calendar - calendar object
	 */
	public function createFromRequest(Calendar $calendar) {
		$userId = $this->api->getUserId();
		if ($calendar->getUserId() === null) {
			$calendar->setUserId($userId);
		}
		if ($calendar->getOwnerId() === null) {
			$calendar->setOwnerId($userId);
		}

		if ($calendar->getBackend() === null) {
			$defaultBackend = $this->app->query('defaultBackend');
			$calendar->setBackend($defaultBackend);
		}

		if ($calendar->getDisplayname() === null) {
			$calendar->setDisplayname('Untitled');
		}

		if ($calendar->getUri() === null && $calendar->getDisplayname() !== '') {
			$displayname = $calendar->getDisplayname();

			$suggestedURI = strtolower($displayname);
			$suggestedURI = CalendarUtility::slugify($suggestedURI);

			while($this->doesExist(array($calendar->getBackend(), $suggestedURI), $calendar->getUserId())) {
				$newSuggestedURI = CalendarUtility::suggestURI($suggestedURI);

				/**
				 * if something goes wrong, this could lead into an endless loop
				 * check if new uri equals old uri, if it does, this will 
				 * prevent an endless loop, but the request will fail
				 */
				if ($newSuggestedURI === $suggestedURI) {
					break;
				}
				$suggestedURI = $newSuggestedURI;
			}

			$calendar->setUri($suggestedURI);
		}

		if ($calendar->getCruds() === null) {
			$calendar->setCruds(Permissions::ALL);
		}

		if ($calendar->getCtag() === null) {
			$calendar->setCtag(0);
		}

		return $this->create($calendar);
	}


	/**
	 * (try to) create all calendars in a calendarcollection
	 * @param CalendarCollection $calendarCollection
	 * @return \OCA\Calendar\Db\CalendarCollection $calendars successfully created calendars
	 */
	public function createCollection(CalendarCollection $calendarCollection) {
		$createdCalendars = new CalendarCollection();

		$calendarCollection->iterate(function($calendar) use ($createdCalendars) {
			try {
				$calendar = $this->create($calendar);
			} catch(BusinessLayerException $ex) {
				continue;
			}
			$createdCalendars->add($calendar);
		});

		return $createdCalendars;
	}


	/**
	 * create all calendars in a calendarcollection from request
	 * @param CalendarCollection $calendarCollection
	 * @return \OCA\Calendar\Db\CalendarCollection $calendars successfully created calendars
	 */
	public function createCollectionFromRequest(CalendarCollection $calendarCollection) {
		$createdCalendars = new CalendarCollection();

		$calendarCollection->iterate(function($calendar) use ($createdCalendars) {
			try {
				$calendar = $this->createFromRequest($calendar);
			} catch(BusinessLayerException $ex) {
				continue;
			}
			$createdCalendars->add($calendar);
		});

		return $createdCalendars;
	}


	/**
	 * update a new calendar
	 * @param Calendar $calendar
	 * @param mixed (string|array) $oldCalendarId 
	 * @param string $oldUserId
	 * @throws BusinessLayerException if backend does not exist
	 * @throws BusinessLayerException if backend is disabled
	 * @throws BusinessLayerException if backend does not implement updating a calendar
	 * @return \OCA\Calendar\Db\Calendar $calendar - calendar object
	 */
	public function update(Calendar $calendar, $oldCalendarId, $oldUserId) {
		try {
			list($oldBackend, $oldCalendarURI) = (is_array($oldCalendarId)) ? $oldCalendarId :
												  $this->splitCalendarURI($oldCalendarId);

			$newBackend = $calendar->getBackend();
			$newCalendarURI = $calendar->getUri();
			$newUserId = $calendar->getUserId();

			if ($oldUserId !== $newUserId) {
				$msg  = 'CalendarBusinessLayer::update(): Not supported: ';
				$msg .= 'Transferring a calendar to another user is not supported yet.';
				throw new BusinessLayerException($msg, Http::STATUS_UNPROCESSABLE_ENTITY);
			}
			if (!$this->backends->find($oldBackend)->getEnabled()) {
				$msg  = 'CalendarBusinessLayer::update(): User Error: ';
				$msg .= 'Old backend found but not enabled!';
				throw new BusinessLayerException($msg, Http::STATUS_UNPROCESSABLE_ENTITY);
			}
			if ($newBackend !== $oldBackend && !$this->backends->find($newBackend)->getEnabled()) {
				$msg  = 'CalendarBusinessLayer::update(): User Error: ';
				$msg .= 'New backend found but not enabled!';
				throw new BusinessLayerException($msg, Http::STATUS_UNPROCESSABLE_ENTITY);
			}

			if (!$calendar->isValid()) {
				$msg  = 'CalendarBusinessLayer::update(): User Error: ';
				$msg .= 'Given calendar data is not valid!';
				throw new BusinessLayerException($msg, Http::STATUS_UNPROCESSABLE_ENTITY);
			}

			if ($oldUserId !== $newUserId) {
				return $this->transfer($calendar, array($oldBackend, $oldCalendarURI), $oldUserId);
			} else if (!$this->doesExist(array($newBackend, $newCalendarURI), $newUserId)) {
				/** Move a calendar when
				 * [x] uri and/or backend changed
				 * [x] new calendar does not exist
				 */
				return $this->move($calendar, array($oldBackend, $oldCalendarURI), $oldUserId);
			} else if (($newBackend !== $oldBackend || $newCalendarURI !== $oldCalendarURI) && 
					   $this->doesExist(array($newBackend, $newCalendarURI), $newUserId)) {
				/** Merge a calendar when
				 * [x] uri and/or backend changed
				 * [x] new calendar exists
				 */
				return $this->merge($calendar, array($oldBackend, $oldCalendarURI), $oldUserId);
			} else {
				if ($this->doesBackendSupport($oldBackend, \OCA\Calendar\Backend\UPDATE_CALENDAR) === true) {
					$api = &$this->backends->find($oldBackend)->api;
					$api->updateCalendar($calendar, $oldCalendarURI);
					$this->cmp->update($calendar);
				} else {
					/** If backend does not support updating calendars
					 * allow the user to:
					 * hide it, change it's color, change it's order, etc.
					 */
					$this->cmp->update($calendar);
				}
				return $calendar;
			}
		} catch(BackendException $ex) {
			//write debug note to logfile
			throw new BusinessLayerException($ex->getMessage());
		} catch (CacheOutDatedException $ex) {
			//write debug note to logfile
			$this->updateCacheForCalendarFromRemote($oldCalendarId, $userId);
			throw new BusinessLayerException($ex->getMessage());
		}
	}


	/**
	 * update a new calendar from request
	 * @param Calendar $calendar
	 * @param mixed (string|array) $oldCalendarId 
	 * @param string $oldUserId
	 * @param integer $oldCtag
	 * @throws BusinessLayerException if backend does not exist
	 * @throws BusinessLayerException if backend is disabled
	 * @throws BusinessLayerException if backend does not implement updating a calendar
	 * @return \OCA\Calendar\Db\Calendar $calendar - calendar object
	 */
	public function updateFromRequest(Calendar $calendar, $oldCalendarId, $oldUserId, $oldCtag) {
		list($oldBackend, $oldCalendarURI) = (is_array($oldCalendarId)) ? $oldCalendarId :
											  $this->splitCalendarURI($oldCalendarId);

		$oldCalendarObject = $this->find(array($oldBackend, $oldCalendarURI), $oldUserId);

		if ($oldCtag !== null) {
			if ($oldCtag < $oldCalendarObject->getCtag()) {
				$msg  = 'CalendarBusinessLayer::updateFromRequest(): User Error: ';
				$msg .= 'Send If-Match ctag is outdated!';
				throw new BusinessLayerException($msg, Http::STATUS_PRECONDITION_FAILED);
			}
		}
		if ($calendar->doesContainNullValues()) {
			$calendar = $oldCalendarObject->overwriteWith($calendar);
		}

		return $this->update($calendar, array($oldBackend, $oldCalendarURI), $oldUserId);
	}


	/**
	 * merge a calendar
	 * @param Calendar $calendar
	 * @param mixed (string|array) $oldCalendarId 
	 * @param string $oldUserId
	 * @return \OCA\Calendar\Db\Calendar $calendar - calendar object
	 */
	private function merge(Calendar $calendar, $oldCalendarId, $oldUserId) {
		try {
			list($oldBackend, $oldCalendarURI) = (is_array($oldCalendarId)) ? $oldCalendarId :
												  $this->splitCalendarURI($oldCalendarId);

			$newBackend = $calendar->getBackend();
			$newCalendarURI = $calendar->getUri();
			$newUserId = $calendar->getUserId();

			$oldBackendsAPI = &$this->backends->find($oldBackend)->api;
			$newBackendsAPI = &$this->backends->find($newBackend)->api;

			if ($newBackend === $oldBackend && $this->doesBackendSupport($oldBackend, \OCA\Calendar\Backend\MERGE_CALENDAR)) {
				$newBackendsAPI->mergeCalendar($calendar, $oldCalendarURI, $oldUserId);
			} else {
				if (!$this->doesBackendSupport($oldBackend, \OCA\Calendar\Backend\DELETE_CALENDAR)) {
					$msg  = 'CalendarBusinessLayer::merge(): User Error: ';
					$msg .= 'Backend does not support deleting calendars!';
					throw new BusinessLayerException($msg);
				}

				//move all objects
				$this->obl->moveAll($calendar, $oldCalendarId, $oldUserId);

				/**
				 * If no exception was thrown, moving objects finished without any problems
				 */
				$oldBackendsAPI->deleteCalendar($oldCalendarURI, $oldUserId);
				//todo delete old calendar from cache
				$this->cmp->update($calendar);
			}

			$this->updateCacheForCalendarFromRemote(array($oldBackend, $oldCalendarURI), $oldUserId);

			return $calendar;
		} catch(Exception $ex){}
	}


	/**
	 * move a calendar to a new uri
	 * @param Calendar $calendar
	 * @param mixed (string|array) $oldCalendarId 
	 * @param string $oldUserId
	 * @return \OCA\Calendar\Db\Calendar $calendar - calendar object
	 */
	private function move(Calendar $calendar, $oldCalendarId, $oldUserId) {
		try {
			list($oldBackend, $oldCalendarURI) = (is_array($oldCalendarId)) ? $oldCalendarId :
												  $this->splitCalendarURI($oldCalendarId);

			$newBackend = $calendar->getBackend();
			$newCalendarURI = $calendar->getUri();
			$newUserId = $calendar->getUserId();

			$oldBackendsAPI = &$this->backends->find($oldBackend)->api;
			$newBackendsAPI = &$this->backends->find($newBackend)->api;

			if ($newBackend === $oldBackend && $this->doesBackendSupport($oldBackend, \OCA\Calendar\Backend\MOVE_CALENDAR)) {
				$newBackendsAPI->moveCalendar($calendar, $oldCalendarURI, $oldUserId);
			} else {
				if (!$this->doesBackendSupport($oldBackend, \OCA\Calendar\Backend\DELETE_CALENDAR)) {
					$msg  = 'CalendarBusinessLayer::move(): User Error: ';
					$msg .= 'Old backend does not support deleting calendars!';
					throw new BusinessLayerException($msg);
				}
				if (!$this->doesBackendSupport($newBackend, \OCA\Calendar\Backend\CREATE_CALENDAR)) {
					$msg  = 'CalendarBusinessLayer::move(): User Error: ';
					$msg .= 'New backend does not support creating calendars!';
					throw new BusinessLayerException($msg);
				}
		
				//create calendar on new backend
				$calendar = $newBackendsAPI->createCalendar($calendar);
	
				//move all objects
				$this->obl->moveAll($calendar, array($oldBackend, $oldCalendarURI), $newUserId);
		
				/** 
				 * If no exception was thrown, moving objects finished without any problems
				 */
				$oldBackendsAPI->deleteCalendar($oldCalendarURI, $userId);
				//todo delete old calendar from cache
				$this->cmp->update($calendar);
			}

			$this->updateCacheForCalendarFromRemote(array($newBackend, $newCalendarURI), $newUserId);		
			return $calendar;
		} catch(Exception $ex) {}
	}


	/**
	 * transfer calendar to another user
	 * @param Calendar $calendar
	 * @param mixed (string|array) $oldCalendarId 
	 * @param string $oldUserId
	 * @return \OCA\Calendar\Db\Calendar $calendar - calendar object
	 */
	/*private function transfer(Calendar $calendar, $oldCalendarId, $oldUserId) {
		try {
			list($oldBackend, $oldCalendarURI) = (is_array($oldCalendarId)) ?
													$oldCalendarId :
													$this->splitCalendarURI($oldCalendarId);

			$newBackend = $calendar->getBackend();
			$newCalendarURI = $calendar->getUri();
			$newUserId = $calendar->getUserId();

			$oldBackendsAPI = &$this->backends->find($oldBackend)->api;
			$newBackendsAPI = &$this->backends->find($newBackend)->api;

			//TODO implement
		} catch(Exception $ex) {
			throw new Exception
		}
	}*/


	/**
	 * touch a calendar aka increment a calendars ctag
	 * @param string $calendarId global uri of calendar e.g. local::work
	 * @param string $userId
	 * @throws BusinessLayerException if backends do not exist
	 * @throws BusinessLayerException if backends are disabled
	 * @throws BusinessLayerException if backend does not implement updating a calendar
	 * @return \OCA\Calendar\Db\Calendar $calendar - calendar object
	 */
	public function touch($calendarId, $userId) {
		try {
			list($backend, $calendarURI) = (is_array($calendarId)) ? $calendarId :
											$this->splitCalendarURI($calendarId);

			$calendar = $this->find(array($backend, $calendarURI), $userId);
			$calendar->touch();
			$calendar = $this->update($calendar, array($backend, $calendarURI), $userId);

			return $calendar;
		} catch(BackendException $ex) {
			throw new BusinessLayerException($ex->getMessage());
		}
	}


	/**
	 * delete a calendar
	 * @param Calendar $calendar
	 * @param string $calendarId global uri of calendar e.g. local-work
	 * @throws BusinessLayerException if backend does not exist
	 * @throws BusinessLayerException if backend is disabled
	 * @throws BusinessLayerException if backend does not implement updating a calendar
	 */
	public function delete($calendar) {
		try {
			$backend = $calendar->getBackend();
			$calendarURI = $calendar->getUri();
			$userId = $calendar->getUserId();

			$calendar = $this->find(array($backend, $calendarURI), $userId);

			if (!$this->backends->find($backend)->getEnabled()) {
				$msg  = 'CalendarBusinessLayer::delete(): User Error: ';
				$msg .= 'Backend found but not enabled!';
				throw new BusinessLayerException($msg);
			}
			if (!$this->doesBackendSupport($backend, \OCA\Calendar\Backend\DELETE_CALENDAR)) {
				$msg  = 'CalendarBusinessLayer::delete(): User Error: ';
				$msg .= 'Backend does not support deleting calendars!';
				throw new BusinessLayerException($msg);
			}

			$this->backends->find($backend)->api->deleteCalendar($calendarURI, $userId);
			$this->cmp->delete($calendar);
		} catch(DoesNotImplementException $ex) {
			throw new BusinessLayerException($ex->getMessage());
		} catch(BackendException $ex) {
			throw new BusinessLayerException($ex->getMessage());
		}
	}


	/**
	 * checks if a calendar exists
	 * @param string $calendarId
	 * @param string $userId
	 * @return boolean
	 */
	public function isCalendarOutDated($calendarId, $userId=null) {
		list($backend, $calendarURI) = (is_array($calendarId)) ? $calendarId :
										$this->splitCalendarURI($calendarId);

		try {
			$cachedCalendar = $this->find(array($backend, $calendarURI), $userId);
			$cctag = $cachedCalendar->getCtag();
		} catch(BusinessLayerException $ex) {
			return true;
		}
		try {
			$remoteCalendar = $this->backends->find($backend)->api->findCalendar($calendarURI, $userId);
			$rctag = $remoteCalendar->getCtag();
		} catch(CacheOutDatedException $ex) {
			return true;
		}

		if ($cctag === $rctag) {
			return false;
		}
		if ($cctag < $rctag) {
			return true;
		}
		if ($cctag > $rctag) {
			//TODO - how to handle this case appropriately?
			//could lead to endless updates if backend is sending broken ctag
			//setting cached ctag to remote ctag will break client sync
		}
	}


	/**
	 * update all calendars of a user
	 * @param string $userId
	 * @return boolean
	 */
	public function updateCacheForAllFromRemote($userId) {
		$this->backends->iterate(function($backend) use ($userId) {
			try{
				$backendName = $backend->getBackend();
				$this->updateCacheForBackendFromRemote($backendName, $userId);
			} catch(BusinessLayerException $ex) {
				//TODO - log error msg
				continue;
			}
		});
	}


	/**
	 * update all calendars of a user on a backend
	 * @param string $backend
	 * @param string $userId
	 * @return boolean
	 */
	public function updateCacheForBackendFromRemote($backend, $userId) {
		$calendars = $this->findAllOnBackend($backend, $userId);
		$remoteCalendars = $this->backends->find($backend)->api->findCalendars($userId, null, null);
		$calendars->addCollection($remoteCalendars)->noDuplicates();

		$calendars->iterate(function(&$calendar) use ($userId) {
			try{
				$backend = $calendar->getBackend();
				$calendarURI = $calendar->getUri();

				$this->updateCacheForCalendarFromRemote(array($backend, $calendarURI), $userId);
			} catch(BusinessLayerException $ex) {
				$this->app->log($ex->getMessage(), 'error');
				continue;
			} catch(DoesNotExistException $ex) {
				//should not occur, but catch it nevertheless
				continue;
			}
		});
	}


	/**
	 * update a specific calendar
	 * @param string $userId
	 * @return boolean
	 */
	public function updateCacheForCalendarFromRemote($calendarId, $userId) {
		try{
			list($backend, $calendarURI) = (is_array($calendarId)) ? $calendarId :
											$this->splitCalendarURI($calendarId);

			$api = &$this->backends->find($backend)->api;

			$doesCalendarExistCached = $this->doesExist(array($backend, $calendarURI), $userId, false);
			$doesCalendarExistRemote = $api->doesCalendarExist($calendarURI, $userId);

			if (!$doesCalendarExistCached && !$doesCalendarExistRemote) {
				$msg  = 'CalendarBusinessLayer::updateCacheForCalendarFromRemote(): ';
				$msg .= '"b:' . $backend . ';u:' . $calendarURI . '" doesn\'t exist';
				$msg .= 'Neither cached nor remote!';
				throw new DoesNotExistException($msg);
			}

			if ($doesCalendarExistCached) {
				$cachedCalendar = $this->find(array($backend, $calendarURI), $userId);;
			}
			if ($doesCalendarExistRemote) {
				$remoteCalendar = $api->findCalendar($calendarURI, $userId);
			}

			if (!$doesCalendarExistRemote) {
				//$this->->deleteAll(array($backend, $calendarURI), $userId);
				$this->cmp->delete($cachedCalendar);
				return true;
			}

			if (!$doesCalendarExistCached) {
				if ($remoteCalendar->isValid() !== true) {
					$msg  = 'CalendarBusinessLayer::updateCacheForCalendarFromRemote(): Backend Error: ';
					$msg .= 'Given calendar data is not valid! (b:"' . $backend . '";c:"' . $calendarURI . '")';
					throw new BusinessLayerException($msg);
				}

				$this->cmp->insert($remoteCalendar);
				$this->obl->updateCacheForCalendarFromRemote(array($backend, $calendarURI), $userId);
				return true;
			}

			if ($cachedCalendar == $remoteCalendar) {
				return true;
			}

			if ($api->cacheObjects($calendarURI, $userId) && $cachedCalendar->getCtag() < $remoteCalendar->getCtag()) {
				$this->obl->updateCacheForCalendarFromRemote(array($backend, $calendarURI), $userId);
			}

			$this->resetValuesNotSupportedByAPI($remoteCalendar, $api);

			if ($cachedCalendar == $remoteCalendar) {
				return true;
			}

			$cachedCalendar->overwriteWith($remoteCalendar);

			if ($cachedCalendar->isValid() !== true) {
				$msg  = 'CalendarBusinessLayer::updateCacheForCalendarFromRemote(): Backend Error: ';
				$msg .= 'Given calendar data is not valid! (b:"' . $backend . '";c:"' . $calendarURI . '")';
				throw new BusinessLayerException($msg);
			}

			$this->cmp->update($cachedCalendar);
		} catch(BackendException $ex) {
			throw new BusinessLayerException($ex->getMessage());
		}
	}


	/**
	 * reset values of a calendar that are not supported by backend
	 * @param \OCA\Calendar\Db\Calendar $calendar
	 * @param \OCA\Calendar\Backend\IBackend $api
	 */
	private function resetValuesNotSupportedByAPI(Calendar &$calendar, &$api) {
		if ($api->canStoreColor() === false) {
			$calendar->setColor(null);
		}
		if ($api->canStoreComponents() === false) {
			$calendar->setComponents(null);
		}
		if ($api->canStoreDisplayname() === false) {
			$calendar->setDisplayname(null);
		}
		if ($api->canStoreEnabled() === false) {
			$calendar->setEnabled(null);
		}
		if ($api->canStoreOrder() === false) {
			$calendar->setOrder(null);
		}
	}
}