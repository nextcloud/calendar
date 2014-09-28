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

use OCP\AppFramework\Db\DoesNotExistException;
use OCP\AppFramework\Db\MultipleObjectsReturnedException;
use OCP\AppFramework\Http;
use OCP\Calendar\ICalendar;
use OCP\Calendar\ICalendarAPI;

use OCA\Calendar\Backend\Exception as BackendException;

class CalendarBusinessLayer extends BusinessLayer {

	/**
	 * @var \OCA\Calendar\Db\CalendarMapper
	 */
	protected $mapper;


	/**
	 * Find all calendars of a user
	 * @param string $userId
	 * @param integer $limit
	 * @param integer $offset
	 * @return \OCP\Calendar\ICalendarCollection
	 */
	public function findAll($userId, $limit=null, $offset=null) {
		return $this->mapper->findAll($userId, $limit, $offset);
	}


	/**
	 * List all calendars of a user
	 * @param string $userId
	 * @return array
	 */
	public function listAll($userId) {
		return $this->mapper->listAll($userId);
	}


	/**
	 * Find calendar by it's id
	 * @param int $id
	 * @param string $userId
	 * @return \OCP\Calendar\ICalendar
	 * @throws \OCA\Calendar\BusinessLayer\BusinessLayerException
	 * if backend does not exist
	 * @throws \OCA\Calendar\BusinessLayer\BusinessLayerException
	 * if backend is disabled
	 */
	public function find($id, $userId) {
		try {
			return $this->mapper->find($id, $userId);
		} catch (DoesNotExistException $ex) {
			throw BusinessLayerException::fromException($ex);
		} catch (MultipleObjectsReturnedException $ex) {
			throw BusinessLayerException::fromException($ex);
		}
	}


	/**
	 * Find calendar by it's uri
	 * @param string $publicUri
	 * @param string $userId
	 * @return \OCP\Calendar\ICalendar
	 * @throws \OCA\Calendar\BusinessLayer\BusinessLayerException
	 * if backend does not exist
	 * @throws \OCA\Calendar\BusinessLayer\BusinessLayerException
	 * if backend is disabled
	 */
	public function findByUri($publicUri, $userId) {
		try {
			return $this->mapper->findByPublicUri($publicUri, $userId);
		} catch (DoesNotExistException $ex) {
			throw BusinessLayerException::fromException($ex);
		} catch (MultipleObjectsReturnedException $ex) {
			throw BusinessLayerException::fromException($ex);
		}
	}


	/**
	 * Create a new calendar
	 * @param \OCP\Calendar\ICalendar $calendar
	 * @return \OCP\Calendar\ICalendar
	 * @throws \OCA\Calendar\BusinessLayer\BusinessLayerException
	 * if name exists already
	 * @throws \OCA\Calendar\BusinessLayer\BusinessLayerException
	 * if backend does not exist
	 * @throws \OCA\Calendar\BusinessLayer\BusinessLayerException
	 * if backend is disabled
	 */
	public function create(ICalendar $calendar) {
		try {
			$this->checkIsValid($calendar);

			$publicUri = $calendar->getPublicUri();
			$userId = $calendar->getUserId();
			if ($this->mapper->doesExist($publicUri, $userId)) {
				throw new BusinessLayerException(
					'URI is already assigned to another calendar!'
				);
			}

			$backend = $calendar->getBackend();
			if (!$backend->doesCalendarSupport(ICalendarAPI::CREATE)) {
				throw new BusinessLayerException(
					'Backend does not support creating calendars!'
				);
			}

			$api = $calendar->getBackend()->getCalendarAPI();
			$calendar = $api->create($calendar);
			$this->mapper->insert($calendar);

			return $calendar;
		} catch (BackendException $ex) {
			\OC::$server->getLogger()->debug($ex->getMessage());
			throw BusinessLayerException::fromException($ex);
		}
	}


	/**
	 * Update a calendar
	 * @param \OCP\Calendar\ICalendar $newCalendar
	 * @return \OCP\Calendar\ICalendar
	 * @throws \OCA\Calendar\BusinessLayer\BusinessLayerException
	 * if backend does not exist
	 * @throws \OCA\Calendar\BusinessLayer\BusinessLayerException
	 * if backend is disabled
	 * @throws \OCA\Calendar\BusinessLayer\BusinessLayerException
	 * if backend does not implement updating a calendar
	 */
	public function update(ICalendar $newCalendar) {
		try {
			$id = $newCalendar->getId();
			$userId = $newCalendar->getUserId();
			$oldCalendar = $this->find($id, $userId);

			$this->checkForIllegalChanges($newCalendar, $oldCalendar);
			$this->checkIsValid($newCalendar);

			$backend = $newCalendar->getBackend();
			if (!$backend->doesCalendarSupport(ICalendarAPI::UPDATE)) {
				throw new BusinessLayerException(
					'Backend does not support updating calendars!'
				);
			}

			$api = $newCalendar->getBackend()->getCalendarAPI();
			$newCalendar = $api->update($newCalendar);
			$this->mapper->update($newCalendar);

			return $newCalendar;
		} catch(BackendException $ex) {
			\OC::$server->getLogger()->debug($ex->getMessage());
			throw BusinessLayerException::fromException($ex);
		}
	}


	/**
	 * Touch a calendar
	 * @param integer $id
	 * @param string $userId
	 * @throws \OCA\Calendar\BusinessLayer\BusinessLayerException
	 * @return \OCP\Calendar\ICalendar
	 */
	public function touch($id, $userId) {
		$calendar = $this->find($id, $userId);
		$calendar->touch();
		return $this->update($calendar);
	}


	/**
	 * Delete a calendar
	 * @param \OCP\Calendar\ICalendar $calendar
	 * @throws \OCA\Calendar\BusinessLayer\BusinessLayerException
	 */
	public function delete(ICalendar $calendar) {
		try {
			$backend = $calendar->getBackend();
			if (!$backend->doesCalendarSupport(ICalendarAPI::DELETE)) {
				throw new BusinessLayerException(
					'Backend does not support deleting calendars!'
				);
			}

			$privateUri = $calendar->getPrivateUri();
			$userId = $calendar->getUserId();
			$backend->getCalendarAPI()->delete($privateUri, $userId);

			$this->mapper->delete($calendar);
		} catch(BackendException $ex) {
			\OC::$server->getLogger()->debug($ex->getMessage());
			throw BusinessLayerException::fromException($ex);
		}
	}


	/**
	 * @param ICalendar $newCalendar
	 * @param ICalendar $oldCalendar
	 * @throws BusinessLayerException
	 */
	private function checkForIllegalChanges(ICalendar $newCalendar,
											ICalendar $oldCalendar) {
		$newUserId = $newCalendar->getUserId();
		$oldUserId = $oldCalendar->getUserId();
		if ($newUserId !== $oldUserId) {
			throw new BusinessLayerException(
				'Not allowed to transfer calendar!'
			);
		}

		$newBackend = $newCalendar->getBackend()->getId();
		$oldBackend = $oldCalendar->getBackend()->getId();
		if ($newBackend !== $oldBackend) {
			throw new BusinessLayerException(
				'Not allowed to change calendar\'s backend'
			);
		}

		$newPublicUri = $newCalendar->getPublicUri();
		$oldPublicUri = $oldCalendar->getPublicUri();
		if ($newPublicUri !== $oldPublicUri) {
			if ($this->mapper->doesExist($newPublicUri, $newUserId)) {
				throw new BusinessLayerException(
					'New URI is already assigned to another calendar!'
				);
			}
		}
	}
}
