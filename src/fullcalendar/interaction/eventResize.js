/**
 * SPDX-FileCopyrightText: 2019 Nextcloud GmbH and Nextcloud contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */
import { getDurationValueFromFullCalendarDuration } from '../duration.js'
import { getObjectAtRecurrenceId } from '../../utils/calendarObject.js'

/**
 * Returns a function to resize an event
 *
 * @param {object} store The Vuex Store
 * @return {Function}
 */
export default function(store) {
	return async function({ event, startDelta, endDelta, revert }) {
		const startDeltaDuration = getDurationValueFromFullCalendarDuration(startDelta)
		const endDeltaDuration = getDurationValueFromFullCalendarDuration(endDelta)

		if (!startDeltaDuration && !endDeltaDuration) {
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

		const eventComponent = getObjectAtRecurrenceId(calendarObject, recurrenceIdDate)
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

		try {
			await store.dispatch('updateCalendarObject', {
				calendarObject,
			})
		} catch (error) {
			store.commit('resetCalendarObjectToDav', {
				calendarObject,
			})
			console.debug(error)
			revert()
		}
	}
}
