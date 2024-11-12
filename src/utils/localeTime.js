/**
 * SPDX-FileCopyrightText: 2021 Nextcloud GmbH and Nextcloud contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import { getCanonicalLocale } from '@nextcloud/l10n'

const locale = [getCanonicalLocale(), undefined].find(locale => {
	try {
		(new Date()).toLocaleString(locale)
	} catch (e) {
		return false
	}

	return true
})

/**
 * Format a time stamp as local time
 *
 * @param timeStamp {Number} unix times stamp in seconds
 * @param timeZoneId {string} IANA time zone identifier
 * @return {string} the formatted time
 */
export function timeStampToLocaleTime(timeStamp, timeZoneId) {
	return (new Date(timeStamp * 1000)).toLocaleString(locale, {
		timeZone: timeZoneId,
		hour: 'numeric',
		minute: 'numeric',
	})
}

/**
 * Format a time stamp as local date
 *
 * @param timeStamp {Number} unix times stamp in seconds
 * @param timeZoneId {string} IANA time zone identifier
 * @return {string} the formatted date
 */
export function timeStampToLocaleDate(timeStamp, timeZoneId) {
	return (new Date(timeStamp * 1000)).toLocaleDateString(locale, {
		timeZone: timeZoneId,
		day: 'numeric',
		month: 'long',
		year: 'numeric',
	})
}
