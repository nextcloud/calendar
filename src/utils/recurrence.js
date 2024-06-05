/**
 * SPDX-FileCopyrightText: 2019 Nextcloud GmbH and Nextcloud contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

/**
 * Gets the ByDay and BySetPosition
 *
 * @param {Date} jsDate The date to get the weekday of
 * @return {object}
 */
export function getBySetPositionAndBySetFromDate(jsDate) {
	const byDay = getWeekDayFromDate(jsDate)
	let bySetPosition = 1
	let dayOfMonth = jsDate.getDate()
	for (; dayOfMonth > 7; dayOfMonth -= 7) {
		bySetPosition++
	}

	return {
		byDay,
		bySetPosition,
	}
}

/**
 * Gets the string-representation of the weekday of a given date
 *
 * @param {Date} jsDate The date to get the weekday of
 * @return {string}
 */
export function getWeekDayFromDate(jsDate) {
	switch (jsDate.getDay()) {
	case 0:
		return 'SU'
	case 1:
		return 'MO'
	case 2:
		return 'TU'
	case 3:
		return 'WE'
	case 4:
		return 'TH'
	case 5:
		return 'FR'
	case 6:
		return 'SA'
	default:
		throw TypeError('Invalid date-object given')
	}
}
