/**
 * SPDX-FileCopyrightText: 2021 Nextcloud GmbH and Nextcloud contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import axios from '@nextcloud/axios'
import { generateUrl } from '@nextcloud/router'

/**
 * @param config {object} the appointment config object
 * @param start {Number} interval start time as unix timestamp
 * @param timeZone {String} target time zone for the time stamps
 */
export async function findSlots(config, start, timeZone) {
	const url = generateUrl('/apps/calendar/appointment/{id}/slots?startTime={start}&timeZone={timeZone}', {
		id: config.id,
		start,
		timeZone,
	})

	const response = await axios.get(url)

	return response.data.data
}

/**
 * @param config
 * @param slot
 * @param displayName
 * @param email
 * @param description
 * @param timeZone
 */
export async function bookSlot(config, slot, displayName, email, description, timeZone) {
	const url = generateUrl('/apps/calendar/appointment/{id}/book', {
		id: config.id,
	})

	const response = await axios.post(url, {
		start: slot.start,
		end: slot.end,
		displayName,
		email,
		description,
		timeZone,
	})

	return response.data.data
}
