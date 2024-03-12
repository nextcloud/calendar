/**
 * @copyright Copyright (c) 2019 Georg Ehrke
 *
 * @author Georg Ehrke <oc.list@georgehrke.com>
 * @author 2024 Grigory Vodyanov <scratchx@gmx.com>
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
