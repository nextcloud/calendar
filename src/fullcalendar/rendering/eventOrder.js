/**
 * SPDX-FileCopyrightText: 2019 Nextcloud GmbH and Nextcloud contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

/**
 * This sorts events when they occur at the same time, have the same duration
 * and the same all-day property
 *
 * @param {EventApi} firstEvent The first full-calendar event
 * @param {EventApi} secondEvent The second full-calendar event
 * @return {number}
 */
export default function(firstEvent, secondEvent) {
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
