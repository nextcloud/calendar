/**
 * SPDX-FileCopyrightText: 2025 Nextcloud GmbH and Nextcloud contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */
import { AttendeeProperty } from '@nextcloud/calendar-js'
import { getBusySlots } from '../../services/freeBusySlotService.js'

/**
 * Returns an event source for event free-busy
 *
 * @param {string} id Identification for this source
 * @param {AttendeeProperty} organizer The organizer of the event
 * @param {AttendeeProperty} attendee The event's attendee
 * @return {{startEditable: boolean, resourceEditable: boolean, editable: boolean, id: string, durationEditable: boolean, events: events, color: string}}
 */
export default function(id, organizer, attendee) {
	return {
		id: 'free-busy-event-source-' + id,
		editable: false,
		startEditable: false,
		durationEditable: false,
		resourceEditable: false,
		events: async ({ start, end, timeZone }, successCallback, failureCallback) => {
			const result = await getBusySlots(organizer, [attendee], start, end, timeZone, false)
			if (result.error) {
				failureCallback(result.error)
			} else {
				successCallback(result.events)
			}
		},
	}
}
