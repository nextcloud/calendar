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

use OCP\Calendar\IBackend;
use OCP\Calendar\IBackendCollection;
use OCP\Calendar\ICalendar;
use OCP\Calendar\CacheOutDatedException;
use OCP\Calendar\DoesNotExistException;
use OCP\Calendar\MultipleObjectsReturnedException;
use OCP\Calendar\IBackendAPI;
use OCP\Calendar\IFullyQualifiedBackend;

use OCA\Calendar\Db\CalendarMapper;
use OCA\Calendar\Utility\CalendarUtility;

class CalendarCacheBusinessLayer extends CacheBusinessLayer {

	/**
	 * @var int
	 */
	const CREATED = 1;


	/**
	 * @var int
	 */
	const UPDATED = 2;


	/**
	 * @var int
	 */
	const REMOVED = 4;


	/**
	 * @var CalendarMapper
	 */
	protected $mapper;


	/**
	 * @param IAppContainer $app
	 * @param IBackendCollection $backends
	 * @param CalendarMapper $calendarMapper
	 */
	public function __construct(IAppContainer $app,
								IBackendCollection $backends,
								CalendarMapper $calendarMapper) {
		parent::__construct($app, $calendarMapper);
		$this->backends = $backends;
		$this->resetHistory();
	}


	/**
	 * @param string $userId
	 * @param int $limit
	 * @param int $offset
	 */
	public function updateMostOutdated($userId=null, $limit=null, $offset=null) {
		if ($userId === null) {
			$calendars = $this->mapper->getMostOutDatedProperties($limit, $offset);
		} else {
			$calendars = $this->mapper->getMostOutDatedPropertiesByUser($userId, $limit, $offset);
		}

		$calendars->iterate(function(ICalendar &$calendar) {
			$this->updateByCache($calendar);
		});
	}


	/**
	 * @param ICalendar $cached
	 */
	public function updateByCache(ICalendar $cached) {
		$backend = $cached->getBackend();
		$privateuri = $cached->getPrivateUri();
		$userId = $cached->getUserId();

		$remote = $this->getRemote($backend, $privateuri, $userId);

		$this->updateByCacheAndRemote($cached, $remote);
	}


	/**
	 * @param int $id
	 * @param string $userId
	 * @throws BusinessLayerException
	 */
	public function updateById($id, $userId) {
		//try to get cached calendar
		try {
			$cached = $this->mapper->findById($id, $userId);
		} catch(DoesNotExistException $ex) {
			throw new BusinessLayerException('Calendar does not exist', Http::STATUS_NOT_FOUND, $ex);
		} catch(MultipleObjectsReturnedException $ex) {
			$msg  = 'CalendarCacheBusinessLayer::updateById(): ';
			$msg .= 'Multiple calendars with publicuri found!';
			throw new BusinessLayerException($msg, Http::STATUS_INTERNAL_SERVER_ERROR, $ex);
		}

		$backend = $cached->getBackend();
		$privateuri = $cached->getPrivateUri();
		$userId = $cached->getUserId();

		$remote = $this->getRemote($backend, $privateuri, $userId);

		$this->updateByCacheAndRemote($cached, $remote);
	}


	/**
	 * @param string $publicuri
	 * @param string $userId
	 * @return int
	 * @throws BusinessLayerException
	 */
	public function updateByPublicUri($publicuri, $userId) {
		//try to get cached calendar
		try {
			$cached = $this->mapper->find($publicuri, $userId);
		} catch(DoesNotExistException $ex) {
			throw new BusinessLayerException('Calendar does not exist', Http::STATUS_NOT_FOUND, $ex);
		} catch(MultipleObjectsReturnedException $ex) {
			$msg  = 'CalendarCacheBusinessLayer::updateByPublicUri(): ';
			$msg .= 'Multiple calendars with publicuri found!';
			throw new BusinessLayerException($msg, Http::STATUS_INTERNAL_SERVER_ERROR, $ex);
		}

		$backend = $cached->getBackend();
		$privateuri = $cached->getPrivateUri();
		$userId = $cached->getUserId();

		$remote = $this->getRemote($backend, $privateuri, $userId);

		$this->updateByCacheAndRemote($cached, $remote);
	}


	/**
	 * @param string $backend
	 * @param string $privateuri
	 * @param string $userId
	 * @throws BusinessLayerException
	 */
	public function updateByPrivateUri($backend, $privateuri, $userId) {
		try {
			$cached = $this->mapper->findByPrivateUri($backend, $privateuri, $userId);
		} catch (DoesNotExistException $ex) {
			$cached = null;
		} catch (MultipleObjectsReturnedException $ex) {
			$msg = 'CalendarCacheBusinessLayer::updateByPrivateUri(): ';
			$msg .= 'Multiple calendars with privateuri found in cache!';
			throw new BusinessLayerException($msg, Http::STATUS_INTERNAL_SERVER_ERROR, $ex);
		}

		$remote = $this->getRemote($backend, $privateuri, $userId);

		$this->updateByCacheAndRemote($cached, $remote);
	}


	/**
	 * @param string $backend
	 * @param string $userId
	 * @param int $limit
	 * @param int $offset
	 */
	public function updateByBackend($backend, $userId, $limit, $offset) {
		/** @var IFullyQualifiedBackend $backendApi */
		$backendApi = $this->backends->find($backend)->getAPI();

		$calendarIds = $backendApi->getCalendarIdentifiers($userId, $limit, $offset);
		foreach($calendarIds as $calendarId) {
			$this->updateByPrivateUri($backend, $calendarId, $userId);
		}
	}


	/**
	 * @param string $userId
	 * @param int $limit
	 * @param int $offset
	 */
	public function updateAll($userId, $limit, $offset) {
		$list = array();

		$this->backends->iterate(function(IBackend $backend) use ($userId, &$limit, &$offset, &$list) {
			if ($limit !== null && $limit < 1) {
				return;
			}

			/** @var IFullyQualifiedBackend $backendApi */
			$backendApi = $backend->getAPI();
			$backendId = $backend->getBackend();

			$numberOfCalendars = $backendApi->countCalendars($userId);

			if ($offset !== null && $numberOfCalendars < $offset) {
				$offset -= $numberOfCalendars;
				return;
			} else {
				$calendarIds = $backendApi->getCalendarIdentifiers($userId, $limit, $offset);
				foreach($calendarIds as $calendarId) {
					$list[] = array(
						'userId' => $userId,
						'backend' => $backendId,
						'privateuri' => $calendarId,
					);
				}

				$numberOfCalendarIds = count($calendarIds);
				if ($limit !== null) {
					$limit -= $numberOfCalendarIds;
				}
				if ($offset !== null) {
					$offset -= $numberOfCalendarIds;
				}
			}
		});

		foreach($list as $item) {
			$backend = $item['backend'];
			$privateuri = $item['privateuri'];
			$userId = $item['userId'];

			$this->updateByPrivateUri($backend, $privateuri, $userId);
		}
	}


	/**
	 * @param ICalendar $cache
	 * @param ICalendar $remote
	 * @throws BusinessLayerException
	 */
	private function updateByCacheAndRemote(ICalendar $cache, ICalendar $remote) {
		if ($cache === null && $remote === null) {
			throw new BusinessLayerException('Calendar does not exist', Http::STATUS_NOT_FOUND);
		} elseif ($cache === null) {
			$this->createCache($remote);
		} elseif ($remote === null) {
			$this->removeCache($cache);
		} else {
			$this->updateCache($cache, $remote);
		}
	}


	/**
	 * @param string $backend
	 * @param string $privateuri
	 * @param string $userId
	 * @return ICalendar
	 * @throws BusinessLayerException
	 */
	private function getRemote($backend, $privateuri, $userId) {
		/** @var IFullyQualifiedBackend $backendApi */
		$backendApi = $this->backends->find($backend)->getAPI();
		try {
			$remoteCalendar = $backendApi->findCalendar($privateuri, $userId);
		} catch (DoesNotExistException $ex) {
			$remoteCalendar = null;
		} catch (CacheOutDatedException $ex) {
			$remoteCalendar = null;
		} catch (MultipleObjectsReturnedException $ex) {
			$msg = 'CalendarCacheBusinessLayer::updateByPrivateUri(): ';
			$msg .= 'Multiple calendars with privateuri found in backend!';
			throw new BusinessLayerException($msg, Http::STATUS_INTERNAL_SERVER_ERROR, $ex);
		}

		return $remoteCalendar;
	}


	/**
	 * @param ICalendar $remote
	 * @throws BusinessLayerException
	 */
	private function createCache(ICalendar &$remote) {
		if ($remote === null) {
			$msg  = 'CalendarCacheBusinessLayer::createCache(): ';
			$msg .= 'Given calendar-object is null!';
			throw new BusinessLayerException($msg, HTTP::STATUS_INTERNAL_SERVER_ERROR);
		}

		$this->generatePublicUri($remote);

		$this->checkCalendarIsValid($remote);

		$remote->setLastPropertiesUpdate(time());
		$remote->setLastObjectUpdate(0);

		$remote = $this->mapper->insert($remote);

		$this->appendToHistory(array(
			'publicuri' => $remote->getPublicUri(),
			'id' => $remote->getId(),
			'task' => self::CREATED,
		));
	}


	/**
	 * @param ICalendar $cached
	 * @throws BusinessLayerException
	 */
	private function removeCache(ICalendar $cached) {
		if ($cached === null) {
			$msg  = 'CalendarCacheBusinessLayer::removeCache(): ';
			$msg .= 'Given calendar-object is null!';
			throw new BusinessLayerException($msg, HTTP::STATUS_INTERNAL_SERVER_ERROR);
		}

		$this->mapper->delete($cached);

		$this->appendToHistory(array(
			'publicuri' => $cached->getPublicUri(),
			'id' => $cached->getId(),
			'task' => self::REMOVED,
		));
	}


	/**
	 * @param ICalendar $cached
	 * @param ICalendar $remote
	 * @throws BusinessLayerException
	 */
	private function updateCache(ICalendar $cached, ICalendar $remote) {
		if ($cached === null) {
			$msg  = 'CalendarCacheBusinessLayer::updateCache(): ';
			$msg .= 'Given calendar-object (cached) is null!';
			throw new BusinessLayerException($msg, HTTP::STATUS_INTERNAL_SERVER_ERROR);
		}
		if ($remote === null) {
			$msg  = 'CalendarCacheBusinessLayer::updateCache(): ';
			$msg .= 'Given calendar-object (remote) is null!';
			throw new BusinessLayerException($msg, HTTP::STATUS_INTERNAL_SERVER_ERROR);
		}

		$this->prepareRemoteForUpdate($remote);
		$cached->overwriteWith($remote);
		$this->checkCalendarIsValid($cached);

		$cached->setLastPropertiesUpdate(time());

		$this->mapper->update($cached);

		$this->appendToHistory(array(
			'publicuri' => $cached->getPublicUri(),
			'id' => $cached->getId(),
			'task' => self::UPDATED,
		));
	}


	/**
	 * @param ICalendar $calendar
	 */
	private function prepareRemoteForUpdate(ICalendar &$calendar) {
		$backend = $calendar->getBackend();
		$this->resetValueNotSupportedByBackend($calendar, $backend);
	}


	/**
	 * generates a public uri that's based on either displayname or privateuri
	 * @param ICalendar $calendar
	 */
	private function generatePublicUri(ICalendar &$calendar) {
		$displayname = $calendar->getDisplayname();
		$privateuri = $calendar->getPrivateUri();
		$userId = $calendar->getUserId();

		if ($displayname !== null && trim($displayname) !== '') {
			$suggestedUri = $displayname;
		} else {
			$suggestedUri = $privateuri;
		}

		while($this->mapper->doesExist($suggestedUri, $userId)) {
			$newSuggestedURI = CalendarUtility::suggestURI($suggestedUri);

			if ($newSuggestedURI === $suggestedUri) {
				break;
			}
			$suggestedUri = $newSuggestedURI;
		}

		$calendar->setPublicUri($suggestedUri);
	}


	/**
	 * @param ICalendar $calendar
	 * @param string $backend
	 */
	private function resetValueNotSupportedByBackend(ICalendar &$calendar, $backend) {
		/** @var IFullyQualifiedBackend $backendApi */
		$backendApi = $this->backends->find($backend)->getAPI();
		$this->resetValuesNotSupportedByAPI($calendar, $backendApi);
	}


	/**
	 * reset values of a calendar that are not supported by backend
	 * @param ICalendar &$calendar
	 * @param IBackendAPI &$api
	 */
	private function resetValuesNotSupportedByAPI(ICalendar &$calendar, IBackendAPI &$api) {
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