/**
 * SPDX-FileCopyrightText: 2025 Nextcloud GmbH and Nextcloud contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import { loadState } from '@nextcloud/initial-state'
import { listen } from '@nextcloud/notify_push'
import debounce from 'debounce'
import useCalendarsStore from '../store/calendars.js'
import logger from '../utils/logger.js'

interface PushMessageBody {
	calendarUrl: string
}

/**
 * Check whether the server is using notify_push.
 */
export function isNotifyPushAvailable(): boolean {
	return loadState('calendar', 'has_notify_push', false)
}

/**
 * Register a notify_push listener to listen for sync requests and sync calendars.
 *
 * @return True if the push listener was started successfully.
 */
export function registerNotifyPushSyncListener(): boolean {
	const calendarsStore = useCalendarsStore()

	// Debounce the sync by 5 seconds to prevent sync spam, especially in shared calendars
	return listen('calendar_sync', debounce((messageType: string, messageBody: PushMessageBody) => {
		if (messageType !== 'calendar_sync') {
			return
		}

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
	}, 5000))
}
