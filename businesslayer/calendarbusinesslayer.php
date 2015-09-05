<?php
/**
 * Copyright (c) 2014 Georg Ehrke <oc.list@georgehrke.com>
 * This file is licensed under the Affero General Public License version 3 or
 * later.
 * See the COPYING-README file.
 */
namespace OCA\Calendar\BusinessLayer;

use \OCP\AppFramework\IAppContainer;

use \OCA\Calendar\Db\Calendar;
use \OCA\Calendar\Db\CalendarCollection;
use \OCA\Calendar\Db\CalendarMapper;

use \OCA\Calendar\Db\ObjectType;

use \OCA\Calendar\Db\BackendMapper;
use \OCA\Calendar\Db\DoesNotExistException;
use \OCA\Calendar\Db\MultipleObjectsReturnedException;

use \OCA\Calendar\Utility\CalendarUtility;

class CalendarBusinessLayer extends BusinessLayer {

	private $cmp;
	private $obl;

	/**
	 * @param IAppContainer $app
	 * @param BackendMapper $backendMapper
	 * @param CalendarMapper $objectMapper: mapper for objects cache
	 * @param ObjectBusinessLayer $objectBusinessLayer
	 * @param API $api: an api wrapper instance
	 */
	public function __construct(IAppContainer $app,
								BackendMapper $backendMapper,
								CalendarMapper $calendarMapper,
								ObjectBusinessLayer $objectBusinessLayer){

		parent::__construct($app, $backendMapper);

		$this->cmp = $calendarMapper;
		$this->obl = $objectBusinessLayer;
	}


	/**
	 * Find calendars of user $userId
	 * @param string $userId
	 * @param int $limit
	 * @param int $offset
	 * @throws BusinessLayerException
	 * @return CalendarCollection
	 */
	public function findAll($userId, $limit=null, $offset=null) {
		try {
			$calendars = $this->cmp->findAll($userId, $limit, $offset);

			//check if $calendars is a CalendarCollection, if not throw an exception
			if(($calendars instanceof CalendarCollection) === false) {
				$msg  = 'CalendarBusinessLayer::findAll(): Internal Error: ';
				$msg .= 'CalendarCache returned unrecognised format!';
				throw new BusinessLayerException($msg, BusinessLayerException::INTERNAL);
			}

			$backends = $this->backends->enabled();
			$calendars = $calendars->filterByBackends($backends);

			return $calendars;
		} catch (DoesNotExistException $ex) {
			throw new BusinessLayerException($ex->getMessage());
		} catch (BackendException $ex) {
			throw new BusinessLayerException($ex->getMessage());
		}
	}


	/**
	 * number of calendars
	 * @param string $userId
	 * @throws BusinessLayerException
	 * @return integer
	 */
	public function numberOfCalendars($userId) {
		try {
			/*$number = $this->cmp->count($userId);

			//check if number is an integer, if not throw an exception
			if(gettype($number) !== 'integer') {
				$msg  = 'CalendarBusinessLayer::numberOfAllCalendars(): Internal Error: ';
				$msg .= 'CalendarCache returned unrecognised format!';
				throw new BusinessLayerException($msg);
			}

			//TODO filter for active backends only

			return $number;*/
			return $this->findAll($userId)->count();
		} catch (DoesNotExistException $ex) {
			throw new BusinessLayerException($ex->getMessage());
		}
	}


	/**
	 * Find all calendars of user $userId on a backend
	 * @param string $backend
	 * @param string $userId
	 * @param int $limit
	 * @param int $offset
	 * @throws BusinessLayerException
	 * @return CalendarCollection
	 */
	public function findAllOnBackend($backend, $userId, $limit=null, $offset=null) {
		try {
			$calendars = $this->cmp->findAllOnBackend($backend, $userId, $limit, $offset);

			//check if $calendars is a CalendarCollection, if not throw an exception
			if(($calendars instanceof CalendarCollection) === false) {
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

			//check if number is an integer, if not throw an exception
			if(gettype($number) !== 'integer') {
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
	 * @param string $calendarId global uri of calendar e.g. local-work
	 * @param string $userId
	 * @throws BusinessLayerException if backend does not exist
	 * @throws BusinessLayerException if backend is disabled
	 * @return calendar object
	 */
	public function find($calendarId, $userId) {
		try {
			if(is_array($calendarId)) {
				$backend = $calendarId[0];
				$calendarURI = $calendarId[1];
			} else {
				list($backend, $calendarURI) = $this->splitCalendarURI($calendarId);
			}

			if($this->isBackendEnabled($backend) !== true) {
				$msg  = 'CalendarBusinessLayer::find(): User Error: ';
				$msg .= 'Backend found but not enabled';
				throw new BusinessLayerException($msg);
			}

			$calendar = $this->cmp->find($backend, $calendarURI, $userId);

			if(($calendar instanceof Calendar) === false) {
				$msg  = 'CalendarBusinessLayer::find(): Internal Error: ';
				$msg .= 'CalendarCache returned unrecognised format!';
				throw new BusinessLayerException($msg);
			}

			return $calendar;
		} catch (DoesNotExistException $ex) {
			throw new BusinessLayerException($ex->getMessage());
		} catch (MultipleObjectsReturnedException $ex) {
			throw new BusinessLayerException($ex->getMessage());
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
			if(is_array($calendarId)) {
				$backend = $calendarId[0];
				$calendarURI = $calendarId[1];
			} else {
				list($backend, $calendarURI) = $this->splitCalendarURI($calendarId);
			}

			$doesExistCached = $this->cmp->doesExist($backend, $calendarURI, $userId);

			if($checkRemote === false) {
				return $doesExistCached;
			}

			$doesExistRemote = $this->backends->find($backend)->api->doesCalendarExist($calendarURI, $userId);

			if($doesExistCached !== $doesExistRemote) {
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
	 * @param int $cruds
	 * @param string $calendarId
	 * @param string $userId
	 * @return boolean
	 */
	public function doesAllow($cruds, $calendarId, $userId) {
		try {
			if(is_array($calendarId)) {
				$backend = $oldCalendarId[0];
				$calendarURI = $oldCalendarId[1];
			} else {
				list($backend, $calendarURI) = $this->splitCalendarURI($calendarId);
			}

			return $this->cmp->doesAllow($cruds, $backend, $calendarURI, $userId);
		} catch(BackendException $ex) {
			throw new BusinessLayerException($ex->getMessage());
		} catch(DoesNotExistException $ex) {
			throw new BusinessLayerException($ex->getMessage());
		}
	}


	/**
	 * checks if a calendar supports a certian component
	 * @param int $component
	 * @param string $calendarId
	 * @param string $userId
	 * @return boolean
	 */
	public function doesSupport($component, $calendarId, $userId) {
		try {
			if(is_array($calendarId)) {
				$backend = $oldCalendarId[0];
				$calendarURI = $oldCalendarId[1];
			} else {
				list($backend, $calendarURI) = $this->splitCalendarURI($calendarId);
			}

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
	 * @return Calendar $calendar - calendar object
	 */
	public function create(Calendar $calendar) {
		try {
			$backend = $calendar->getBackend();
			$calendarURI = $calendar->getUri();
			$userId = $calendar->getUserId();

			if(!$calendar->isValid()) {
				$msg  = 'CalendarBusinessLayer::create(): User Error: ';
				$msg .= 'Given calendar data is not valid!';
				throw new BusinessLayerException($msg);
			}

			if(!$this->isBackendEnabled($backend)) {
				$msg  = 'CalendarBusinessLayer::create(): User Error: ';
				$msg .= 'Backend found but not enabled!';
				throw new BusinessLayerException($msg);
			}
			if($this->doesCalendarExist(array($backend, $calendarURI), $userId)) {
				$msg  = 'CalendarBusinessLayer::create(): User Error: ';
				$msg .= 'Calendar already exists!';
				throw new BusinessLayerException($msg);
			}
			if(!$this->doesBackendSupport($backend, \OCA\Calendar\Backend\CREATE_CALENDAR)) {
				$msg  = 'CalendarBusinessLayer::create(): User Error: ';
				$msg .= 'Backend does not support creating calendars!';
				throw new BusinessLayerException($msg);
			}

			$this->backends->find($backend)->api->createCalendar($calendar);
			$this->mapper->insert($calendar);

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
	 * update a new calendar
	 * @param Calendar $calendar
	 * @param string $calendarId global uri of calendar e.g. local-work
	 * @param string $userId
	 * @throws BusinessLayerException if backend does not exist
	 * @throws BusinessLayerException if backend is disabled
	 * @throws BusinessLayerException if backend does not implement updating a calendar
	 * @return Calendar $calendar - calendar object
	 */
	public function update(Calendar $calendar, $oldCalendarId, $oldUserId) {
		try {
			if(is_array($oldCalendarId)) {
				$oldBackend = $oldCalendarId[0];
				$oldCalendarURI = $oldCalendarId[1];
			} else {
				list($oldBackend, $oldCalendarURI) = $this->splitCalendarURI($oldCalendarId);
			}

			if($calendar->doesContainNullValues()) {
				$oldCalendarObject = $this->find(array($oldBackend, $oldCalendarURI), $oldUserId);
				$oldCalendarObject->overwriteWith($calendar);
				$calendar = $oldCalendarObject;
			}

			$newBackend = $calendar->getBackend();
			$newCalendarURI = $calendar->getUri();
			$newUserId = $calendar->getUserId();

			if($oldUserId !== $newUserId) {
				$msg  = 'CalendarBusinessLayer::update(): Not supported: ';
				$msg .= 'Transferring a calendar to another user is not supported yet.';
				throw new BusinessLayerException($msg);
			}
			if($this->isBackendEnabled($oldBackend) !== true) {
				$msg  = 'CalendarBusinessLayer::update(): User Error: ';
				$msg .= 'Backend found but not enabled!';
				throw new BusinessLayerException($msg);
			}
			if($newBackend !== $oldBackend && $this->isBackendEnabled($newBackend) !== true) {
				$msg  = 'CalendarBusinessLayer::update(): User Error: ';
				$msg .= 'Backend found but not enabled!';
				throw new BusinessLayerException($msg);
			}

			$oldBackendsAPI = &$this->backends->find($oldBackend)->api;
			$newBackendsAPI = &$this->backends->find($newBackend)->api;

			if($calendar->isValid() !== true) {
				$msg  = 'CalendarBusinessLayer::update(): User Error: ';
				$msg .= 'Given calendar data is not valid!';
				throw new BusinessLayerException($msg);
			}

			/* Move calendar to another backend when:
			 * - [x] the backend changed
			 * - [x] uri is available on the other calendar
			 */
			if($newBackend !== $oldBackend && !$this->doesCalendarExist(array($newBackend, $newCalendarURI), $newUserId)) {
				if(!$this->doesBackendSupport($oldBackend, \OCA\Calendar\Backend\DELETE_CALENDAR)) {
					$msg  = 'CalendarBusinessLayer::update(): User Error: ';
					$msg .= 'Backend does not support deleting calendars!';
					throw new BusinessLayerException($msg);
				}
				if(!$this->doesBackendSupport($newBackend, \OCA\Calendar\Backend\CREATE_CALENDAR)) {
					$msg  = 'CalendarBusinessLayer::update(): User Error: ';
					$msg .= 'Backend does not support creating calendars!';
					throw new BusinessLayerException($msg);
				}

				//create calendar on new backend
				$calendar = $newBackendsAPI->createCalendar($calendar);

				//move all objects
				$this->obl->moveAll($calendar, array($oldBackend, $oldCalendarURI), $newUserId);

				//if no exception was thrown,
				//moving objects finished without any problem
				$oldBackendsAPI->deleteCalendar($oldCalendarURI, $userId);
				$this->cmp->update($calendar);
				$this->updateFromCache(array($oldBackend, $oldCalendarURI), $oldUserId);

				return $calendar;
			} else
			/* Merge calendar with another one when:
			 *  - [x] the backend changed
			 *  - [x] uri is not available on the other backend
			 * or:
			 *  - [x] backend didn't change
			 *  - [x] uri changed
			 *  - [x] uri is not available
			 */
			if(($newBackend !== $oldBackend || $newCalendarURI !== $oldCalendarURI) && $this->doesCalendarExist(array($newBackend, $newCalendarURI), $newUserId)) {
				if($newBackend === $oldBackend && $this->doesBackendSupport($oldBackend, \OCA\Calendar\Backend\MERGE_CALENDAR)) {
					$newBackendsAPI->mergeCalendar($calendar, $oldCalendarURI, $oldUserId);
				} else {
					if(!$this->doesBackendSupport($oldBackend, \OCA\Calendar\Backend\DELETE_CALENDAR)) {
						$msg  = 'CalendarBusinessLayer::update(): User Error: ';
						$msg .= 'Backend does not support deleting calendars!';
						throw new BusinessLayerException($msg);
					}

					//move all objects
					$this->obl->moveAll($calendar, $oldCalendarId, $oldUserId);

					//if no exception was thrown,
					//moving objects finished without any problem
					$this->cmp->update($calendar);
					$oldBackendsAPI->deleteCalendar($oldCalendarURI, $oldUserId);
					$this->updateFromCache(array($oldBackend, $oldCalendarURI), $oldUserId);
				}

				return $calendar;
			} else {
			/* Update the calendar when:
			 *  - [x] the backend didn't change
			 *  - [x] the uri didn't change
			 */
				if($this->doesBackendSupport($backend, \OCA\Calendar\Backend\UPDATE_CALENDAR) === true) {
					$newBackendsAPI->updateCalendar($calendar, $oldCalendarURI);
				}
				$this->mapper->updateEntity($calendar);
				return $calendar;
			}
		} catch(DoesNotImplementException $ex) {
			//write debug note to logfile
			throw new BusinessLayerException($ex->getMessage());
		} catch(BackendException $ex) {
			//write debug note to logfile
			throw new BusinessLayerException($ex->getMessage());
		} catch (CalendarNotFixable $ex) {
			//write error note to logfile
			throw new BusinessLayerException($ex->getMessage());
		} catch (CacheOutDatedException $ex) {
			//write debug note to logfile
			$this->updateCacheForCalendarFromRemote($oldCalendarId, $userId);
			throw new BusinessLayerException($ex->getMessage());
		}
	}


	/**
	 * touch a calendar aka increment a calendars ctag
	 * @param string $calendarId global uri of calendar e.g. local-work
	 * @param string $userId
	 * @throws BusinessLayerException if backends do not exist
	 * @throws BusinessLayerException if backends are disabled
	 * @throws BusinessLayerException if backend does not implement updating a calendar
	 * @return Calendar $calendar - calendar object
	 */
	public function touch($calendarId, $userId) {
		try {
			if(is_array($calendarId)) {
				$backend = $calendarId[0];
				$calendarURI = $calendarId[1];
			} else {
				list($backend, $calendarURI) = $this->splitCalendarURI($calendarId);
			}

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
	 * @param string $userId
	 * @throws BusinessLayerException if backend does not exist
	 * @throws BusinessLayerException if backend is disabled
	 * @throws BusinessLayerException if backend does not implement updating a calendar
	 */
	public function delete($calendarId, $userId) {
		try {
			if(is_array($calendarId)) {
				$backend = $oldCalendarId[0];
				$calendarURI = $oldCalendarId[1];
			} else {
				list($backend, $calendarURI) = $this->splitCalendarURI($calendarId);
			}

			$calendar = $this->find(array($backend, $calendarURI), $userId);

			if(!$this->isBackendEnabled($backend)) {
				$msg  = 'CalendarBusinessLayer::delete(): User Error: ';
				$msg .= 'Backend found but not enabled!';
				throw new BusinessLayerException($msg);
			}
			if(!$this->doesBackendSupport($backend, \OCA\Calendar\Backend\DELETE_CALENDAR)) {
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
		try{
			if(is_array($calendarId)) {
				$backend = $oldCalendarId[0];
				$calendarURI = $oldCalendarId[1];
			} else {
				list($backend, $calendarURI) = $this->splitCalendarURI($calendarId);
			}

			$cachedCtag = $cachedCalendar->getCtag();
			$remoteCtag = $remoteCalendar->getCtag();
			if($cachedCtag === $remoteCtag) {
				return false;
			}
			if($cachedCtag < $remoteCtag) {
				return true;
			}
			if($cachedCtag > $remoteCalendar) {
				//TODO - how to handle this case appropriately?
				//could lead to endless updates if backend is sending broken ctag
				//setting cached ctag to remote ctag will break client sync
			}
		} catch(BackendException $ex) {
			throw new BusinessLayerException($ex->getMessage());
		} catch(DoesNotExistException $ex) {
			
		}
	}

	/**
	 * update all calendars of a user
	 * @param string $userId
	 * @return boolean
	 */
	public function updateCacheForAllFromRemote($userId) {
		try{
			$backends = $this->backends->getObjects();

			foreach($backends as $backend) {
				try{
					$backendName = $backend->getBackend();
					$this->updateCacheForBackendFromRemote($backendName, $userId);
				} catch(BusinessLayerException $ex) {
					//TODO - log error msg
					continue;
				}
			}
		} catch(BackendException $ex) {
			throw new BusinessLayerException($ex->getMessage());
		}
	}

	/**
	 * update all calendars of a user on a backend
	 * @param string $backend
	 * @param string $userId
	 * @return boolean
	 */
	public function updateCacheForBackendFromRemote($backend, $userId) {
		try{
			$calendars = $this->findAllOnBackend($backend, $userId);

			$remoteCalendars = $this->backends->find($backend)->api->findCalendars($userId);

			$calendars->addCollection($remoteCalendars)->noDuplicates();

			foreach($calendars->getObjects() as $calendar) {
				try{
					$backend = $calendar->getBackend();
					$calendarURI = $calendar->getUri();
	
					$this->updateCacheForCalendarFromRemote(array($backend, $calendarURI), $userId);
				} catch(BusinessLayerException $ex) {
					//TODO - log error msg
					continue;
				} catch(DoesNotExistException $ex) {
					//should not occur, but catch it nevertheless
					continue;
				}
			}
		} catch(BackendException $ex) {
			throw new BusinessLayerException($ex->getMessage());
		}
	}

	/**
	 * update a specific calendar
	 * @param string $userId
	 * @return boolean
	 */
	public function updateCacheForCalendarFromRemote($calendarId, $userId) {
		try{
			if(is_array($calendarId)) {
				$backend = $calendarId[0];
				$calendarURI = $calendarId[1];
			} else {
				list($backend, $calendarURI) = $this->splitCalendarURI($calendarId);
			}

			$remoteAPI = &$this->backends->find($backend)->api;

			$doesCalendarExistCached = $this->doesExist(array($backend, $calendarURI), $userId, false);
			$doesCalendarExistRemote = $remoteAPI->doesCalendarExist($calendarURI, $userId);

			if($doesCalendarExistCached === false && $doesCalendarExistRemote === false) {
				$msg  = 'CalendarBusinessLayer::updateCacheForCalendarFromRemote(): ';
				$msg .= '"b:' . $backend . ';u:' . $calendarURI . '" doesn\'t exist';
				$msg .= 'Neither cached nor remote!';
				throw new DoesNotExistException($msg);
			}

			if($doesCalendarExistRemote === false) {
				$msg  = 'CalendarBusinessLayer::updateCacheForCalendarFromRemote(): ';
				$msg .= 'Calendar vanished from remote - removing calendar from cache!';
				//TODO - log debug message

				$cachedCalendar = $this->find(array($backend, $calendarURI), $userId);

				$this->obl->deleteAll(array($backend, $calendarURI), $userId);
				$this->cmp->delete($cachedCalendar);
				return true;
			}

			$remoteCalendar = $remoteAPI->findCalendar($calendarURI, $userId);

			if($doesCalendarExistCached === false) {
				$msg  = 'CalendarBusinessLayer::updateCacheForCalendarFromRemote(): ';
				$msg .= 'Calendar not cached - creating calendar from remote!';
				//TODO - log debug message

				if($remoteCalendar->isValid() !== true) {
					$msg  = 'CalendarBusinessLayer::updateCacheForCalendarFromRemote(): Backend Error: ';
					$msg .= 'Given calendar data is not valid!';
					throw new BusinessLayerException($msg);
				}

				$this->cmp->insert($remoteCalendar);
				$this->obl->updateCacheForCalendarFromRemote(array($backend, $calendarURI), $userId);
				return true;
			}

			$cachedCalendar = $this->find(array($backend, $calendarURI), $userId);

			if($cachedCalendar == $remoteCalendar) {
				return true;
			}

			if($cachedCalendar->getCtag() < $remoteCalendar->getCtag()) {
				$this->obl->updateCacheForCalendarFromRemote(array($backend, $calendarURI), $userId);
			}

			if($remoteAPI->canStoreColor() === false) {
				$remoteCalendar->setColor(null);
			}
			if($remoteAPI->canStoreComponents() === false) {
				$remoteCalendar->setComponents(null);
			}
			if($remoteAPI->canStoreDisplayname() === false) {
				$remoteCalendar->setDisplayname(null);
			}
			if($remoteAPI->canStoreEnabled() === false) {
				$remoteCalendar->setEnabled(null);
			}
			if($remoteAPI->canStoreOrder() === false) {
				$remoteCalendar->setOrder(null);
			}

			$cachedCalendar->overwriteWith($remoteCalendar);

			if($cachedCalendar->isValid() !== true) {
				$msg  = 'CalendarBusinessLayer::updateCacheForCalendarFromRemote(): Backend Error: ';
				$msg .= 'Given calendar data is not valid!';
				throw new BusinessLayerException($msg);
			}

			$this->cmp->update($cachedCalendar);

			return true;
		} catch(BackendException $ex) {
			throw new BusinessLayerException($ex->getMessage());
		}
	}
}