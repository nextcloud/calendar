/**
 * SPDX-FileCopyrightText: 2020 Nextcloud GmbH and Nextcloud contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import { getDateFromDateTimeValue } from '../utils/date.js'
import { DurationValue, DateTimeValue } from '@nextcloud/calendar-js'
import { getHexForColorName, getClosestCSS3ColorNameForHex } from '../utils/color.js'
import { mapAlarmComponentToAlarmObject } from './alarm.js'
import { mapAttendeePropertyToAttendeeObject } from './attendee.js'
import { mapAttachmentPropertyToAttchmentObject } from './attachment.js'
import {
	getDefaultRecurrenceRuleObject,
	mapRecurrenceRuleValueToRecurrenceRuleObject,
} from './recurrenceRule.js'

/**
 * Creates a complete calendar-object-instance-object based on given props
 *
 * @param {object} props The props already provided
 * @return {object}
 */
const getDefaultEventObject = (props = {}) => Object.assign({}, {
	// The real event-component coming from calendar-js
	eventComponent: null,
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
	// Whether or not the user is allowed to toggle the all-day checkbox
	canModifyAllDay: true,
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
	recurrenceRule: getDefaultRecurrenceRuleObject(),
	// Whether or not this event has multiple recurrence-rules
	hasMultipleRRules: false,
	// Whether or not this is the master item
	isMasterItem: false,
	// Whether or not this is a recurrence-exception
	isRecurrenceException: false,
	// Whether or not the applied modifications require to update this and all future
	forceThisAndAllFuture: false,
	// Whether or not it's possible to create a recurrence-exception for this event
	canCreateRecurrenceException: false,
	// Attendees of this event
	attendees: [],
	// Organizer of the event
	organizer: null,
	// Alarm of the event
	alarms: [],
	// Custom color of the event
	customColor: null,
	// Categories
	categories: [],
	// Attachments of this event
	attachments: [],
}, props)

/**
 *
 * @param {EventComponent} eventComponent The calendar-js eventComponent
 * @return {object}
 */
const mapEventComponentToEventObject = (eventComponent) => {
	const eventObject = getDefaultEventObject({
		eventComponent,
		title: eventComponent.title,
		isAllDay: eventComponent.isAllDay(),
		canModifyAllDay: eventComponent.canModifyAllDay(),
		location: eventComponent.location,
		description: eventComponent.description,
		accessClass: eventComponent.accessClass,
		status: eventComponent.status,
		timeTransparency: eventComponent.timeTransparency,
		categories: Array.from(eventComponent.getCategoryIterator()),
		isMasterItem: eventComponent.isMasterItem(),
		isRecurrenceException: eventComponent.isRecurrenceException(),
		canCreateRecurrenceException: eventComponent.canCreateRecurrenceExceptions(),
	})

	/**
	 * According to RFC5545, DTEND is exclusive. This is rather intuitive for timed-events
	 * but rather unintuitive for all-day events
	 *
	 * That's why, when an event is all-day from 2019-10-03 to 2019-10-04,
	 * it will be displayed as 2019-10-03 to 2019-10-03 in the editor.
	 */
	eventObject.startDate = getDateFromDateTimeValue(eventComponent.startDate)
	eventObject.startTimezoneId = eventComponent.startDate.timezoneId

	if (eventComponent.isAllDay()) {
		const endDate = eventComponent.endDate.clone()
		endDate.addDuration(DurationValue.fromSeconds(-1 * 60 * 60 * 24))
		eventObject.endDate = getDateFromDateTimeValue(endDate)
	} else {
		eventObject.endDate = getDateFromDateTimeValue(eventComponent.endDate)
	}
	eventObject.endTimezoneId = eventComponent.endDate.timezoneId

	/**
	 * Extract organizer if there is any
	 */
	if (eventComponent.organizer) {
		const organizerProperty = eventComponent.getFirstProperty('ORGANIZER')
		eventObject.organizer = {
			commonName: organizerProperty.commonName,
			uri: organizerProperty.email,
			attendeeProperty: organizerProperty,
		}
	}

	/**
	 * Extract alarms
	 */
	for (const alarm of eventComponent.getAlarmIterator()) {
		eventObject.alarms.push(mapAlarmComponentToAlarmObject(alarm))
	}

	/**
	 * Extract attendees
	 */
	for (const attendee of eventComponent.getAttendeeIterator()) {
		eventObject.attendees.push(mapAttendeePropertyToAttendeeObject(attendee))
	}

	/**
	 * Extract attachments
	 */

	for (const attachment of eventComponent.getPropertyIterator('ATTACH')) {
		eventObject.attachments.push(mapAttachmentPropertyToAttchmentObject(attachment))
	}

	/**
	 * Extract recurrence-rule
	 */
	const recurrenceRuleIterator = eventComponent.getPropertyIterator('RRULE')
	const recurrenceRuleFirstIteration = recurrenceRuleIterator.next()

	const firstRecurrenceRule = recurrenceRuleFirstIteration.value
	if (firstRecurrenceRule) {
		eventObject.recurrenceRule = mapRecurrenceRuleValueToRecurrenceRuleObject(firstRecurrenceRule.getFirstValue(), eventComponent.startDate)
		eventObject.hasMultipleRRules = !recurrenceRuleIterator.next().done
	}

	/**
	 * Convert the CSS 3 color name to a hex color
	 */
	if (eventComponent.hasProperty('COLOR')) {
		const hexColor = getHexForColorName(eventComponent.getFirstPropertyFirstValue('COLOR'))
		if (hexColor !== null) {
			eventObject.customColor = hexColor
		}
	}

	return eventObject
}

/**
 * Copy data from a calendar-object-instance into a calendar-js event-component
 *
 * @param {object} eventObject The calendar-object-instance object
 * @param {EventComponent} eventComponent The calendar-js EventComponent object
 * @param {boolean} resetAttendeeStatus Whether or not to reset the attendee status
 */
const copyCalendarObjectInstanceIntoEventComponent = (eventObject, eventComponent, resetAttendeeStatus = false) => {
	eventComponent.title = eventObject.title
	eventComponent.location = eventObject.location
	eventComponent.description = eventObject.description
	eventComponent.accessClass = eventObject.accessClass
	eventComponent.status = eventObject.status
	eventComponent.timeTransparency = eventObject.timeTransparency

	for (const category of eventObject.categories) {
		eventComponent.addCategory(category)
	}

	if (eventObject.organizer) {
		eventComponent.setOrganizerFromNameAndEMail(eventObject.organizer.commonName, eventObject.organizer.uri)
	}

	for (const alarm of eventObject.alarms) {
		if (alarm.isRelative) {
			const duration = DurationValue.fromSeconds(alarm.relativeTrigger)
			eventComponent.addRelativeAlarm(alarm.type, duration, alarm.relativeIsRelatedToStart)
		} else {
			const date = DateTimeValue.fromJSDate(alarm.absoluteDate)
			eventComponent.addAbsoluteAlarm(alarm.type, date)
		}
	}

	for (const attendee of eventObject.attendees) {
		if (resetAttendeeStatus) {
			attendee.attendeeProperty.participationStatus = 'NEEDS-ACTION'
			attendee.attendeeProperty.rsvp = true
		}

		eventComponent.addProperty(attendee.attendeeProperty)
	}

	for (const rule of eventObject.eventComponent.getPropertyIterator('RRULE')) {
		eventComponent.addProperty(rule)
	}

	if (eventObject.customColor) {
		eventComponent.color = getClosestCSS3ColorNameForHex(eventObject.customColor)
	}
}

export {
	getDefaultEventObject,
	mapEventComponentToEventObject,
	copyCalendarObjectInstanceIntoEventComponent,
}
