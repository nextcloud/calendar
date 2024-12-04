/**
 * SPDX-FileCopyrightText: 2019 Nextcloud GmbH and Nextcloud contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */
import {
	getPrefixedRoute,
	isPublicOrEmbeddedRoute,
} from '../../utils/router.js'
import { generateUrl } from '@nextcloud/router'
import { translate as t } from '@nextcloud/l10n'
import { showInfo } from '@nextcloud/dialogs'
import { emit } from '@nextcloud/event-bus'
import useSettingsStore from '../../store/settings.js'
import useWidgetStore from '../../store/widget.js'

/**
 * Returns a function for click action on event. This will open the editor.
 * Either the popover or the sidebar, based on the user's preference.
 *
 * @param {object} router The Vue router
 * @param {object} route The current Vue route
 * @param {Window} window The window object
 * @param {boolean} isWidget Whether the calendar is embedded in a widget
 * @param {object} ref The ref object of CalendarGrid component
 * @return {Function}
 */
export default function(router, route, window, isWidget = false, ref = undefined) {
	const widgetStore = useWidgetStore()
	return function({ event }) {
		if (isWidget) {
			widgetStore.setWidgetRef({ widgetRef: ref.fullCalendar.$el })
		}
		switch (event.extendedProps.objectType) {
		case 'VEVENT':
			handleEventClick(event, router, route, window, isWidget)
			break

		case 'VTODO':
			handleToDoClick(event, route, window, isWidget)
			break
		}
	}
}

/**
 * Handle eventClick for VEVENT
 *
 * @param {EventDef} event FullCalendar event
 * @param {object} router The Vue router
 * @param {object} route The current Vue route
 * @param {Window} window The window object
 * @param {boolean} isWidget Whether the calendar is embedded in a widget
 */
function handleEventClick(event, router, route, window, isWidget = false) {
	const settingsStore = useSettingsStore()
	const widgetStore = useWidgetStore()
	if (isWidget) {
		widgetStore.setSelectedEvent({ object: event.extendedProps.objectId, recurrenceId: event.extendedProps.recurrenceId })
		return
	}
	let desiredRoute = settingsStore.skipPopover
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
 * @param {object} route The current Vue route
 * @param {Window} window The window object
 * @param isWidget
 */
function handleToDoClick(event, route, window, isWidget = false) {
	const settingsStore = useSettingsStore()

	if (isWidget || isPublicOrEmbeddedRoute(route.name)) {
		return
	}

	const davUrlParts = event.extendedProps.davUrl.split('/')
	const taskId = davUrlParts.pop()
	const calendarId = davUrlParts.pop()

	emit('calendar:handle-todo-click', { calendarId, taskId })

	if (!settingsStore.tasksEnabled) {
		showInfo(t('calendar', 'Please ask your administrator to enable the Tasks App.'))
		return
	}
	const url = `apps/tasks/calendars/${calendarId}/tasks/${taskId}`
	window.location = window.location.protocol + '//' + window.location.host + generateUrl(url)
}
