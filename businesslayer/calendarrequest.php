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
use OCP\Calendar\IBackend;
use OCP\Calendar\ICalendar;
use OCA\Calendar\Db\Permissions;
use OCA\Calendar\Utility\CalendarUtility;

class CalendarRequestBusinessLayer extends CalendarBusinessLayer {

	/**
	 * Creates a new calendar from request
	 * @param \OCP\Calendar\ICalendar $calendar
	 * @param string $userId
	 * @return \OCP\Calendar\ICalendar
	 * @throws \OCA\Calendar\BusinessLayer\BusinessLayerException
	 * if name exists already
	 * @throws \OCA\Calendar\BusinessLayer\BusinessLayerException
	 * if backend does not exist
	 * @throws \OCA\Calendar\BusinessLayer\BusinessLayerException
	 * if backend is disabled
	 */
	public function create(ICalendar $calendar, $userId) {
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

		return parent::create($calendar);
	}


	/**
	 * Update a calendar from request
	 * @param \OCP\Calendar\ICalendar $newCalendar
	 * @param \OCP\Calendar\ICalendar $oldCalendar
	 * @return \OCP\Calendar\ICalendar
	 */
	public function update(ICalendar $newCalendar,
									  ICalendar $oldCalendar) {
		$newCalendar->setId($oldCalendar->getId());
		$newCalendar->setPrivateUri($oldCalendar->getPrivateUri());

		$this->resetReadOnlyProperties($newCalendar, $oldCalendar);

		return parent::update($newCalendar);
	}


	/**
	 * Patch a calendar from request
	 * @param \OCP\Calendar\ICalendar $newCalendar
	 * @param \OCP\Calendar\ICalendar $oldCalendar
	 * @return \OCP\Calendar\ICalendar
	 */
	public function patch(ICalendar $newCalendar,
									 ICalendar $oldCalendar) {
		$newCalendar->setId($oldCalendar->getId());
		$newCalendar->setPrivateUri($oldCalendar->getPrivateUri());

		$this->resetReadOnlyProperties($newCalendar, $oldCalendar);

		if ($newCalendar->doesContainNullValues()) {
			$newCalendar = $oldCalendar->overwriteWith($newCalendar);
		}

		/** @var \OCP\Calendar\ICalendar $newCalendar */
		return parent::update($newCalendar);
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

}