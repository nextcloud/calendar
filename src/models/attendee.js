/**
 * @copyright Copyright (c) 2020 Georg Ehrke
 * @copyright Copyright (c) 2023 Jonas Heinrich
 *
 * @author Georg Ehrke <oc.list@georgehrke.com>
 * @author Jonas Heinrich <heinrich@synyx.net>
 *
 * @license AGPL-3.0-or-later
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as
 * published by the Free Software Foundation, either version 3 of the
 * License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program. If not, see <http://www.gnu.org/licenses/>.
 *
 */

/**
 * Creates a complete attendee object based on given props
 *
 * TODO:
 *  - we should eventually support delegatedFrom and delegatedTo
 *
 * @param {object} props The attendee properties already provided
 * @return {object}
 */
const getDefaultAttendeeObject = (props = {}) => Object.assign({}, {
	// The calendar-js attendee property
	attendeeProperty: null,
	// The display-name of the attendee
	commonName: null,
	// The calendar-user-type of the attendee
	calendarUserType: 'INDIVIDUAL',
	// The participation status of the attendee
	participationStatus: 'NEEDS-ACTION',
	// The role of the attendee
	role: 'REQ-PARTICIPANT',
	// The RSVP for the attendee
	rsvp: false,
	// The uri of the attendee
	uri: null,
	// Member address of the attendee
	member: null,
}, props)

/**
 * Maps a calendar-js attendee property to our attendee object
 *
 * @param {AttendeeProperty} attendeeProperty The calendar-js attendeeProperty to turn into a attendee object
 * @return {object}
 */
const mapAttendeePropertyToAttendeeObject = (attendeeProperty) => {
	return getDefaultAttendeeObject({
		attendeeProperty,
		commonName: attendeeProperty.commonName,
		calendarUserType: attendeeProperty.userType,
		participationStatus: attendeeProperty.participationStatus,
		role: attendeeProperty.role,
		rsvp: attendeeProperty.rsvp,
		uri: attendeeProperty.email,
		member: attendeeProperty.member,
	})
}

export {
	getDefaultAttendeeObject,
	mapAttendeePropertyToAttendeeObject,
}
