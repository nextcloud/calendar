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

use \OCP\AppFramework\IAppContainer;
use \OCP\AppFramework\Http;

use OCA\Calendar\Backend\Backend;
use \OCA\Calendar\Backend\BackendException;
use \OCA\Calendar\Backend\CacheOutDatedException;
use \OCA\Calendar\Backend\IBackend;

use \OCA\Calendar\Db\BackendMapper;

use \OCA\Calendar\Db\Calendar;
use \OCA\Calendar\Db\CalendarCollection;
use \OCA\Calendar\Db\CalendarMapper;

use \OCA\Calendar\Db\Permissions;

use \OCA\Calendar\Db\DoesNotExistException;
use \OCA\Calendar\Db\MultipleObjectsReturnedException;

use \OCA\Calendar\Utility\CalendarUtility;

class CalendarBusinessLayer extends BusinessLayer {

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
	 * @return \OCA\Calendar\Db\CalendarCollection
	 */
	public function findAll($userId, $limit=null, $offset=null, $activeBackendsOnly=true) {
		try {
			$calendars = $this->mapper->findAll($userId, $limit, $offset);
			if (!($calendars instanceof CalendarCollection)) {
				$msg  = 'CalendarBusinessLayer::findAll(): Internal Error: ';
				$msg .= 'CalendarCache returned unrecognised format!';
				throw new BusinessLayerException($msg);
			}

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
				$number = $this->mapper->count($userId);
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
			$calendars = $this->mapper->findAllOnBackend($backend, $userId, $limit, $offset);
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
			$number = $this->mapper->countOnBackend($backend, $userId);
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

			$calendar = $this->mapper->find($backend, $calendarURI, $userId);
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
     * @param mixed [string, array] $calendarId
     * @param string $userId
     * @param bool $checkRemote
     * @return mixed
     * @throws BusinessLayerException
     */
    public function doesExist($calendarId, $userId, $checkRemote=false) {
		try {
			list($backend, $calendarURI) = (is_array($calendarId)) ? $calendarId :
											$this->splitCalendarURI($calendarId);

			if($checkRemote) {
				$api = &$this->backends->find($backend->api);
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
	 * @return boolean mixed
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
	 * @return boolean
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
	 * @param Calendar $calendar
	 * @throws BusinessLayerException if name exists already
	 * @throws BusinessLayerException if backend does not exist
	 * @throws BusinessLayerException if backend is disabled
	 * @return Calendar $calendar - calendar object
	 * @throws BusinessLayerException
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
			if (!$this->doesBackendSupport($backend, Backend::CREATE_CALENDAR)) {
				$msg  = 'CalendarBusinessLayer::create(): User Error: ';
				$msg .= 'Backend does not support creating calendars!';
				throw new BusinessLayerException($msg, Http::STATUS_UNPROCESSABLE_ENTITY);
			}

			$this->backends->find($backend)->api->createCalendar($calendar);
			$this->mapper->insert($calendar);

			return $calendar;
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
	 * @param CalendarCollection $calendarCollection
	 * @return \OCA\Calendar\Db\CalendarCollection $calendars successfully created calendars
	 */
	public function createCollection(CalendarCollection $calendarCollection) {
		$createdCalendars = new CalendarCollection();

		$calendarCollection->iterate(function($calendar) use ($createdCalendars) {
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
	 * @param CalendarCollection $calendarCollection
	 * @return \OCA\Calendar\Db\CalendarCollection $calendars successfully created calendars
	 */
	public function createCollectionFromRequest(CalendarCollection $calendarCollection) {
		$createdCalendars = new CalendarCollection();

		$calendarCollection->iterate(function($calendar) use ($createdCalendars) {
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
	 * @param Calendar $calendar
	 * @param mixed (string|array) $oldCalendarId 
	 * @param string $oldUserId
	 * @throws BusinessLayerException if backend does not exist
	 * @throws BusinessLayerException if backend is disabled
	 * @throws BusinessLayerException if backend does not implement updating a calendar
	 * @return \OCA\Calendar\Db\Calendar $calendar - calendar object
	 */
	public function updateFromRequest(Calendar $calendar, $oldCalendarId, $oldUserId) {
		list($oldBackend, $oldCalendarURI) = (is_array($oldCalendarId)) ? $oldCalendarId :
											  $this->splitCalendarURI($oldCalendarId);

		if ($calendar->doesContainNullValues()) {
			$oldCalendarObject = $this->find(array($oldBackend, $oldCalendarURI), $oldUserId);
			$calendar = $oldCalendarObject->overwriteWith($calendar);
		}

		return $this->update($calendar, array($oldBackend, $oldCalendarURI), $oldUserId);
	}


	/**
	 * @param Calendar $calendar
	 * @param $oldCalendarId
	 * @param $oldUserId
	 * @return Calendar
	 * @throws BusinessLayerException
	 */
	private function merge(Calendar $calendar, $oldCalendarId, $oldUserId) {
		try {
			list($oldBackend, $oldCalendarURI) = (is_array($oldCalendarId)) ? $oldCalendarId :
												  $this->splitCalendarURI($oldCalendarId);

			//TODO finish implementation
			return $calendar;

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
	 * @param Calendar $calendar
	 * @param mixed (string/array) $oldCalendarId
	 * @param string $oldUserId
	 * @return Calendar
	 * @throws BusinessLayerException
	 */
	private function move(Calendar $calendar, $oldCalendarId, $oldUserId) {
		try {
			list($oldBackend, $oldCalendarURI) = (is_array($oldCalendarId)) ? $oldCalendarId :
												  $this->splitCalendarURI($oldCalendarId);

			//TODO finish implementation
			return $calendar;

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
				$this->obl->moveAll($calendar, array($oldBackend, $oldCalendarURI), $newUserId);
		
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
	 * @param Calendar $calendar
	 * @param mixed (string|array) $oldCalendarId 
	 * @param string $oldUserId
	 * @return \OCA\Calendar\Db\Calendar $calendar - calendar object
	 */
	private function transfer(Calendar $calendar, $oldCalendarId, $oldUserId) {
		try {
			list($oldBackend, $oldCalendarURI) = (is_array($oldCalendarId)) ?
													$oldCalendarId :
													$this->splitCalendarURI($oldCalendarId);

			//TODO finish implementation
			return $calendar;

			$newBackend = $calendar->getBackend();
			$newCalendarURI = $calendar->getUri();
			$newUserId = $calendar->getUserId();

			$oldBackendsAPI = &$this->backends->find($oldBackend)->api;
			$newBackendsAPI = &$this->backends->find($newBackend)->api;

			//TODO implement
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
	 * @param Calendar $calendar
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
}