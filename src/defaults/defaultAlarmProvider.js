/**
 * SPDX-FileCopyrightText: 2019 Nextcloud GmbH and Nextcloud contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

/**
 * @param {boolean} allDay is all day?
 */
export function getDefaultAlarms(allDay = false) {
	if (allDay) {
		return [
			9 * 60 * 60, // On the day of the event at 9am
			-15 * 60 * 60, // 1 day before at 9am
			-39 * 60 * 60, // 2 days before at 9am
			-159 * 60 * 60, // 1 week before at 9am
		]
	} else {
		return [
			0, // At the time of the event
			-5 * 60, // 5 minutes before
			-10 * 60, // 10 minutes before
			-15 * 60, // 15 minutes before
			-30 * 60, // 30 minutes before
			-1 * 60 * 60, // 1 hour before
			-2 * 60 * 60, // 2 hour before
			-1 * 24 * 60 * 60, // 1 day before
			-2 * 24 * 60 * 60, // 2 days before
		]
	}
}

export default getDefaultAlarms
