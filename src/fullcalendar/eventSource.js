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
	generateTextColorForRGBString
} from '../services/colorService'
import getTimezoneManager from '../services/timezoneDataProviderService'
import { getUnixTimestampFromDate } from '../services/date'
import { eventSourceFunction } from './eventSourceFunction.js'

/**
 *
 * @param {Object} store The Vuex store
 * @returns {function(*): {backgroundColor: *, borderColor: *, editable: boolean, className: *, id: *, textColor: *, events: events}}
 */
export default function(store) {
	return function(calendar) {
		const source = {
			id: calendar.id,
			// coloring
			backgroundColor: calendar.color,
			borderColor: calendar.color,
			textColor: generateTextColorForRGBString(calendar.color),
			// html foo
			className: calendar.id,
			events: ({ start, end, timeZone }, successCallback, failureCallback) => {
				const timezoneObject = getTimezoneManager().getTimezoneForId(timeZone)
				const timeRange = store.getters.getTimeRangeForCalendarCoveringRange(calendar.id, getUnixTimestampFromDate(start), getUnixTimestampFromDate(end))
				if (!timeRange) {
					store.dispatch('getEventsFromCalendarInTimeRange', {
						calendar: calendar,
						from: start,
						to: end
					}).then(() => {
						const timeRange = store.getters.getTimeRangeForCalendarCoveringRange(calendar.id, getUnixTimestampFromDate(start), getUnixTimestampFromDate(end))
						const calendarObjects = store.getters.getCalendarObjectsByTimeRangeId(timeRange.id)
						successCallback(eventSourceFunction(calendarObjects, start, end, timezoneObject))
					})
				} else {
					const calendarObjects = store.getters.getCalendarObjectsByTimeRangeId(timeRange.id)
					successCallback(eventSourceFunction(calendarObjects, start, end, timezoneObject))
				}
			}
		}

		if (calendar.isReadOnly) {
			source.editable = false
		}

		return source
	}
}
