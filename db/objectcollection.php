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

use Sabre\VObject\Component\VCalendar;
use Sabre\VObject\Component\VEvent;
use Sabre\VObject\Component\VJournal;
use Sabre\VObject\Component\VTodo;
use OCA\Calendar\IObjectCollection;
use OCA\Calendar\IObject;
use OCA\Calendar\ITimezone;

use DateTime;

class ObjectCollection extends Collection implements IObjectCollection {

	/**
	 * {@inheritDoc}
	 */
	public function inPeriod(DateTime $start, DateTime $end) {
		$objectsInPeriod = new ObjectCollection();

		foreach ($this->objects as $object) {
			if ($object->getRepeating() === true) {
				$objectsInPeriod->add($object);
			} else {
				if ($object->isInTimeRange($start, $end)) {
					$objectsInPeriod->add($object);
				}
			}
		}

		return $objectsInPeriod;
	}


	/**
	 * {@inheritDoc}
	 */
	public function expand(DateTime $start, DateTime $end) {
		$expandedObjects = new ObjectCollection();

		foreach ($this->objects as $object) {
			if ($object->getRepeating() === true) {
				$vobject = $object->getVObject();
				$vobject->expand($start, $end);
				$object->setVObject($vobject);
				$expandedObjects->add($object);
			}
		}

		return $expandedObjects;
	}


	/**
	 * {@inheritDoc}
	 */
	public function ownedBy($userId) {
		$objectsOwnedBy = new ObjectCollection();

		foreach ($this->objects as $object) {
			if ($object->getCalendar() instanceof Calendar &&
				$object->getCalendar()->getOwnerId() === $userId) {
				$objectsOwnedBy->add($object);
			}
		}

		return $objectsOwnedBy;
	}


	/**
	 * {@inheritDoc}
	 */
	public function ofType($type) {
		$objectsOfType = new ObjectCollection();

		foreach ($this->objects as $object) {
			if ($object->getType() & $type) {
				$objectsOfType->add($object);
			}
		}

		return $objectsOfType;
	}


	/**
	 * {@inheritDoc}
	 */
	public function addGlobalIds(array $idTable) {
		foreach ($this->objects as $object) {
			$uri = $object->getUri();
			if (isset($idTable[$uri])) {
				$object->setId($idTable[$uri]);
			} else {
				//TODO how to handle this case
			}
		}
	}


	/**
	 * {@inheritDoc}
	 */
	public function getVObject() {
		$vCalendar = new VCalendar();

		foreach($this->objects as &$object) {
			if (!($object instanceof IObject) && !($object instanceof ITimezone)) {
				continue;
			}

			$vObject = $object->getVObject();
			foreach($vObject->children() as $child) {
				if ($child instanceof VEvent ||
					$child instanceof VJournal ||
					$child instanceof VTodo ||
					$child->name === 'VTIMEZONE') {
					$vCalendar->add($child);
				}
			}
		}

		return $vCalendar;
	}


	/**
	 * {@inheritDoc}
	 */
	public function getVObjects() {
		$vObjects = array();

		foreach($this->objects as &$object) {
			if (!($object instanceof IObject) && !($object instanceof ITimezone)) {
				continue;
			}

			$vObjects[] = $object->getVObject();
		}

		return $vObjects;
	}


	/**
	 * {@inheritDoc}
	 */
	public function listAll($type=ObjectType::ALL) {
		$objects = $this->ofType($type);

		$list = [];
		foreach($objects as $object) {
			/** @var IObject $object */
			$list[] = $object->getUri();
		}

		return $list;
	}
}