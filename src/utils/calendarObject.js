/**
 * @copyright Copyright (c) 2020 Georg Ehrke
 *
 * @author Georg Ehrke <oc.list@georgehrke.com>
 *
 * @license AGPL-3.0-or-later
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
