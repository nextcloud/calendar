/**
 * @copyright Copyright (c) 2019 Georg Ehrke
 *
 * @author Georg Ehrke <oc.list@georgehrke.com>
 *
 * @license GNU AGPL version 3 or any later version
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
 * @param {Object} store The Vuex store
 * @param {Object} router The Vue router
 * @param {Window} window The window object
 * @returns {Function}
 */
export default function(store, router, window) {
	return function({ start, end, allDay }) {
		let name = store.state.settings.skipPopover
			? 'NewSidebarView'
			: 'NewPopoverView'

		if (window.innerWidth <= 768 && name === 'NewPopoverView') {
			name = 'NewSidebarView'
		}

		const params = Object.assign({}, store.state.route.params, {
			allDay: allDay ? '1' : '0',
			dtstart: String(Math.floor(start.getTime() / 1000)),
			dtend: String(Math.floor(end.getTime() / 1000))
		})

		// Don't push new route when day didn't change
		if (name === store.state.route.name
			&& params.allDay === store.state.route.params.allDay
			&& params.dtstart === store.state.route.params.dtstart
			&& params.dtend === store.state.route.params.dtend) {
			return
		}

		router.push({ name, params })
	}
}
