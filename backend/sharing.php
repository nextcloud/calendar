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

class Sharing extends Backend {

	private static $crudsMapper = array(
		\OCP\PERMISSION_CREATE	=> Permissions::CREATE,
		\OCP\PERMISSION_READ	=> Permissions::READ,
		\OCP\PERMISSION_UPDATE	=> Permissions::UPDATE,
		\OCP\PERMISSION_DELETE	=> Permissions::DELETE,
		\OCP\PERMISSION_SHARE	=> Permissions::SHARE,
		\OCP\PERMISSION_ALL		=> Permissions::ALL,
	);


	/**
	 * @brief constructor
	 * @param IAppContainer $app
	 * @param array $parameters
	 */
	public function __construct(IAppContainer $app, array $parameters){
		parent::__construct($app, 'Sharing');
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
		$sharedCalendars = \OCP\Share::getItemsSharedWith('calendar', OC_Share_Backend_Calendar::FORMAT_CALENDAR);
		$singleSharedEvents = \OCP\Share::getItemsSharedWith('calendar', OC_Share_Backend_Calendar::FORMAT_EVENT);
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