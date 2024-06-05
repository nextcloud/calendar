/**
 * SPDX-FileCopyrightText: 2019 Nextcloud GmbH and Nextcloud contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */
import { AttendeeProperty } from '@nextcloud/calendar-js'
import { getBusySlots } from '../../services/freeBusySlotService.js'

/**
 * Returns an event source for free-busy
 *
 * @param {string} id Identification for this source
 * @param {AttendeeProperty} organizer The organizer of the event
 * @param {AttendeeProperty[]} attendees Array of the event's attendees
 * @return {{startEditable: boolean, resourceEditable: boolean, editable: boolean, id: string, durationEditable: boolean, events: events}}
 */
export default function(id, organizer, attendees) {
	return {
		id: 'free-busy-event-source-' + id,
		editable: false,
		startEditable: false,
		durationEditable: false,
		resourceEditable: false,
		events: async ({ start, end, timeZone }, successCallback, failureCallback) => {
			const result = await getBusySlots(organizer, attendees, start, end, timeZone)
			if (result.error) {
				failureCallback(result.error)
			} else {
				successCallback(result.events)
			}
		},
	}
}
