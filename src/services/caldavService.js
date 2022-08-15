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
import DavClient from '@nextcloud/cdav-library'
import { generateRemoteUrl } from '@nextcloud/router'
import { getRequestToken } from '@nextcloud/auth'
import { CALDAV_BIRTHDAY_CALENDAR } from '../models/consts.js'

let client = null
const getClient = () => {
	if (client) {
		return client
	}

	client = new DavClient({
		rootUrl: generateRemoteUrl('dav'),
	}, () => {
		const headers = {
			'X-Requested-With': 'XMLHttpRequest',
			requesttoken: getRequestToken(),
			'X-NC-CalDAV-Webcal-Caching': 'On',
		}
		const xhr = new XMLHttpRequest()
		const oldOpen = xhr.open

		// override open() method to add headers
		xhr.open = function() {
			const result = oldOpen.apply(this, arguments)
			for (const name in headers) {
				xhr.setRequestHeader(name, headers[name])
			}

			return result
		}

		OC.registerXHRForErrorProcessing(xhr) // eslint-disable-line no-undef
		return xhr
	})

	return getClient()
}

/**
 * Initializes the client for use in the user-view
 */
const initializeClientForUserView = async () => {
	await getClient().connect({ enableCalDAV: true })
}

/**
 * Initializes the client for use in the public/embed-view
 */
const initializeClientForPublicView = async () => {
	await getClient()._createPublicCalendarHome()
}

/**
 * Fetch all calendars from the server
 *
 * @return {Promise<CalendarHome>}
 */
const getCalendarHome = () => getClient().calendarHomes[0]

/**
 * Fetch all collections in the calendar home from the server
 *
 * @return {Promise<Collection[]>}
 */
const findAll = () => {
	return getCalendarHome().findAllCalDAVCollectionsGrouped()
}

/**
 * Fetch all deleted calendars from the server
 *
 * @return {Promise<Calendar[]>}
 */
const findAllDeletedCalendars = () => {
	return getCalendarHome().findAllDeletedCalendars()
}

/**
 * Fetch public calendars by their token
 *
 * @param {string[]} tokens List of tokens
 * @return {Promise<Calendar[]>}
 */
const findPublicCalendarsByTokens = async (tokens) => {
	const findPromises = []

	for (const token of tokens) {
		const promise = getClient().publicCalendarHome
			.find(token)
			.catch(() => null) // Catch outdated tokens

		findPromises.push(promise)
	}

	const calendars = await Promise.all(findPromises)
	return calendars.filter((calendar) => calendar !== null)
}

/**
 * Fetches all scheduling inboxes
 *
 * Nitpick detail: Technically, we shouldn't be querying all scheduling inboxes
 * in the calendar-home and just take the first one, but rather query the
 * "CALDAV:schedule-inbox-URL" property on the principal URL and take that one.
 * However, it doesn't make any difference for the Nextcloud CalDAV server
 * and saves us extraneous requests here.
 *
 * https://tools.ietf.org/html/rfc6638#section-2.2.1
 *
 * @return {Promise<ScheduleInbox[]>}
 */
const findSchedulingInbox = async () => {
	const inboxes = await getCalendarHome().findAllScheduleInboxes()
	return inboxes[0]
}

/**
 * Fetches all scheduling outboxes
 *
 * Nitpick detail: Technically, we shouldn't be querying all scheduling outboxes
 * in the calendar-home and just take the first one, but rather query the
 * "CALDAV:schedule-outbox-URL" property on the principal URL and take that one.
 * However, it doesn't make any difference for the Nextcloud CalDAV server
 * and saves us extraneous requests here.
 *
 * https://tools.ietf.org/html/rfc6638#section-2.1.1
 *
 * @return {Promise<ScheduleOutbox>}
 */
const findSchedulingOutbox = async () => {
	const outboxes = await getCalendarHome().findAllScheduleOutboxes()
	return outboxes[0]
}

/**
 * Creates a calendar
 *
 * @param {string} displayName Visible name
 * @param {string} color Color
 * @param {string[]} components Supported component set
 * @param {number} order Order of calendar in list
 * @param {string} timezoneIcs ICS representation of timezone
 * @return {Promise<Calendar>}
 */
const createCalendar = async (displayName, color, components, order, timezoneIcs) => {
	return getCalendarHome().createCalendarCollection(displayName, color, components, order, timezoneIcs)
}

/**
 * Creates a subscription
 *
 * This function does not return a subscription, but a cached calendar
 *
 * @param {string} displayName Visible name
 * @param {string} color Color
 * @param {string} source Link to WebCAL Source
 * @param {number} order Order of calendar in list
 * @return {Promise<Calendar>}
 */
const createSubscription = async (displayName, color, source, order) => {
	return getCalendarHome().createSubscribedCollection(displayName, color, source, order)
}

/**
 * Gets the birthday calendar
 *
 * @return {Promise<Calendar>}
 */
const getBirthdayCalendar = async () => {
	return getCalendarHome().find(CALDAV_BIRTHDAY_CALENDAR)
}

/**
 * Returns the Current User Principal
 *
 * @return {Principal}
 */
const getCurrentUserPrincipal = () => {
	return getClient().currentUserPrincipal
}

/**
 * Finds calendar principals by displayname
 *
 * @param {string} term The search-term
 * @return {Promise<void>}
 */
const principalPropertySearchByDisplaynameOrEmail = async (term) => {
	return getClient().principalPropertySearchByDisplaynameOrEmail(term)
}

/**
 * Performs a principal property search based on multiple advanced filters
 *
 * @param {object} query The destructuring query object
 * @param {string=} query.displayName The display name to search for
 * @param {number=} query.capacity The minimum required seating capacity
 * @param {string[]=} query.features The features to filter by
 * @param {string=} query.roomType The room type to filter by
 * @return {Promise<Principal[]>}
 */
const advancedPrincipalPropertySearch = async (query) => {
	return getClient().advancedPrincipalPropertySearch(query)
}

/**
 * Finds one principal by it's URL
 *
 * @param {string} url The principal-url
 * @return {Promise<Principal>}
 */
const findPrincipalByUrl = async (url) => {
	return getClient().findPrincipal(url)
}

export {
	initializeClientForUserView,
	initializeClientForPublicView,
	findAll,
	findAllDeletedCalendars,
	findPublicCalendarsByTokens,
	findSchedulingInbox,
	findSchedulingOutbox,
	createCalendar,
	createSubscription,
	getBirthdayCalendar,
	getCurrentUserPrincipal,
	principalPropertySearchByDisplaynameOrEmail,
	advancedPrincipalPropertySearch,
	findPrincipalByUrl,
}
