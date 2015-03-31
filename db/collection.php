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

use OCA\Calendar\ICollection;
use OCA\Calendar\IEntity;

abstract class Collection implements ICollection {

	/**
	 * array containing all entities
	 *
	 * @var array
	 */
	protected $objects=[];


	/**
	 * init collection with a single entity
	 *
	 * @param IEntity $entity
	 * @return ICollection
	 */
	public static function fromEntity(IEntity $entity) {
		/** @var ICollection $instance */
		$instance = new static();
		$instance->add($entity);

		return $instance;
	}


	/**
	 * init collection with another collection
	 *
	 * @param ICollection $collection
	 * @return ICollection
	 */
	public static function fromCollection(ICollection $collection) {
		/** @var ICollection $instance */
		$instance = new static();
		$instance->addCollection($collection);

		return $instance;
	}


	/**
	 * init collection with array of entities
	 *
	 * @param array $entities
	 * @return ICollection
	 */
	public static function fromArray(array $entities) {
		/** @var ICollection $instance */
		$instance = new static();
		$instance->addObjects($entities);

		return $instance;
	}


	/**
	 * add entity to collection
	 *
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
	 * add collection to collection
	 *
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
	 * add array of entities to collection
	 *
	 * @param array $array
	 * @param integer $nth insert at index, if not set, objects will be appended
	 * @return integer
	 */
	public function addObjects(array $array, $nth=null) {
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
	 * get array of all entities
	 *
	 * @return array of Entities
	 */
	public function getObjects() {
		return $this->objects;
	}


	/**
	 * set objects
	 *
	 * @param array $objects
	 * @return $this
	 */
	public function setObjects(array $objects) {
		$this->objects = $objects;
		return $this;
	}


	/**
	 * get a subset of current collection
	 *
	 * @param integer $limit
	 * @param integer $offset
	 * @return array of Entities
	 */
	public function subset($limit=null, $offset=null) {
		/** @var ICollection $instance */
		$instance = new static();

		if ($limit === null && $offset === null) {
			$instance->addObjects($this->getObjects());
			return $instance;
		}

		if ($offset === null) {
			$offset = 0;
		}

		$objects = array_slice($this->objects, $offset, $limit);
		$instance->addObjects($objects);

		return $instance;
	}


	/**
	 * check if entity is in collection
	 *
	 * @param IEntity $object
	 * @return boolean
	 */
	public function inCollection(IEntity $object) {
		return in_array($object, $this->objects);
	}


	/**
	 * get a collection of entities that meet criteria
	 *
	 * @param string $key property that's supposed to be searched
	 * @param mixed $value expected value, can be a regular expression when 3rd param is set to true
	 * @return mixed (boolean|ICollection)
	 */
	public function search($key, $value) {
		$collection = new static();

		$getter = 'get' . ucfirst($key);
		foreach($this->objects as $object) {
			if ($object->$getter() === $value) {
				$collection->add($object);
			}
		}

		return $collection;
	}


	/**
	 * set a property for all calendars
	 *
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
	 *
	 * @return boolean
	 */
	public function isValid() {
		foreach($this->objects as $object) {
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
	 *
	 * @param callable $function breaks when callable returns false
	 */
	public function iterate(callable $function) {
		foreach($this->objects as &$object) {
			$return = $function($object);
			if ($return === false) {
				break;
			}
		}
	}


	/**
	 * remove duplicates from collection
	 * @return $this
	 */
	public function noDuplicates() {
		$this->objects = array_unique($this->objects);
		return $this;
	}


	/**
	 * Array-Access-Interface methods
	 */
	/**
	 * @param mixed $offset
	 * @return boolean
	 */
	public function offsetExists($offset) {
		return isset($this->objects[$offset]);
	}


	/**
	 * @param mixed $offset
	 * @return IEntity|void
	 */
	public function offsetGet($offset){
		return $this->offsetExists($offset) ? $this->objects[$offset] : null;
	}


	/**
	 * @param mixed $offset
	 * @param mixed $value
	 */
	public function offsetSet($offset, $value){
		if ($value instanceof IEntity) {
			if ($offset === null) {
				$this->objects[] = $value;
			} else {
				$this->objects[$offset] = $value;
			}
		}
	}


	/**
	 * @param mixed $offset
	 */
	public function offsetUnset($offset) {
		unset($this->objects[$offset]);
	}


	/**
	 * Countable-Interface methods:
	 */
	/**
	 * get number of elements within collection
	 *
	 * @return integer
	 */
	public function count() {
		return count($this->objects);
	}


	/**
	 * Iterator-Interface methods:
	 */
	/**
	 * get current entity
	 *
	 * @return Entity
	 */
	public function current() {
		return current($this->objects);
	}


	/**
	 * get num index of current entity
	 *
	 * @return integer
	 */
	public function key() {
		return key($this->objects);
	}


	/**
	 * go to next entity and get it
	 *
	 * @return Entity
	 */
	public function next() {
		return next($this->objects);
	}


	/**
	 * go to first entity and get it
	 *
	 * @return Entity
	 */
	public function rewind() {
		return reset($this->objects);
	}


	/**
	 * check if current position is valid
	 *
	 * @return boolean
	 */
	public function valid() {
		return array_key_exists($this->key(), $this->objects);
	}

	public function reset() {
		$this->objects = [];
	}
}