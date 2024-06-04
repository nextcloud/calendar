/**
 * SPDX-FileCopyrightText: 2019 Nextcloud GmbH and Nextcloud contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

/**
 * Figure out whether or not an event can be dropped at a certain place
 *
 * This mostly enforces the policy that all events of a recurrence-set
 * must be of the same date-type
 *
 * @param {object} dropInfo Info about location where event will be dropped
 * @param {EventApi} draggedEvent The fullcalendar event object
 * @return {boolean}
 */
export default function(dropInfo, draggedEvent) {
	if (draggedEvent.extendedProps.canModifyAllDay) {
		return true
	}

	return dropInfo.allDay === draggedEvent.allDay
}
