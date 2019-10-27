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
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program. If not, see <http://www.gnu.org/licenses/>.
 *
 */

/**
 * returns a new Date object
 *
 * @returns {Date}
 */
export function dateFactory() {
	return new Date()
}

/**
 * formats a Date object as YYYYMMDD
 *
 * @param {Date} date Date to format
 * @returns {string}
 */
export function getYYYYMMDDFromDate(date) {
	return new Date(date.getTime() - (date.getTimezoneOffset() * 60000))
		.toISOString()
		.split('T')[0]
}

/**
 * get unix time from date object
 *
 * @param {Date} date Date to format
 * @returns {number}
 */
export function getUnixTimestampFromDate(date) {
	return Math.floor(date.getTime() / 1000)
}

/**
 * Gets a Date-object based on the firstday param used in routes
 *
 * @param {String} firstDayParam The firstday param from the router
 * @returns {Date}
 */
export function getDateFromFirstdayParam(firstDayParam) {
	if (firstDayParam === 'now') {
		return dateFactory()
	}

	return new Date(firstDayParam)
}

/**
 * formats firstday param as YYYYMMDD
 *
 * @param {String} firstDayParam The firstday param from the router
 * @returns {string}
 */
export function getYYYYMMDDFromFirstdayParam(firstDayParam) {
	if (firstDayParam === 'now') {
		return getYYYYMMDDFromDate(dateFactory())
	}

	return firstDayParam
}

/**
 * Gets a date object based on the given DateTimeValue
 * Ignores given timezone-information
 *
 * @param {DateTimeValue} dateTimeValue Value to get date from
 * @returns {Date}
 */
export function getDateFromDateTimeValue(dateTimeValue) {
	return new Date(
		dateTimeValue.year,
		dateTimeValue.month - 1,
		dateTimeValue.day,
		dateTimeValue.hour,
		dateTimeValue.minute,
		0,
		0
	)
}

/**
 * modifies a date
 *
 * @param {Date} date Date object to modify
 * @param {Object} data The destructuring object
 * @param {Number} data.day Number of days to add
 * @param {Number} data.week Number of weeks to add
 * @param {Number} data.month Number of months to add
 * @returns {Date}
 */
export function modifyDate(date, { day = 0, week = 0, month = 0 }) {
	date = new Date(date.getTime())
	date.setDate(date.getDate() + day)
	date.setDate(date.getDate() + week * 7)
	date.setMonth(date.getMonth() + month)

	return date
}
