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
namespace OCA\Calendar\Backend\Sharing;

use OCA\Calendar\Backend as BackendUtils;
use OCA\Calendar\Db\ObjectType;
use OCA\Calendar\ICalendar;
use OCA\Calendar\IObject;

class Object extends Sharing implements BackendUtils\IObjectAPI, BackendUtils\IObjectAPICreate,
	BackendUtils\IObjectAPIUpdate, BackendUtils\IObjectAPIDelete, BackendUtils\IObjectAPIFindInPeriod,
	BackendUtils\IObjectAPISearch, BackendUtils\IObjectAPISearchInPeriod {

	/**
	 * @var string
	 */
	private $uri;


	/**
	 * @var string
	 */
	private $userId;


	/**
	 * @param ICalendar $calendar
	 */
	public function __construct(ICalendar $calendar) {
		$this->uri = $calendar->getPrivateUri();
		$this->userId = $calendar->getUserId();
	}


	/**
	 * {@inheritDoc}
	 */
	public function cache() {
		return false;
	}


	/**
	 * {@inheritDoc}
	 */
	public function find($objectURI, $type=ObjectType::ALL) {

	}


	/**
	 * {@inheritDoc}
	 */
	public function findAll($type=ObjectType::ALL, $limit=null, $offset=null) {

	}


	/**
	 * {@inheritDoc}
	 */
	public function listAll($type=ObjectType::ALL) {

	}


	/**
	 * {@inheritDoc}
	 */
	public function findAllInPeriod(\DateTime $start, \DateTime $end,
									$type=ObjectType::ALL,
									$limit, $offset){

	}


	/**
	 * {@inheritDoc}
	 */
	public function hasUpdated(IObject $object) {

	}


	/**
	 * {@inheritDoc}
	 */
	public function create(IObject $object) {

	}


	/**
	 * {@inheritDoc}
	 */
	public function update(IObject $object) {

	}


	/**
	 * {@inheritDoc}
	 */
	public function delete(IObject $object) {

	}


	/**
	 * {@inheritDoc}
	 */
	public function searchByProperties(array $properties=[], $type=ObjectType::ALL, $limit, $offset) {

	}


	/**
	 * {@inheritDoc}
	 */
	public function searchByPropertiesInPeriod(array $properties=[], \DateTime $start, \DateTime $end, $type=ObjectType::ALL, $limit, $offset) {

	}


	/**
	 * @param IObject $object
	 */
	private function cleanByAccessClass(IObject $object) {

	}
}