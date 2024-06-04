/**
 * SPDX-FileCopyrightText: 2021 Nextcloud GmbH and Nextcloud contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */
import getTimezoneManager from '../../services/timezoneDataProviderService.js'
import { AttendeeProperty, DateTimeValue } from '@nextcloud/calendar-js'
import logger from '../../utils/logger.js'
import { doFreeBusyRequest } from '../../utils/freebusy.js'

/**
 * Returns an event source for free-busy
 *
 * @param {AttendeeProperty} organizer The organizer of the event
 * @param {AttendeeProperty[]} attendees Array of the event's attendees
 * @param {string[]} resources List of resources
 * @return {{startEditable: boolean, resourceEditable: boolean, editable: boolean, id: string, durationEditable: boolean, events: events}}
 */
export default function(organizer, attendees, resources) {
	const resourceIds = resources.map((resource) => resource.id)

	return {
		id: 'free-busy-free-for-all',
		editable: false,
		startEditable: false,
		durationEditable: false,
		resourceEditable: false,
		events: async ({
						   start,
						   end,
						   timeZone,
					   }, successCallback, failureCallback) => {
			console.debug('freeBusyBlockedForAllEventSource', start, end, timeZone)

			let timezoneObject = getTimezoneManager().getTimezoneForId(timeZone)
			if (!timezoneObject) {
				timezoneObject = getTimezoneManager().getTimezoneForId('UTC')
				logger.error(`FreeBusyEventSource: Timezone ${timeZone} not found, falling back to UTC.`)
			}

			const startDateTime = DateTimeValue.fromJSDate(start, true)
			const endDateTime = DateTimeValue.fromJSDate(end, true)

			const organizerAsAttendee = new AttendeeProperty('ATTENDEE', organizer.email)
			const freeBusyIterator = await doFreeBusyRequest(
				startDateTime,
				endDateTime,
				organizer,
				[organizerAsAttendee, ...attendees],
			)

			const slots = []
			for await (const [, freeBusyProperty] of freeBusyIterator) {
				slots.push({
					start: freeBusyProperty.getFirstValue().start.getInTimezone(timezoneObject).jsDate,
					end: freeBusyProperty.getFirstValue().end.getInTimezone(timezoneObject).jsDate,
				})
			}

			// Now that we have all the busy slots we try to combine them to iron
			// out any overlaps between them.
			// The algorithm below will sort the slots by their start time ane then
			// iteratively collapse anything that starts and stops within the same
			// time. The complexity of this algorithms is n^2, but assuming the
			// number of attendees of an event is relatively low, this should be
			// fine to calculate.
			slots.sort((a, b) => a.start - b.start)
			const slotsWithoutOverlap = []
			if (slots.length) {
				let currentSlotStart = slots[0].start
				slots.forEach(slot => {
					const combined = findNextCombinedSlot(slots, currentSlotStart) ?? slot
					if (combined.start < currentSlotStart) {
						// This slot has already been combined with a former slot
						return
					}

					slotsWithoutOverlap.push(combined)
					currentSlotStart = combined.end
				})
			}
			console.debug('deduplicated slots', slots, slotsWithoutOverlap)

			const events = slotsWithoutOverlap.map(slot => {
				return {
					groupId: 'free-busy-blocked-for-all',
					start: slot.start.toISOString(),
					end: slot.end.toISOString(),
					resourceIds,
					display: 'background',
					allDay: false,
					backgroundColor: 'var(--color-text-maxcontrast)',
					borderColor: 'var(--color-text-maxcontrast)',
				}
			})

			console.debug('freeBusyBlockedForAllEventSource', slots, events)

			successCallback(events)
		},
	}
}

/**
 * @param {object} slots the slots
 * @param {Date} start the start
 */
function findNextCombinedSlot(slots, start) {
	const slot = slots
		.filter(slot => slot.start >= start)
		.reduce((combined, slot) => {
			if (slot.start < combined.start) {
				// This slot starts too early
				return combined
			}

			if (slot.end <= combined.end) {
				// This slots starts and ends within the combined one
				return combined
			}

			if (slot.start > combined.end) {
				// This slots starts after the the combined one
				return combined
			}

			// The slot is extended
			return {
				start: combined.start,
				end: slot.end,
			}
		}, {
			start,
			end: start,
		})

	if (slot.start === slot.end) {
		// Empty -> no slot
		return undefined
	}

	return slot
}
