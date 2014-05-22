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

use OCP\Calendar\ICalendar;
use OCP\Calendar\ICalendarCollection;

use OCP\Calendar\BackendException;
use OCP\Calendar\CacheOutDatedException;
use OCP\Calendar\DoesNotExistException;
use OCP\Calendar\MultipleObjectsReturnedException;

use OCA\Calendar\Backend\Backend;
use OCA\Calendar\Backend\IBackend;

use OCA\Calendar\Db\BackendMapper;

use OCA\Calendar\Db\Calendar;
use OCA\Calendar\Db\CalendarCollection;
use OCA\Calendar\Db\CalendarMapper;
use OCA\Calendar\Db\Permissions;

use OCA\Calendar\Utility\CalendarUtility;

class CalendarBusinessLayer extends BusinessLayer {

	/**
	 * @var CalendarMapper
	 */
	protected $mapper;


	/**
	 * object ObjectBusinessLayer object
	 * @var \OCA\Calendar\BusinessLayer\ObjectBusinessLayer
	 */
	private $obl;


	/**
	 * @param IAppContainer $app
	 * @param BackendMapper $backendMapper
	 * @param CalendarMapper $calendarMapper
	 * @param ObjectBusinessLayer $objectBusinessLayer
	 */
	public function __construct(IAppContainer $app,
								BackendMapper $backendMapper,
								CalendarMapper $calendarMapper,
								ObjectBusinessLayer $objectBusinessLayer){
		parent::__construct($app, $calendarMapper);
		parent::initBackendSystem($backendMapper);
		$this->obl = $objectBusinessLayer;
	}


	/**
	 * Find calendars of user $userId
	 * @param string $userId
	 * @param integer $limit
	 * @param integer $offset
	 * @param boolean $activeBackendsOnly
	 * @throws BusinessLayerException
	 * @return ICalendarCollection
	 */
	public function findAll($userId, $limit=null, $offset=null, $activeBackendsOnly=true) {
		try {
			$calendars = $this->mapper->findAll($userId, $limit, $offset);

			if ($activeBackendsOnly) {
				$activeBackends = $this->backends->enabled();
				$calendars = $calendars->filterByBackends($activeBackends);
			}

			return $calendars;
		} catch (BackendException $ex) {
			throw new BusinessLayerException($ex->getMessage());
		}
	}


	/**
	 * number of calendars
	 * @param string $userId
	 * @param boolean $activeBackendsOnly
	 * @throws BusinessLayerException
	 * @return integer
	 */
	public function numberOfCalendars($userId, $activeBackendsOnly=true) {
		try {
			if (!$activeBackendsOnly) {
				return $this->mapper->count($userId);
			} else {
				return $this->findAll($userId, null, null, true)->count();
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
	 * @return ICalendarCollection
	 */
	public function findAllOnBackend($backend, $userId, $limit=null, $offset=null) {
		try {
			return $this->mapper->findAllOnBackend($backend, $userId, $limit, $offset);
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
			return $this->mapper->countOnBackend($backend, $userId);
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
	 * @return ICalendar
	 */
	public function find($calendarId, $userId) {
		try {
			list($backend, $calendarURI) = (is_array($calendarId)) ? $calendarId :
											$this->splitCalendarURI($calendarId);

			$this->checkBackendEnabled($backend);

			return $this->mapper->find($backend, $calendarURI, $userId);
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
     * @param mixed [string, array] $calendarId
     * @param string $userId
     * @param bool $checkRemote
     * @return bool
     * @throws BusinessLayerException
     */
    public function doesExist($calendarId, $userId, $checkRemote=false) {
		try {
			list($backend, $calendarURI) = (is_array($calendarId)) ? $calendarId :
											$this->splitCalendarURI($calendarId);

			if($checkRemote) {
				$api = &$this->backends->find($backend)->api;
				return $api->doesCalendarExist($calendarURI, $userId);
			} else {
				return $this->mapper->doesExist($backend, $calendarURI, $userId);
			}
		} catch(BackendException $ex) {
			throw new BusinessLayerException($ex->getMessage());
		} catch(DoesNotExistException $ex) {
			throw new BusinessLayerException($ex->getMessage());
		}
	}


	/**
	 * @param integer $cruds
	 * @param string $calendarId
	 * @param string $userId
	 * @return bool
	 * @throws BusinessLayerException
	 */
	public function doesAllow($cruds, $calendarId, $userId) {
		try {
			list($backend, $calendarURI) = (is_array($calendarId)) ? $calendarId :
											$this->splitCalendarURI($calendarId);

			return $this->mapper->doesAllow($cruds, $backend, $calendarURI, $userId);
		} catch(BackendException $ex) {
			throw new BusinessLayerException($ex->getMessage());
		} catch(DoesNotExistException $ex) {
			throw new BusinessLayerException($ex->getMessage());
		}
	}


	/**
	 * checks if a calendar supports a certain component
	 * @param integer $component
	 * @param string $calendarId
	 * @param string $userId
	 * @return bool
	 * @throws BusinessLayerException
	 */
	public function doesSupport($component, $calendarId, $userId) {
		try {
			list($backend, $calendarURI) = (is_array($calendarId)) ? $calendarId :
											$this->splitCalendarURI($calendarId);

			return $this->mapper->doesSupport($component, $backend, $calendarURI, $userId);
		} catch(BackendException $ex) {
			throw new BusinessLayerException($ex->getMessage());
		} catch(DoesNotExistException $ex) {
			throw new BusinessLayerException($ex->getMessage());
		}
	}


	/**
	 * create a new calendar
	 * @param ICalendar $calendar
	 * @throws BusinessLayerException if name exists already
	 * @throws BusinessLayerException if backend does not exist
	 * @throws BusinessLayerException if backend is disabled
	 * @return ICalendar
	 * @throws BusinessLayerException
	 */
	public function create(ICalendar $calendar) {
		try {
			$backend = $calendar->getBackend();
			$calendarURI = $calendar->getUri();
			$userId = $calendar->getUserId();

			if (!$calendar->isValid()) {
				$msg  = 'CalendarBusinessLayer::create(): User Error: ';
				$msg .= 'Given calendar data is not valid!';
				throw new BusinessLayerException($msg, Http::STATUS_UNPROCESSABLE_ENTITY);
			}

			$this->checkBackendEnabled($backend);
			if ($this->doesExist(array($backend, $calendarURI), $userId)) {
				$msg  = 'CalendarBusinessLayer::create(): User Error: ';
				$msg .= 'Calendar already exists!';
				throw new BusinessLayerException($msg, Http::STATUS_CONFLICT);
			}
			$this->checkBackendSupports($backend, Backend::CREATE_CALENDAR);

			$this->backends->find($backend)->api->createCalendar($calendar);
			$this->mapper->insert($calendar);

			return $calendar;
		} catch (BackendException $ex) {
			throw new BusinessLayerException($ex->getMessage());
		} catch (CacheOutDatedException $ex) {
			//TODO update cache
			throw new BusinessLayerException($ex->getMessage());
		}
	}


	/**
	 * create a new calendar from request
	 * @param ICalendar $calendar
	 * @return ICalendar
	 */
	public function createFromRequest(ICalendar $calendar) {
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
				 * prevent an endless loop and the request will (most certainly) fail
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
	 * (try to) create all calendars in a calendar-collection
	 * @param ICalendarCollection $calendarCollection
	 * @return ICalendarCollection
	 */
	public function createCollection(ICalendarCollection $calendarCollection) {
		$createdCalendars = new CalendarCollection();

		$calendarCollection->iterate(function(ICalendar $calendar) use ($createdCalendars) {
			try {
				$calendar = $this->create($calendar);
			} catch(BusinessLayerException $ex) {
				return;
			}
			$createdCalendars->add($calendar);
		});

		return $createdCalendars;
	}


	/**
	 * create all calendars in a calendar-collection from request
	 * @param ICalendarCollection $calendarCollection
	 * @return ICalendarCollection
	 */
	public function createCollectionFromRequest(ICalendarCollection $calendarCollection) {
		$createdCalendars = new CalendarCollection();

		$calendarCollection->iterate(function(ICalendar $calendar) use ($createdCalendars) {
			try {
				$calendar = $this->createFromRequest($calendar);
			} catch(BusinessLayerException $ex) {
				return;
			}
			$createdCalendars->add($calendar);
		});

		return $createdCalendars;
	}


	/**
	 * update a new calendar
	 * @param ICalendar $calendar
	 * @param mixed (string|array) $oldCalendarId 
	 * @param string $oldUserId
	 * @throws BusinessLayerException if backend does not exist
	 * @throws BusinessLayerException if backend is disabled
	 * @throws BusinessLayerException if backend does not implement updating a calendar
	 * @return ICalendar
	 */
	public function update(ICalendar $calendar, $oldCalendarId, $oldUserId) {
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
				if ($this->doesBackendSupport($oldBackend, Backend::UPDATE_CALENDAR) === true) {
					$api = &$this->backends->find($oldBackend)->api;
					$api->updateCalendar($calendar, $oldCalendarURI);
					$this->mapper->update($calendar);
				} else {
					/** If backend does not support updating calendars
					 * allow the user to: hide it, change it's color, etc.
					 */
					$this->mapper->update($calendar);
				}
				return $calendar;
			}
		} catch(BackendException $ex) {
			//write debug note to logfile
			throw new BusinessLayerException($ex->getMessage());
		} catch (CacheOutDatedException $ex) {
			//write debug note to logfile
			//$this->updateCacheForCalendarFromRemote($oldCalendarId, $userId); TODO fix me
			throw new BusinessLayerException($ex->getMessage());
		}
	}


	/**
	 * update a new calendar from request
	 * @param ICalendar $calendar
	 * @param mixed (string|array) $oldCalendarId 
	 * @param string $oldUserId
	 * @throws BusinessLayerException if backend does not exist
	 * @throws BusinessLayerException if backend is disabled
	 * @throws BusinessLayerException if backend does not implement updating a calendar
	 * @return ICalendar
	 */
	public function updateFromRequest(ICalendar $calendar, $oldCalendarId, $oldUserId) {
		list($oldBackend, $oldCalendarURI) = (is_array($oldCalendarId)) ? $oldCalendarId :
											  $this->splitCalendarURI($oldCalendarId);

		if ($calendar->doesContainNullValues()) {
			$oldCalendarObject = $this->find(array($oldBackend, $oldCalendarURI), $oldUserId);
			$calendar = $oldCalendarObject->overwriteWith($calendar);
		}

		return $this->update($calendar, array($oldBackend, $oldCalendarURI), $oldUserId);
	}


	/**
	 * @param ICalendar $calendar
	 * @param $oldCalendarId
	 * @param $oldUserId
	 * @return ICalendar
	 * @throws BusinessLayerException
	 */
	private function merge(ICalendar $calendar, $oldCalendarId, $oldUserId) {
		try {
			list($oldBackend, $oldCalendarURI) = (is_array($oldCalendarId)) ? $oldCalendarId :
												  $this->splitCalendarURI($oldCalendarId);

			//TODO finish implementation
			$newBackend = $calendar->getBackend();
			$newCalendarURI = $calendar->getUri();
			$newUserId = $calendar->getUserId();

			$oldBackendsAPI = &$this->backends->find($oldBackend)->api;
			$newBackendsAPI = &$this->backends->find($newBackend)->api;

			if ($newBackend === $oldBackend && $this->doesBackendSupport($oldBackend, Backend::MERGE_CALENDAR)) {
				$newBackendsAPI->mergeCalendar($calendar, $oldCalendarURI, $oldUserId);
			} else {
				if (!$this->doesBackendSupport($oldBackend, Backend::DELETE_CALENDAR)) {
					$msg  = 'CalendarBusinessLayer::merge(): User Error: ';
					$msg .= 'Backend does not support deleting calendars!';
					throw new BusinessLayerException($msg);
				}

				//move all objects
				//$this->obl->moveAll($calendar, $oldCalendarId, $oldUserId);

				/**
				 * If no exception was thrown, moving objects finished without any problems
				 */
				$oldBackendsAPI->deleteCalendar($oldCalendarURI, $oldUserId);
				//todo delete old calendar from cache
				$this->mapper->update($calendar);
			}

			$this->updateCacheForCalendarFromRemote(array($oldBackend, $oldCalendarURI), $oldUserId);

			return $calendar;
		} catch(Exception $ex){}
	}


	/**
	 * @param ICalendar $calendar
	 * @param mixed (string/array) $oldCalendarId
	 * @param string $oldUserId
	 * @return ICalendar
	 * @throws BusinessLayerException
	 */
	private function move(ICalendar $calendar, $oldCalendarId, $oldUserId) {
		try {
			list($oldBackend, $oldCalendarURI) = (is_array($oldCalendarId)) ? $oldCalendarId :
												  $this->splitCalendarURI($oldCalendarId);

			//TODO finish implementation

			$newBackend = $calendar->getBackend();
			$newCalendarURI = $calendar->getUri();
			$newUserId = $calendar->getUserId();

			$oldBackendsAPI = &$this->backends->find($oldBackend)->api;
			$newBackendsAPI = &$this->backends->find($newBackend)->api;

			if ($newBackend === $oldBackend && $this->doesBackendSupport($oldBackend, Backend::MOVE_CALENDAR)) {
				$newBackendsAPI->moveCalendar($calendar, $oldCalendarURI, $oldUserId);
			} else {
				if (!$this->doesBackendSupport($oldBackend, Backend::DELETE_CALENDAR)) {
					$msg  = 'CalendarBusinessLayer::move(): User Error: ';
					$msg .= 'Old backend does not support deleting calendars!';
					throw new BusinessLayerException($msg);
				}
				if (!$this->doesBackendSupport($newBackend, Backend::CREATE_CALENDAR)) {
					$msg  = 'CalendarBusinessLayer::move(): User Error: ';
					$msg .= 'New backend does not support creating calendars!';
					throw new BusinessLayerException($msg);
				}
		
				//create calendar on new backend
				$calendar = $newBackendsAPI->createCalendar($calendar);
	
				//move all objects

				/** 
				 * If no exception was thrown, moving objects finished without any problems
				 */
				$oldBackendsAPI->deleteCalendar($oldCalendarURI, $userId);
				//todo delete old calendar from cache
				$this->mapper->update($calendar);
			}

			$this->updateCacheForCalendarFromRemote(array($newBackend, $newCalendarURI), $newUserId);		
			return $calendar;
		} catch(Exception $ex) {}
	}


	/**
	 * transfer calendar to another user
	 * @param ICalendar $calendar
	 * @param mixed (string|array) $oldCalendarId 
	 * @param string $oldUserId
	 * @return ICalendar $calendar - calendar object
	 */
	private function transfer(ICalendar $calendar, $oldCalendarId, $oldUserId) {
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
			return $calendar;
		} catch(Exception $ex) {}
	}


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
	 * @param ICalendar $calendar
	 * @throws BusinessLayerException if backend does not exist
	 * @throws BusinessLayerException if backend is disabled
	 * @throws BusinessLayerException if backend does not implement updating a calendar
	 */
	public function delete(ICalendar $calendar) {
		try {
			$backend = $calendar->getBackend();
			$calendarURI = $calendar->getUri();
			$userId = $calendar->getUserId();

			$calendar = $this->find(array($backend, $calendarURI), $userId);

			$this->checkBackendEnabled($backend);
			if (!$this->doesBackendSupport($backend, Backend::DELETE_CALENDAR)) {
				$msg  = 'CalendarBusinessLayer::delete(): User Error: ';
				$msg .= 'Backend does not support deleting calendars!';
				throw new BusinessLayerException($msg);
			}

			$this->backends->find($backend)->api->deleteCalendar($calendarURI, $userId);
			$this->mapper->delete($calendar);
		} catch(BackendException $ex) {
			throw new BusinessLayerException($ex->getMessage());
		}
	}


	/**
	 * @param string $backend
	 * @param string $calendarURI
	 * @param string $userId
	 * @return bool
	 * @throws BusinessLayerException
	 */
	private function checkCalendarDoesExist($backend, $calendarURI, $userId) {
		if (!$this->doesExist(array($backend, $calendarURI), $userId)) {
			$msg = 'Calendar not found!';
			throw new BusinessLayerException($msg, Http::STATUS_CONFLICT);
		}

		return true;
	}


	/**
	 * @param string $backend
	 * @param string $calendarURI
	 * @param string $userId
	 * @return bool
	 * @throws BusinessLayerException
	 */
	private function checkCalendarDoesNotExist($backend, $calendarURI, $userId) {
		if ($this->doesExist(array($backend, $calendarURI), $userId)) {
			$msg = 'Calendar already exists!';
			throw new BusinessLayerException($msg, Http::STATUS_CONFLICT);
		}

		return true;
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
				$this->updateCacheForBackendFromRemote($backendName, $userId, null, null);
			} catch(BusinessLayerException $ex) {
				//TODO - log error msg
				return;
			}
		});
	}


	/**
	 * update all calendars of a user on a backend
	 * @param string $backend
	 * @param string $userId
	 * @param integer $limit
	 * @param integer $offset
	 */
	public function updateCacheForBackendFromRemote($backend, $userId, $limit, $offset) {
		$calendars = $this->findAllOnBackend($backend, $userId);
		$remoteCalendars = $this->backends->find($backend)->api->findCalendars($userId, null, null);
		$calendars->addCollection($remoteCalendars)->noDuplicates();

		$calendars->subset($limit, $offset)->iterate(function(&$calendar) use ($backend, $userId) {
			try{
				$calendarURI = $calendar->getUri();

				$this->updateCacheForCalendarFromRemote(array($backend, $calendarURI), $userId);
			} catch(BusinessLayerException $ex) {
				$this->app->log($ex->getMessage(), 'error');
				return;
			} catch(DoesNotExistException $ex) {
				//should not occur, but catch it nevertheless
				$this->app->log($ex->getMessage(), 'fatal');
				return;
			}
		});
	}


	/**
	 * @param mixed (string/array) $calendarId
	 * @param string $userId
	 * @throws BusinessLayerException
	 * @throws \OCA\Calendar\Db\DoesNotExistException
	 */
	public function updateCacheForCalendarFromRemote($calendarId, $userId) {
		try{
			list($backend, $calendarURI) = (is_array($calendarId)) ? $calendarId :
				$this->splitCalendarURI($calendarId);

			$api = $this->backends->find($backend)->api;

			$doesExistCached = $this->doesExist(array($backend, $calendarURI), $userId, false);
			$doesExistRemote = $api->doesCalendarExist($calendarURI, $userId);

			if (!$doesExistCached && !$doesExistRemote) {
				$msg  = 'CalendarBusinessLayer::updateCacheForCalendarFromRemote(): ';
				$msg .= '"b:' . $backend . ';u:' . $calendarURI . '" doesn\'t exist';
				$msg .= 'Neither cached nor remote!';
				throw new DoesNotExistException($msg);
			}

			$cachedCalendar = $doesExistCached ? $this->find(array($backend, $calendarURI), $userId) : null;
			$remoteCalendar = $doesExistRemote ? $api->findCalendar($calendarURI, $userId) : null;

			if (!$doesExistRemote) {
				//$this->obl->deleteAll($cachedCalendar, null, null);
				$this->mapper->delete($cachedCalendar);
				return;
			}
			if (!$doesExistCached) {
				if ($remoteCalendar->isValid() !== true) {
					$msg  = 'CalendarBusinessLayer::updateCacheForCalendarFromRemote(): Backend Error: ';
					$msg .= 'Given calendar data is not valid! (b:"' . $backend . '";c:"' . $calendarURI . '")';
					throw new BusinessLayerException($msg);
				}

				$this->mapper->insert($remoteCalendar);
				//$this->obl->updateCacheForCalendarFromRemote(array($backend, $calendarURI), $userId);
				return;
			}

			if ($cachedCalendar == $remoteCalendar) {
				return;
			}

			if ($api->cacheObjects($calendarURI, $userId) && $cachedCalendar->getCtag() < $remoteCalendar->getCtag()) {
				//$this->obl->updateCacheForCalendarFromRemote(array($backend, $calendarURI), $userId);
			}

			$this->resetValuesNotSupportedByAPI($remoteCalendar, $api);

			if ($cachedCalendar == $remoteCalendar) {
				return;
			}

			$cachedCalendar->overwriteWith($remoteCalendar);

			if ($cachedCalendar->isValid() !== true) {
				$msg  = 'CalendarBusinessLayer::updateCacheForCalendarFromRemote(): Backend Error: ';
				$msg .= 'Given calendar data is not valid! (b:"' . $backend . '";c:"' . $calendarURI . '")';
				throw new BusinessLayerException($msg);
			}

			$this->mapper->update($cachedCalendar);
		} catch(BackendException $ex) {
			throw new BusinessLayerException($ex->getMessage());
		}
	}


	/**
	 * reset values of a calendar that are not supported by backend
	 * @param \OCA\Calendar\Db\Calendar $calendar
	 * @param \OCA\Calendar\Backend\IBackend $api
	 */
	private function resetValuesNotSupportedByAPI(Calendar &$calendar, IBackend &$api) {
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