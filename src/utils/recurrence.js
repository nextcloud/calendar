/**
 * @copyright Copyright (c) 2019 Georg Ehrke
 *
 * @author Georg Ehrke <oc.list@georgehrke.com>
 *
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
 *
 */

/**
 * Gets the ByDay and BySetPosition
 *
 * @param {Date} jsDate The date to get the weekday of
 * @returns {Object}
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
 * @returns {string}
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
