/**
 * SPDX-FileCopyrightText: 2020 Nextcloud GmbH and Nextcloud contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */
import { DateTimeValue } from '@nextcloud/calendar-js'

/**
 * Get all recurrence-items in given range
 *
 * @param {object} calendarObject Calendar-object model
 * @param {Date} start Begin of time-range
 * @param {Date} end End of time-range
 * @return {Array}
 */
const getAllObjectsInTimeRange = (calendarObject, start, end) => {
	const iterator = calendarObject.calendarComponent.getVObjectIterator()
	const firstVObject = iterator.next().value
	if (!firstVObject) {
		return []
	}

	const s = DateTimeValue.fromJSDate(start, true)
	const e = DateTimeValue.fromJSDate(end, true)
	return firstVObject.recurrenceManager.getAllOccurrencesBetween(s, e)
}

/**
 * Get recurrence-item at exactly a given recurrence-Id
 *
 * @param {object} calendarObject Calendar-object model
 * @param {Date} recurrenceId RecurrenceId to retrieve
 * @return {AbstractRecurringComponent|null}
 */
const getObjectAtRecurrenceId = (calendarObject, recurrenceId) => {
	const iterator = calendarObject.calendarComponent.getVObjectIterator()
	const firstVObject = iterator.next().value
	if (!firstVObject) {
		return null
	}

	const d = DateTimeValue.fromJSDate(recurrenceId, true)
	return firstVObject.recurrenceManager.getOccurrenceAtExactly(d)
}

export {
	getAllObjectsInTimeRange,
	getObjectAtRecurrenceId,
}
