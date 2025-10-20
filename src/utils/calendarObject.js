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
function getAllObjectsInTimeRange(calendarObject, start, end) {
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
function getObjectAtRecurrenceId(calendarObject, recurrenceId) {
	const iterator = calendarObject.calendarComponent.getVObjectIterator()
	const firstVObject = iterator.next().value
	if (!firstVObject) {
		return null
	}

	const d = DateTimeValue.fromJSDate(recurrenceId, true)
	return firstVObject.recurrenceManager.getOccurrenceAtExactly(d)
}

/**
 * Checks whether the given event-component represents the primary (first)
 * occurrence of its recurring series, as opposed to any later occurrence.
 *
 * The base component's own DTSTART is not necessarily a valid occurrence
 * itself (e.g. it may not match the RRULE's BYDAY), so this compares against
 * the actual first occurrence the recurrence-manager generates, rather than
 * the base component's raw start date.
 *
 * @param {object} calendarObject Calendar-object model
 * @param {AbstractRecurringComponent} eventComponent The occurrence being edited
 * @return {boolean}
 */
function isBaseOccurrence(calendarObject, eventComponent) {
	if (!eventComponent.isPartOfRecurrenceSet()) {
		return false
	}

	let baseComponent = null
	for (const component of calendarObject.calendarComponent.getComponentIterator()) {
		if (component.name === eventComponent.name && !component.hasProperty('RECURRENCE-ID')) {
			baseComponent = component
			break
		}
	}
	if (!baseComponent) {
		return false
	}

	const firstOccurrenceRecurrenceId = baseComponent.recurrenceManager
		.getClosestOccurrence(baseComponent.startDate)
		.getReferenceRecurrenceId()

	return !eventComponent.originalRecurrenceId
		|| eventComponent.originalRecurrenceId.compare(firstOccurrenceRecurrenceId) === 0
}

export {
	getAllObjectsInTimeRange,
	getObjectAtRecurrenceId,
	isBaseOccurrence,
}
