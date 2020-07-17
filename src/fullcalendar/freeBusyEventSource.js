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
import getTimezoneManager from '../services/timezoneDataProviderService.js'
import { createFreeBusyRequest } from 'calendar-js'
import DateTimeValue from 'calendar-js/src/values/dateTimeValue.js'
import client from '../services/caldavService.js'
import freeBusyEventSourceFunction from './freeBusyEventSourceFunction.js'
import logger from '../utils/logger.js'
// import AttendeeProperty from 'calendar-js/src/properties/attendeeProperty.js'

/**
 * Returns an event source for free-busy
 *
 * @param {String} id Identification for this source
 * @param {AttendeeProperty} organizer The organizer of the event
 * @param {AttendeeProperty[]} attendees Array of the event's attendees
 * @returns {{startEditable: boolean, resourceEditable: boolean, editable: boolean, id: string, durationEditable: boolean, events: events}}
 */
export default function(id, organizer, attendees) {
	return {
		id: 'free-busy-event-source-' + id,
		editable: false,
		startEditable: false,
		durationEditable: false,
		resourceEditable: false,
		events: async({ start, end, timeZone }, successCallback, failureCallback) => {
			console.debug(start, end, timeZone)

			let timezoneObject = getTimezoneManager().getTimezoneForId(timeZone)
			if (!timezoneObject) {
				timezoneObject = getTimezoneManager().getTimezoneForId('UTC')
				logger.error(`FreeBusyEventSource: Timezone ${timeZone} not found, falling back to UTC.`)
			}

			const startDateTime = DateTimeValue.fromJSDate(start, true)
			const endDateTime = DateTimeValue.fromJSDate(end, true)

			// const organizerAsAttendee = new AttendeeProperty('ATTENDEE', organizer.email)
			const freeBusyComponent = createFreeBusyRequest(startDateTime, endDateTime, organizer, attendees)
			const freeBusyICS = freeBusyComponent.toICS()

			let outbox
			try {
				const outboxes = await client.calendarHomes[0].findAllScheduleOutboxes()
				outbox = outboxes[0]
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
			const events = []
			for (const [uri, data] of Object.entries(freeBusyData)) {
				events.push(...freeBusyEventSourceFunction(uri, data.calendarData, data.success, startDateTime, endDateTime, timezoneObject))
			}

			console.debug(events)
			successCallback(events)
		},
	}
}
