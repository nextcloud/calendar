/**
 * SPDX-FileCopyrightText: 2025 Nextcloud GmbH and Nextcloud contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import { getBaseUrl } from '@nextcloud/router'
import HttpClient from '@nextcloud/axios'
import { principalPropertySearchByDisplaynameOrEmail } from './caldavService'

/**
 *
 * @param email {string} email of nextcloud user or contact
 */
export async function getAttendeeDetails(email) {
	const allDetails = JSON.parse(localStorage.getItem('calendar-attendee-details') || '[]')

	const attendeeDetails = allDetails.filter((detail) => detail.email === email)

	if (attendeeDetails.length > 0 && Date.now() - attendeeDetails[0].timestamp < 7 * 24 * 60 * 60 * 1000) {
		return attendeeDetails[0]
	}

	let response

	try {
		const principles = await principalPropertySearchByDisplaynameOrEmail(email)

		if (principles.length < 1) {
			return {}
		}

		response = await HttpClient.get(getBaseUrl() + `/ocs/v1.php/cloud/users/${principles[0].userId}`, {})
	} catch (error) {
		console.debug(error)
		return {}
	}

	const newAttendeeDetails = {
		email,
		timestamp: Date.now(),
		timezone: response.data.ocs.data.timezone,
	}

	allDetails.unshift(newAttendeeDetails)

	if (allDetails.length > 1000) {
		allDetails.splice(1000)
	}

	localStorage.setItem('calendar-attendee-details', JSON.stringify(allDetails))

	return newAttendeeDetails
}
