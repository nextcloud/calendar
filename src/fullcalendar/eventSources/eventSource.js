/**
 * SPDX-FileCopyrightText: 2019 Nextcloud GmbH and Nextcloud contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */
import {
	generateTextColorForHex,
} from '../../utils/color.js'
import getTimezoneManager from '../../services/timezoneDataProviderService.js'
import { getUnixTimestampFromDate } from '../../utils/date.js'
import { eventSourceFunction } from './eventSourceFunction.js'
import logger from '../../utils/logger.js'

/**
 * Returns a function to generate a FullCalendar event-source based on the Vuex calendar model
 *
 * @param {object} store The Vuex store
 * @return {function(*=): {backgroundColor: *, borderColor: *, className: *, id: *, textColor: *, events: events}}
 */
export default function(store) {
	return function(calendar) {
		const source = {
			id: calendar.id,
			// coloring
			backgroundColor: calendar.color,
			className: 'fc-event--'+calendar.pattern,
			borderColor: calendar.color,
			textColor: generateTextColorForHex(calendar.color),
			// html foo
			events: async ({ start, end, timeZone }, successCallback, failureCallback) => {
				let timezoneObject = getTimezoneManager().getTimezoneForId(timeZone)
				if (!timezoneObject) {
					timezoneObject = getTimezoneManager().getTimezoneForId('UTC')
					logger.error(`EventSource: Timezone ${timeZone} not found, falling back to UTC.`)
				}

				// This code assumes that once a time range has been fetched it won't be changed
				// outside of the vuex store. Triggering a refetch will just update all known
				// calendar objects inside this time range. New events that were added to a cached
				// time range externally will not be fetched and have to be added manually.
				const timeRange = store.getters.getTimeRangeForCalendarCoveringRange(calendar.id, getUnixTimestampFromDate(start), getUnixTimestampFromDate(end))
				if (!timeRange) {
					let timeRangeId
					try {
						timeRangeId = await store.dispatch('getEventsFromCalendarInTimeRange', {
							calendar,
							from: start,
							to: end,
						})
					} catch (error) {
						failureCallback(error)
						return
					}

					const calendarObjects = store.getters.getCalendarObjectsByTimeRangeId(timeRangeId)
					successCallback(eventSourceFunction(calendarObjects, calendar, start, end, timezoneObject))
				} else {
					const calendarObjects = store.getters.getCalendarObjectsByTimeRangeId(timeRange.id)
					successCallback(eventSourceFunction(calendarObjects, calendar, start, end, timezoneObject))
				}
			},
		}

		if (calendar.readOnly) {
			source.editable = false
		}

		return source
	}
}
