/**
 * SPDX-FileCopyrightText: 2026 Nextcloud GmbH and Nextcloud contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import { DateTimeValue } from '@nextcloud/calendar-js'
import getTimezoneManager from '@/services/timezoneDataProviderService.js'

/**
 * Turn one of the editor's wall-clock dates into a real instant.
 *
 * The editor's `startDate` / `endDate` mean "11:30 in the event's timezone",
 * but they are plain Dates whose LOCAL getters carry those digits - so in a
 * browser in another timezone they point at the wrong moment entirely.
 *
 * The conversion goes through the timezone manager rather than
 * `Intl.DateTimeFormat`, because **a TZID is not always an IANA identifier**.
 * An event that arrived from Exchange carries Microsoft's own name - Outlook
 * writes `TZID=Romance Standard Time` for Central European Time - and `Intl`
 * rejects it with a RangeError. The manager knows the alias (it maps to
 * Europe/Paris) and it also handles a VTIMEZONE the event brought with it.
 *
 * @param {?Date} wallClock The editor's date
 * @param {?string} timeZoneId TZID of the event's timezone
 * @return {?Date} The instant those digits denote, or null if the timezone
 *                 cannot be resolved - in which case the caller should say
 *                 nothing rather than compute a time that is hours out
 */
export function wallClockToInstant(wallClock, timeZoneId) {
	if (!(wallClock instanceof Date) || !Number.isFinite(wallClock.getTime())) {
		return null
	}

	const timezone = timeZoneId
		? getTimezoneManager().getTimezoneForId(timeZoneId)
		: null
	if (!timezone) {
		return null
	}

	return DateTimeValue.fromData({
		year: wallClock.getFullYear(),
		month: wallClock.getMonth() + 1,
		day: wallClock.getDate(),
		hour: wallClock.getHours(),
		minute: wallClock.getMinutes(),
		second: wallClock.getSeconds(),
	}, timezone).jsDate
}
