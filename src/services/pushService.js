import { getBaseUrl } from '@nextcloud/router'
import useCalendarsStore from '../store/calendars.js'
import useCalendarObjectsStore from '../store/calendarObjects.js'
import useFetchedTimeRangesStore from '../store/fetchedTimeRanges.js'

import logger from '../utils/logger.js'

function getWsBaseUrl() {
	const url = new URL(getBaseUrl())
	url.protocol = 'wss:'
	return url.toString() + '/php-push'
}

export function registerPushListener(endpoint, action, { onMessage }) {
	const serverUrl = getWsBaseUrl() + endpoint
	const socket = new WebSocket(serverUrl)

	if (onMessage) {
		socket.onmessage = (msg) => {
			const response = JSON.parse(msg.data)
			logger.debug(`Received message on ${endpoint}: action=${response.action}`, {
				response,
			})

			if (response.action !== action) {
				return
			}

			onMessage(response)
		}
	}
}

export function registerSyncListener() {
	const calendarsStore = useCalendarsStore()

	registerPushListener('/dav', 'sync', {
		onMessage: (msg) => {
			const { calendarUrl } = msg.data
			const calendar = calendarsStore.getCalendarByUrl(calendarUrl)
			if (!calendar) {
				logger.info(`No such calendar: ${calendarUrl}`)
				return
			}

			logger.info(`Syncing calendar ${calendarUrl} (requested by push)`)
			syncCalendar(calendar)
		},
	})
}

function syncCalendar(calendar) {
	const calendarsStore = useCalendarsStore()
	const calendarObjectsStore = useCalendarObjectsStore()
	const fetchedTimeRangesStore = useFetchedTimeRangesStore()

	const existingSyncToken = calendarsStore.getCalendarSyncToken(calendar)
	if (!existingSyncToken && !calendarsStore.getCalendarById(calendar.id)) {
		// New calendar!
		logger.debug(`Adding new calendar ${calendar.url}`)
		this.calendarsStore.addCalendarMutation({ calendar })
		return
	}

	logger.debug(`Refetching calendar ${calendar.url} (syncToken changed)`)
	const fetchedTimeRanges = fetchedTimeRangesStore.getAllTimeRangesForCalendar(calendar.id)
	for (const timeRange of fetchedTimeRanges) {
		fetchedTimeRangesStore.removeTimeRange({
			timeRangeId: timeRange.id,
		})
		calendarsStore.deleteFetchedTimeRangeFromCalendarMutation({
			calendar,
			fetchedTimeRangeId: timeRange.id,
		})
	}

	calendarsStore.updateCalendarSyncToken({
		calendar,
		syncToken: calendar.dav.syncToken,
	})
	calendarObjectsStore.modificationCount++
}
