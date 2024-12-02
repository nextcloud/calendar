/**
 * SPDX-FileCopyrightText: 2024 Nextcloud GmbH and Nextcloud contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import { listen } from '@nextcloud/notify_push'
import { loadState } from '@nextcloud/initial-state'
import useCalendarsStore from '../store/calendars.js'
import logger from '../utils/logger.js'

/**
 * Register a notify_push listener to listen for sync requests and sync calendars.
 */
export function registerNotifyPushSyncListener() {
	// TODO: how to actually get the state
	/*
	const isPushEnabled = loadState('calendar', 'notify_push_available', false)
	if (!isPushEnabled) {
		return
	}
	*/

	const calendarsStore = useCalendarsStore()
	listen('calendar_sync', (messageType, messageBody) => {
		logger.debug('calendar_sync', {
			messageType,
			messageBody,
		})
		const { calendarUrl } = messageBody
		const calendar = calendarsStore.getCalendarByUrl(calendarUrl)
		if (!calendar) {
			logger.warn(`Requested push sync for unknown calendar: ${calendarUrl}`, {
				messageType,
				messageBody,
			})
			return
		}

		logger.debug(`Syncing calendar ${calendarUrl} (requested by notify_push)`)
		calendarsStore.syncCalendar({ calendar })
	})
}
