/**
 * SPDX-FileCopyrightText: 2019 Nextcloud GmbH and Nextcloud contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import { showWarning } from '@nextcloud/dialogs'
import { translate as t } from '@nextcloud/l10n'
import { spawnDialog } from '@nextcloud/vue/functions/dialog'
import DragRecurrenceDialog from '../../components/DragRecurrenceDialog.vue'
import { DragRecurrenceDialogResult } from '../../models/consts.ts'
import getTimezoneManager from '../../services/timezoneDataProviderService.js'
import useCalendarObjectInstanceStore from '../../store/calendarObjectInstance.js'
import useCalendarObjectsStore from '../../store/calendarObjects.js'
import usePrincipalsStore from '../../store/principals.js'
import { isOrganizer } from '../../utils/attendee.js'
import logger from '../../utils/logger.js'
import { getDurationValueFromFullCalendarDuration } from '../duration.js'

/**
 * Returns a function to drop an event at a different position
 *
 * @param {object} fcAPI The fullcalendar api
 * @return {Function}
 */
export default function(fcAPI) {
	const calendarObjectsStore = useCalendarObjectsStore()
	const calendarObjectInstanceStore = useCalendarObjectInstanceStore()
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

		let objects
		try {
			objects = await calendarObjectInstanceStore.getCalendarObjectInstanceByObjectIdAndRecurrenceId({
				objectId,
				recurrenceId,
			})
		} catch (error) {
			logger.error('Recurrence was not found', { error })
			calendarObjectInstanceStore.resetCalendarObjectInstanceObjectIdAndRecurrenceId()
			revert()
			return
		}

		const { calendarObject, calendarObjectInstance } = objects
		const eventComponent = calendarObjectInstance.eventComponent

		if (!isOrganizer(principalsStore.getCurrentUserPrincipalEmail, eventComponent.organizer)) {
			revert()
			showWarning(t('calendar', 'You are not allowed to edit this event as an attendee.'))
			calendarObjectInstanceStore.resetCalendarObjectInstanceObjectIdAndRecurrenceId()
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
			logger.error('Failed to shift event', { error })
			calendarObjectsStore.resetCalendarObjectToDavMutation({
				calendarObject,
			})
			calendarObjectInstanceStore.resetCalendarObjectInstanceObjectIdAndRecurrenceId()
			revert()
			return
		}

		// Show a modal to let the user decide whether to update this or all future instances.
		// Non-recurring events or recurrence exceptions can just be dropped and don't require
		// extra user interaction.
		let thisAndAllFuture = false
		if (eventComponent.isPartOfRecurrenceSet() && eventComponent.canCreateRecurrenceExceptions()) {
			const result = await new Promise((resolve) => {
				try {
					spawnDialog(DragRecurrenceDialog, { eventComponent }, resolve)
				} catch (error) {
					logger.error(`Drag recurrence confirmation modal error: ${error}`, { error })
					resolve(DragRecurrenceDialogResult.Cancel)
				}
			})
			if (result === DragRecurrenceDialogResult.Cancel) {
				calendarObjectsStore.resetCalendarObjectToDavMutation({
					calendarObject,
				})
				calendarObjectInstanceStore.resetCalendarObjectInstanceObjectIdAndRecurrenceId()
				revert()
				return
			}

			thisAndAllFuture = result === DragRecurrenceDialogResult.SaveThisAndAllFuture
		}

		try {
			await calendarObjectInstanceStore.saveCalendarObject({
				thisAndAllFuture,
				calendarId: calendarObject.calendarId,
				calendarObject,
				eventComponent,
			})
		} catch (error) {
			logger.error('Failed to save dragged event', { error })
			calendarObjectsStore.resetCalendarObjectToDavMutation({
				calendarObject,
			})
			revert()
		} finally {
			calendarObjectInstanceStore.resetCalendarObjectInstanceObjectIdAndRecurrenceId()
		}
	}
}
