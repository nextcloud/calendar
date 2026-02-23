/**
 * SPDX-FileCopyrightText: 2019 Nextcloud GmbH and Nextcloud contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

/**
 * Sorts part-day events by start date and time and skips all-day events.
 *
 * @param {EventApi} first The first full-calendar event
 * @param {EventApi} second The second full-calendar event
 * @return {number}
 */
export function partDayOrder(first, second) {
	if (first.allDay && second.allDay) {
		return 0
	}

	return first.start - second.start
}

/**
 * Sorts all-day events before timed events explicitly.
 *
 * @param {EventApi} first The first full-calendar event
 * @param {EventApi} second The second full-calendar event
 * @return {number}
 */
export function allDayFirst(first, second) {
	if (first.allDay === second.allDay) {
		return 0
	}
	return first.allDay ? -1 : 1
}

/**
 * Sorts all-day events by calendarOrder, then duration desc, then title.
 *
 * @param {EventApi} first The first full-calendar event
 * @param {EventApi} second The second full-calendar event
 * @return {number}
 */
export function allDayOrder(first, second) {
	if (!first.allDay || !second.allDay) {
		return 0
	}

	if (first.extendedProps.calendarOrder !== second.extendedProps.calendarOrder) {
		return (first.extendedProps.calendarOrder - second.extendedProps.calendarOrder) < 0 ? -1 : 1
	}

	if (second.duration !== first.duration) {
		return second.duration - first.duration
	}

	if (first.title !== second.title) {
		return (first.title < second.title) ? -1 : 1
	}

	return 0
}
