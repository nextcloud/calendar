/**
 * SPDX-FileCopyrightText: 2026 Nextcloud GmbH and Nextcloud contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import logger from '@/utils/logger.js'

/**
 * Offset of a named timezone at a given instant, in milliseconds.
 *
 * @param {Date} date The instant to measure at
 * @param {string} timeZone IANA timezone id
 * @return {number} Milliseconds to add to UTC to get local time
 */
function timezoneOffsetAt(date, timeZone) {
	let formatter
	try {
		formatter = new Intl.DateTimeFormat('en-US', {
			timeZone,
			hour12: false,
			year: 'numeric',
			month: '2-digit',
			day: '2-digit',
			hour: '2-digit',
			minute: '2-digit',
			second: '2-digit',
		})
	} catch (error) {
		// An event can carry a TZID this browser does not know. Degrading to
		// the floating interpretation is wrong by at most a few hours; letting
		// the RangeError out would take the whole editor down.
		logger.debug('Unknown timezone id, treating the time as floating', { timeZone, error })
		return 0
	}
	const parts = {}
	for (const { type, value } of formatter.formatToParts(date)) {
		parts[type] = value
	}
	const asUtc = Date.UTC(
		Number(parts.year),
		Number(parts.month) - 1,
		Number(parts.day),
		Number(parts.hour) % 24,
		Number(parts.minute),
		Number(parts.second),
	)
	return asUtc - date.getTime()
}

/**
 * Turn one of the editor's wall-clock dates into a real instant.
 *
 * The editor's `startDate` / `endDate` mean "11:30 in the event's timezone",
 * but they are plain Dates whose LOCAL getters carry those digits - so in a
 * browser in another timezone they point at the wrong moment entirely.
 *
 * @param {?Date} wallClock The editor's date
 * @param {?string} timeZone IANA id of the event's timezone
 * @return {?Date} The instant those digits denote in that timezone
 */
export function wallClockToInstant(wallClock, timeZone) {
	if (!(wallClock instanceof Date) || !Number.isFinite(wallClock.getTime())) {
		return null
	}
	const digitsAsUtc = Date.UTC(
		wallClock.getFullYear(),
		wallClock.getMonth(),
		wallClock.getDate(),
		wallClock.getHours(),
		wallClock.getMinutes(),
		wallClock.getSeconds(),
	)
	if (!timeZone) {
		return new Date(digitsAsUtc)
	}
	// Twice, so a guess that lands on the wrong side of a DST switch still
	// resolves to the right offset.
	let instant = digitsAsUtc
	for (let pass = 0; pass < 2; pass++) {
		instant = digitsAsUtc - timezoneOffsetAt(new Date(instant), timeZone)
	}
	return new Date(instant)
}
