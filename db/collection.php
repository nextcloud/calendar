<?php
/**
 * Copyright (c) 2014 Georg Ehrke <oc.list@georgehrke.com>
 * This file is licensed under the Affero General Public License version 3 or
 * later.
 * See the COPYING-README file.
 */
namespace OCA\Calendar\Db;

use \OCA\Calendar\Sabre\VObject\Component\VCalendar;
use \OCA\Calendar\Sabre\VObject\Component\VTimezone;
use \OCA\Calendar\Sabre\VObject\Component\VEvent;
use \OCA\Calendar\Sabre\VObject\Component\VJournal;
use \OCA\Calendar\Sabre\VObject\Component\VTodo;

abstract class Collection {

	/**
	 * array containing all entities
	 * @var array
	 */
	protected $objects;


	/**
	 * @bried constructur
	 * @param mixed (array|Entity|Collection) $object
	 */
	public function __construct($objects=null) {
		$this->objects = array();

		if ($objects !== null) {
			if (is_array($objects)) {
				$this->addObjects($objects);
			} elseif ($objects instanceof Entity) {
				$this->add($objects);
			} elseif ($objects instanceof Collection) {
				$this->addCollection($objects);
			}
		}
	}


	/**
	 * @brief add entity to collection
	 * @param Entity $object entity to be added
	 * @param integer $nth insert at index, if not set, entity will be appended
	 * @return $this
	 */
	public function add(Entity $object, $nth=null) {
		if ($nth === null) {
			$this->objects[$this->count()] = $object;
		} else {
			$objects  = array_slice($this->objects, 0, $nth, true);
			$objects += array($object);
			$objects += array_slice($this->objects, $nth, $this->count() - 1, true);

			$this->objects = $objects;
		}

		return $this;
	}


	/**
	 * @brief add entities to collection
	 * @param Collection $objects collection of entities to be added
	 * @param integer $nth insert at index, if not set, collection will be appended
	 * @return integer
	 */
	public function addCollection(Collection $collection, $nth=null) {
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
	 * @brief add objects to collection
	 * @param array $objects
	 * @param integer $nth insert at index, if not set, objects will be appended
	 * @return integer
	 */
	protected function addObjects(array $array, $nth=null) {
		if ($nth === null) {
			$this->objects += $objects;
		} else {
			$objects  = array_slice($this->objects, 0, $nth, true);
			$objects += $array;
			$objects += array_slice($this->objects, $nth, $this->count() - count($array), true);

			$this->objects = $objects;
		}

		return $this;
	}


	/**
	 * @brief remove entity from collection
	 * @param integer $nth remove nth element, if not set, current element will be removed
	 * @return 
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
	 * @brief remove entity by it's information
	 * @param integer $nth remove nth element, if not set, current element will be removed
	 * @return this
	 */
	public function removeByEntity(Entity $entity) {
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
	 * @brief remove entities by a single property
	 * @param string $key key for property
	 * @param mixed $value value to be set
	 * @return this;
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
	 * @brief get number of elements within collection
	 * @return integer 
	 */
	public function count() {
		return count($this->objects);
	}


	/**
	 * @brief get current entity 
	 * @return single Entity 
	 */
	public function current() {
		return current($this->objects);
	}


	/**
	 * @brief get num index of current entity
	 * @return integer 
	 */
	public function key() {
		return key($this->objects);
	}


	/**
	 * @brief goto next entity and get it
	 * @return single Entity 
	 */
	public function next() {
		return next($this->objects);
	}


	/**
	 * @brief goto previous entity and get it
	 * @return single Entity 
	 */
	public function prev() {
		return prev($this->objects);
	}


	/**
	 * @brief goto first entity and get it
	 * @return single Entity 
	 */
	public function reset() {
		return reset($this->objects);
	}


	/**
	 * @brief goto last entity and get it
	 * @return single Entity 
	 */
	public function end() {
		return end($this->objects);
	}


	/**
	 * @brief get nth entity of collection
	 * @param integer $nth
	 * @return mixed (single Entity) or null
	 */
	public function get($nth) {
		if (array_key_exists($nth, $this->objects)) {
			return $this->objects[$nth];
		} else {
			return null;
		}
	}


	/**
	 * @brief get array of all entities
	 * @return array of Entities
	 */
	public function getObjects() {
		return $this->objects;
	}


	/**
	 * @brief get a subset of current collection
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

		$class = get_class($this);
		$subset = new $class();

		for($i = $offset; $i < ($offset + $limit); $i++) {
			if (array_key_exists($i, $this->objects)) {
				$subset->add($this->objects[$i]);
			}
		}

		return $subset;
	}


	/**
	 * @brief check if entity is in collection
	 * @param Entity $object
	 * @return boolean
	 */
	public function inCollection(Entity $object) {
		return in_array($object, $this->objects);
	}


	/**
	 * @brief get one VCalendar object containing all information
	 * @return VCalendar object
	 */
	public function getVObject() {
		$vCalendar = new VCalendar();

		foreach($this->objects as &$object) {
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
	 * @brief get an array of VCalendar objects
	 * @return array of VCalendar object
	 */
	public function getVObjects() {
		$vObjects = array();

		foreach($this->objects as &$object) {
			$vObjects[] = $object->getVObject();
		}

		return $vObjects;
	}


	/**
	 * @brief get a collection of entities that meet criteria
	 * @param string $key property that's supposed to be searched
	 * @param mixed $value expected value, can be a regular expression when 3rd param is set to true
	 * @return collection
	 */
	public function search($key, $value) {
		$class = get_class($this);
		$matchingObjects = new $class();

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
	 * @brief get a collection of entities that meet criteria; search calendar data
	 * @param string $class class of new collection
	 * @param string $dataProperty name of property that stores data
	 * @param string $regex regular expression
	 * @return ObjectCollection
	 */
	public function searchData($key, $regex) {
		$class = get_class($this);
		$matchingObjects = new $class();

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
	 * @brief set a property for all calendars
	 * @param string $key key for property
	 * @param mixed $value value to be set
	 * @return this
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
	 * @brief checks if all entities are valid
	 * Stops when it finds the first invalid one
	 * @param boolean
	 */
	public function isValid() {
		foreach($this->objects as &$object) {
			if (!$object->isValid()) {
				return false;
			}
		}

		return true;
	}


	/**
	 * @brief iterate over each entity of collection
	 * @param anonymous function
	 * iterate gives you a pointer to the current object. be careful!
	 * @param array of parameters
	 */
	public function iterate($function) {
		foreach($this->objects as &$object) {
			$function($object);
		}

		return $this;
	}


	/**
	 * @brief remove duplicates from collection
	 * @return $this
	 */
	public function noDuplicates() {
		$this->objects = array_unique($this->objects);
		return $this;
	}
}