/**
 * @copyright Copyright (c) 2021 Richard Steinmetz <richard@steinmetz.cloud>
 * @author Richard Steinmetz <richard@steinmetz.cloud>
 * @license GNU AGPL version 3 or any later version
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as
 * published by the Free Software Foundation, either version 3 of the
 * License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program. If not, see <http://www.gnu.org/licenses/>.
 */

import { doFreeBusyRequest } from '../../../../src/utils/freebusy'
import { findSchedulingOutbox } from '../../../../src/services/caldavService'
import { AttendeeProperty, DateTimeValue, FreeBusyProperty } from '@nextcloud/calendar-js'

jest.mock('../../../../src/services/caldavService')

/**
 * Create an array from an async generator
 *
 * @param {AsyncGenerator} generator An async generator that hasn't been awaited yet
 * @return {Promise<Array>} The array generated from the given async generator
 */
async function arrayFromAsync(generator) {
	const data = []
	for await (const tuple of generator) {
		data.push(tuple)
	}
	return data
}

describe('utils/freebusy test suite', () => {
	it('should ignore explicit free slots', async () => {
		const calendarData = loadICS('freebusy/explicitFreeSlot')
		findSchedulingOutbox.mockImplementationOnce(() => ({
			async freeBusyRequest(ics) {
				return {
					foo: {
						success: true,
						status: '2.0;Success',
						calendarData,
					},
				}
			},
		}))

		const start = DateTimeValue.fromJSDate(new Date('20210906T220000Z'))
		const end = DateTimeValue.fromJSDate(new Date('20210907T220000Z'))
		const email = 'mailto:user@localhost'
		const organizer = new AttendeeProperty('ORGANIZER', email)
		const attendees = [
			new AttendeeProperty('ATTENDEE', email),
		]

		const data = await arrayFromAsync(doFreeBusyRequest(start, end, organizer, attendees))
		expect(data).toHaveLength(0)
	})

	it('should handle multiple attendees', async () => {
		const calendarData = loadICS('freebusy/multipleAttendees')
		findSchedulingOutbox.mockImplementationOnce(() => ({
			async freeBusyRequest(ics) {
				return {
					foo: {
						success: true,
						status: '2.0;Success',
						calendarData,
					},
				}
			},
		}))

		const start = DateTimeValue.fromJSDate(new Date('20210906T220000Z'))
		const end = DateTimeValue.fromJSDate(new Date('20210907T220000Z'))
		const organizer = new AttendeeProperty('ORGANIZER', 'mailto:user1@localhost')
		const attendees = [
			new AttendeeProperty('ATTENDEE', 'mailto:user1@localhost'),
			new AttendeeProperty('ATTENDEE', 'mailto:user2@localhost'),
		]

		const data = await arrayFromAsync(doFreeBusyRequest(start, end, organizer, attendees))
		expect(data).toHaveLength(2)
		const [[attendee1, freeBusy1], [attendee2, freeBusy2]] = data
		expect(attendee1.toICALJs().toICALString()).toEqual('ATTENDEE:mailto:user1@localhost')
		expect(freeBusy1.toICALJs().toICALString()).toEqual('FREEBUSY:20210906T220000Z/20210907T220000Z')
		expect(attendee2.toICALJs().toICALString()).toEqual('ATTENDEE:mailto:user2@localhost')
		expect(freeBusy2.toICALJs().toICALString()).toEqual('FREEBUSY:20210906T220000Z/20210907T220000Z')
	})
})
