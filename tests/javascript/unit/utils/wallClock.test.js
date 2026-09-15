/**
 * SPDX-FileCopyrightText: 2026 Nextcloud GmbH and Nextcloud contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */
import { wallClockToInstant } from '@/utils/wallClock.js'

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

	it('should read the digits as UTC when no timezone is given', () => {
		const instant = wallClockToInstant(wallClock(2026, 9, 24, 10, 0), null)
		expect(instant.toISOString()).toEqual('2026-09-24T10:00:00.000Z')
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
		// Europe/Berlin springs forward at 02:00 on 2026-03-29. A single-pass
		// conversion guesses the offset from the pre-transition side and lands
		// an hour out for readings just after the change.
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

	it('should degrade to the floating reading for a timezone id it cannot resolve', () => {
		// A foreign client can put a TZID in the event that this browser has
		// never heard of. That must not throw a RangeError at the editor.
		expect(wallClockToInstant(wallClock(2026, 9, 24, 10, 0), 'Mars/Olympus_Mons').toISOString())
			.toEqual('2026-09-24T10:00:00.000Z')
	})
})
