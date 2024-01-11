/**
 * SPDX-FileCopyrightText: 2019 Nextcloud GmbH and Nextcloud contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */
import { getDurationValueFromFullCalendarDuration } from '../duration.js'
import { getObjectAtRecurrenceId } from '../../utils/calendarObject.js'
import useCalendarsStore from '../../store/calendars.js'
import useCalendarObjectsStore from '../../store/calendarObjects.js'

/**
 * Returns a function to resize an event
 *
 * @return {Function}
 */
export default function() {
	const calendarsStore = useCalendarsStore()
	const calendarObjectsStore = useCalendarObjectsStore()

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
			calendarObject = await calendarsStore.getEventByObjectId({ objectId })
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
			await calendarObjectsStore.updateCalendarObject({
				calendarObject,
			})
		} catch (error) {
			calendarObjectsStore.resetCalendarObjectToDavMutation({
				calendarObject,
			})
			console.debug(error)
			revert()
		}
	}
}
