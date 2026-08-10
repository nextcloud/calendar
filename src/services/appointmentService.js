/**
 * SPDX-FileCopyrightText: 2021 Nextcloud GmbH and Nextcloud contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import axios from '@nextcloud/axios'
import { generateUrl } from '@nextcloud/router'

/**
 * @param {object} config the appointment config object
 * @param {string} date selected availability date in yyyy-m-d format
 * @param {string} timeZone target time zone for the time stamps
 */
export async function findSlots(config, date, timeZone) {
	const url = generateUrl('/apps/calendar/appointment/{token}/slots?dateSelected={date}&timeZone={timeZone}', {
		token: config.token,
		date,
		timeZone,
	})

	const response = await axios.get(url)

	return response.data.data
}

/**
 * @param {object} config the appointment config object
 * @param {object} slot the selected availability slot to book
 * @param {string} displayName display name of the person booking the slot
 * @param {string} email email address of the person booking the slot
 * @param {string} description description for the booked appointment
 * @param {string} timeZone time zone the slot was selected in
 */
export async function bookSlot(config, slot, displayName, email, description, timeZone) {
	const url = generateUrl('/apps/calendar/appointment/{token}/book', {
		token: config.token,
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
