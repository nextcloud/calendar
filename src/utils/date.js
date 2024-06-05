/**
 * SPDX-FileCopyrightText: 2019 Nextcloud GmbH and Nextcloud contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import logger from './logger.js'

/**
 * returns a new Date object
 *
 * @return {Date}
 */
export function dateFactory() {
	return new Date()
}

/**
 * formats a Date object as YYYYMMDD
 *
 * @param {Date} date Date to format
 * @return {string}
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
 * @return {number}
 */
export function getUnixTimestampFromDate(date) {
	return Math.floor(date.getTime() / 1000)
}

/**
 * Gets a Date-object based on the firstday param used in routes
 *
 * @param {string} firstDayParam The firstday param from the router
 * @return {Date}
 */
export function getDateFromFirstdayParam(firstDayParam) {
	if (firstDayParam === 'now') {
		return dateFactory()
	}

	const [year, month, date] = firstDayParam.split('-')
		.map((str) => parseInt(str, 10))

	if (Number.isNaN(year) || Number.isNaN(month) || Number.isNaN(date)) {
		logger.error('First day parameter contains non-numerical components, falling back to today')
		return dateFactory()
	}

	const dateObject = dateFactory()
	dateObject.setFullYear(year, month - 1, date)
	dateObject.setHours(0, 0, 0, 0)

	return dateObject
}

/**
 * formats firstday param as YYYYMMDD
 *
 * @param {string} firstDayParam The firstday param from the router
 * @return {string}
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
 * @return {Date}
 */
export function getDateFromDateTimeValue(dateTimeValue) {
	return new Date(
		dateTimeValue.year,
		dateTimeValue.month - 1,
		dateTimeValue.day,
		dateTimeValue.hour,
		dateTimeValue.minute,
		0,
		0,
	)
}

/**
 * modifies a date
 *
 * @param {Date} date Date object to modify
 * @param {object} data The destructuring object
 * @param {number} data.day Number of days to add
 * @param {number} data.week Number of weeks to add
 * @param {number} data.month Number of months to add
 * @param data.year
 * @return {Date}
 */
export function modifyDate(date, { day = 0, week = 0, month = 0, year = 0 }) {
	date = new Date(date.getTime())
	date.setDate(date.getDate() + day)
	date.setDate(date.getDate() + week * 7)
	date.setMonth(date.getMonth() + month)
	date.setFullYear(date.getFullYear() + year)

	return date
}
