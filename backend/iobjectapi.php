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

/**
 * Interface IBackendAPI
 *
 * @method IObject create() create(IObject $object) create an object
 * @method IObject update() update(IObject $object) update an object
 * @method boolean delete() delete(IObject $object) delete an object
 * @method IObjectCollection findAllInPeriod() findAllInPeriod(\DateTime $start, \DateTime $end, $type=ObjectType::ALL, $limit, $offset) find objects in period
 * @method IObjectCollection searchByProperties() searchByProperties(array $properties=array(), $limit, $offset) search objects
 */
interface IObjectAPI {

	const CREATE = 'create';
	const UPDATE = 'update';
	const DELETE = 'delete';
	const FIND_IN_PERIOD = 'findAllInPeriod';
	const SEARCH_BY_PROPERTIES = 'searchByProperties';

	/**
	 * returns whether or not calendar objects should be cached
	 * @return boolean
	 *
	 * This method returns a bool.
	 * This method is mandatory!
	 */
	public function cache();


	/**
	 * find object
	 * @param string $objectUri
	 * @param integer $type
	 * @return IObject
	 * @throws \OCP\AppFramework\Db\DoesNotExistException if calendar does not exist
	 * @throws \OCP\AppFramework\Db\DoesNotExistException if object does not exist
	 * @throws \OCP\AppFramework\Db\MultipleObjectsReturnedException
	 *
	 * This method returns an \OCA\Calendar\Db\Object object.
	 * This method is mandatory!
	 */
	public function find($objectUri, $type=ObjectType::ALL);


	/**
	 * returns all objects in the calendar $calendarURI of the user $userId
	 * @param integer $type
	 * @param integer $limit
	 * @param integer $offset
	 * @returns IObjectCollection
	 * @throws \OCP\AppFramework\Db\DoesNotExistException if calendar does not exist
	 *
	 * This method returns an \OCA\Calendar\Db\ObjectCollection object.
	 * This method is mandatory!
	 */
	public function findAll($type=ObjectType::ALL, $limit=null, $offset=null);


	/**
	 * get list of objectURIs
	 * @param integer $type
	 * @return array
	 */
	public function listAll($type=ObjectType::ALL);
}