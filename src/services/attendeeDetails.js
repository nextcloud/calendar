/**
 * SPDX-FileCopyrightText: 2025 Nextcloud GmbH and Nextcloud contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import HttpClient from '@nextcloud/axios'
import { getLocale } from '@nextcloud/l10n'
import { getBaseUrl, linkTo } from '@nextcloud/router'
import { principalPropertySearchByDisplaynameOrEmail } from './caldavService.js'

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

	let response = {}

	// Attempt 1, try to see if the attendee is a nextcloud user

	try {
		const principles = await principalPropertySearchByDisplaynameOrEmail(email)

		if (principles.length >= 1) {
			response = await HttpClient.get(getBaseUrl() + `/ocs/v1.php/cloud/users/${principles[0].userId}`, {})
		}
	} catch (error) {
		console.debug(error)
		return {}
	}

	if (response.data) {
		return generateDetails(allDetails, email, response.data.ocs.data.timezone)
	}

	// Attempt 2, if the attendee isn't a nextcloud user, see if it's a contact

	try {
		response = await HttpClient.post(linkTo('calendar', 'index.php') + '/v1/autocompletion/attendee', {
			search: email,
		})
	} catch (error) {
		console.debug(error)
		return {}
	}

	if (response.data.length) {
		return generateDetails(allDetails, email, response.data[0].tzid)
	}

	return {}
}

/**
 *
 * @param allDetails all the localstorage information
 * @param email attendee email
 * @param timezone fetched attendee timezone
 */
function generateDetails(allDetails, email, timezone) {
	const newAttendeeDetails = {
		email,
		timestamp: Date.now(),
		timezone,
	}

	allDetails = allDetails.filter((detail) => detail.email !== email)

	allDetails.unshift(newAttendeeDetails)

	if (allDetails.length > 1000) {
		allDetails.splice(1000)
	}

	localStorage.setItem('calendar-attendee-details', JSON.stringify(allDetails))

	return newAttendeeDetails
}

/**
 *
 * @param startDate starting date of event
 * @param timezone timezone of attendee
 */
export function adjustAttendeeTime(startDate, timezone) {
	if (!timezone || !startDate) {
		return false
	}

	const date = new Date(startDate)
	const locale = getLocale().replace('_', '-').toLowerCase()

	// Format in target timezone
	const options = {
		timeZone: timezone,
		hour: '2-digit',
		minute: '2-digit',
	}

	const formattedTime = date.toLocaleTimeString(locale, options)

	const localDay = date.getUTCDate()
	const tzDay = new Intl.DateTimeFormat(locale, { timeZone: timezone, day: '2-digit' }).format(date)
	const tzDayNum = parseInt(tzDay, 10)

	let dayOffset = ''
	if (tzDayNum > localDay) {
		dayOffset = ' (+1 ' + t('calendar', 'day') + ')'
	} else if (tzDayNum < localDay) {
		dayOffset = ' (-1 ' + t('calendar', 'day') + ')'
	}

	return `${formattedTime}${dayOffset}`
}
