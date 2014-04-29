<?php
/**
 * Copyright (c) 2014 Georg Ehrke <oc.list@georgehrke.com>
 * This file is licensed under the Affero General Public License version 3 or
 * later.
 * See the COPYING-README file.
 */
namespace OCA\Calendar\Db;

use \DateTime;

class ObjectCollection extends Collection {

	/**
	 * @brief get a collection of entities within period
	 * @param DateTime $start
	 * @param DateTime $end
	 * @return ObjectCollection
	 */
	public function inPeriod(DateTime $start, DateTime $end) {
		$objectsInPeriod = new ObjectCollection();

		$this->iterate(function($object) use (&$objectsInPeriod, $start, $end) {
			if ($object->isRepeating() === true) {
				$objectsInPeriod->add($object);
			} else {
				if ($object->isInTimeRange($start, $end)) {
					$objectsInPeriod->add($object);
				}
			}
		});

		return $objectsInPeriod;
	}


	/**
	 * @brief expand all entities of collection
	 * @param DateTime $start
	 * @param DateTime $end
	 * @return ObjectCollection
	 */
	public function expand(DateTime $start, DateTime $end) {
		$expandedObjects = new ObjectCollection();

		$this->iterate(function($object) use (&$expandedObjects, $start, $end) {
			if ($object->isRepeating() === true) {
				$object->vobject->expand($start, $end);
				$expandedObjects->add($object);
			}
		});

		return $expandedObjects;
	}


	/**
	 * @brief get a collection of all calendars owned by a certian user
	 * @param string userId of owner
	 * @return ObjectCollection
	 */
	public function ownedBy($userId) {
		$objectsOwnedBy = new ObjectCollection();

		$this->iterate(function($object) use (&$objectsOwnedBy, $userId) {
			if ($object->calendar instanceof Calendar &&
				$object->calendar->getOwner() === $userId) {
				$objectsOwnedBy->add($object);
			}
		});

		return $objectsOwnedBy;
	}


	/**
	 * @brief get a collection of all enabled calendars within collection
	 * @return ObjectCollection
	 */
	public function ofType($type) {
		$objectsOfType = new ObjectCollection();

		$this->iterate(function($object) use (&$objectsOfType, $type) {
			if ($object->getType() & $type) {
				$objectsOfType->add($object);
			}
		});

		return $objectsOfType;
	}
}