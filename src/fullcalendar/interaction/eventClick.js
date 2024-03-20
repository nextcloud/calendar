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
import {
	getPrefixedRoute,
	isPublicOrEmbeddedRoute,
} from '../../utils/router.js'
import { generateUrl } from '@nextcloud/router'
import { translate as t } from '@nextcloud/l10n'
import { showInfo } from '@nextcloud/dialogs'
import { emit } from '@nextcloud/event-bus'

/**
 * Returns a function for click action on event. This will open the editor.
 * Either the popover or the sidebar, based on the user's preference.
 *
 * @param {object} store The Vuex store
 * @param {object} router The Vue router
 * @param {object} route The current Vue route
 * @param {Window} window The window object
 * @param {boolean} isWidget Whether the calendar is embedded in a widget
 * @param {object} ref The ref object of CalendarGrid component
 * @return {Function}
 */
export default function(store, router, route, window, isWidget = false, ref = undefined) {

	return function({ event }) {
		if (isWidget) {
			store.commit('setWidgetRef', { widgetRef: ref.fullCalendar.$el })
		}
		switch (event.extendedProps.objectType) {
		case 'VEVENT':
			handleEventClick(event, store, router, route, window, isWidget)
			break

		case 'VTODO':
			handleToDoClick(event, store, route, window, isWidget)
			break
		}
	}
}

/**
 * Handle eventClick for VEVENT
 *
 * @param {EventDef} event FullCalendar event
 * @param {object} store The Vuex store
 * @param {object} router The Vue router
 * @param {object} route The current Vue route
 * @param {Window} window The window object
 * @param {boolean} isWidget Whether the calendar is embedded in a widget
 */
function handleEventClick(event, store, router, route, window, isWidget = false) {
	if (isWidget) {
		store.commit('setSelectedEvent', { object: event.extendedProps.objectId, recurrenceId: event.extendedProps.recurrenceId })
		return
	}
	let desiredRoute = store.state.settings.skipPopover
		? 'EditSidebarView'
		: 'EditPopoverView'

	// Don't show the popover if the window size is too small (less then its max width of 450 px + a bit)
	// The mobile breakpoint of the reworked modals is 1024 px / 2 so simply use that.
	if (window.innerWidth <= 1024 / 2 && desiredRoute === 'EditPopoverView') {
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

/**
 * Handle eventClick for VTODO
 *
 * @param {EventDef} event FullCalendar event
 * @param {object} store The Vuex store
 * @param {object} route The current Vue route
 * @param {Window} window The window object
 * @param isWidget
 */
function handleToDoClick(event, store, route, window, isWidget = false) {

	if (isWidget || isPublicOrEmbeddedRoute(route.name)) {
		return
	}

	const davUrlParts = event.extendedProps.davUrl.split('/')
	const taskId = davUrlParts.pop()
	const calendarId = davUrlParts.pop()

	emit('calendar:handle-todo-click', { calendarId, taskId })

	if (!store.state.settings.tasksEnabled) {
		showInfo(t('calendar', 'Please ask your administrator to enable the Tasks App.'))
		return
	}
	const url = `apps/tasks/#/calendars/${calendarId}/tasks/${taskId}`
	window.location = window.location.protocol + '//' + window.location.host + generateUrl(url)
}
