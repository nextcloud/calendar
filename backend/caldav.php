<?php
/**
 * Copyright (c) 2014 Georg Ehrke <oc.list@georgehrke.com>
 * This file is licensed under the Affero General Public License version 3 or
 * later.
 * See the COPYING-README file.
 */
namespace OCA\Calendar\Backend;

use \OCP\AppFramework\IAppContainer;

use \OCA\Calendar\Db\DoesNotExistException;
use \OCA\Calendar\Db\MultipleObjectsReturnedException;
use \OCA\Calendar\Db\CorruptDataException;

use \OCA\Calendar\Db\Calendar;
use \OCA\Calendar\Db\CalendarCollection;

use \OCA\Calendar\Db\Object;
use \OCA\Calendar\Db\ObjectCollection;

use \OCA\Calendar\Db\Timezone;
use \OCA\Calendar\Db\TimezoneCollection;

use \OCA\Calendar\Db\ObjectType;
use \OCA\Calendar\Db\Permissions;

use \OCA\Calendar\Utility\ObjectUtility;

use \DateTime;

class CalDAV extends Backend {

	/**
	 * subscription mapper
	 * @var \OCA\Calendar\Db\SubscriptionMapper
	 */
	protected $subscriptionMapper;


	/**
	 * @brief constructor
	 * @param IAppContainer $app
	 * @param array $parameters
	 */
	public function __construct(IAppContainer $app, array $parameters){
		parent::__construct($app, 'CalDAV');

		$this->subscriptionMapper = $app->query('SubscriptionMapper');
	}


	/**
	 * @brief returns information about calendar $calendarURI of the user $userId
	 * @param string $calendarURI
	 * @param string $userId
	 * @returns array with \OCA\Calendar\Db\Calendar object
	 * @throws DoesNotExistException if uri does not exist
	 */
	public function findCalendar($calendarURI, $userId) {
		return new Calendar();
	}


	/**
	 * @brief returns all calendars of the user $userId
	 * @param string $userId
	 * @returns \OCA\Calendar\Db\CalendarCollection
	 * @throws DoesNotExistException if uri does not exist
	 */
	public function findCalendars($userId, $limit=null, $offset=null) {
		return new CalendarCollection();
	}


	/**
	 * @brief returns number of calendar
	 * @param string $userid
	 * @returns integer
	 */
	public function countCalendars($userId) {
		return 0;
	}


	/**
	 * @brief returns whether or not a calendar exists
	 * @param string $calendarURI
	 * @param string $userid
	 * @returns boolean
	 */
	public function doesCalendarExist($calendarURI, $userId) {
		return false;
	}


	/**
	 * @brief returns information about the object (event/journal/todo) with the uid $objectURI in the calendar $calendarURI of the user $userId 
	 * @param string $calendarURI
	 * @param string $objectURI
	 * @param string $userid
	 * @returns \OCA\Calendar\Db\Object object
	 * @throws DoesNotExistException if calendar does not exist
	 * @throws DoesNotExistException if object does not exist
	 */
	public function findObject(Calendar &$calendar, $objectURI) {
		throw new DoesNotExistException();
	}


	/**
	 * @brief returns all objects in the calendar $calendarURI of the user $userId
	 * @param string $calendarURI
	 * @param string $userId
	 * @returns \OCA\Calendar\Db\ObjectCollection
	 * @throws DoesNotExistException if calendar does not exist
	 */
	public function findObjects(Calendar &$calendar, $limit, $offset) {
		return new ObjectCollection();
	}
}