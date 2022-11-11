/**
 * @copyright 2021 Christoph Wurst <christoph@winzerhof-wurst.at>
 *
 * @author 2021 Christoph Wurst <christoph@winzerhof-wurst.at>
 *
 * @license AGPL-3.0-or-later
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as
 * published by the Free Software Foundation, either version 3 of the
 * License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 *
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
