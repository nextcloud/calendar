/**
 * @copyright Copyright (c) 2019 Georg Ehrke
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

/**
 * Provides a function to select a time-range in the calendar-grid.
 * This will open the new event editor. Based on the user's preference,
 * either the popover or the sidebar.
 *
 * @param {object} store The Vuex store
 * @param {object} router The Vue router
 * @param {object} route The Vue route
 * @param {Window} window The window object
 * @return {Function}
 */
export default function(store, router, route, window) {
	return function({ start, end, allDay }) {
		let name = store.state.settings.skipPopover
			? 'NewSidebarView'
			: 'NewPopoverView'

		// Don't show the popover if the window size is too small (less then its max width of 450 px + a bit)
		// The mobile breakpoint of the reworked modals is 1024 px / 2 so simply use that.
		if (window.innerWidth <= 1024 / 2 && name === 'NewPopoverView') {
			name = 'NewSidebarView'
		}

		// If we are already in a new event view, don't change it
		if (['NewSidebarView', 'NewPopoverView'].includes(route.name)) {
			name = route.name
		}

		const params = Object.assign({}, route.params, {
			allDay: allDay ? '1' : '0',
			dtstart: String(Math.floor(start.getTime() / 1000)),
			dtend: String(Math.floor(end.getTime() / 1000)),
		})

		// Don't push new route when day didn't change
		if (name === route.name && params.allDay === route.params.allDay
			&& params.dtstart === route.params.dtstart && params.dtend === route.params.dtend) {
			return
		}

		router.push({ name, params })
	}
}
