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
class OC_Migration_Provider_Calendar extends OC_Migration_Provider{

	// Create the xml for the user supplied
	function export( ) {
		$options = array(
			'table'=>'calendar_calendars',
			'matchcol'=>'userid',
			'matchval'=>$this->uid,
			'idcol'=>'id'
		);
		$ids = $this->content->copyRows( $options );

		$options = array(
			'table'=>'calendar_objects',
			'matchcol'=>'calendarid',
			'matchval'=>$ids
		);

		// Export tags
		$ids2 = $this->content->copyRows( $options );

		// If both returned some ids then they worked
		if(is_array($ids) && is_array($ids2)) {
			return true;
		} else {
			return false;
		}

	}

	// Import function for calendar
	function import( ) {
		switch( $this->appinfo->version ) {
			default:
				// All versions of the app have had the same db structure, so all can use the same import function
				$query = $this->content->prepare( 'SELECT * FROM `calendar_calendars` WHERE `userid` = ?' );
				$results = $query->execute( array( $this->olduid ) );
				$idmap = array();
				while( $row = $results->fetchRow() ) {
					// Import each calendar
					$calendarquery = OCP\DB::prepare( 'INSERT INTO `*PREFIX*calendar_calendars` (`userid`,`displayname`,`uri`,`ctag`,`calendarorder`,`calendarcolor`,`timezone`,`components`) VALUES(?,?,?,?,?,?,?,?)' );
					$calendarquery->execute(array( $this->uid, $row['displayname'], $row['uri'], $row['ctag'], $row['calendarorder'], $row['calendarcolor'], $row['timezone'], $row['components']));
					// Map the id
					$idmap[$row['id']] = OCP\DB::insertid('*PREFIX*calendar_calendars');
					// Make the calendar active
					OC_Calendar_Calendar::setCalendarActive($idmap[$row['id']], true);
				}
				// Now tags
				foreach($idmap as $oldid => $newid) {

					$query = $this->content->prepare( 'SELECT * FROM `calendar_objects` WHERE `calendarid` = ?' );
					$results = $query->execute( array( $oldid ) );
					while( $row = $results->fetchRow() ) {
						// Import the objects
						$objectquery = OCP\DB::prepare( 'INSERT INTO `*PREFIX*calendar_objects` (`calendarid`,`objecttype`,`startdate`,`enddate`,`repeating`,`summary`,`calendardata`,`uri`,`lastmodified`) VALUES(?,?,?,?,?,?,?,?,?)' );
						$objectquery->execute(array( $newid, $row['objecttype'], $row['startdate'], $row['enddate'], $row['repeating'], $row['summary'], $row['calendardata'], $row['uri'], $row['lastmodified'] ));
					}
				}
				// All done!
			break;
		}

		return true;
	}

}

// Load the provider
new OC_Migration_Provider_Calendar( 'calendar' );