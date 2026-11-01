/**
 * SPDX-FileCopyrightText: 2019 Nextcloud GmbH and Nextcloud contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */
import { showInfo } from '@nextcloud/dialogs'
import { emit } from '@nextcloud/event-bus'
import { translate as t } from '@nextcloud/l10n'
import { generateUrl, getBaseUrl } from '@nextcloud/router'
import { errorCatchAsync } from '@/fullcalendar/utils/errors.js'
import useCalendarsStore from '@/store/calendars.js'
import useSettingsStore from '@/store/settings.js'
import useWidgetStore from '@/store/widget.js'
import { isDeckCalendar } from '@/utils/calendar.ts'
import {
	getPrefixedRoute,
	getViewMode,
	ViewMode,
} from '@/utils/router.js'
import { parseTaskDavUrl } from '@/utils/tasks.ts'

/**
 * Returns a function for click action on event. This will open the editor.
 * Either the popover or the full, based on the user's preference.
 *
 * @param {object} router The Vue router
 * @param {object} route The current Vue route
 * @param {Window} window The window object
 * @param {boolean} isWidget Whether the calendar is embedded in a widget
 * @param {object} ref The ref object of CalendarGrid component
 * @param {function(object): void} showReference Show a reference in a popover
 * @return {(info: {event: EventDef}) => Promise<void>}
 */
export default function(router, route, window, isWidget = false, ref = undefined, showReference = undefined) {
	const calendarsStore = useCalendarsStore()
	const widgetStore = useWidgetStore()
	return errorCatchAsync(function({ el, event, jsEvent }) {
		if (isWidget) {
			widgetStore.setWidgetRef({ widgetRef: ref.fullCalendar.$el })
		}
		switch (event.extendedProps.objectType) {
			case 'VEVENT':
				handleEventClick(event, router, route, window, isWidget)
				break

			case 'VTODO': {
				const calendar = calendarsStore.getCalendarById(event.extendedProps.calendarId)
				if (calendar && isDeckCalendar(calendar) && showReference) {
					const { taskId } = parseTaskDavUrl(event.extendedProps.davUrl)
					const cardId = /^card-(\d+)\.ics$/.exec(taskId)?.[1]
					if (cardId) {
						const url = generateUrl('/apps/deck/card/{cardId}', { cardId }, { baseURL: getBaseUrl() })
						jsEvent.preventDefault()
						showReference({ url, el })
						break
					}
				}
				handleToDoClick(event, el, route, window, jsEvent, isWidget)
				break
			}
		}
	}, 'eventClick')
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
		? 'EditFullView'
		: 'EditPopoverView'

	// Don't show the popover if the window size is too small (less than its max width of 516 px + a bit)
	// The sidebar is 300px, so we check 850px (300 + 516 + some margin)

	// The popover also becomes uncomfortable to use on short screens
	if ((window.innerWidth <= 850 || window.innerHeight <= 400) && desiredRoute === 'EditPopoverView') {
		desiredRoute = 'EditFullView'
	}

	const name = getPrefixedRoute(route.name, desiredRoute)
	const params = {
		...route.params,
		object: event.extendedProps.objectId,
		recurrenceId: String(event.extendedProps.recurrenceId),
	}

	// Don't push new route when day didn't change
	if ((getPrefixedRoute(route.name, 'EditPopoverView') === route.name || getPrefixedRoute(route.name, 'EditFullView') === route.name)
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
 * @param {HTMLElement} el The HTML element of the event
 * @param {object} route The current Vue route
 * @param {Window} window The window object
 * @param {MouseEvent} jsEvent The native click event
 * @param {boolean} isWidget Whether the calendar is embedded as a widget
 */
function handleToDoClick(event, el, route, window, jsEvent, isWidget = false) {
	const settingsStore = useSettingsStore()

	if (getViewMode(route.name, isWidget) !== ViewMode.USER) {
		jsEvent?.preventDefault()
		return
	}

	const { calendarId, taskId } = parseTaskDavUrl(event.extendedProps.davUrl)

	emit('calendar:handle-todo-click', { calendarId, taskId })

	if (!settingsStore.tasksEnabled) {
		jsEvent?.preventDefault()
		showInfo(t('calendar', 'Please ask your administrator to enable the Tasks App.'))
		return
	}

	// In the list view, FullCalendar navigates in the same tab when the row is clicked,
	// ignoring the target of the link. Open the task in a new tab instead.
	if (event.url && el?.classList?.contains('fc-list-event')) {
		jsEvent?.preventDefault()
		window.open(event.url, '_blank', 'noopener')
	}
}
