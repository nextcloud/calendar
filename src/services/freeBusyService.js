/**
 * SPDX-FileCopyrightText: 2021 Nextcloud GmbH and Nextcloud contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import { AttendeeProperty } from '@nextcloud/calendar-js'
import { addMailtoPrefix, removeMailtoPrefix } from '../utils/attendee.js'
import { doFreeBusyRequest } from '../utils/freebusy.js'

/**
 * Check resource availability using a free busy request
 * and amend the status to the option object (option.isAvailable)
 *
 * @param {object[]} options The search results to amend with an availability
 * @param {string} principalEmail Principal of the organizer
 * @param {DateTimeValue} start Start date
 * @param {DateTimeValue} end End date
 */
export async function checkResourceAvailability(options, principalEmail, start, end) {
	if (options.length === 0) {
		return
	}

	const organizer = new AttendeeProperty(
		'ORGANIZER',
		addMailtoPrefix(principalEmail),
	)
	const attendees = []
	for (const option of options) {
		attendees.push(new AttendeeProperty('ATTENDEE', addMailtoPrefix(option.email)))
	}

	for await (const [attendeeProperty] of doFreeBusyRequest(start, end, organizer, attendees)) {
		const attendeeEmail = removeMailtoPrefix(attendeeProperty.email)
		for (const option of options) {
			if (removeMailtoPrefix(option.email) === attendeeEmail) {
				options.participationStatus = ''
				option.isAvailable = false
				break
			}
		}
	}
}
