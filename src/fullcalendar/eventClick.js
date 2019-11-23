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
import { getPrefixedRoute } from '../utils/router'

/**
 * Returns a function for click action on event. This will open the editor.
 * Either the popover or the sidebar, based on the user's preference.
 *
 * @param {Object} store The Vuex store
 * @param {Object} router The Vue router
 * @param {Object} route The current Vue route
 * @param {Window} window The window object
 * @returns {Function}
 */
export default function(store, router, route, window) {
	return function({ event }) {
		let desiredRoute = store.state.settings.skipPopover
			? 'EditSidebarView'
			: 'EditPopoverView'

		if (window.innerWidth <= 768 && desiredRoute === 'EditPopoverView') {
			desiredRoute = 'EditSidebarView'
		}

		const name = getPrefixedRoute(route.name, desiredRoute)
		const params = Object.assign({}, route.params, {
			object: event.extendedProps.objectId,
			recurrenceId: String(event.extendedProps.recurrenceId),
		})

		// Don't push new route when day didn't change
		if ((getPrefixedRoute(route.name, 'EditPopoverView') === route.name || getPrefixedRoute(route.name, 'EditSidebarView') === route.name)
			&& params.object === route.params.object
			&& params.recurrenceId === route.params.recurrenceId) {
			return
		}

		router.push({ name, params })
	}
}
