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

use OCA\Calendar\Backend as BackendUtils;
use OCA\Calendar\Cache\Calendar as CalendarCache;
use OCA\Calendar\IBackendCollection;
use OCA\Calendar\ICalendar;

use OCP\AppFramework\Db\DoesNotExistException;
use OCP\AppFramework\Db\MultipleObjectsReturnedException;
use OCP\AppFramework\Http;

class CalendarManager extends BusinessLayer {

	/**
	 * @var IBackendCollection
	 */
	protected $backends;


	/**
	 * @var CalendarCache\Cache
	 */
	protected $cache;


	/**
	 * @var CalendarCache\Updater
	 */
	protected $updater;


	/**
	 * @param IBackendCollection $backends
	 */
	public function __construct(IBackendCollection $backends) {
		$this->backends = $backends;

		$this->cache = $backends->getCache();
		$this->updater = $backends->getUpdater();
		$this->watcher = $backends->getWatcher();
	}


	/**
	 * Find all calendars of a user
	 * @param string $userId
	 * @param integer $limit
	 * @param integer $offset
	 * @return \OCA\Calendar\ICalendarCollection
	 */
	public function findAll($userId, $limit, $offset) {
		return $this->cache->findAll($userId, $limit, $offset);
	}


	/**
	 * List all calendars of a user
	 * @param string $userId
	 * @return array
	 */
	public function listAll($userId) {
		return $this->cache->listAll($userId);
	}


	/**
	 * Find calendar by it's id
	 * @param int $id
	 * @param string $userId
	 * @return \OCA\Calendar\ICalendar
	 * @throws \OCA\Calendar\BusinessLayer\Exception
	 * if backend does not exist
	 * @throws \OCA\Calendar\BusinessLayer\Exception
	 * if backend is disabled
	 */
	public function find($id, $userId) {
		try {
			return $this->cache->findById($id, $userId);
		} catch (DoesNotExistException $ex) {
			throw Exception::fromException($ex);
		} catch (MultipleObjectsReturnedException $ex) {
			throw Exception::fromException($ex);
		}
	}


	/**
	 * Find calendar by it's uri
	 * @param string $publicUri
	 * @param string $userId
	 * @return \OCA\Calendar\ICalendar
	 * @throws \OCA\Calendar\BusinessLayer\Exception
	 * if backend does not exist
	 * @throws \OCA\Calendar\BusinessLayer\Exception
	 * if backend is disabled
	 */
	public function findByUri($publicUri, $userId) {
		try {
			return $this->cache->findByPublicUri($publicUri, $userId);
		} catch (DoesNotExistException $ex) {
			throw Exception::fromException($ex);
		} catch (MultipleObjectsReturnedException $ex) {
			throw Exception::fromException($ex);
		}
	}


	/**
	 * Create a new calendar
	 * @param \OCA\Calendar\ICalendar $calendar
	 * @return \OCA\Calendar\ICalendar
	 * @throws \OCA\Calendar\BusinessLayer\Exception
	 * if name exists already
	 * @throws \OCA\Calendar\BusinessLayer\Exception
	 * if backend does not exist
	 * @throws \OCA\Calendar\BusinessLayer\Exception
	 * if backend is disabled
	 */
	public function create(ICalendar $calendar) {
		$this->checkIsValid($calendar);

		$backendId = $calendar->getBackend()->getId();
		$privateUri = $calendar->getPrivateUri();
		$userId = $calendar->getUserId();
		$publicUri = $calendar->getPublicUri();

		if ($this->cache->doesExist($publicUri, $userId)) {
			throw new Exception('Public uri is already taken!');
		}

		$api = $calendar->getBackend()->getCalendarAPI();
		if (!($api instanceof BackendUtils\ICalendarAPICreate)) {
			throw new Exception('Backend doesn\'t support creating calendars!');
		}

		try {
			$calendar = $api->create($calendar);
		} catch (BackendUtils\Exception $ex) {
			\OC::$server->getLogger()->debug($ex->getMessage());
			throw Exception::fromException($ex);
		}

		$this->updater->propagate($backendId, $privateUri, $userId, $calendar);
		return $calendar;
	}


	/**
	 * Update a calendar
	 * @param \OCA\Calendar\ICalendar $newCalendar
	 * @return \OCA\Calendar\ICalendar
	 * @throws \OCA\Calendar\BusinessLayer\Exception
	 * if backend does not exist
	 * @throws \OCA\Calendar\BusinessLayer\Exception
	 * if backend is disabled
	 * @throws \OCA\Calendar\BusinessLayer\Exception
	 * if backend does not implement updating a calendar
	 */
	public function update(ICalendar $newCalendar) {
		$id = $newCalendar->getId();
		$backendId = $newCalendar->getBackend()->getId();
		$privateUri = $newCalendar->getPrivateUri();
		$userId = $newCalendar->getUserId();

		$oldCalendar = $this->find($id, $userId);

		$this->checkForIllegalChanges($newCalendar, $oldCalendar);
		$this->checkIsValid($newCalendar);

		$api = $newCalendar->getBackend()->getCalendarAPI();
		if ($api instanceof BackendUtils\ICalendarAPIUpdate) {
			try {
				$newCalendar = $api->update($newCalendar);
			} catch (BackendUtils\Exception $ex) {
				\OC::$server->getLogger()->debug($ex->getMessage());
				throw Exception::fromException($ex);
			}
		} else {
			if (!$this->areMinorChanges($newCalendar)) {
				throw new Exception('Backend doesn\'t support updating calendars!');
			}
		}

		$this->updater->propagate($backendId, $privateUri, $userId, $newCalendar);
		return $newCalendar;
	}


	/**
	 * Touch a calendar
	 * @param integer $id
	 * @param string $userId
	 * @throws \OCA\Calendar\BusinessLayer\Exception
	 * @return \OCA\Calendar\ICalendar
	 */
	public function touch($id, $userId) {
		$calendar = $this->find($id, $userId);
		$calendar->touch();

		return $this->update($calendar);
	}


	/**
	 * Delete a calendar
	 * @param \OCA\Calendar\ICalendar $calendar
	 * @throws \OCA\Calendar\BusinessLayer\Exception
	 */
	public function delete(ICalendar $calendar) {
		try {
			$api = $calendar->getBackend()->getCalendarAPI();
			if (!($api instanceof BackendUtils\ICalendarAPIDelete)) {
				throw new Exception(
					'Backend does not support deleting calendars!'
				);
			}

			$backendId = $calendar->getBackend()->getId();
			$privateUri = $calendar->getPrivateUri();
			$userId = $calendar->getUserId();
			$api->delete($privateUri, $userId);

			$this->updater->remove($backendId, $privateUri, $userId);
		} catch(BackendUtils\Exception $ex) {
			\OC::$server->getLogger()->debug($ex->getMessage());
			throw Exception::fromException($ex);
		}
	}


	/**
	 * @param ICalendar $n
	 * @param ICalendar $o
	 * @throws Exception
	 */
	private function checkForIllegalChanges(ICalendar $n, ICalendar $o) {
		if ($n->getUserId() !== $o->getUserId()) {
			throw new Exception('Not allowed to transfer calendar to another user!');
		}

		if ($n->getBackend()->getId() !== $o->getBackend()->getId()) {
			throw new Exception('Not allowed to transfer calendar to another backend!');
		}

		if ($n->getPublicUri() !== $o->getPublicUri()) {
			if ($this->cache->doesExist($n->getPublicUri(), $n->getUserId())) {
				throw new Exception('New URI is already assigned to another calendar!');
			}
		}
	}


	/**
	 * @param ICalendar $calendar
	 * @return boolean
	 */
	private function areMinorChanges(ICalendar $calendar) {
		$allowed = [
			'color',
			'components',
			'description',
			'displayname',
			'enabled',
			'order',
		];

		$updatedFields = array_keys($calendar->getUpdatedFields());
		$majorChanges = array_diff($updatedFields, $allowed);

		return empty($majorChanges);
	}
}
