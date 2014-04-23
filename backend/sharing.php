<?php
/**
 * Copyright (c) 2014 Georg Ehrke <oc.list@georgehrke.com>
 * This file is licensed under the Affero General Public License version 3 or
 * later.
 * See the COPYING-README file.
 *
 * naming schema:
 * sharing-{sharingid}
 * sharing-{sharingid}-{uid}
 */
namespace OCA\Calendar\Backend;

use \OCP\AppFramework\IAppContainer;

use \OCA\Calendar\Db\DoesNotExistException;
use \OCA\Calendar\Db\MultipleObjectsReturnedException;

use \OCA\Calendar\Db\Calendar;
use \OCA\Calendar\Db\CalendarCollection;

use \OCA\Calendar\Db\Object;
use \OCA\Calendar\Db\ObjectCollection;

use \OCA\Calendar\Db\Timezone;
use \OCA\Calendar\Db\TimezoneCollection;

use \OCA\Calendar\Db\ObjectType;
use \OCA\Calendar\Db\Permissions;

use \DateTime;

class Sharing extends Backend {

	private $backend;

	private static $crudsMapper = array(
		\OCP\PERMISSION_CREATE	=> Permissions::CREATE,
		\OCP\PERMISSION_READ	=> Permissions::READ,
		\OCP\PERMISSION_UPDATE	=> Permissions::UPDATE,
		\OCP\PERMISSION_DELETE	=> Permissions::DELETE,
		\OCP\PERMISSION_SHARE	=> Permissions::SHARE,
		\OCP\PERMISSION_ALL		=> Permissions::ALL,
	);

	public function __construct($api, $parameters, &$backendBusinessLayer){
		parent::__construct($api, 'sharing');
		$this->backend = $backendBusinessLayer;
	}

	public function cacheObjects($calendarURI, $userId) {
		return false;
	}

	public function canBeEnabled() {
		return \OCP\Share::isEnabled();
	}

	public function findCalendar($calendarURI, $userId) {
		
	}

	public function findCalendars($userId, $limit, $offset) {
		$sharedCalendars = OCP\Share::getItemsSharedWith('calendar', OC_Share_Backend_Calendar::FORMAT_CALENDAR);
		$singleSharedEvents = null;
	}

	public function updateCalendar(Calendar $calendar, $calendarId, $userId) {

	}

	public function deleteCalendar(Calendar $calendar) {

	}
	
	public function mergeCalendar(Calendar $calendar, $calendarId=null, $userId=null) {

	}

	public function findObject($calendarURI, $objectURI, $userId) {

	}

	public function findObjects($calendarId, $userId, $limit, $offset) {

	}

	public function findObjectsInPeriod($calendarId, $start, $end, $userId, $limit, $offset){

	}

	public function findObjectsByType($calendarId, $type, $userId, $limit, $offset) {

	}

	public function findObjectsByTypeInPeriod($calendarId, $type, $start, $end, $userId, $limit, $offset) {

	}

	public function createObject(Object $object, $userId) {

	}

	public function updateObject(Object $object, $calendarId, $uri, $userId) {

	}

	public function deleteObject(Object $object){

	}

	public function searchByProperties($properties=array(), $calendarId=null, $userId=null) {
		
	}
}