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
use OCA\Calendar\ICalendar;

use OCA\Calendar\Db\Permissions;
use OCA\Calendar\Utility\CalendarUtility;

class CalendarRequestManager extends CalendarManager {

	/**
	 * Creates a new calendar from request
	 * @param \OCA\Calendar\ICalendar $calendar
	 * @param string $userId
	 * @return \OCA\Calendar\ICalendar
	 * @throws \OCA\Calendar\BusinessLayer\Exception
	 * if name exists already
	 * @throws \OCA\Calendar\BusinessLayer\Exception
	 * if backend does not exist
	 * @throws \OCA\Calendar\BusinessLayer\Exception
	 * if backend is disabled
	 */
	public function create(ICalendar $calendar, $userId) {
		$backends = $this->backends->getObjects();
		$setIfNull = array(
			'userId' => $userId,
			'ownerId' => $userId,
			'backend' => $backends[0],
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
	 * @param \OCA\Calendar\ICalendar $newCalendar
	 * @param \OCA\Calendar\ICalendar $oldCalendar
	 * @return \OCA\Calendar\ICalendar
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
	 * @param \OCA\Calendar\ICalendar $newCalendar
	 * @param \OCA\Calendar\ICalendar $oldCalendar
	 * @return \OCA\Calendar\ICalendar
	 */
	public function patch(ICalendar $newCalendar,
									 ICalendar $oldCalendar) {
		$newCalendar->setId($oldCalendar->getId());
		$newCalendar->setPrivateUri($oldCalendar->getPrivateUri());

		$this->resetReadOnlyProperties($newCalendar, $oldCalendar);

		if ($newCalendar->doesContainNullValues()) {
			$newCalendar = $oldCalendar->overwriteWith($newCalendar);
		}

		/** @var \OCA\Calendar\ICalendar $newCalendar */
		return parent::update($newCalendar);
	}


	/**
	 * Reset values that shall not be updated by the user directly
	 * @param \OCA\Calendar\ICalendar &$new
	 * @param \OCA\Calendar\ICalendar $old
	 */
	private function resetReadOnlyProperties(ICalendar &$new, ICalendar $old) {
		$new->setUserId($old->getUserId());
		$new->setOwnerId($old->getOwnerId());
		$new->setCruds($old->getCruds());
		$new->setCtag($old->getCtag());
	}


	/**
	 * Make sure either a publicUri or a displayname are set
	 * @param \OCA\Calendar\ICalendar $calendar
	 * @throws \OCA\Calendar\BusinessLayer\Exception
	 */
	private function checkUriOrDisplaynameExists(ICalendar $calendar) {
		$displayname = $calendar->getDisplayname();
		if (($displayname === null || trim($displayname) === '') &&
			$calendar->getPublicUri() === null) {
			throw new Exception(
				'Please enter a calendar-name',
				Http::STATUS_UNPROCESSABLE_ENTITY
			);
		}
	}


	/**
	 * Generate a unique public uri
	 * @param \OCA\Calendar\ICalendar $calendar
	 */
	private function generatePublicUri(ICalendar &$calendar) {
		CalendarUtility::generateURI($calendar, function($suggestedUri) use ($calendar) {
			return $this->cache->doesExist($suggestedUri, $calendar->getUserId());
		}, true);

		$calendar->setPrivateUri($calendar->getPublicUri());
	}
}