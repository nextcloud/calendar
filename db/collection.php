<?php
/**
 * Copyright (c) 2014 Georg Ehrke <oc.list@georgehrke.com>
 * This file is licensed under the Affero General Public License version 3 or
 * later.
 * See the COPYING-README file.
 */
namespace OCA\Calendar\Db;

use \OCA\Calendar\Sabre\VObject\Component\VCalendar;
use \OCA\Calendar\Sabre\VObject\Reader;
use \OCA\Calendar\Sabre\VObject\ParseException;
use \OCA\Calendar\Sabre\VObject\EofException;

use \OCA\Calendar\Sabre\VObject\Component\VTimezone;
use \OCA\Calendar\Sabre\VObject\Component\VEvent;
use \OCA\Calendar\Sabre\VObject\Component\VJournal;
use \OCA\Calendar\Sabre\VObject\Component\VTodo;

abstract class Collection {

	protected $objects;

	public function __construct($objects=null) {
		$this->objects = array();

		if($objects !== null) {

			if(is_array($objects) === true) {
				$this->objects = $objects;
			} else if($objects instanceof Entity) {
				$this->add($objects);
			} else if($objects instanceof Collection) {
				$this->addCollection($objects);
			}

		}
	}

	/**
	 * @brief add entity to collection
	 * @param Entity $object entity to be added
	 * @param integer $nth insert at index, if not set, entity will be appended
	 * @return integer 
	 */
	public function add(Entity $object, $nth=null) {
		if($nth === null) {
			$nth = $this->count();
		}
		for($i = $this->count(); $i > $nth; $i--) {
			$this->objects[$i] = $this->objects[($i - 1)];
		}
		$this->objects[$nth] = $object;
		return $this;
	}

	/**
	 * @brief add entities to collection
	 * @param Collection $objects collection of entities to be added
	 * @param integer $nth insert at index, if not set, entity will be appended
	 * @return integer 
	 */
	public function addCollection(Collection $objects, $nth=null) {
		if($nth === null) {
			$nth = $this->count();
		}
		$numberOfNewEntities = $objects->count();
		for($i = ($this->count() + $numberOfNewEntities); $i > ($nth + $numberOfNewEntities); $i--) {
			$this->objects[$i] = $this->objects[($i - $numberOfNewEntities)];
		}
		for($i = $nth; $i < ($nth + $numberOfNewEntities); $i++) {
			$this->objects[$i] = $objects->current();
			$objects->next();
		}
		return $this;
	}

	/**
	 * @brief remove entity from collection
	 * @param integer $nth remove nth element, if not set, current element will be removed
	 * @return 
	 */
	public function remove($nth=null) {
		if($nth === null){
			$nth = $this->key();
		}
		unset($this->objects[$nth]);
		return $this;
	}

	/**
	 * @brief remove entity by it's information
	 * @param integer $nth remove nth element, if not set, current element will be removed
	 * @return this
	 */
	public function removeByEntity(Entity $entity) {
		for($i = 0; $i < $this->count(); $i++) {
			//use of (==) instead of (===) is intended!
			//see http://php.net/manual/en/language.oop5.object-comparison.php
			if($this->objects[$i] == $entity) {
				unset($this->objects[($i--)]);
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
		$propertyGetter = 'get' . ucfirst($key);

		for($i = 0; $i < $this->count(); $i++) {
			if(is_callable(array($this->objects[$i], $propertyGetter)) && $object->{$propertyGetter}() === $value) {
				unset($this->objects[($i--)]);
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
		if(array_key_exists($nth, $this->objects)) {
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
		$class = get_class($this);

		if($offset === null) {
			$offset = 0;
		}

		if($limit === null) {
			return $this;
		} else {
			$subset = new $class();

			for($i = $offset; $i < ($offset + $limit); $i++) {
				if(array_key_exists($i, $this->objects)) {
					$subset->add($this->objects[$i]);
				}
			}

			return $subset;
		}

	}

	/**
	 * @brief check if entity is in collection
	 * @return boolean
	 */
	public function inCollection(Entity $object) {
		var_dump($object);
		var_dump($this->objects);
		exit;
		return in_array($object, $this->objects);
	}

	/**
	 * @brief get one VCalendar object containing all information
	 * @return VCalendar object
	 */
	public function getVObject() {
		$vObject = new VCalendar();

		foreach($this->objects as &$object) {
			$vElement = $object->getVObject();
			$children = $vElement->children();
			foreach($children as $child) {
				if($child instanceof VEvent || 
				   $child instanceof VJournal ||
				   $child instanceof VTodo ||
				   $child->name === 'VTIMEZONE') {
					$vObject->add($child);
				}
			}
		}

		return $vObject;
	}

	/**
	 * @brief get an array of VCalendar objects
	 * @return array of VCalendar object
	 */
	public function getVObjects() {
		$vobjects = array();

		foreach($this->objects as &$object) {
			$vobjects[] = $object->getVObject();
		}

		return $vobjects;
	}

	/**
	 * @brief get a collection of entities that meet criteria
	 * @param string $key property that's supposed to be searched
	 * @param mixed $value expected value, can be a regular expression when 3rd param is set to true
	 * @param boolean $regex disable / enable search based on regular expression
	 * @return collection
	 */
	public function search($key, $value, $regex=false) {
		$class = get_class($this);
		$matchingObjects = new $class();

		$propertyGetter = 'get' . ucfirst($key);

		foreach($this->objects as &$object) {
			if(is_callable(array($object, $propertyGetter)) && $object->{$propertyGetter}() === $value) {
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
	public function searchData($dataProperty, $regex) {
		$class = get_class($this);
		$matchingObjects = new $class();

		$dataGetter = 'get' . ucfirst($dataProperty);

		foreach($this->objects as &$object) {
			if(is_callable(array($object, $propertyGetter)) && preg_match($regex, $object->{$dataGetter}()) === 1) {
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
		$propertySetter = 'set' . ucfirst($key);

		foreach($this->objects as &$object) {
			if(is_callable(array($object, $propertySetter))) {
				$object->{$propertySetter}($value);
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
			if($object->isValid() === false) {
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
	}

	public function noDuplicates() {
		$this->objects = array_unique($this->objects);
	}
}