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

/**
 * Returns a function to drop an event at a different position
 *
 * @param {Object} store The Vuex store
 * @returns {Function}
 */
export default function(store) {
	return function({ event, oldEvent, delta, revert }) {
		const deltaDuration = getDurationValueFromFullCalendarDuration(delta)
		const defaultAllDayDuration = getDurationValueFromFullCalendarDuration(this.getOption('defaultAllDayEventDuration'))
		const defaultTimedDuration = getDurationValueFromFullCalendarDuration(this.getOption('defaultTimedEventDuration'))
		const timezoneId = this.getOption('timeZone')
		const timezone = getTimezoneManager().getTimezoneForId(timezoneId)

		if (!deltaDuration || !defaultAllDayDuration || !defaultTimedDuration) {
			revert()
			return
		}

		const objectId = event.extendedProps.objectId
		const recurrenceId = event.extendedProps.recurrenceId
		const recurrenceIdDate = new Date(recurrenceId * 1000)

		return store.dispatch('getEventByObjectId', { objectId })
			.then(() => {
				const calendarObject = store.getters.getCalendarObjectById(objectId)
				const eventComponent = calendarObject.getObjectAtRecurrenceId(recurrenceIdDate)

				if (!eventComponent) {
					console.debug('Recurrence-id not found')
					revert()
					return
				}

				eventComponent.shiftByDuration(deltaDuration, event.allDay, timezone, defaultAllDayDuration, defaultTimedDuration)
				if (eventComponent.canCreateRecurrenceExceptions()) {
					eventComponent.createRecurrenceException()
				}

				return store.dispatch('updateCalendarObject', {
					calendarObject
				})
			})
			.catch((err) => {
				console.debug(err)
				revert()
			})
	}
}
