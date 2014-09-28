<?php
/**
 * ownCloud - Calendar App
 *
 * @author Georg Ehrke
 * @copyright 2014 Georg Ehrke <oc.list@georgehrke.com>
 * @author Thomas Tanghus
 * @copyright 2014 Thomas Tanghus <thomas@tanghus.net>
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
namespace OCA\Calendar\Backend\Contact;

use OCP\Calendar\ICalendar;
use OCP\Calendar\IObject;
use OCP\Calendar\IObjectAPI;
use OCP\Calendar\IObjectCollection;
use OCP\Calendar\CacheOutDatedException;

use OCP\AppFramework\Db\DoesNotExistException;
use OCP\AppFramework\Db\MultipleObjectsReturnedException;
use OCP\Calendar\ObjectType;
use OCP\Contacts\IManager;

class Object extends Contact implements IObjectAPI {

	/**
	 * @var \OCP\Calendar\ICalendar
	 */
	private $calendar;


	/**
	 * @var string
	 */
	private $uri;


	/**
	 * @var string
	 */
	private $userId;


	/**
	 * @param IManager $contacts
	 * @param ICalendar $calendar
	 */
	public function __construct(IManager $contacts, ICalendar $calendar) {
		parent::__construct($contacts);

		$this->calendar = $calendar;

		$this->uri = $calendar->getPrivateUri();
		$this->userId = $calendar->getUserId();
	}


	/**
	 * @return boolean
	 */
	public function cache() {
		return false;
	}


	/**
	 * find object
	 * @param string $objectURI
	 * @param integer $type
	 * @throws CacheOutDatedException if calendar does not exist
	 * @throws DoesNotExistException
	 * @throws MultipleObjectsReturnedException if more than one result found
	 * @return IObject
	 */
	public function find($objectURI, $type=ObjectType::ALL) {

	}


	/**
	 * Find objects
	 * @param integer $type
	 * @param integer $limit
	 * @param integer $offset
	 * @throws CacheOutDatedException
	 * @return IObjectCollection
	 */
	public function findAll($type=ObjectType::ALL, $limit=null, $offset=null) {

	}


	/**
	 * @param integer $type
	 * @return array
	 */
	public function listAll($type=ObjectType::ALL) {

	}
}