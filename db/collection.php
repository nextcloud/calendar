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

use OCP\Calendar\ICollection;
use OCP\Calendar\IEntity;

use OCA\Calendar\Sabre\VObject\Component\VCalendar;
use OCA\Calendar\Sabre\VObject\Component\VEvent;
use OCA\Calendar\Sabre\VObject\Component\VJournal;
use OCA\Calendar\Sabre\VObject\Component\VTodo;

abstract class Collection implements ICollection {

	/**
	 * array containing all entities
	 * @var array
	 */
	protected $objects=array();


	/**
	 * constructor
	 * @param mixed (array|Entity|Collection) $objects
	 */
	public function __construct($objects=null) {
		if ($objects instanceof IEntity) {
			$this->add($objects);
		} elseif ($objects instanceof ICollection) {
			$this->addCollection($objects);
		} elseif (is_array($objects)) {
			$this->addObjects($objects);
		}
	}


	/**
	 * add entity to collection
	 * @param IEntity $object entity to be added
	 * @param integer $nth insert at index, if not set, entity will be appended
	 * @return $this
	 */
	public function add(IEntity $object, $nth=null) {
		if ($nth === null) {
			$this->objects[$this->count()] = $object;
		} else {
			$objects = array_slice($this->objects, 0, $nth, true);
			$objects = array_merge($objects, array($object));
			$objects = array_merge($objects, array_slice($this->objects, $nth, $this->count(), true));

			$this->objects = $objects;
		}

		return $this;
	}


	/**
	 * add entities to collection
	 * @param ICollection $collection collection of entities to be added
	 * @param integer $nth insert at index, if not set, collection will be appended
	 * @return integer
	 */
	public function addCollection(ICollection $collection, $nth=null) {
		if ($nth === null) {
			$nth = $this->count();
		}

		$objects  = array_slice($this->objects, 0, $nth, true);
		$objects += $collection->getObjects();
		$objects += array_slice($this->objects, $nth, $this->count() - $collection->count(), true);

		$this->objects = $objects;
		return $this;
	}


	/**
	 * add objects to collection
	 * @param array $array
	 * @param integer $nth insert at index, if not set, objects will be appended
	 * @return integer
	 */
	protected function addObjects(array $array, $nth=null) {
		if ($nth === null) {
			$this->objects += $array;
		} else {
			$objects  = array_slice($this->objects, 0, $nth, true);
			$objects += $array;
			$objects += array_slice($this->objects, $nth, $this->count() - count($array), true);

			$this->objects = $objects;
		}

		return $this;
	}


	/**
	 * updates an entity in collection
	 * @param IEntity $entity
	 */
	public function update(IEntity $entity) {
		$entityId = strval($entity);

		for ($i = 0; $i < $this->count(); $i++) {
			$objectId = strval($this->objects[$i]);

			if ($entityId === $objectId) {
				$this->objects[$i] = $entity;
			}
		}
	}


	/**
	 * remove entity from collection
	 * @param integer $nth remove nth element, if not set, current element will be removed
	 * @return $this
	 */
	public function remove($nth=null) {
		if ($nth === null){
			$nth = $this->key();
		}

		$objects = $this->objects;
		unset($objects[$nth]);
		$objects = array_values($objects);

		$this->objects = $objects;
		return $this;
	}


	/**
	 * remove entity by it's information
	 * @param IEntity $entity
	 * @return $this
	 */
	public function removeByEntity(IEntity $entity) {
		if (in_array($entity, $this->objects)) {
			for($i = 0; $i < $this->count(); $i++) {
				//use of (==) instead of (===) is intended!
				//see http://php.net/manual/en/language.oop5.object-comparison.php
				if ($this->objects[$i] == $entity) {
					$this->remove($i--);
				}
			}
		}

		return $this;
	}


	/**
	 * remove entities by a single property
	 * @param string $key key for property
	 * @param mixed $value value to be set
	 * @return $this;
	 */
	public function removeByProperty($key, $value) {
		$getter = 'get' . ucfirst($key);

		for($i = 0; $i < $this->count(); $i++) {
			if (is_callable(array($this->objects[$i], $getter)) &&
				$this->objects[$i]->{$getter}() === $value) {
				$this->remove($i--);
			}
		}

		return $this;
	}


	/**
	 * get number of elements within collection
	 * @return integer 
	 */
	public function count() {
		return count($this->objects);
	}


	/**
	 * get current entity 
	 * @return Entity
	 */
	public function current() {
		return current($this->objects);
	}


	/**
	 * get num index of current entity
	 * @return integer 
	 */
	public function key() {
		return key($this->objects);
	}


	/**
	 * goto next entity and get it
	 * @return Entity
	 */
	public function next() {
		return next($this->objects);
	}


	/**
	 * goto previous entity and get it
	 * @return Entity
	 */
	public function prev() {
		return prev($this->objects);
	}


	/**
	 * goto first entity and get it
	 * @return Entity
	 */
	public function reset() {
		return reset($this->objects);
	}


	/**
	 * goto last entity and get it
	 * @return Entity
	 */
	public function end() {
		return end($this->objects);
	}


	/**
	 * get nth entity of collection
	 * @param integer $nth
	 * @return mixed (Entity/null)
	 */
	public function get($nth) {
		if (array_key_exists($nth, $this->objects)) {
			return $this->objects[$nth];
		} else {
			return null;
		}
	}


	/**
	 * get array of all entities
	 * @return array of Entities
	 */
	public function getObjects() {
		return $this->objects;
	}


	/**
	 * get a subset of current collection
	 * @param int $limit
	 * @param int @offset
	 * @return array of Entities
	 */
	public function subset($limit=null, $offset=null) {
		if ($limit === null && $offset === null) {
			return $this;
		}

		if ($limit === null) {
			$limit = 0;
		}
		if ($offset === null) {
			$offset = 0;
		}

		$objects = array_slice($this->objects, $offset, $limit);

		$class = get_class($this);
		return new $class($objects);
	}


	/**
	 * check if entity is in collection
	 * @param IEntity $object
	 * @return boolean
	 */
	public function inCollection(IEntity $object) {
		return in_array($object, $this->objects);
	}


	/**
	 * get one VCalendar object containing all information
	 * @return VCalendar object
	 */
	public function getVObject() {
		$vCalendar = new VCalendar();

		foreach($this->objects as &$object) {
			if (!($object instanceof IEntity)) {
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
	 * get an array of VCalendar objects
	 * @return array of VCalendar object
	 */
	public function getVObjects() {
		$vObjects = array();

		foreach($this->objects as &$object) {
			if (!($object instanceof IEntity)) {
				continue;
			}

			$vObjects[] = $object->getVObject();
		}

		return $vObjects;
	}


	/**
	 * get a collection of entities that meet criteria
	 * @param string $key property that's supposed to be searched
	 * @param mixed $value expected value, can be a regular expression when 3rd param is set to true
	 * @return mixed (boolean|ICollection)
	 */
	public function search($key, $value) {
		$class = get_class($this);
		$matchingObjects = new $class();

		if (!($matchingObjects instanceof ICollection)) {
			return false;
		}

		$getter = 'get' . ucfirst($key);

		foreach($this->objects as &$object) {
			if (is_callable(array($object, $getter)) &&
				$object->{$getter}() === $value) {
				$matchingObjects->add($object);
			}
		}

		return $matchingObjects;
	}


	/**
	 * get a collection of entities that meet criteria; search calendar data
	 * @param string $key name of property that stores data
	 * @param string $regex regular expression
	 * @return mixed (boolean|ICollection)
	 */
	public function searchData($key, $regex) {
		$class = get_class($this);
		$matchingObjects = new $class();

		if (!($matchingObjects instanceof ICollection)) {
			return false;
		}

		$getter = 'get' . ucfirst($key);

		foreach($this->objects as &$object) {
			if (is_callable(array($object, $getter)) &&
				preg_match($regex, $object->{$getter}()) === 1) {
				$matchingObjects->add($object);
			}
		}

		return $matchingObjects;
	}


	/**
	 * set a property for all calendars
	 * @param string $key key for property
	 * @param mixed $value value to be set
	 * @return $this
	 */
	public function setProperty($key, $value) {
		$setter = 'set' . ucfirst($key);

		foreach($this->objects as &$object) {
			if (is_callable(array($object, $setter))) {
				$object->{$setter}($value);
			}
		}

		return $this;
	}


	/**
	 * checks if all entities are valid
	 * Stops when it finds the first invalid one
	 * @return bool
	 */
	public function isValid() {
		foreach($this->objects as &$object) {
			if (!($object instanceof IEntity)) {
				return false;
			}
			if (!$object->isValid()) {
				return false;
			}
		}

		return true;
	}


	/**
	 * iterate over each entity of collection
	 * @param callable $function
	 * @return $this
	 */
	public function iterate($function) {
		foreach($this->objects as &$object) {
			$function($object);
		}

		return $this;
	}


	/**
	 * remove duplicates from collection
	 * @return $this
	 */
	public function noDuplicates() {
		$this->objects = array_unique($this->objects);
		return $this;
	}
}