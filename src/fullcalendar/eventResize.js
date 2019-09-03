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
import { getDurationValueFromFullCalendarDuration } from './duration'

/**
 * Returns a function to resize an event
 *
 * @param {Object} store The Vuex Store
 * @returns {Function}
 */
export default function(store) {
	return function({ event, prevEvent, startDelta, endDelta, revert }) {
		const startDeltaDuration = getDurationValueFromFullCalendarDuration(startDelta)
		const endDeltaDuration = getDurationValueFromFullCalendarDuration(endDelta)

		if (!startDeltaDuration && !endDeltaDuration) {
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

				if (startDeltaDuration) {
					eventComponent.addDurationToStart(startDeltaDuration)
				}
				if (endDeltaDuration) {
					eventComponent.addDurationToEnd(endDeltaDuration)
				}

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
