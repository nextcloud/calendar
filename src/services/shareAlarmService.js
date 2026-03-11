/**
 * SPDX-FileCopyrightText: 2025 Nextcloud GmbH and Nextcloud contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import axios from '@nextcloud/axios'
import { generateUrl } from '@nextcloud/router'
import logger from '../utils/logger.js'

/**
 * Fetch alarm suppression settings for all shares of a calendar
 *
 * @param {string} calendarUrl The owner's calendar DAV URL
 * @return {Promise<object>} Map of principalUri to suppressAlarms boolean
 */
export async function getShareAlarmSettings(calendarUrl) {
	logger.debug('Fetching share alarm settings', { calendarUrl })
	const url = generateUrl('/apps/calendar/v1/share-alarm')

	const response = await axios.get(url, {
		params: { calendarUrl },
	})
	return response.data.data ?? {}
}

/**
 * Toggle alarm suppression for a specific share
 *
 * @param {string} calendarUrl The owner's calendar DAV URL
 * @param {string} principalUri The sharee's principal URI (without 'principal:' prefix)
 * @param {boolean} suppressAlarms Whether to suppress alarms
 * @return {Promise<void>}
 */
export async function toggleShareAlarmSuppression(calendarUrl, principalUri, suppressAlarms) {
	logger.debug('Toggling share alarm suppression', { calendarUrl, principalUri, suppressAlarms })
	const url = generateUrl('/apps/calendar/v1/share-alarm')

	await axios.post(url, {
		calendarUrl,
		principalUri,
		suppressAlarms,
	})
}
