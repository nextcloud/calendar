<?php
/**
 * Copyright (c) 2014 Georg Ehrke <oc.list@georgehrke.com>
 * Copyright (c) 2014 Thomas Tanghus <thomas@tanghus.net>
 * This file is licensed under the Affero General Public License version 3 or
 * later.
 * See the COPYING-README file.
 */
namespace OCA\Calendar\Sabre;

use Sabre_CalDAV_Calendar;
use Sabre_DAV_Exception_NotFound;

/**
 * This class overrides Sabre_CalDAV_Calendar::getACL() to return read/write
 * permissions based on user and shared state and it overrides
 * Sabre_CalDAV_Calendar::getChild() and Sabre_CalDAV_Calendar::getChildren()
 * to instantiate OC_Connector_Sabre_CalDAV_CalendarObjects.
*/
class CalDAV_Calendar extends Sabre_CalDAV_Calendar {

	/**
	* Returns a list of ACE's for this node.
	*
	* Each ACE has the following properties:
	*   * 'privilege', a string such as {DAV:}read or {DAV:}write. These are
	*     currently the only supported privileges
	*   * 'principal', a url to the principal who owns the node
	*   * 'protected' (optional), indicating that this ACE is not allowed to
	*      be updated.
	*
	* @return array
	*/
	public function getACL() {

		$readprincipal = $this->getOwner();
		$writeprincipal = $this->getOwner();
		$uid = OC_Calendar_Calendar::extractUserID($this->getOwner());

		if($uid != OCP\USER::getUser()) {
			if($uid === 'contact_birthdays') {
				$readprincipal = 'principals/' . OCP\User::getUser();
			} else {
				$sharedCalendar = OCP\Share::getItemSharedWithBySource('calendar', $this->calendarInfo['id']);
				if ($sharedCalendar && ($sharedCalendar['permissions'] & OCP\PERMISSION_READ)) {
					$readprincipal = 'principals/' . OCP\User::getUser();
				}
				if ($sharedCalendar && ($sharedCalendar['permissions'] & OCP\PERMISSION_UPDATE)) {
					$writeprincipal = 'principals/' . OCP\User::getUser();
				}
			}
		}

		return array(
			array(
				'privilege' => '{DAV:}read',
				'principal' => $readprincipal,
				'protected' => true,
			),
			array(
				'privilege' => '{DAV:}write',
				'principal' => $writeprincipal,
				'protected' => true,
			),
			array(
				'privilege' => '{DAV:}read',
				'principal' => $readprincipal . '/calendar-proxy-write',
				'protected' => true,
			),
			array(
				'privilege' => '{DAV:}write',
				'principal' => $writeprincipal . '/calendar-proxy-write',
				'protected' => true,
			),
			array(
				'privilege' => '{DAV:}read',
				'principal' => $readprincipal . '/calendar-proxy-read',
				'protected' => true,
			),
			array(
				'privilege' => '{' . Sabre_CalDAV_Plugin::NS_CALDAV . '}read-free-busy',
				'principal' => '{DAV:}authenticated',
				'protected' => true,
			),

		);

	}

	/**
	* Returns a calendar object
	*
	* The contained calendar objects are for example Events or Todo's.
	*
	* @param string $name
	* @return Sabre_DAV_ICalendarObject
	*/
	public function getChild($name) {
		$obj = $this->caldavBackend->getCalendarObject($this->calendarInfo['id'],$name);
		if (!$obj) {
			throw new Sabre_DAV_Exception_NotFound('Calendar object not found');
		}
		return new CalDAV_CalendarObject($this->caldavBackend,$this->calendarInfo,$obj);

	}

	/**
	* Returns the full list of calendar objects
	*
	* @return array
	*/
	public function getChildren() {

		$objs = $this->caldavBackend->getCalendarObjects($this->calendarInfo['id']);
		$children = array();
		foreach($objs as $obj) {
			$children[] = new CalDAV_CalendarObject($this->caldavBackend,$this->calendarInfo,$obj);
		}
		return $children;

	}

}