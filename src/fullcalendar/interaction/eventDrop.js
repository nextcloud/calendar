/**
 * @copyright Copyright (c) 2019 Georg Ehrke
 *
 * @author Georg Ehrke <oc.list@georgehrke.com>
 *
 * @author Richard Steinmetz <richard@steinmetz.cloud>
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
import { getDurationValueFromFullCalendarDuration } from '../duration'
import getTimezoneManager from '../../services/timezoneDataProviderService'
import logger from '../../utils/logger.js'

/**
 * Returns a function to drop an event at a different position
 *
 * @param {object} store The Vuex store
 * @param {object} fcAPI The fullcalendar api
 * @return {Function}
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

		let objects
		try {
			const objectId = event.extendedProps.objectId
			const recurrenceId = event.extendedProps.recurrenceId
			objects = await store.dispatch('getCalendarObjectInstanceByObjectIdAndRecurrenceId', {
				objectId,
				recurrenceId,
			})
		} catch (error) {
			store.commit('resetCalendarObjectInstanceObjectIdAndRecurrenceId')
			logger.error('Recurrence was not found', { error })
			revert()
			return
		}

		const { calendarObject, calendarObjectInstance } = objects
		const eventComponent = calendarObjectInstance.eventComponent

		try {
			// shiftByDuration may throw exceptions in certain cases
			eventComponent.shiftByDuration(deltaDuration, event.allDay, timezone, defaultAllDayDuration, defaultTimedDuration)
		} catch (error) {
			store.commit('resetCalendarObjectToDav', {
				calendarObject,
			})
			store.commit('resetCalendarObjectInstanceObjectIdAndRecurrenceId')
			logger.error('Failed to shift event', { error })
			revert()
			return
		}

		try {
			// Show a modal to let the user decide whether to update this or all future instances.
			// Non-recurring events or recurrence exceptions can just be dropped and don't require
			// extra user interaction.
			let thisAndAllFuture = false
			if (eventComponent.isPartOfRecurrenceSet() && eventComponent.canCreateRecurrenceExceptions()) {
				thisAndAllFuture = await store.dispatch('showDragRecurrenceModal', {
					eventComponent,
				})
			}

			await store.dispatch('saveCalendarObjectInstance', {
				thisAndAllFuture,
				calendarId: calendarObject.calendarId,
			})
		} catch (error) {
			store.commit('resetCalendarObjectToDav', {
				calendarObject,
			})
			if (error !== 'closedByUser') {
				logger.error('Could not drop event', { error })
			}
			revert()
		} finally {
			store.commit('resetCalendarObjectInstanceObjectIdAndRecurrenceId')
		}
	}
}
