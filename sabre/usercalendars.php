<?php
/**
 * Copyright (c) 2014 Georg Ehrke <oc.list@georgehrke.com>
 * Copyright (c) 2014 Thomas Tanghus <thomas@tanghus.net>
 * This file is licensed under the Affero General Public License version 3 or
 * later.
 * See the COPYING-README file.
 */
namespace OCA\Calendar\Sabre;

use Sabre_CalDAV_UserCalendars;
use Sabre_CalDAV_Schedule_Outbox;

/**
 * This class overrides Sabre_CalDAV_UserCalendars::getChildren()
 * to instantiate OCA\Calendar\Sabre\CalDAV_Calendars.
*/
class CalDAV_UserCalendars extends Sabre_CalDAV_UserCalendars {

	/**
	* Returns a list of calendars
	*
	* @return Sabre_CalDAV_Schedule_Outbox[]
	*/
	public function getChildren() {

		$calendars = $this->caldavBackend->getCalendarsForUser($this->principalInfo['uri']);
		$objs = array();
		foreach($calendars as $calendar) {
			$objs[] = new CalDAV_Calendar($this->principalBackend,
										  $this->caldavBackend,
										  $calendar);
		}
		$objs[] = new Sabre_CalDAV_Schedule_Outbox($this->principalInfo['uri']);
		return $objs;

	}

}