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

use OCP\AppFramework\Http;
use OCP\Calendar\Backend;
use OCP\Calendar\IBackend;
use OCP\Calendar\ICalendar;
use OCP\Calendar\BackendException;
use OCP\Calendar\DoesNotExistException;
use OCP\Calendar\MultipleObjectsReturnedException;

use OCA\Calendar\Db\Permissions;
use OCA\Calendar\Utility\CalendarUtility;

class CalendarBusinessLayer extends BackendCollectionBusinessLayer {

	/**
	 * @var \OCA\Calendar\Db\CalendarMapper
	 */
	protected $mapper;


	/**
	 * Find all calendars of a user
	 * @param string $userId
	 * @param integer $limit
	 * @param integer $offset
	 * @param boolean $activeBackendsOnly
	 * @throws \OCA\Calendar\BusinessLayer\BusinessLayerException
	 * @return \OCP\Calendar\ICalendarCollection
	 */
	public function findAll($userId, $limit=null, $offset=null,
							$activeBackendsOnly=true) {
		try {
			$calendars = $this->mapper->findAll($userId, $limit, $offset);

			if ($activeBackendsOnly) {
				$activeBackends = $this->backends->enabled();
				/** @var \OCP\Calendar\ICalendarCollection $calendars */
				$calendars = $calendars->filterByBackends($activeBackends);
			}

			return $calendars;
		} catch (BackendException $ex) {
			throw new BusinessLayerException($ex->getMessage());
		}
	}


	/**
	 * Get number of calendars
	 * @param string $userId
	 * @param boolean $activeBackendsOnly
	 * @throws \OCA\Calendar\BusinessLayer\BusinessLayerException
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
	 * Find all calendars of user stored on a certain backend
	 * @param string $backend
	 * @param string $userId
	 * @param integer $limit
	 * @param integer $offset
	 * @throws \OCA\Calendar\BusinessLayer\BusinessLayerException
	 * @return \OCP\Calendar\ICalendarCollection
	 */
	public function findAllOnBackend($backend, $userId,
									 $limit=null, $offset=null) {
		try {
			return $this->mapper->findAllOnBackend($backend, $userId,
				$limit, $offset);
		} catch (DoesNotExistException $ex) {
			throw new BusinessLayerException($ex->getMessage());
		} catch (BackendException $ex) {
			throw new BusinessLayerException($ex->getMessage());
		}
	}


	/**
	 * Get number of calendars on a certain backend
	 * @param string $backend
	 * @param string $userId
	 * @throws \OCA\Calendar\BusinessLayer\BusinessLayerException
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
	 * Find calendar
	 * @param string $publicUri
	 * @param string $userId
	 * @return \OCP\Calendar\ICalendar
	 * @throws \OCA\Calendar\BusinessLayer\BusinessLayerException
	 * if backend does not exist
	 * @throws \OCA\Calendar\BusinessLayer\BusinessLayerException
	 * if backend is disabled
	 */
	public function find($publicUri, $userId) {
		try {
			$calendar = $this->mapper->find($publicUri, $userId);
			$this->checkBackendEnabled($calendar->getBackend());

			return $calendar;
		} catch (DoesNotExistException $ex) {
			return $this->throwDoesNotExist($ex);
		} catch (MultipleObjectsReturnedException $ex) {
			return $this->throwMultipleExist($ex);
		}
	}


	/**
	 * Find calendar by it's id
	 * @param int $id
	 * @return \OCP\Calendar\ICalendar
	 * @throws \OCA\Calendar\BusinessLayer\BusinessLayerException
	 * if backend does not exist
	 * @throws \OCA\Calendar\BusinessLayer\BusinessLayerException
	 * if backend is disabled
	 */
	public function findById($id) {
		try {
			$calendar = $this->mapper->findById($id);
			$this->checkBackendEnabled($calendar->getBackend());

			return $calendar;
		} catch (DoesNotExistException $ex) {
			return $this->throwDoesNotExist($ex);
		} catch (MultipleObjectsReturnedException $ex) {
			return $this->throwMultipleExist($ex);
		}
	}


    /**
	 * Get whether or not a calendar exist
     * @param string $publicUri
     * @param string $userId
     * @return bool
     */
    public function doesExist($publicUri, $userId) {
		return $this->mapper->doesExist($publicUri, $userId);
	}


	/**
	 * Get whether or not a calendar allows a certain action
	 * @param string $publicUri
	 * @param string $userId
	 * @param integer $cruds
	 * @return bool
	 */
	public function doesAllow($publicUri, $userId, $cruds) {
		return $this->mapper->doesAllow($publicUri, $userId, $cruds);
	}


	/**
	 * Get whether or not a calendar can store a certain component
	 * @param string $publicUri
	 * @param string $userId
	 * @param integer $component
	 * @return bool
	 */
	public function doesSupport($publicUri, $userId, $component) {
		return $this->mapper->doesSupport($publicUri, $userId, $component);
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
			$backend = $calendar->getBackend();
			$publicUri = $calendar->getPublicUri();
			$userId = $calendar->getUserId();

			$this->checkIsValid($calendar);
			$this->checkBackendEnabled($backend);
			$this->checkDoesNotExist($publicUri, $userId);
			$this->checkBackendSupports($backend, Backend::CREATE_CALENDAR);

			/** @var \OCP\Calendar\IFullyQualifiedBackend $api */
			$api = $this->backends->find($backend)->getAPI();
			$api->createCalendar($calendar);
			$this->mapper->insert($calendar);

			return $calendar;
		} catch (BackendException $ex) {
			throw new BusinessLayerException($ex->getMessage());
		}
	}


	/**
	 * Creates a new calendar from request
	 * @param \OCP\Calendar\ICalendar $calendar
	 * @return \OCP\Calendar\ICalendar
	 * @throws \OCA\Calendar\BusinessLayer\BusinessLayerException
	 * if name exists already
	 * @throws \OCA\Calendar\BusinessLayer\BusinessLayerException
	 * if backend does not exist
	 * @throws \OCA\Calendar\BusinessLayer\BusinessLayerException
	 * if backend is disabled
	 */
	public function createFromRequest(ICalendar $calendar) {
		$userId = $this->api->getUserId();
		/** @var IBackend $firstBackend */
		$firstBackend = $this->backends->reset();
		$defaultBackend = $firstBackend->getBackend();

		$setIfNull = array(
			'userId' => $userId,
			'ownerId' => $userId,
			'backend' => $defaultBackend,
			'cruds' => Permissions::ALL,
			'ctag' => 0,
			'enabled' => true,
			'order' => 0
		);

		foreach($setIfNull as $property => $default) {
			$getter = 'get' . ucfirst($property);
			$setter = 'set' . ucfirst($property);

			if ($calendar->$getter() === null) {
				$calendar->$setter($default);
			}
		}

		$this->checkUriOrDisplaynameExists($calendar);
		$this->generatePublicUri($calendar);

		return $this->create($calendar);
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
			$oldCalendar = $this->findById($newCalendar->getId());

			$this->checkUsersEqual($newCalendar->getUserId(),
				$oldCalendar->getUserId());
			$this->checkBackendEnabled($newCalendar->getBackend());
			$this->checkBackendEnabled($oldCalendar->getBackend());
			$this->checkIsValid($newCalendar);

			if (!$this->doesNeedMove($newCalendar, $oldCalendar)) {
				return $this->updateProperties($newCalendar);
			} else {
				throw new BusinessLayerException('Action not supported yet!');
			}
		} catch(BackendException $ex) {
			$this->app->log($ex->getMessage(), 'debug');
			throw new BusinessLayerException($ex->getMessage());
		}
	}


	/**
	 * Update a calendar from request
	 * @param \OCP\Calendar\ICalendar $newCalendar
	 * @param \OCP\Calendar\ICalendar $oldCalendar
	 * @return \OCP\Calendar\ICalendar
	 */
	public function updateFromRequest(ICalendar $newCalendar,
									  ICalendar $oldCalendar) {
		$newCalendar->setId($oldCalendar->getId());
		$newCalendar->setPrivateUri($oldCalendar->getPrivateUri());

		$this->resetReadOnlyProperties($newCalendar, $oldCalendar);

		return $this->update($newCalendar);
	}


	/**
	 * Patch a calendar from request
	 * @param \OCP\Calendar\ICalendar $newCalendar
	 * @param \OCP\Calendar\ICalendar $oldCalendar
	 * @return \OCP\Calendar\ICalendar
	 */
	public function patchFromRequest(ICalendar $newCalendar,
									 ICalendar $oldCalendar) {
		$newCalendar->setId($oldCalendar->getId());
		$newCalendar->setPrivateUri($oldCalendar->getPrivateUri());

		$this->resetReadOnlyProperties($newCalendar, $oldCalendar);

		if ($newCalendar->doesContainNullValues()) {
			$newCalendar = $oldCalendar->overwriteWith($newCalendar);
		}

		/** @var \OCP\Calendar\ICalendar $newCalendar */
		return $this->update($newCalendar);
	}


	/**
	 * Update a calendar's properties
	 * @param \OCP\Calendar\ICalendar $calendar
	 * @return \OCP\Calendar\ICalendar
	 * @throws \OCA\Calendar\BusinessLayer\BusinessLayerException
	 */
	private function updateProperties(ICalendar $calendar) {
		try {
			$backend = $calendar->getBackend();

			if ($this->doesBackendSupport($backend, Backend::UPDATE_CALENDAR)) {
				/** @var \OCP\Calendar\IFullyQualifiedBackend $api */
				$api = $this->backends->find($backend)->getAPI();
				$api->updateCalendar($calendar);
			}

			$this->mapper->update($calendar);

			return $calendar;
		} catch(BackendException $ex) {
			throw new BusinessLayerException($ex->getMessage(), $ex->getCode(),
				$ex);
		}
	}


	/**
	 * Move a calendar to another backend
	 * @param \OCP\Calendar\ICalendar $newCalendar
	 * @param \OCP\Calendar\ICalendar $oldCalendar
	 * @return \OCP\Calendar\ICalendar
	 * @throws \OCA\Calendar\BusinessLayer\BusinessLayerException
	 *
	private function move(ICalendar $newCalendar, ICalendar $oldCalendar) {
	}*/


	/**
	 * Touch a calendar
	 * @param string $publicUri
	 * @param string $userId
	 * @throws \OCA\Calendar\BusinessLayer\BusinessLayerException
	 * @return \OCP\Calendar\ICalendar
	 */
	public function touch($publicUri, $userId) {
		try {
			$calendar = $this->find($publicUri, $userId);
			$calendar->touch();
			$calendar = $this->update($calendar);

			return $calendar;
		} catch(BackendException $ex) {
			throw new BusinessLayerException($ex->getMessage());
		}
	}


	/**
	 * Delete a calendar
	 * @param \OCP\Calendar\ICalendar $calendar
	 * @throws \OCA\Calendar\BusinessLayer\BusinessLayerException
	 */
	public function delete(ICalendar $calendar) {
		try {
			$backend = $calendar->getBackend();
			$privateUri = $calendar->getPrivateUri();
			$userId = $calendar->getUserId();

			$this->checkBackendEnabled($backend);
			$this->checkBackendSupports($backend, Backend::DELETE_CALENDAR);

			/** @var \OCP\Calendar\IFullyQualifiedBackend $api */
			$api = $this->backends->find($backend)->getAPI();
			$api->deleteCalendar($privateUri, $userId);
			$this->mapper->delete($calendar);
		} catch(BackendException $ex) {
			throw new BusinessLayerException($ex->getMessage());
		}
	}


	/**
	 * Get whether or not a calendar needs a move
	 * @param \OCP\Calendar\ICalendar $newCalendar
	 * @param \OCP\Calendar\ICalendar $oldCalendar
	 * @return bool
	 */
	private function doesNeedMove(ICalendar $newCalendar,
								  ICalendar $oldCalendar) {
		return (($newCalendar->getBackend() !== $oldCalendar->getBackend()) &&
			!$this->doesExist($newCalendar->getPublicUri(),
							  $newCalendar->getUserId()) ||
			$newCalendar->getUserId() !== $oldCalendar->getUserId());
	}


	/**
	 * Reset values that shall not be updated by the user directly
	 * @param \OCP\Calendar\ICalendar &$newCalendar
	 * @param \OCP\Calendar\ICalendar &$oldCalendar
	 */
	private function resetReadOnlyProperties(ICalendar &$newCalendar,
											 ICalendar &$oldCalendar) {
		$newCalendar->setUserId($oldCalendar->getUserId());
		$newCalendar->setOwnerId($oldCalendar->getOwnerId());
		$newCalendar->setCruds($oldCalendar->getCruds());
		$newCalendar->setCtag($oldCalendar->getCruds());
	}


	/**
	 * Make sure either a publicUri or a displayname are set
	 * @param \OCP\Calendar\ICalendar $calendar
	 * @throws \OCA\Calendar\BusinessLayer\BusinessLayerException
	 */
	private function checkUriOrDisplaynameExists(ICalendar $calendar) {
		if (($calendar->getDisplayname() === null ||
			trim($calendar->getDisplayname()) === '') &&
			$calendar->getPublicUri() === null) {
			throw new BusinessLayerException(
				'Please enter a calendar-name',
				Http::STATUS_UNPROCESSABLE_ENTITY
			);
		}
	}


	/**
	 * Generate a unique public uri
	 * @param \OCP\Calendar\ICalendar $calendar
	 */
	private function generatePublicUri(ICalendar &$calendar) {
		if ($calendar->getPublicUri() === null) {
			$suggestedURI = mb_strtolower($calendar->getDisplayname());
		} else {
			$suggestedURI = $calendar->getPublicUri();
		}
		$suggestedURI = CalendarUtility::slugify($suggestedURI);

		while($this->doesExist($suggestedURI, $calendar->getUserId())) {
			$newSuggestedURI = CalendarUtility::suggestURI($suggestedURI);

			if ($newSuggestedURI === $suggestedURI) {
				break;
			}
			$suggestedURI = $newSuggestedURI;
		}

		$calendar->setPublicUri($suggestedURI);
		$calendar->setPrivateUri($suggestedURI);
	}


	/**
	 * Throw a BusinessLayerException based upon a DoesNotExistException
	 * @param DoesNotExistException $ex
	 * @return null
	 * @throws \OCA\Calendar\BusinessLayer\BusinessLayerException
	 */
	private function throwDoesNotExist(DoesNotExistException $ex) {
		throw new BusinessLayerException(
			'No matching calendar entry found!',
			Http::STATUS_NOT_FOUND, $ex
		);
	}


	/**
	 * Throw a BusinessLayerException based upon
	 * a MultipleObjectsReturnedException
	 * @param MultipleObjectsReturnedException $ex
	 * @return null
	 * @throws \OCA\Calendar\BusinessLayer\BusinessLayerException
	 */
	private function throwMultipleExist(MultipleObjectsReturnedException $ex) {
		throw new BusinessLayerException(
			'Multiple matching calendar entries found!',
			Http::STATUS_INTERNAL_SERVER_ERROR, $ex
		);
	}
}
