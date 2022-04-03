/**
 * @copyright Copyright (c) 2020 Georg Ehrke
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
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program. If not, see <http://www.gnu.org/licenses/>.
 *
 */
import { loadState } from '@nextcloud/initial-state'
import {
	dateFactory,
	getUnixTimestampFromDate,
} from './date.js'

/**
 * Gets the initial view
 *
 * @return {string}
 */
export function getInitialView() {
	try {
		return loadState('calendar', 'initial_view')
	} catch (error) {
		return 'dayGridMonth'
	}
}

/**
 * Gets the preferred editor view
 *
 * @return {string} Either popover or sidebar
 */
export function getPreferredEditorRoute() {
	let skipPopover
	try {
		skipPopover = loadState('calendar', 'skip_popover')
	} catch (error) {
		skipPopover = false
	}

	// Don't show the popover if the window size is too small (less then its max width of 450 px + a bit)
	// The mobile breakpoint of the reworked modals is 1024 px / 2 so simply use that.
	if (window.innerWidth <= 1024 / 2) {
		skipPopover = true
	}

	return skipPopover
		? 'sidebar'
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
 * Checks whether a routeName represents a public / embedded route
 *
 * @param {string} routeName Name of the route
 * @return {boolean}
 */
export function isPublicOrEmbeddedRoute(routeName) {
	return routeName.startsWith('Embed') || routeName.startsWith('Public')
}
