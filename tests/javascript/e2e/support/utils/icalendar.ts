/**
 * SPDX-FileCopyrightText: 2026 Nextcloud GmbH and Nextcloud contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

// Builds and parses iCalendar data, without talking to the server (see `caldav.ts` for that).

import ICAL from 'ical.js'

/**
 * An event to create, see `buildEvent`.
 */
export interface EventDetails {
	/** Unique id of the event */
	uid: string
	/** Title of the event */
	title: string
	/** Start of the event */
	start: Date
	/** End of the event */
	end: Date
	/** iCalendar recurrence rule, e.g. `FREQ=DAILY;COUNT=3` */
	recurrenceRule?: string
	/** Email of the organizer of the event */
	organizerEmail?: string
	/** Emails of the attendees of the event */
	attendeeEmails?: string[]
}

/**
 * An occurrence of a saved event.
 */
export interface Occurrence {
	/** Start of the occurrence */
	start: Date
	/** Value of the requested property of the occurrence, `null` if it does not have the property */
	value: unknown
}

/**
 * Format a date as an iCalendar date-time in UTC, e.g. `20260115T100000Z`.
 *
 * @param date The date to format
 */
function toICalendarDateTime(date: Date): string {
	return date.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '')
}

/**
 * Build the iCalendar data of an event resource.
 *
 * @param details The event
 * @return The iCalendar data
 */
export function buildEvent(details: EventDetails): string {
	const { uid, title, start, end, recurrenceRule, organizerEmail, attendeeEmails = [] } = details
	return [
		'BEGIN:VCALENDAR',
		'VERSION:2.0',
		'PRODID:-//Nextcloud calendar E2E tests//EN',
		'BEGIN:VEVENT',
		`UID:${uid}`,
		`DTSTAMP:${toICalendarDateTime(new Date())}`,
		`DTSTART:${toICalendarDateTime(start)}`,
		`DTEND:${toICalendarDateTime(end)}`,
		`SUMMARY:${title}`,
		...(recurrenceRule === undefined ? [] : [`RRULE:${recurrenceRule}`]),
		...(organizerEmail === undefined ? [] : [`ORGANIZER:mailto:${organizerEmail}`]),
		...attendeeEmails.map((email) => `ATTENDEE;PARTSTAT=NEEDS-ACTION;RSVP=TRUE:mailto:${email}`),
		'END:VEVENT',
		'END:VCALENDAR',
	].join('\r\n')
}

/**
 * Get the events of an event resource: the event or the series, and the exceptions of the series.
 *
 * @param calendarData iCalendar data of the event resource
 */
export function getEventComponents(calendarData: string): ICAL.Component[] {
	return ICAL.Component.fromString(calendarData).getAllSubcomponents('vevent')
}

/**
 * Get the occurrences of an event resource, including the changes of its exceptions.
 * A recurring event needs to end, e.g. with `COUNT`.
 *
 * @param calendarData iCalendar data of the event resource
 * @param propertyName Name of the property to get the value of for each occurrence
 * @return The occurrences, in their order
 */
export function getOccurrences(calendarData: string, propertyName: string): Occurrence[] {
	const events = getEventComponents(calendarData)
	const master = events.find((component) => !component.hasProperty('recurrence-id'))
	if (master === undefined) {
		throw new Error(`No event without a recurrence id in: ${calendarData}`)
	}
	// Relates the exceptions next to it in the calendar data.
	const event = new ICAL.Event(master)
	if (!event.isRecurring()) {
		return [{ start: event.startDate.toJSDate(), value: master.getFirstPropertyValue(propertyName) }]
	}

	const occurrences: Occurrence[] = []
	const iterator = event.iterator()
	for (let date = iterator.next(); date; date = iterator.next()) {
		const { startDate, item } = event.getOccurrenceDetails(date)
		occurrences.push({ start: startDate.toJSDate(), value: item.component.getFirstPropertyValue(propertyName) })
	}
	return occurrences
}
