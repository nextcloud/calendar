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

use OCA\Calendar\Db\DoesNotExistException;
use OCA\Calendar\Db\MultipleObjectsReturnedException;
use OCP\AppFramework\IAppContainer;
use OCA\Calendar\Db\BackendMapper;
use OCA\Calendar\Db\CalendarMapper;

class CalendarCacheBusinessLayer extends BusinessLayer {

	const NOT_IN_CACHE = 1;
	const NOT_REMOTE = 2;
	const OUTDATED = 3;


	/**
	 * @param IAppContainer $app
	 * @param BackendMapper $backendMapper
	 * @param CalendarMapper $calendarMapper
	 */
	public function __construct(IAppContainer $app,
								BackendMapper $backendMapper,
								CalendarMapper $calendarMapper) {
		parent::__construct($app, $calendarMapper);
		parent::initBackendSystem($backendMapper);
	}


	/**
	 * @brief check if a calendar is outdated
	 * @param string $calendarId
	 * @param string $userId
	 * @return mixed (boolean|integer)
	 */
	public function isOutDated($calendarId, $userId) {
		list($backend, $calendarURI) = (is_array($calendarId)) ? $calendarId :
										$this->splitCalendarURI($calendarId);

		try {
			$cachedCTag = $this->mapper->findCTag($backend, $calendarURI, $userId);
		} catch(DoesNotExistException $ex) {
			return self::NOT_IN_CACHE;
		} catch(MultipleObjectsReturnedException $ex) {
			throw new BusinessLayerException($ex->getMessage(), $ex->getCode(), $ex);
		}

		$api = &$this->backends->find($backend)->api;
		try {
			$remoteCTag = $api->getCalendarsCTag($calendarURI, $userId);
		} catch(DoesNotExistException $ex) {
			return self::NOT_REMOTE;
		} catch(MultipleObjectsReturnedException $ex) {
			throw new BusinessLayerException($ex->getMessage(), $ex->getCode(), $ex);
		}

		if ($cachedCTag === $remoteCTag) {
			return false;
		}
		if ($cachedCTag < $remoteCTag) {
			return true;
		}
		if ($remoteCTag > $cachedCTag) {
			//TODO - how to handle this case appropriately?
			//could lead to endless updates if backend is sending broken ctag
			//setting cached ctag to remote ctag will break client sync
			return false;
		}
	}


	/**
	 * @brief create a calendar in cache
	 * @param mixed (string|array) $calendarId
	 * @param string $userId
	 */
	public function create($calendarId, $userId) {
		list($backend, $calendarURI) = (is_array($calendarId)) ? $calendarId :
										$this->splitCalendarURI($calendarId);


	}


	/**
	 * @brief update a cached calendar from remote
	 * @param mixed (string|array) $calendarId
	 * @param string $userId
	 */
	public function update($calendarId, $userId) {
		list($backend, $calendarURI) = (is_array($calendarId)) ? $calendarId :
										$this->splitCalendarURI($calendarId);


	}


	/**
	 * @brief delete a calendar in cache
	 * @param mixed (string|array) $calendarId
	 * @param string $userId
	 */
	public function delete($calendarId, $userId) {
		list($backend, $calendarURI) = (is_array($calendarId)) ? $calendarId :
										$this->splitCalendarURI($calendarId);


	}


	/**
	 *
	 */
	public function getNextCalendar() {

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

	$calendars->subset($limit, $offset)->iterate(function(&$calendar) use ($userId) {
	try{
	$backend = $calendar->getBackend();
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

	$api = &$this->backends->find($backend)->api;

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
	$this->obl->deleteAll($cachedCalendar, null, null);
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
	$this->obl->updateCacheForCalendarFromRemote(array($backend, $calendarURI), $userId);
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