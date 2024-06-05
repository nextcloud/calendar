/**
 * SPDX-FileCopyrightText: 2019 Nextcloud GmbH and Nextcloud contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */
import { getYYYYMMDDFromDate } from '../../utils/date.js'

/**
 * Handles a click on a day-number in the calendar-grid
 *
 * @param {object} router The Vue router
 * @param {object} route The current Vue route
 * @return {function(Date): void}
 */
export default function(router, route) {
	return function(date) {
		const name = route.name
		const params = Object.assign({}, route.params, {
			firstDay: getYYYYMMDDFromDate(date),
			view: 'timeGridDay',
		})

		// Don't push new route when day and view didn't change
		if (route.params.firstDay === params.firstDay && route.params.view === params.view) {
			return
		}

		router.push({ name, params })
	}
}
