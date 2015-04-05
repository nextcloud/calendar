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
namespace OCA\Calendar\Backend\Sharing;

use OCA\Calendar\Backend as BackendUtils;
use OCA\Calendar\IBackend;
use OCA\Calendar\ICalendar;
use OCA\Calendar\Share\Types as ShareTypes;

use OCP\Share;

class Calendar extends Sharing implements BackendUtils\ICalendarAPI,
	BackendUtils\ICalendarAPIDelete {

	/**
	 * @var IBackend
	 */
	private $backend;


	/**
	 * @param IBackend $backend
	 */
	public function __construct(IBackend $backend) {
		$this->backend = $backend;
	}


	/**
	 * {@inheritDoc}
	 */
	public function find($privateUri, $userId) {
		// different formats for privateUri
		// calendar::$privateUri
		// object::$userId
		list($itemType, $itemTarget) = explode('::', $privateUri, 1);

		if ($itemType === 'calendar') {
			return Share::getItemSharedWith($itemType, $itemTarget, ShareTypes::ENTITY);
		} elseif ($itemType === 'object') {
			$calendars = Share::getItemsShared($itemType, ShareTypes::GROUPED);
			if (!isset($calendars[$itemTarget])) {
				throw new BackendUtils\DoesNotExistException();
			}

			return $calendars[$itemTarget]['calendar'];
		} else {
			throw new BackendUtils\DoesNotExistException();
		}
	}


	/**
	 * {@inheritDoc}
	 */
	public function findAll($userId, $limit=null, $offset=null) {
		/** @var \OCA\Calendar\ICalendarCollection $calendars */
		$calendars = Share::getItemsSharedWithUser('calendar', $userId, ShareTypes::ENTITY);
		$objectCalendars = Share::getItemsShared('object', ShareTypes::ENTITY);

		foreach ($objectCalendars as $objectCalendar) {
			$calendars->add($objectCalendar['calendar']);
		}

		return $calendars;
	}


	/**
	 * {@inheritDoc}
	 */
	public function listAll($userId) {
		return array_merge(
			Share::getItemsSharedWithUser('calendar', $userId, ShareTypes::ENTITYLIST),
			Share::getItemsShared('object', ShareTypes::GROUPEDLIST)
		);
	}


	/**
	 * {@inheritDoc}
	 */
	public function hasUpdated(ICalendar $calendar) {
		$privateUri = $calendar->getPrivateUri();
		$userId = $calendar->getUserId();

		$oldCalendar = $this->find($privateUri, $userId);
		return ($calendar->getCtag() !== $oldCalendar->getCtag());
	}


	/**
	 * {@inheritDoc}
	 */
	public function delete($privateUri, $userId) {
		list($itemType, $itemTarget) = explode('::', $privateUri, 1);

		if ($itemType === 'calendar') {
			return Share::unshareFromSelf('calendar', $itemTarget);
		} elseif ($itemType === 'object') {
			$calendars = Share::getItemsShared($itemType, ShareTypes::GROUPED);
			/** @var ICalendar $calendar */
			foreach($calendars as $calendar) {
				if ($calendar->getPrivateUri() !== $privateUri) {
					continue;
				}
				$objects = $calendar['objects'];
				foreach($objects as $object) {
					Share::unshareFromSelf('object', $object['shareItem']['item_source']);
				}
			}
			return true;
		} else {
			throw new BackendUtils\DoesNotExistException();
		}
	}
}