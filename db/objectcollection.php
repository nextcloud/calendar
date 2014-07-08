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
namespace OCA\Calendar\Db;

use OCP\Calendar\IObject;

use \DateTime;
use OCP\Calendar\IObjectCollection;

class ObjectCollection extends Collection implements IObjectCollection {

	/**
	 * get a collection of entities within period
	 * @param DateTime $start
	 * @param DateTime $end
	 * @return ObjectCollection
	 */
	public function inPeriod(DateTime $start, DateTime $end) {
		$objectsInPeriod = new ObjectCollection();

		$this->iterate(function(IObject $object) use (&$objectsInPeriod, $start, $end) {
			if ($object->getRepeating() === true) {
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
	 * expand all entities of collection
	 * @param DateTime $start
	 * @param DateTime $end
	 * @return ObjectCollection
	 */
	public function expand(DateTime $start, DateTime $end) {
		$expandedObjects = new ObjectCollection();

		$this->iterate(function(IObject $object) use (&$expandedObjects, $start, $end) {
			if ($object->getRepeating() === true) {
				$vobject = $object->getVObject();
				$vobject->expand($start, $end);
				$object->setVObject($vobject);
				$expandedObjects->add($object);
			}
		});

		return $expandedObjects;
	}


	/**
	 * get a collection of all calendars owned by a certian user
	 * @param string $userId of owner
	 * @return ObjectCollection
	 */
	public function ownedBy($userId) {
		$objectsOwnedBy = new ObjectCollection();

		$this->iterate(function(IObject $object) use (&$objectsOwnedBy, $userId) {
			if ($object->getCalendar() instanceof Calendar &&
				$object->getCalendar()->getOwnerId() === $userId) {
				$objectsOwnedBy->add($object);
			}
		});

		return $objectsOwnedBy;
	}


	/**
	 * get a collection of all enabled calendars within collection
	 * @param integer $type
	 * @return ObjectCollection
	 */
	public function ofType($type) {
		$objectsOfType = new ObjectCollection();

		$this->iterate(function(IObject $object) use (&$objectsOfType, $type) {
			if ($object->getType() & $type) {
				$objectsOfType->add($object);
			}
		});

		return $objectsOfType;
	}


	/**
	 * @param array $idTable
	 */
	public function addGlobalIds(array $idTable) {
		$this->iterate(function(IObject &$object) use ($idTable) {
			$uri = $object->getUri();
			if (isset($idTable[$uri])) {
				$object->setId($idTable[$uri]);
			} else {
				//TODO how to handle this case
			}
		});
	}
}