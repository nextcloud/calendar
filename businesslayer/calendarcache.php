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

use OCA\Calendar\Backend\IBackend;

use OCA\Calendar\Db\BackendMapper;
use OCA\Calendar\Db\CalendarMapper;


class CalendarCacheBusinessLayer extends BusinessLayer {

	/**
	 * @var CalendarMapper
	 */
	protected $mapper;


	/**
	 * @var array
	 */
	private $cachedIdentifiers=array();


	/**
	 * @var array
	 */
	private $remoteIdentifiers=array();


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
	 * create a calendar in cache
	 * @param mixed (string|array) $calendarId
	 * @param string $userId
	 */
	public function create($calendarId, $userId) {
		list($backend, $calendarURI) = (is_array($calendarId)) ? $calendarId :
										$this->splitCalendarURI($calendarId);

		$calendar = $this->findCachedCalendar($calendarId, $userId);
		if (!$calendar) {
			return;
		}
		$this->resetValueNotSupportedByBackend($calendar, $backend);

		$this->checkCalendarIsValid($calendar);
		$this->mapper->insert($calendar);
	}


	/**
	 * update a cached calendar from remote
	 * @param mixed (string|array) $calendarId
	 * @param string $userId
	 */
	public function update($calendarId, $userId) {
		list($backend, $calendarURI) = (is_array($calendarId)) ? $calendarId :
										$this->splitCalendarURI($calendarId);


	}


	/**
	 * delete a calendar in cache
	 * @param mixed (string|array) $calendarId
	 * @param string $userId
	 */
	public function delete($calendarId, $userId) {
		list($backend, $calendarURI) = (is_array($calendarId)) ? $calendarId :
										$this->splitCalendarURI($calendarId);

		$calendar = $this->findCachedCalendar($calendarId, $userId);
		if ($calendar === null) {
			return;
		}

		$this->mapper->delete($calendar);
	}


	/**
	 *
	 */
	public function getNextCalendar() {

	}


	/**
	 * @param string $backend
	 * @param string $userId
	 */
	private function scanIdentifiers($backend, $userId) {
		$api = &$this->backends->find($backend)->api;

		$cachedIdentifiers = $this->mapper->findAllIdentifiersOnBackend($backend, $userId);
		$remoteIdentifiers = $api->getCalendarIdentifiers($userId, null, null);

		if ($cachedIdentifiers) {
			$this->cachedIdentifiers[$userId][$backend] = $cachedIdentifiers;
		}
		if ($remoteIdentifiers) {
			$this->remoteIdentifiers[$userId][$backend] = $remoteIdentifiers;
		}
	}


	/**
	 * @param string $backend
	 * @param string $userId
	 * @return array
	 */
	private function scanForNew($backend, $userId) {
		return array_diff($this->cachedIdentifiers, $this->remoteIdentifiers);
	}


	/**
	 * @param string $backend
	 * @param string $userId
	 * @return array
	 */
	private function scanForOutDated($backend, $userId) {
		return array_intersect($this->cachedIdentifiers, $this->remoteIdentifiers);
	}


	/**
	 * @param $backend
	 * @param $userId
	 * @return array
	 */
	private function scanForDeleted($backend, $userId) {
		return array_diff($this->remoteIdentifiers, $this->cachedIdentifiers);
	}


	/**
	 * @param mixed (string|array) $calendarId
	 * @param string $userId
	 * @return bool
	 */
	private function doesExistCached($calendarId, $userId) {
		list($backend, $calendarURI) = (is_array($calendarId)) ? $calendarId :
										$this->splitCalendarURI($calendarId);

		return $this->mapper->doesExist($backend, $calendarURI, $userId);
	}


	/**
	 * @param mixed (string|array) $calendarId
	 * @param string $userId
	 * @return boolean
	 */
	private function doesExistRemote($calendarId, $userId) {
		list($backend, $calendarURI) = (is_array($calendarId)) ? $calendarId :
										$this->splitCalendarURI($calendarId);

		$api = &$this->backends->find($backend)->api;
		return $api->doesCalendarExist($calendarURI, $userId);
	}


	/**
	 * @param mixed (string|array) $calendarId
	 * @param string $userId
	 * @return null|ICalendar
	 */
	private function findCachedCalendar($calendarId, $userId) {
		list($backend, $calendarURI) = (is_array($calendarId)) ? $calendarId :
										$this->splitCalendarURI($calendarId);

		try {
			return $this->mapper->find($backend, $calendarURI, $userId);
		} catch (DoesNotExistException $ex) {
			return null;
		} catch (MultipleObjectsReturnedException $ex) {
			return null;
		}
	}


	/**
	 * @param mixed (string|array) $calendarId
	 * @param string $userId
	 * @return null|ICalendar
	 */
	private function findRemoteCalendar($calendarId, $userId) {
		list($backend, $calendarURI) = (is_array($calendarId)) ? $calendarId :
										$this->splitCalendarURI($calendarId);

		$api = &$this->backends->find($backend)->api;
		try {
			return $api->findCalendar($calendarURI, $userId);
		} catch(DoesNotExistException $ex) {
			return null;
		} catch(MultipleObjectsReturnedException $ex) {
			return null;
		} catch(BackendException $ex) {
			return null;
		}
	}


	/**
	 * @param ICalendar $calendar
	 * @param string $backend
	 */
	private function resetValueNotSupportedByBackend(ICalendar &$calendar, $backend) {
		$api = $this->backends->find($backend)->api;
		$this->resetValuesNotSupportedByAPI($calendar, $api);
	}


	/**
	 * reset values of a calendar that are not supported by backend
	 * @param ICalendar &$calendar
	 * @param IBackend &$api
	 */
	private function resetValuesNotSupportedByAPI(ICalendar &$calendar, IBackend &$api) {
		if (!$api->canStoreColor()) {
			$calendar->setColor(null);
		}
		if (!$api->canStoreComponents()) {
			$calendar->setComponents(null);
		}
		if (!$api->canStoreDescription()) {
			$calendar->setDescription(null);
		}
		if (!$api->canStoreDisplayname()) {
			$calendar->setDisplayname(null);
		}
		if (!$api->canStoreEnabled()) {
			$calendar->setEnabled(null);
		}
		if (!$api->canStoreOrder()) {
			$calendar->setOrder(null);
		}
	}
}