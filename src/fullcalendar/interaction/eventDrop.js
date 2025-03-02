/**
 * SPDX-FileCopyrightText: 2019 Nextcloud GmbH and Nextcloud contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */
import { getDurationValueFromFullCalendarDuration } from '../duration.js'
import getTimezoneManager from '../../services/timezoneDataProviderService.js'
import logger from '../../utils/logger.js'
import { getObjectAtRecurrenceId } from '../../utils/calendarObject.js'
import useCalendarsStore from '../../store/calendars.js'
import useCalendarObjectsStore from '../../store/calendarObjects.js'
import usePrincipalsStore from '../../store/principals.js'
import { isOrganizer } from '../../utils/attendee.js'
import { showWarning } from '@nextcloud/dialogs'
import { translate as t } from '@nextcloud/l10n'
/**
 * Returns a function to drop an event at a different position
 *
 * @param {object} fcAPI The fullcalendar api
 * @return {Function}
 */
export default function(fcAPI) {
	const calendarsStore = useCalendarsStore()
	const calendarObjectsStore = useCalendarObjectsStore()
	const principalsStore = usePrincipalsStore()

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

		if (!isOrganizer(principalsStore.getCurrentUserPrincipalEmail, eventComponent.organizer)) {
			revert()
			showWarning(t('calendar', 'You are not allowed to edit this event as an attendee.'))
			return
		}

		// Reset attendees participation state to NEEDS-ACTION, since eventDrop
		// is always a signification change
		// Partly a workaround for Sabre-DAV not respecting RFC 6638 3.2.8, see
		// https://github.com/sabre-io/dav/issues/1282
		if (eventComponent.organizer && eventComponent.hasProperty('ATTENDEE')) {
			const organizer = eventComponent.getFirstProperty('ORGANIZER')
			for (const attendee of eventComponent.getAttendeeIterator()) {
				if (organizer.value !== attendee.value) {
					attendee.participationStatus = 'NEEDS-ACTION'
				}
			}
		}

		try {
			// shiftByDuration may throw exceptions in certain cases
			eventComponent.shiftByDuration(deltaDuration, event.allDay, timezone, defaultAllDayDuration, defaultTimedDuration)
		} catch (error) {
			calendarObjectsStore.resetCalendarObjectToDavMutation({
				calendarObject,
			})
			console.debug(error)
			revert()
			return
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
