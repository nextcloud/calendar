/**
 * SPDX-FileCopyrightText: 2019 Nextcloud GmbH and Nextcloud contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import useSettingsStore from '../../store/settings.js'
import { errorCatch } from '../utils/errors.js'

/**
 * Provides a function to select a time-range in the calendar-grid.
 * This will open the new event editor. Based on the user's preference,
 * either the popover or the full.
 *
 * @param {object} router The Vue router
 * @param {object} route The Vue route
 * @param {Window} window The window object
 * @return {Function}
 */
export default function(router, route, window) {
	const settingsStore = useSettingsStore()

	return errorCatch(function({ start, end, allDay }) {
		let name = settingsStore.skipPopover
			? 'NewFullView'
			: 'NewPopoverView'

		// Don't show the popover if the window size is too small (less then its max width of 450 px + a bit)
		// The mobile breakpoint of the reworked modals is 1024 px / 2 so simply use that.
		if (window.innerWidth <= 1024 / 2 && name === 'NewPopoverView') {
			name = 'NewFullView'
		}

		// If we are already in a new event view, don't change it
		if (['NewFullView', 'NewPopoverView'].includes(route.name)) {
			name = route.name
		}

		const params = {
			...route.params,
			allDay: allDay ? '1' : '0',
			dtstart: String(Math.floor(start.getTime() / 1000)),
			dtend: String(Math.floor(end.getTime() / 1000)),
		}

		// Don't push new route when day didn't change
		if (name === route.name && params.allDay === route.params.allDay
			&& params.dtstart === route.params.dtstart && params.dtend === route.params.dtend) {
			return
		}

		router.push({ name, params })
	}, 'select')
}
