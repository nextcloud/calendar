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
namespace OCA\Calendar;

interface IObjectAPI {

	/**
	 * returns whether or not calendar objects should be cached
	 * @return boolean
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
	 */
	public function find($objectUri, $type=ObjectType::ALL);


	/**
	 * returns all objects in the calendar $calendarURI of the user $userId
	 * @param integer $type
	 * @param integer $limit
	 * @param integer $offset
	 * @returns IObjectCollection
	 * @throws \OCP\AppFramework\Db\DoesNotExistException if calendar does not exist
	 */
	public function findAll($type=ObjectType::ALL, $limit=null, $offset=null);


	/**
	 * get list of objectURIs
	 * @param integer $type
	 * @return array
	 */
	public function listAll($type=ObjectType::ALL);


	/**
	 * check if $object has updated on backend
	 * @param IObject $object
	 * @return boolean
	 */
	public function hasUpdated(IObject $object);
}

interface IObjectAPICreate extends IObjectAPI {

	/**
	 * create an object
	 * @param IObject $object
	 * @return IObject
	 */
	public function create(IObject $object);
}

interface IObjectAPIUpdate extends IObjectAPI {

	/**
	 * update an object
	 * @param IObject $update
	 * @return IObject
	 */
	public function update(IObject $update);
}

interface IObjectAPIDelete extends IObjectAPI {

	/**
	 * delete an object
	 * @param IObject $object
	 * @return boolean
	 */
	public function delete(IObject $object);
}

interface IObjectAPIFindInPeriod extends IObjectAPI {

	/**
	 * find objects in a certain period
	 * @param \DateTime $start
	 * @param \DateTime $end
	 * @param integer $type
	 * @param integer $limit
	 * @param integer $offset
	 * @return IObjectCollection
	 */
	public function findAllInPeriod(\DateTime $start, \DateTime $end, $type=ObjectType::ALL, $limit, $offset);
}

interface IObjectAPISearch extends IObjectAPI {

	/**
	 * search objects
	 * @param array $properties
	 * @param integer $type
	 * @param integer $limit
	 * @param integer $offset
	 * @return IObjectCollection
	 */
	public function searchByProperties(array $properties=[], $type=ObjectType::ALL, $limit, $offset);
}

interface IObjectAPISearchInPeriod extends IObjectAPI {

	/**
	 * search objects in a certain period
	 * @param array $properties
	 * @param \DateTime $start
	 * @param \DateTime $end
	 * @param integer $type
	 * @param integer $limit
	 * @param integer $offset
	 * @return IObjectCollection
	 */
	public function searchByPropertiesInPeriod(array $properties=[], \DateTime $start, \DateTime $end, $type=ObjectType::ALL, $limit, $offset);
}