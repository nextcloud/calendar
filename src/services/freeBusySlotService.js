/**
 * SPDX-FileCopyrightText: 2024 Nextcloud GmbH and Nextcloud contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import { AttendeeProperty, createFreeBusyRequest, DateTimeValue } from '@nextcloud/calendar-js'
import { findSchedulingOutbox } from './caldavService.js'
import freeBusyResourceEventSourceFunction from '../fullcalendar/eventSources/freeBusyResourceEventSourceFunction.js'
import getTimezoneManager from './timezoneDataProviderService.js'
import logger from '../utils/logger.js'

const daysToSearch = 7

/**
 * Get busy slots for organizer and/or attendee/s
 *
 * @param {Principal} organizer The organizer of the event
 * @param {AttendeeProperty[]} attendees Array of the event's attendees
 * @param {Date} start The start date and time of the event
 * @param {Date} end The end date and time of the event
 * @param timeZoneId
 * @param {boolean} bulk fetch all attendees in one request
 * @return {Promise<>}
 */
export async function getBusySlots(organizer, attendees, start, end, timeZoneId, bulk = true) {
	// We start searching a day earlier because if we don't availability events get cut off in weird ways
	const clonedStart = new Date(start.getTime())
	clonedStart.setDate(clonedStart.getDate() - 1)
	let timezoneObject = getTimezoneManager().getTimezoneForId(timeZoneId)
	if (!timezoneObject) {
		timezoneObject = getTimezoneManager().getTimezoneForId('UTC')
		logger.error(`FreeBusyEventSource: Timezone ${timeZoneId} not found, falling back to UTC.`)
	}

	const startDateTime = DateTimeValue.fromJSDate(clonedStart, true)
	const endDateTime = DateTimeValue.fromJSDate(end, true)
	let freeBusyComponent
	let isOrganizer = false
	if (bulk) {
		const organizerAsAttendee = new AttendeeProperty('ATTENDEE', organizer.email)
		freeBusyComponent = createFreeBusyRequest(startDateTime, endDateTime, organizer, [organizerAsAttendee, ...attendees])
	} else {
		freeBusyComponent = createFreeBusyRequest(startDateTime, endDateTime, organizer, attendees)
		isOrganizer = attendees[0].email === organizer.email
	}
	const freeBusyICS = freeBusyComponent.toICS()
	let outbox
	try {
		outbox = await findSchedulingOutbox()
	} catch (error) {
		return { error }
	}

	let freeBusyData
	try {
		freeBusyData = await outbox.freeBusyRequest(freeBusyICS)
	} catch (error) {
		return { error }
	}
	const events = []
	for (const [uri, data] of Object.entries(freeBusyData)) {
		if (bulk) {
			events.push(...freeBusyResourceEventSourceFunction(uri, data.calendarData, data.success, startDateTime, endDateTime, timezoneObject))
		} else {
			events.push(...freeBusyResourceEventSourceFunction(uri, data.calendarData, data.success, startDateTime, endDateTime, timezoneObject, attendees[0].commonName, isOrganizer))
		}
	}
	return { events }
}

/**
 * Get the first available slot for an event using the freebusy API
 *

 * @param {Date} start The start date and time of the event
 * @param {Date} end The end date and time of the event
 * @param retrievedEvents Events found by the freebusy API
 * @return []
 */
export function getFirstFreeSlot(start, end, retrievedEvents) {

	// Here we are trying to understand the duration of the event, this is needed to check that the start and end points of a theoretical slot are free
	let duration = getDurationInSeconds(start, end)
	if (duration === 0) {
		duration = 86400 // One day
	}

	// We check all events in a weekly span from the start of the event
	const endSearchDate = new Date(start)
	endSearchDate.setDate(start.getDate() + daysToSearch)

	if (retrievedEvents.error) {
		return [{ error: retrievedEvents.error }]
	}

	// Events have to be sorted to be checked cronologically
	let events = sortEvents(retrievedEvents)

	events = events.filter(function(event) {
	    return new Date(start) < new Date(event.end)
	})

	const totalSlots = []

	// Check times after every event
	for (let i = 0; i < events.length; i++) {
		const foundSlots = checkTime(new Date(events[i].end), duration, events)

		if (foundSlots) totalSlots.push(foundSlots)
	}

	// Check current time
	const foundSlots = checkTime(new Date(start), duration, events, false, false)

	if (foundSlots) {
		totalSlots.unshift(foundSlots)
	}

	return totalSlots
}

/**
 *
 * @param start
 * @param end
 * @return {number}
 */
function getDurationInSeconds(start, end) {
	// Convert dates to UTC to account for daylight saving time
	const startUTC = new Date(start).toUTCString()
	const endUTC = new Date(end).toUTCString()

	const durationMs = new Date(endUTC) - new Date(startUTC)
	// Convert milliseconds to seconds
	return Math.floor(durationMs / 1000)
}

/**
 *
 * @param currentCheckedTime
 * @param duration
 * @param events
 * @param toRound
 * @parma toRound
 */
function checkTime(currentCheckedTime, duration, events, toRound = true) {
	let timeValid = true

	// We sometimes don't want to round, like when using the current time
	if (toRound) {
		currentCheckedTime = roundToNearestQuarter(currentCheckedTime)
	}

	const currentCheckedTimeEnd = new Date(currentCheckedTime)
	currentCheckedTimeEnd.setSeconds(currentCheckedTime.getSeconds() + duration)

	events.every(
		(event) => {
			const eventStart = new Date(event.start)
			const eventEnd = new Date(event.end)

			// Start of event is within the range that we are checking
			if (eventStart >= currentCheckedTime && eventStart <= currentCheckedTimeEnd) {
				timeValid = false
				return false
			}

			// End of event is within range that we are checking
			if (eventEnd >= currentCheckedTime && eventEnd <= currentCheckedTimeEnd) {
				timeValid = false
				return false
			}

			// Range that we are checking is within ends of event
			if (eventStart <= currentCheckedTime && eventEnd >= currentCheckedTimeEnd) {
				timeValid = false
				return false
			}
			return true
		},
	)

	if (timeValid) {
		return { start: currentCheckedTime, end: currentCheckedTimeEnd }
	} else {
		return false
	}
}

/**
 *
 * @param events
 */
function sortEvents(events) {
	// Remove events that have the same start and end time, if not done causes problems
	const mappedEvents = new Map()

	for (const obj of events) {
		const key = obj.start.toString() + obj.end.toString()

		if (!mappedEvents.has(key)) {
			mappedEvents.set(key, obj)
		}
	}

	return Array.from(mappedEvents.values()).sort((a, b) => new Date(a.start) - new Date(b.start))
}

/**
 *
 * @param date
 */
function roundToNearestQuarter(date) {
	// Needed because it doesn't work with 0
	if (date.getMinutes() % 15 === 0) date.setMinutes(date.getMinutes() + 1)

	const roundedMinutes = Math.ceil(date.getMinutes() / 15) * 15

	date.setMinutes(roundedMinutes)

	// Reset seconds and milliseconds
	date.setSeconds(0)
	date.setMilliseconds(0)

	return date
}
