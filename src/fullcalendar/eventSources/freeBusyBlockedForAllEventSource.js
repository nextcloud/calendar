/*
 * @copyright 2021 Christoph Wurst <christoph@winzerhof-wurst.at>
 *
 * @author 2021 Christoph Wurst <christoph@winzerhof-wurst.at>
 *
 * @license GNU AGPL version 3 or any later version
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as
 * published by the Free Software Foundation, either version 3 of the
 * License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */
import getTimezoneManager from '../../services/timezoneDataProviderService.js'
import { createFreeBusyRequest, getParserManager } from 'calendar-js'
import DateTimeValue from 'calendar-js/src/values/dateTimeValue.js'
import { findSchedulingOutbox } from '../../services/caldavService.js'
import logger from '../../utils/logger.js'
import AttendeeProperty from 'calendar-js/src/properties/attendeeProperty.js'

/**
 * Returns an event source for free-busy
 *
 * @param {AttendeeProperty} organizer The organizer of the event
 * @param {AttendeeProperty[]} attendees Array of the event's attendees
 * @param {String[]} resources List of resources
 * @returns {{startEditable: boolean, resourceEditable: boolean, editable: boolean, id: string, durationEditable: boolean, events: events}}
 */
export default function(organizer, attendees, resources) {
	const resourceIds = resources.map((resource) => resource.id)

	return {
		id: 'free-busy-free-for-all',
		editable: false,
		startEditable: false,
		durationEditable: false,
		resourceEditable: false,
		events: async({
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
			const freeBusyComponent = createFreeBusyRequest(startDateTime, endDateTime, organizer, [organizerAsAttendee, ...attendees])
			const freeBusyICS = freeBusyComponent.toICS()

			let outbox
			try {
				outbox = await findSchedulingOutbox()
			} catch (error) {
				failureCallback(error)
				return
			}

			let freeBusyData
			try {
				freeBusyData = await outbox.freeBusyRequest(freeBusyICS)
			} catch (error) {
				failureCallback(error)
				return
			}

			const slots = []
			for (const [, data] of Object.entries(freeBusyData)) {
				if (!data.success) {
					continue
				}

				const parserManager = getParserManager()
				const parser = parserManager.getParserForFileType('text/calendar')
				parser.parse(data.calendarData)

				// TODO: fix me upstream, parser only exports VEVENT, VJOURNAL and VTODO at the moment
				const calendarComponent = parser._calendarComponent
				const freeBusyComponent = calendarComponent.getFirstComponent('VFREEBUSY')
				if (!freeBusyComponent) {
					continue
				}

				for (const freeBusyProperty of freeBusyComponent.getPropertyIterator('FREEBUSY')) {
					if (freeBusyProperty.type === 'FREE') {
						// We care about anything BUT free slots
						continue
					}

					slots.push({
						start: freeBusyProperty.getFirstValue().start.getInTimezone(timezoneObject).jsDate,
						end: freeBusyProperty.getFirstValue().end.getInTimezone(timezoneObject).jsDate,
					})
				}
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
					resourceIds: resourceIds,
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

/***
 * Try to combine slots after the given starting date
 *
 * @param {{start: Date, end: Date}[]} slots The slots to combine
 * @param {Date} start Combine slots after this date
 * @returns {undefined|{start: Date, end: Date}} The combined date or undefined if no overlaps were found
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
