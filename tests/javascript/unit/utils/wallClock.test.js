/**
 * SPDX-FileCopyrightText: 2026 Nextcloud GmbH and Nextcloud contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */
import getTimezoneManager from '@/services/timezoneDataProviderService.js'
import { wallClockToInstant } from '@/utils/wallClock.js'

// Registering the default timezones is what teaches the manager both the IANA
// zones and Microsoft's aliases; without it every lookup misses.
beforeAll(() => {
	getTimezoneManager()
})

/**
 * Build the Date the editor would hold for a given wall-clock reading.
 *
 * The editor stores "11:30 in the event's timezone" as a Date whose LOCAL
 * getters carry those digits, which is what these tests feed in.
 *
 * @param {number} year Full year
 * @param {number} month 1-indexed month
 * @param {number} day Day of month
 * @param {number} hour Hour
 * @param {number} minute Minute
 * @return {Date} The wall-clock date
 */
function wallClock(year, month, day, hour, minute) {
	return new Date(year, month - 1, day, hour, minute, 0, 0)
}

describe('utils/wallClock test suite', () => {
	it('should return null for anything that is not a usable date', () => {
		expect(wallClockToInstant(null, 'Europe/Berlin')).toEqual(null)
		expect(wallClockToInstant(undefined, 'Europe/Berlin')).toEqual(null)
		expect(wallClockToInstant('2026-09-24T10:00:00', 'Europe/Berlin')).toEqual(null)
		expect(wallClockToInstant(new Date(NaN), 'Europe/Berlin')).toEqual(null)
	})

	it('should apply the timezone offset in effect at that moment', () => {
		// Central European Summer Time, UTC+2.
		expect(wallClockToInstant(wallClock(2026, 9, 24, 10, 0), 'Europe/Berlin').toISOString())
			.toEqual('2026-09-24T08:00:00.000Z')
		// Central European Time, UTC+1.
		expect(wallClockToInstant(wallClock(2026, 12, 24, 10, 0), 'Europe/Berlin').toISOString())
			.toEqual('2026-12-24T09:00:00.000Z')
	})

	it('should handle timezones behind UTC and off-hour offsets', () => {
		expect(wallClockToInstant(wallClock(2026, 9, 24, 10, 0), 'America/New_York').toISOString())
			.toEqual('2026-09-24T14:00:00.000Z')
		expect(wallClockToInstant(wallClock(2026, 9, 24, 10, 0), 'Asia/Kathmandu').toISOString())
			.toEqual('2026-09-24T04:15:00.000Z')
		expect(wallClockToInstant(wallClock(2026, 9, 24, 10, 0), 'UTC').toISOString())
			.toEqual('2026-09-24T10:00:00.000Z')
	})

	it('should settle on the right side of a DST transition', () => {
		// Europe/Berlin springs forward at 02:00 on 2026-03-29.
		expect(wallClockToInstant(wallClock(2026, 3, 29, 1, 30), 'Europe/Berlin').toISOString())
			.toEqual('2026-03-29T00:30:00.000Z')
		expect(wallClockToInstant(wallClock(2026, 3, 29, 3, 30), 'Europe/Berlin').toISOString())
			.toEqual('2026-03-29T01:30:00.000Z')
		// And back again at 03:00 on 2026-10-25.
		expect(wallClockToInstant(wallClock(2026, 10, 25, 1, 30), 'Europe/Berlin').toISOString())
			.toEqual('2026-10-24T23:30:00.000Z')
		expect(wallClockToInstant(wallClock(2026, 10, 25, 4, 30), 'Europe/Berlin').toISOString())
			.toEqual('2026-10-25T03:30:00.000Z')
	})

	// The regression that motivated going through the timezone manager rather
	// than Intl.DateTimeFormat: an event invited from Outlook carries
	// Microsoft's timezone name, which Intl rejects outright.
	it('should understand Microsoft timezone names as written by Outlook', () => {
		expect(wallClockToInstant(wallClock(2026, 9, 18, 10, 0), 'Romance Standard Time').toISOString())
			.toEqual('2026-09-18T08:00:00.000Z')
		expect(wallClockToInstant(wallClock(2026, 9, 18, 10, 0), 'W. Europe Standard Time').toISOString())
			.toEqual('2026-09-18T08:00:00.000Z')
		expect(wallClockToInstant(wallClock(2026, 9, 18, 10, 0), 'Pacific Standard Time').toISOString())
			.toEqual('2026-09-18T17:00:00.000Z')
	})

	it('should return null rather than a wrong answer when the timezone is unknown', () => {
		expect(wallClockToInstant(wallClock(2026, 9, 24, 10, 0), 'Mars/Olympus_Mons')).toEqual(null)
		expect(wallClockToInstant(wallClock(2026, 9, 24, 10, 0), null)).toEqual(null)
	})
})
