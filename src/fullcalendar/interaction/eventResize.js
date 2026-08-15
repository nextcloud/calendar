import { getDurationValueFromFullCalendarDuration } from '@/fullcalendar/duration.js'
import { errorCatchAsync } from '@/fullcalendar/utils/errors.js'
/**
 * SPDX-FileCopyrightText: 2019 Nextcloud GmbH and Nextcloud contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */
import useCalendarObjectsStore from '@/store/calendarObjects.js'
import useCalendarsStore from '@/store/calendars.js'
import { getObjectAtRecurrenceId } from '@/utils/calendarObject.js'
import logger from '@/utils/logger.js'

/**
 * Returns a function to resize an event
 *
 * @return {(info: {event: EventDef, startDelta: object, endDelta: object, revert: () => void}) => Promise<void>}
 */
export default function() {
	const calendarsStore = useCalendarsStore()
	const calendarObjectsStore = useCalendarObjectsStore()

	return errorCatchAsync(async function({ event, startDelta, endDelta, revert }) {
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
			logger.debug(error)
			revert()
			return
		}

		const eventComponent = getObjectAtRecurrenceId(calendarObject, recurrenceIdDate)
		if (!eventComponent) {
			logger.debug('Recurrence-id not found')
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
			logger.debug(error)
			revert()
		}
	}, 'eventResize')
}
