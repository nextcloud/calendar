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
import { getDurationValueFromFullCalendarDuration } from '../fullcalendar/duration'
import getTimezoneManager from '../services/timezoneDataProviderService'
import logger from '../utils/logger.js'

/**
 * Returns a function to drop an event at a different position
 *
 * @param {Object} store The Vuex store
 * @param {Object} fcAPI The fullcalendar api
 * @returns {Function}
 */
export default function(store, fcAPI) {
	return async function({ event, delta, revert }) {
		const deltaDuration = getDurationValueFromFullCalendarDuration(delta)
		const defaultAllDayDuration = getDurationValueFromFullCalendarDuration(fcAPI.getOption('defaultAllDayEventDuration'))
		const defaultTimedDuration = getDurationValueFromFullCalendarDuration(fcAPI.getOption('defaultTimedEventDuration'))
		const timezoneId = fcAPI.getOption('timeZone')
		let timezone = getTimezoneManager().getTimezoneForId(timezoneId)
		if (!timezone) {
			timezone = getTimezoneManager().getTimezoneForId('UTC')
			logger.error(`EventDrop: Timezone ${timezoneId} not found, falling back to UTC.`)
		}

		if (!deltaDuration || !defaultAllDayDuration || !defaultTimedDuration) {
			revert()
			return
		}

		const objectId = event.extendedProps.objectId
		const recurrenceId = event.extendedProps.recurrenceId
		const recurrenceIdDate = new Date(recurrenceId * 1000)

		let calendarObject
		try {
			calendarObject = await store.dispatch('getEventByObjectId', { objectId })
		} catch (error) {
			console.debug(error)
			revert()
			return
		}

		const eventComponent = calendarObject.getObjectAtRecurrenceId(recurrenceIdDate)
		if (!eventComponent) {
			console.debug('Recurrence-id not found')
			revert()
			return
		}

		try {
			// shiftByDuration may throw exceptions in certain cases
			eventComponent.shiftByDuration(deltaDuration, event.allDay, timezone, defaultAllDayDuration, defaultTimedDuration)
		} catch (error) {
			calendarObject.resetToDav()
			console.debug(error)
			revert()
			return
		}

		if (eventComponent.canCreateRecurrenceExceptions()) {
			eventComponent.createRecurrenceException()
		}

		try {
			await store.dispatch('updateCalendarObject', {
				calendarObject,
			})
		} catch (error) {
			calendarObject.resetToDav()
			console.debug(error)
			revert()
		}
	}
}
