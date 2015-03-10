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

/**
 * Class OC_Calendar_Calendar
 * @deprecated
 */
class OC_Calendar_Calendar{
	/**
	 * Returns the list of calendars for a specific user.
	 * @param string $uid User ID
	 * @param boolean $active Only return calendars with this $active state, default(=false) is don't care
	 * @return array
	 */
	public static function allCalendars($uid, $active=false) {

	}

	/**
	 * Gets the data of one calendar
	 * @param integer $id
	 * @return associative array
	 */
	public static function find($id) {

	}

	/**
	 * Creates a new calendar
	 * @param string $userid
	 * @param string $name
	 * @param string $components Default: "VEVENT,VTODO,VJOURNAL"
	 * @param string $timezone Default: null
	 * @param integer $order Default: 1
	 * @param string $color Default: null, format: '#RRGGBB(AA)'
	 * @return insertid
	 */
	public static function addCalendar($userid,$name,$components='VEVENT,VTODO,VJOURNAL',$timezone=null,$order=0,$color=null) {

	}

	/**
	 * Creates default calendars
	 * @param string $userid
	 * @return boolean|null
	 */
	public static function addDefaultCalendars($userid = null) {

	}

	/**
	 * Edits a calendar
	 * @param integer $id
	 * @param string $name Default: null
	 * @param string $components Default: null
	 * @param string $timezone Default: null
	 * @param integer $order Default: null
	 * @param string $color Default: null, format: '#RRGGBB(AA)'
	 * @return boolean|null
	 *
	 * Values not null will be set
	 */
	public static function editCalendar($id,$name=null,$components=null,$timezone=null,$order=null,$color=null) {

	}

	/**
	 * Sets a calendar (in)active
	 * @param integer $id
	 * @param boolean $active
	 * @return boolean|null
	 */
	public static function setCalendarActive($id,$active) {

	}

	/**
	 * Updates ctag for calendar
	 * @param integer $id
	 * @return boolean|null
	 */
	public static function touchCalendar($id) {

	}

	/**
	 * removes a calendar
	 * @param integer $id
	 * @return boolean|null
	 */
	public static function deleteCalendar($id) {

	}

	/**
	 * Creates a URI for Calendar
	 * @param string $name name of the calendar
	 * @param array  $existing existing calendar URIs
	 * @return string uri
	 */
	public static function createURI($name,$existing) {

	}

	/**
	 * gets the userid from a principal path
	 * @return string
	 */
	public static function extractUserID($principaluri) {

	}

	/**
	 * generates the Event Source Info for our JS
	 * @param array $calendar calendar data
	 * @return array
	 */
	public static function getEventSourceInfo($calendar) {

	}

	/*
	 * checks if a calendar name is available for a user
	 * @param string $calendarname
	 * @param string $userid
	 * @return boolean
	 */
	public static function isCalendarNameavailable($calendarname, $userid) {

	}
}