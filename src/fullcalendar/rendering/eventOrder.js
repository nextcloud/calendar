/**
 * SPDX-FileCopyrightText: 2019 Nextcloud GmbH and Nextcloud contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */
import { errorCatch } from '../utils/errors.js'

/**
 * This sorts events by their start date and time and skips all-day events.
 *
 * @param {EventApi} first The first full-calendar event
 * @param {EventApi} second The second full-calendar event
 * @return {number}
 */
export function eventStartOrder(first, second) {
	if (first.allDay && second.allDay) {
		return 0
	}

	return first.start - second.start
}

/**
 * This sorts events by their duration in descending order and skips all-day events.
 *
 * @param {EventApi} first The first full-calendar event
 * @param {EventApi} second The second full-calendar event
 * @return {number}
 */
export function eventDurationOrderDesc(first, second) {
	if (first.allDay && second.allDay) {
		return 0
	}

	return second.duration - first.duration
}

/**
 * This sorts events when they occur at the same time, have the same duration
 * and the same all-day property
 *
 * @param {EventApi} firstEvent The first full-calendar event
 * @param {EventApi} secondEvent The second full-calendar event
 * @return {number}
 */
export function eventOrder(firstEvent, secondEvent) {
	if (firstEvent.extendedProps.calendarOrder !== secondEvent.extendedProps.calendarOrder) {
		return (firstEvent.extendedProps.calendarOrder - secondEvent.extendedProps.calendarOrder) < 0 ? -1 : 1
	}

	if (firstEvent.extendedProps.calendarName !== secondEvent.extendedProps.calendarName) {
		return (firstEvent.extendedProps.calendarName < secondEvent.extendedProps.calendarName) ? -1 : 1
	}

	if (firstEvent.extendedProps.calendarId !== secondEvent.extendedProps.calendarId) {
		return (firstEvent.extendedProps.calendarId < secondEvent.extendedProps.calendarId) ? -1 : 1
	}

	if (firstEvent.title !== secondEvent.title) {
		return (firstEvent.title < secondEvent.title) ? -1 : 1
	}

	return 0
}

export default errorCatch(eventOrder, 'eventOrder')
