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
namespace OCA\Calendar;

use OCP\Calendar\IBackendCollection;
use OCP\Calendar\ICalendar;

use OCA\Calendar\Backend\DoesNotExistException;
use OCA\Calendar\Db\CalendarMapper;
use OCA\Calendar\Utility\CalendarUtility;

class CalendarCache {

	/**
	 * @var IBackendCollection
	 */
	protected $backends;


	/**
	 * @var CalendarMapper
	 */
	protected $cache;


	/**
	 * @var string
	 */
	protected $userId;


	/**
	 * @param IBackendCollection $backends
	 * @param CalendarMapper $cache
	 * @param string $userId
	 */
	public function __construct(IBackendCollection $backends,
								CalendarMapper $cache, $userId) {
		$this->backends = $backends;
		$this->cache = $cache;
		$this->userId = $userId;
	}


	/**
	 * @param integer $limit
	 * @param integer $offset
	 * Limit and Offset does not apply to deleting objects
	 * @throws \OCP\AppFramework\Db\DoesNotExistException
	 * @throws Backend\Exception
	 */
	public function scan($limit=null, $offset=null) {
		$remote = $this->backends->getPrivateUris($this->userId);
		$cached = $this->cache->getPrivateUris($this->userId);

		sort($remote);
		sort($cached);

		if ($limit !== null && $offset === null) {
			$offset = 0;
		}

		$i = 0;
		foreach ($remote as $backend => $calendars) {
			sort($calendars);

			if (array_key_exists($backend, $cached)) {
				$toDelete = array_diff($cached[$backend], $calendars);
				$this->removeListFromCache($toDelete);
			}

			foreach($calendars as $calendar) {
				if ($i++ < $offset) {
					continue;
				}
				if ($limit > ($offset - $i)) {
					break;
				}

				if (isset($cached[$backend]) &&
					in_array($calendar, $cached[$backend])) {
					$this->updateCache($backend, $calendar);
				} else {
					$this->addToCache($backend, $calendar);
				}
			}

			if ($limit > ($offset - $i)) {
				break;
			}
		}
	}


	/**
	 * @param string $backend
	 * @param string $privateUri
	 */
	protected function addToCache($backend, $privateUri) {
		$calendar = $this->getCalendarFromBackend($backend, $privateUri);

		if ($calendar === null) {
			return;
		}

		CalendarUtility::generateURI($calendar, function($uri, $userId) {
			return $this->cache->doesExist($uri, $userId);
		}, true);

		if(!$this->checkIsValid($calendar)) {
			return;
		}

		$this->cache->insert($calendar);
	}


	/**
	 * @param string $backend
	 * @param string $privateUri
	 */
	protected function updateCache($backend, $privateUri) {
		$newCalendar = $this->getCalendarFromBackend($backend, $privateUri);
		$oldCalendar = $this->cache->findByPrivateUri($backend, $privateUri,
			$this->userId);

		if ($newCalendar === null) {
			return;
		}

		$this->resetProps($newCalendar);
		$oldCalendar->overwriteWith($newCalendar);

		if(!$this->checkIsValid($oldCalendar)) {
			return;
		}

		$this->cache->update($oldCalendar);
	}


	/**
	 * delete multiple objects based on array of
	 * objectUris from cache
	 * @param string $backend
	 * @param array $privateUris
	 */
	protected function removeListFromCache($backend, array $privateUris=[]) {
		if (!$this->backends->find($backend)) {
			return;
		}

		$calendarAPI = $this->backends->find($backend)->getCalendarAPI();
		foreach($privateUris as $key => $privateUri) {
			try {
				$calendarAPI->find($privateUri, $this->userId);
			} catch(DoesNotExistException $ex) {
				//everything as expected - continue
			} catch(Backend\Exception $ex) {
				//don't delete calendars when an exception other than
				//DoesNotExistException is thrown
				unset($privateUris[$key]);
			}
		}

		$this->cache->deletePrivateUriList($backend, $privateUris);
	}


	/**
	 * @param $backend
	 * @param $privateUri
	 * @return null|\OCP\Calendar\ICalendar
	 */
	private function getCalendarFromBackend($backend, $privateUri) {
		try {
			return $this->backends->find($backend)
				->getCalendarAPI()->find($privateUri, $this->userId);
		} catch(Backend\DoesNotExistException $ex) {
			\OC::$server->getLogger()->error($ex->getMessage());
		} catch(Backend\MultipleObjectsReturnedException $ex) {
			\OC::$server->getLogger()->error($ex->getMessage());
		} catch(Backend\TemporarilyNotAvailableException $ex) {
			\OC::$server->getLogger()->notice($ex->getMessage());
		} catch(Backend\Exception $ex) {
			\OC::$server->getLogger()->debug($ex->getMessage());
		}

		return null;
	}


	/**
	 * @param ICalendar $calendar
	 * @return boolean
	 */
	private function checkIsValid(ICalendar $calendar) {
		if (!$calendar->isValid()) {
			\OC::$server->getLogger()->error(
				'Backend returned invalid calendar object'
			);
			return false;
		}

		return true;
	}


	/**
	 * @param ICalendar $calendar
	 */
	private function resetProps(ICalendar &$calendar) {
		$api = $calendar->getBackend()->getBackendAPI();

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