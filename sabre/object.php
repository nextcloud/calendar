<?php
/**
 * Copyright (c) 2014 Georg Ehrke <oc.list@georgehrke.com>
 * Copyright (c) 2014 Thomas Tanghus <thomas@tanghus.net>
 * This file is licensed under the Affero General Public License version 3 or
 * later.
 * See the COPYING-README file.
 */
namespace OCA\Calendar\Sabre;

use Sabre_CalDAV_CalendarObject;

/**
 * This class overrides Sabre_CalDAV_CalendarObject::getACL()
 * to return read/write permissions based on user and shared state.
*/
class CalDAV_CalendarObject extends Sabre_CalDAV_CalendarObject {

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
				$object = OC_VObject::parse($this->objectData['calendardata']);
				$sharedCalendar = OCP\Share::getItemSharedWithBySource('calendar', $this->calendarInfo['id']);
				$sharedAccessClassPermissions = OC_Calendar_Object::getAccessClassPermissions($object);
				if ($sharedCalendar && ($sharedCalendar['permissions'] & OCP\PERMISSION_READ) && ($sharedAccessClassPermissions & OCP\PERMISSION_READ)) {
					$readprincipal = 'principals/' . OCP\USER::getUser();
				}
				if ($sharedCalendar && ($sharedCalendar['permissions'] & OCP\PERMISSION_UPDATE) && ($sharedAccessClassPermissions & OCP\PERMISSION_UPDATE)) {
					$writeprincipal = 'principals/' . OCP\USER::getUser();
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
		);

	}

}