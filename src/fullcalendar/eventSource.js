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
import {
	generateTextColorForHex,
} from '../utils/color.js'
import getTimezoneManager from '../services/timezoneDataProviderService'
import { getUnixTimestampFromDate } from '../utils/date.js'
import { eventSourceFunction } from './eventSourceFunction.js'

/**
 * Returns a function to generate a FullCalendar event-source based on the Vuex calendar model
 *
 * @param {Object} store The Vuex store
 * @returns {function(*=): {backgroundColor: *, borderColor: *, className: *, id: *, textColor: *, events: events}}
 */
export default function(store) {
	return function(calendar) {
		const source = {
			id: calendar.id,
			// coloring
			backgroundColor: calendar.color,
			borderColor: calendar.color,
			textColor: generateTextColorForHex(calendar.color),
			// html foo
			events: async({ start, end, timeZone }, successCallback, failureCallback) => {
				const timezoneObject = getTimezoneManager().getTimezoneForId(timeZone)
				const timeRange = store.getters.getTimeRangeForCalendarCoveringRange(calendar.id, getUnixTimestampFromDate(start), getUnixTimestampFromDate(end))
				if (!timeRange) {
					let timeRangeId
					try {
						timeRangeId = await store.dispatch('getEventsFromCalendarInTimeRange', {
							calendar: calendar,
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

		if (calendar.isReadOnly) {
			source.editable = false
		}

		return source
	}
}
