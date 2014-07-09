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
use OCP\Calendar\IFullyQualifiedBackend;
use OCP\Calendar\ICalendar;
use OCP\Calendar\ICalendarCollection;
use OCP\Calendar\BackendException;
use OCP\Calendar\DoesNotExistException;
use OCP\Calendar\MultipleObjectsReturnedException;

use OCA\Calendar\Db\CalendarMapper;
use OCA\Calendar\Db\Permissions;
use OCA\Calendar\Utility\CalendarUtility;

class CalendarBusinessLayer extends BackendCollectionBusinessLayer {

	/**
	 * @var CalendarMapper
	 */
	protected $mapper;


	/**
	 * Find all calendars of a user
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
				/** @var ICalendarCollection $calendars */
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
	 * Find all calendars of user stored on a certain backend
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
	 * Get number of calendars on a certain backend
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
	 * Find calendar
	 * @param string $publicUri
	 * @param string $userId
	 * @throws BusinessLayerException if backend does not exist
	 * @throws BusinessLayerException if backend is disabled
	 * @return ICalendar
	 */
	public function find($publicUri, $userId) {
		try {
			$calendar = $this->mapper->find($publicUri, $userId);
			$this->checkBackendEnabled($calendar->getBackend());

			return $calendar;
		} catch (DoesNotExistException $ex) {
			$msg  = 'CalendarBusinessLayer::find(): User Error: ';
			$msg .= 'No matching calendar entry found!';
			throw new BusinessLayerException($msg, Http::STATUS_NOT_FOUND, $ex);
		} catch (MultipleObjectsReturnedException $ex) {
			$msg  = 'CalendarBusinessLayer::find(): Internal Error: ';
			$msg .= 'Multiple matching calendar entries found!';
			throw new BusinessLayerException($msg, Http::STATUS_INTERNAL_SERVER_ERROR, $ex);
		}
	}


	/**
	 * Find calendar $calendarId of user $userId
	 * @param int $id
	 * @param string $userId
	 * @throws BusinessLayerException if backend does not exist
	 * @throws BusinessLayerException if backend is disabled
	 * @return ICalendar
	 */
	public function findById($id, $userId) {
		try {
			return $this->mapper->findById($id, $userId);
		} catch (DoesNotExistException $ex) {
			$msg = 'No matching calendar entry found!';
			throw new BusinessLayerException($msg, Http::STATUS_NOT_FOUND, $ex);
		} catch (MultipleObjectsReturnedException $ex) {
			$msg = 'Multiple matching calendar entries found!';
			throw new BusinessLayerException($msg, Http::STATUS_INTERNAL_SERVER_ERROR, $ex);
		}
	}


    /**
	 * Get whether or not a calendar exist
     * @param string $publicUri
     * @param string $userId
     * @return bool
     * @throws BusinessLayerException
     */
    public function doesExist($publicUri, $userId) {
		return $this->mapper->doesExist($publicUri, $userId);
	}


	/**
	 * Get whether or not a calendar allows a certain action
	 * @param integer $cruds
	 * @param string $publicUri
	 * @param string $userId
	 * @return bool
	 * @throws BusinessLayerException
	 */
	public function doesAllow($cruds, $publicUri, $userId) {
		return $this->mapper->doesAllow($cruds, $publicUri, $userId);
	}


	/**
	 * Get whether or not a calendar can store a certain component
	 * @param integer $component
	 * @param string $publicUri
	 * @param string $userId
	 * @return bool
	 * @throws BusinessLayerException
	 */
	public function doesSupport($component, $publicUri, $userId) {
		return $this->mapper->doesSupport($component, $publicUri, $userId);
	}


	/**
	 * Create a new calendar
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
			$publicUri = $calendar->getPublicUri();
			$userId = $calendar->getUserId();

			$this->checkIsValid($calendar);
			$this->checkBackendEnabled($backend);
			$this->checkDoesNotExist($publicUri, $userId);
			$this->checkBackendSupports($backend, Backend::CREATE_CALENDAR);

			/** @var IFullyQualifiedBackend $api */
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
	 * @param ICalendar $calendar
	 * @return ICalendar
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
	 * @param ICalendar $newCalendar
	 * @param string $oldPublicUri
	 * @param string $oldUserId
	 * @throws BusinessLayerException if backend does not exist
	 * @throws BusinessLayerException if backend is disabled
	 * @throws BusinessLayerException if backend does not implement updating a calendar
	 * @return ICalendar
	 */
	public function update(ICalendar $newCalendar, $oldPublicUri, $oldUserId) {
		try {
			$oldCalendar = $this->find($oldPublicUri, $oldUserId);

			$this->checkUsersEqual($newCalendar->getUserId(), $oldCalendar->getUserId());
			$this->checkBackendEnabled($newCalendar->getBackend());
			$this->checkBackendEnabled($oldCalendar->getBackend());
			$this->checkIsValid($newCalendar);

			if (!$this->doesNeedTransfer($newCalendar, $oldCalendar) &&
				!$this->doesNeedMove($newCalendar, $oldCalendar) &&
				!$this->doesNeedMerge($newCalendar, $oldCalendar)) {
				return $this->updateProperties($newCalendar);
			} else {
				throw new BusinessLayerException('Action not supported yet');
			}
		} catch(BackendException $ex) {
			$this->app->log($ex->getMessage(), 'debug');
			throw new BusinessLayerException($ex->getMessage());
		}
	}


	/**
	 * Update a new calendar from request
	 * @param ICalendar $newCalendar
	 * @param string $oldPublicUri
	 * @param string $oldUserId
	 * @throws BusinessLayerException if backend does not exist
	 * @throws BusinessLayerException if backend is disabled
	 * @throws BusinessLayerException if backend does not implement updating a calendar
	 * @return ICalendar
	 */
	public function updateFromRequest(ICalendar $newCalendar, $oldPublicUri, $oldUserId) {
		$oldCalendar = $this->find($oldPublicUri, $oldUserId);
		return $this->updateFromRequestByCalendar($oldCalendar, $newCalendar);
	}


	/**
	 * Update a calendar from request by it's id
	 * @param ICalendar $newCalendar
	 * @param int $oldCalendarId
	 * @param string $oldUserId
	 * @throws BusinessLayerException if backend does not exist
	 * @throws BusinessLayerException if backend is disabled
	 * @throws BusinessLayerException if backend does not implement updating a calendar
	 * @return ICalendar
	 */
	public function updateFromRequestById(ICalendar $newCalendar, $oldCalendarId, $oldUserId) {
		$oldCalendar = $this->findById($oldCalendarId, $oldUserId);
		return $this->updateFromRequestByCalendar($oldCalendar, $newCalendar);
	}


	/**
	 * @param ICalendar $newCalendar
	 * @param ICalendar $oldCalendar
	 * @return ICalendar
	 */
	public function updateFromRequestByCalendar(ICalendar $newCalendar, ICalendar $oldCalendar) {
		$newCalendar->setId($oldCalendar->getId());
		$newCalendar->setPrivateUri($oldCalendar->getPrivateUri());

		$this->resetReadOnlyProperties($newCalendar, $oldCalendar);

		return $this->update($newCalendar, $oldCalendar->getPublicUri(), $oldCalendar->getUserId());
	}


	/**
	 * Patch a calendar from request
	 * @param ICalendar $newCalendar
	 * @param string $oldPublicUri
	 * @param string $oldUserId
	 * @throws BusinessLayerException if backend does not exist
	 * @throws BusinessLayerException if backend is disabled
	 * @throws BusinessLayerException if backend does not implement updating a calendar
	 * @return ICalendar
	 */
	public function patchFromRequest(ICalendar $newCalendar, $oldPublicUri, $oldUserId) {
		$oldCalendar = $this->find($oldPublicUri, $oldUserId);
		return $this->patchFromRequestByCalendar($newCalendar, $oldCalendar);
	}


	/**
	 * Patch a calendar from request by it's id
	 * @param ICalendar $newCalendar
	 * @param int $oldCalendarId
	 * @param string $oldUserId
	 * @throws BusinessLayerException if backend does not exist
	 * @throws BusinessLayerException if backend is disabled
	 * @throws BusinessLayerException if3 backend does not implement updating a calendar
	 * @return ICalendar
	 */
	public function patchFromRequestById(ICalendar $newCalendar, $oldCalendarId, $oldUserId) {
		$oldCalendar = $this->findById($oldCalendarId, $oldUserId);
		return $this->patchFromRequestByCalendar($newCalendar, $oldCalendar);
	}


	/**
	 * Patch a calendar from an old calendar object
	 * @param ICalendar $newCalendar
	 * @param ICalendar $oldCalendar
	 * @return ICalendar
	 */
	private function patchFromRequestByCalendar(ICalendar $newCalendar, ICalendar $oldCalendar) {
		$newCalendar->setId($oldCalendar->getId());
		$newCalendar->setPrivateUri($oldCalendar->getPrivateUri());

		$this->resetReadOnlyProperties($newCalendar, $oldCalendar);

		if ($newCalendar->doesContainNullValues()) {
			$newCalendar = $oldCalendar->overwriteWith($newCalendar);
		}

		/** @var ICalendar $newCalendar */
		return $this->update($newCalendar, $oldCalendar->getPublicUri(), $oldCalendar->getUserId());
	}


	/**
	 * Update a calendar's properties
	 * @param ICalendar $calendar
	 * @return ICalendar
	 * @throws BusinessLayerException
	 */
	private function updateProperties(ICalendar $calendar) {
		try {
			$backend = $calendar->getBackend();

			if ($this->doesBackendSupport($backend, Backend::UPDATE_CALENDAR)) {
				/** @var IFullyQualifiedBackend $api */
				$api = $this->backends->find($backend)->getAPI();
				$api->updateCalendar($calendar);
			}

			$this->mapper->update($calendar);
			return $calendar;
		} catch(BackendException $ex) {
			throw new BusinessLayerException($ex->getMessage(), $ex->getCode(), $ex);
		}
	}


	/**
	 * Merge a calendar with another one
	 * @param ICalendar $newCalendar
	 * @param ICalendar $oldCalendar
	 * @return ICalendar
	 * @throws BusinessLayerException
	 *
	private function merge(ICalendar $newCalendar, ICalendar $oldCalendar) {
		throw new BusinessLayerException('Merging calendars not supported yet!');
	}


	/**
	 * Move a calendar to another backend
	 * @param ICalendar $newCalendar
	 * @param ICalendar $oldCalendar
	 * @return ICalendar
	 * @throws BusinessLayerException
	 *
	private function move(ICalendar $newCalendar, ICalendar $oldCalendar) {
		throw new BusinessLayerException('Moving calendars not supported yet');
	}


	/**
	 * Transfer a calendar to another user
	 * @param ICalendar $newCalendar
	 * @param ICalendar $oldCalendar
	 * @return ICalendar
	 * @throws BusinessLayerException
	 *
	private function transfer(ICalendar $newCalendar, ICalendar $oldCalendar) {
		throw new BusinessLayerException('Transferring calendars not supported yet');
	}*/


	/**
	 * Touch a calendar
	 * @param string $publicUri
	 * @param string $userId
	 * @throws BusinessLayerException
	 * @return ICalendar
	 */
	public function touch($publicUri, $userId) {
		try {
			$calendar = $this->find($publicUri, $userId);
			$calendar->touch();
			$calendar = $this->update($calendar, $publicUri, $userId);

			return $calendar;
		} catch(BackendException $ex) {
			throw new BusinessLayerException($ex->getMessage());
		}
	}


	/**
	 * delete a calendar
	 * @param ICalendar $calendar
	 * @throws BusinessLayerException
	 */
	public function delete(ICalendar $calendar) {
		try {
			$backend = $calendar->getBackend();
			$privateUri = $calendar->getPrivateUri();
			$userId = $calendar->getUserId();

			$this->checkBackendEnabled($backend);
			$this->checkBackendSupports($backend, Backend::DELETE_CALENDAR);

			/** @var IFullyQualifiedBackend $api */
			$api = $this->backends->find($backend)->getAPI();
			$api->deleteCalendar($privateUri, $userId);
			$this->mapper->delete($calendar);
		} catch(BackendException $ex) {
			throw new BusinessLayerException($ex->getMessage());
		}
	}


	/**
	 * Get whether or not a calendar needs a transfer
	 * @param ICalendar $newCalendar
	 * @param ICalendar $oldCalendar
	 * @return bool
	 */
	private function doesNeedTransfer(ICalendar $newCalendar, ICalendar $oldCalendar) {
		return ($newCalendar->getUserId() !== $oldCalendar->getUserId());
	}


	/**
	 * Get whether or not a calendar needs a move
	 * @param ICalendar $newCalendar
	 * @param ICalendar $oldCalendar
	 * @return bool
	 */
	private function doesNeedMove(ICalendar $newCalendar, ICalendar $oldCalendar) {
		return (($newCalendar->getBackend() !== $oldCalendar->getBackend()) &&
			!$this->doesExist($newCalendar->getPublicUri(), $newCalendar->getUserId()));
	}


	/**
	 * Get whether or not a calendar needs a merge
	 * @param ICalendar $newCalendar
	 * @param ICalendar $oldCalendar
	 * @return bool
	 */
	private function doesNeedMerge(ICalendar $newCalendar, ICalendar $oldCalendar) {
		return (($newCalendar->getBackend() !== $oldCalendar->getBackend()) &&
			$this->doesExist($newCalendar->getPublicUri(), $newCalendar->getUserId()));
	}


	/**
	 * @param ICalendar &$newCalendar
	 * @param ICalendar &$oldCalendar
	 */
	private function resetReadOnlyProperties(ICalendar &$newCalendar, ICalendar &$oldCalendar) {
		$newCalendar->setUserId($oldCalendar->getUserId());
		$newCalendar->setOwnerId($oldCalendar->getOwnerId());
		$newCalendar->setCruds($oldCalendar->getCruds());
		$newCalendar->setCtag($oldCalendar->getCruds());
	}


	/**
	 * @param ICalendar $calendar
	 * @throws BusinessLayerException
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
	 * @param ICalendar $calendar
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
}