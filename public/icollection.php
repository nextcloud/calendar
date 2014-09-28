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

interface ICollection extends \Countable, \ArrayAccess, \Iterator {

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
	 * add objects to collection
	 * @param array $array
	 * @param integer $nth insert at index, if not set, objects will be appended
	 * @return integer
	 */
	public function addObjects(array $array, $nth=null);


	/**
	 * get array of all entities
	 * @return array of IEntities
	 */
	public function getObjects();


	/**
	 * set objects
	 *
	 * @param array $objects
	 * @return $this
	 */
	public function setObjects(array $objects);


	/**
	 * get a subset of current collection
	 * @param int $limit
	 * @param int @offset
	 * @param integer $offset
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
	 * get a collection of entities that meet criteria
	 * @param string $key property that's supposed to be searched
	 * @param string $value expected value, can be a regular expression when 3rd param is set to true
	 * @return ICollection
	 */
	public function search($key, $value);


	/**
	 * set a property for all calendars
	 * @param string $key key for property
	 * @param \OCA\Calendar\Db\Calendar $value value to be set
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
	 */
	public function iterate(callable $function);


	/**
	 * remove duplicates from collection
	 * @return $this
	 */
	public function noDuplicates();
}