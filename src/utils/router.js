/**
 * SPDX-FileCopyrightText: 2020 Nextcloud GmbH and Nextcloud contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */
import { loadState } from '@nextcloud/initial-state'
import {
	dateFactory,
	getUnixTimestampFromDate,
} from '@/utils/date.js'
import logger from '@/utils/logger.js'

/**
 * Gets the initial view
 *
 * @return {string}
 */
export function getInitialView() {
	try {
		return loadState('calendar', 'initial_view')
	} catch (error) {
		logger.error('Failed to load initial view state', { error })
		return 'dayGridMonth'
	}
}

/**
 * Gets the preferred editor view
 *
 * @return {string} Either popover or full
 */
export function getPreferredEditorRoute() {
	let skipPopover
	try {
		skipPopover = loadState('calendar', 'skip_popover')
	} catch (error) {
		logger.error('Failed to load skip-popover state', { error })
		skipPopover = false
	}

	// Don't show the popover if the window size is too small (less then its max width of 450 px + a bit)
	// The mobile breakpoint of the reworked modals is 1024 px / 2 so simply use that.
	if (window.innerWidth <= 1024 / 2) {
		skipPopover = true
	}

	return skipPopover
		? 'full'
		: 'popover'
}

/**
 * Gets the default start-date for a new event
 *
 * @return {string}
 */
export function getDefaultStartDateForNewEvent() {
	const start = dateFactory()
	start.setHours(start.getHours() + Math.ceil(start.getMinutes() / 60))
	start.setMinutes(0)

	return String(getUnixTimestampFromDate(start))
}

/**
 * Gets the default end-date for a new event
 *
 * @return {string}
 */
export function getDefaultEndDateForNewEvent() {
	// When we have a setting for default event duration,
	// this needs to be taken into consideration here
	const start = getDefaultStartDateForNewEvent()
	const end = new Date(Number(start) * 1000)
	end.setHours(end.getHours() + 1)

	return String(getUnixTimestampFromDate(end))
}

/**
 * Prefixes a desired route name based on the current route
 *
 * @param {string} currentRouteName The name of the current route
 * @param {string} toRouteName The name of the desired route
 * @return {string}
 */
export function getPrefixedRoute(currentRouteName, toRouteName) {
	if (currentRouteName.startsWith('Embed')) {
		return 'Embed' + toRouteName
	}

	if (currentRouteName.startsWith('Public')) {
		return 'Public' + toRouteName
	}

	return toRouteName
}

/**
 * The different modes the calendar app can be rendered in.
 * This is the single source of truth for what "public", "embedded"
 * and "widget" mean across the app - components should derive their
 * behaviour from this instead of re-deriving it from route names or
 * calendar permissions.
 */
export const ViewMode = Object.freeze({
	// A normal, authenticated user viewing their own calendars
	USER: 'user',
	// A public share link (/p/:tokens/...)
	PUBLIC: 'public',
	// An embedded share link (/embed/:tokens/...)
	EMBEDDED: 'embedded',
	// A dashboard / Talk / Text reference widget (no vue-router present)
	WIDGET: 'widget',
})

/**
 * Determines the view mode the calendar is currently rendered in.
 *
 * @param {string|undefined|null} routeName Name of the current vue-router route, if any
 * @param {boolean} isWidget Whether the calendar is rendered as a reference widget
 * @return {string} One of ViewMode
 */
export function getViewMode(routeName, isWidget = false) {
	if (isWidget) {
		return ViewMode.WIDGET
	}

	if (routeName?.startsWith('Embed')) {
		return ViewMode.EMBEDDED
	}

	if (routeName?.startsWith('Public')) {
		return ViewMode.PUBLIC
	}

	return ViewMode.USER
}
