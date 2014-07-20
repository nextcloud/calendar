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
namespace OCP\Calendar;

interface ICollection extends \Countable, \ArrayAccess {

	/**
	 * add entity to collection
	 * @param IEntity $object entity to be added
	 * @param integer $nth insert at index, if not set, entity will be appended
	 * @return $this
	 */
	public function add(IEntity $object, $nth=null);


	/**
	 * add entities to collection
	 * @param ICollection $collection collection of entities to be added
	 * @param integer $nth insert at index, if not set, collection will be appended
	 * @return integer
	 */
	public function addCollection(ICollection $collection, $nth=null);


	/**
	 * updates an entity in collection
	 * @param IEntity $entity
	 */
	public function update(IEntity $entity);


	/**
	 * remove entity from collection
	 * @param integer $nth remove nth element, if not set, current element will be removed
	 * @return $this
	 */
	public function remove($nth=null);


	/**
	 * remove entity by it's information
	 * @param IEntity $entity
	 * @return $this
	 */
	public function removeByEntity(IEntity $entity);


	/**
	 * remove entities by a single property
	 * @param string $key key for property
	 * @param mixed $value value to be set
	 * @return $this;
	 */
	public function removeByProperty($key, $value);


	/**
	 * get current entity
	 * @return IEntity
	 */
	public function current();


	/**
	 * get num index of current entity
	 * @return integer
	 */
	public function key();


	/**
	 * goto next entity and get it
	 * @return IEntity
	 */
	public function next();


	/**
	 * goto previous entity and get it
	 * @return IEntity
	 */
	public function prev();


	/**
	 * goto first entity and get it
	 * @return IEntity
	 */
	public function reset();


	/**
	 * goto last entity and get it
	 * @return IEntity
	 */
	public function end();


	/**
	 * get nth entity of collection
	 * @param integer $nth
	 * @return mixed (IEntity/null)
	 */
	public function get($nth);


	/**
	 * get array of all entities
	 * @return array of IEntities
	 */
	public function getObjects();


	/**
	 * get a subset of current collection
	 * @param int $limit
	 * @param int @offset
	 * @return array of Entities
	 */
	public function subset($limit=null, $offset=null);


	/**
	 * check if entity is in collection
	 * @param IEntity $object
	 * @return boolean
	 */
	public function inCollection(IEntity $object);


	/**
	 * get one VCalendar object containing all information
	 * @return VCalendar object
	 */
	public function getVObject();


	/**
	 * get an array of VCalendar objects
	 * @return array of VCalendar object
	 */
	public function getVObjects();


	/**
	 * get a collection of entities that meet criteria
	 * @param string $key property that's supposed to be searched
	 * @param mixed $value expected value, can be a regular expression when 3rd param is set to true
	 * @return ICollection
	 */
	public function search($key, $value);


	/**
	 * get a collection of entities that meet criteria; search calendar data
	 * @param string $key name of property that stores data
	 * @param string $regex regular expression
	 * @return ICollection
	 */
	public function searchData($key, $regex);


	/**
	 * set a property for all calendars
	 * @param string $key key for property
	 * @param mixed $value value to be set
	 * @return $this
	 */
	public function setProperty($key, $value);


	/**
	 * checks if all entities are valid
	 * Stops when it finds the first invalid one
	 * @return bool
	 */
	public function isValid();


	/**
	 * iterate over each entity of collection
	 * @param callable $function
	 * @return $this
	 */
	public function iterate($function);


	/**
	 * remove duplicates from collection
	 * @return $this
	 */
	public function noDuplicates();
}