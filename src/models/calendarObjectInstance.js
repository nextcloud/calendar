/**
 * @copyright Copyright (c) 2019 Georg Ehrke
 *
 * @author Georg Ehrke <oc.list@georgehrke.com>
 *
 * @license GNU AGPL version 3 or any later version
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
import { getDateFromDateTimeValue } from '../services/dateService.js'
import DurationValue from 'calendar-js/src/values/durationValue.js'

/**
 * Creates a complete calendar-object-instance-object based on given props
 *
 * @param {Object} props The props already provided
 * @returns {Object}
 */
export const getDefaultCalendarObjectInstanceObject = (props = {}) => Object.assign({}, {
	// Title of the event
	title: null,
	// Start date of the event
	startDate: null,
	// Timezone of the start date
	startTimezoneId: null,
	// End date of the event
	endDate: null,
	// Timezone of the end date
	endTimezoneId: null,
	// Indicator whether or not event is all-day
	isAllDay: false,
	// Location that the event takes places in
	location: null,
	// description of the event
	description: null,
	// Access class of the event (PUBLIC, PRIVATE, CONFIDENTIAL)
	accessClass: null,
	// Status of the event (CONFIRMED, TENTATIVE, CANCELLED)
	status: null,
	// Whether or not to block this event in Free-Busy reports (TRANSPARENT, OPAQUE)
	timeTransparency: null,
	// The recurrence rule of this event. We only support one recurrence-rule
	recurrenceRule: {},
	// Attendees of this event
	attendees: [],
	// Organizer of the event
	organizer: {
		// name of the organizer
		name: null,
		// email of the organzier:
		uri: null
	},
	// Alarm of the event
	alarms: [],
	// Custom color of the event
	customColor: null,
	// Categories
	categories: [],
	// Wether or not the user is allowed to toggle the all-day checkbox
	canModifyAllDay: true,
	// The real event-component coming from calendar-js
	eventComponent: null,
}, props)

/**
 * Map an EventComponent from calendar-js to our calendar object instance object
 *
 * @param {EventComponent} eventComponent The EventComponent object to map to an object
 * @returns {{color: *, attendees: [], timeTransparency: *, alarms: [], description: *, location: *, eventComponent: *, categories: [], title: *, accessClass: *, status: *}}
 */
export const mapEventComponentToCalendarObjectInstanceObject = (eventComponent) => {
	const calendarObjectInstanceObject = {
		title: eventComponent.title,
		location: eventComponent.location,
		description: eventComponent.description,
		accessClass: eventComponent.accessClass,
		status: eventComponent.status,
		timeTransparency: eventComponent.timeTransparency,
		color: eventComponent.color,
		attendees: [],
		alarms: [],
		categories: [],
		organizer: null,
		canModifyAllDay: eventComponent.canModifyAllDay(),
		eventComponent
	}

	// The end date of an event is non-inclusive. This is rather intuitive for timed-events, but very unintuitive for all-day events.
	// That's why, when an events is from 2019-10-03 to 2019-10-04, we will show 2019-10-03 to 2019-10-03 in the editor.
	calendarObjectInstanceObject.isAllDay = eventComponent.isAllDay()
	calendarObjectInstanceObject.startDate = getDateFromDateTimeValue(eventComponent.startDate)
	calendarObjectInstanceObject.startTimezoneId = eventComponent.startDate.timezoneId

	if (eventComponent.isAllDay()) {
		const endDate = eventComponent.endDate.clone()
		endDate.addDuration(DurationValue.fromSeconds(-1 * 60 * 60 * 24))
		calendarObjectInstanceObject.endDate = getDateFromDateTimeValue(endDate)
	} else {
		calendarObjectInstanceObject.endDate = getDateFromDateTimeValue(eventComponent.endDate)
	}
	calendarObjectInstanceObject.endTimezoneId = eventComponent.endDate.timezoneId

	for (const attendee of eventComponent.getAttendeeIterator()) {
		calendarObjectInstanceObject.attendees.push({
			commonName: attendee.commonName,
			participationStatus: attendee.participationStatus,
			role: attendee.role,
			rsvp: attendee.rsvp,
			uri: attendee.email,
			attendeeProperty: attendee
		})
	}

	for (const alarm of eventComponent.getAlarmIterator()) {
		calendarObjectInstanceObject.alarms.push({
			type: alarm.action,
			// triggerDate:
			// isRelative: alarm.trigger.isRelative()
			alarmComponent: alarm
		})
	}

	for (const category of eventComponent.getCategoryIterator()) {
		calendarObjectInstanceObject.categories.push(category)
	}

	if (eventComponent.organizer) {
		const organizerProperty = eventComponent.getFirstProperty('ORGANIZER')
		calendarObjectInstanceObject.organizer = {
			name: organizerProperty.name,
			uri: organizerProperty.email
		}
	}

	return calendarObjectInstanceObject
}
