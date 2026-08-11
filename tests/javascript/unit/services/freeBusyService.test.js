/**
 * SPDX-FileCopyrightText: 2026 Nextcloud GmbH and Nextcloud contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import { AttendeeProperty } from '@nextcloud/calendar-js'
import { checkResourceAvailability } from '../../../../src/services/freeBusyService'
import { doFreeBusyRequest } from '../../../../src/utils/freebusy'

vi.mock('../../../../src/utils/freebusy')

describe('services/freeBusyService test suite', () => {
	beforeEach(() => {
		vi.clearAllMocks()
	})

	it('should mark busy resources as unavailable and leave others available', async () => {
		doFreeBusyRequest.mockImplementationOnce(async function* () {
			yield [new AttendeeProperty('ATTENDEE', 'mailto:room1@localhost'), undefined]
		})

		const options = [
			{ email: 'room1@localhost', isAvailable: true },
			{ email: 'room2@localhost', isAvailable: true },
		]
		await checkResourceAvailability(options, 'user@localhost', undefined, undefined)

		expect(options[0].isAvailable).toEqual(false)
		expect(options[1].isAvailable).toEqual(true)
	})

	it('should match attendees regardless of mailto prefixes', async () => {
		doFreeBusyRequest.mockImplementationOnce(async function* () {
			yield [new AttendeeProperty('ATTENDEE', 'mailto:room1@localhost'), undefined]
		})

		const options = [
			{ email: 'mailto:room1@localhost', isAvailable: true },
		]
		await checkResourceAvailability(options, 'user@localhost', undefined, undefined)

		expect(options[0].isAvailable).toEqual(false)
	})

	it('should not send a request without options', async () => {
		await checkResourceAvailability([], 'user@localhost', undefined, undefined)

		expect(doFreeBusyRequest).not.toHaveBeenCalled()
	})

	it('should not assign a participation status to the options array', async () => {
		doFreeBusyRequest.mockImplementationOnce(async function* () {
			yield [new AttendeeProperty('ATTENDEE', 'mailto:room1@localhost'), undefined]
		})

		const options = [
			{ email: 'room1@localhost', isAvailable: true },
		]
		await checkResourceAvailability(options, 'user@localhost', undefined, undefined)

		expect(options).not.toHaveProperty('participationStatus')
	})
})
