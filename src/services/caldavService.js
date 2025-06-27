/**
 * SPDX-FileCopyrightText: 2020 Nextcloud GmbH and Nextcloud contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */
import DavClient from '@nextcloud/cdav-library'
import { generateRemoteUrl } from '@nextcloud/router'
import { CALDAV_BIRTHDAY_CALENDAR } from '../models/consts.js'

const clients = {}

const getClientKey = (headers) => JSON.stringify(headers)

const getClient = (headers = {}) => {
	const clientKey = getClientKey(headers)
	if (clients[clientKey]) {
		return clients[clientKey]
	}

	clients[clientKey] = new DavClient({
		rootUrl: generateRemoteUrl('dav'),
		defaultHeaders: {
			'X-NC-CalDAV-Webcal-Caching': 'On',
		},
	})

	return clients[clientKey]
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
 * @param {object} headers
 * @return {Promise<CalendarHome>}
 */
const getCalendarHome = (headers) => getClient(headers).calendarHomes[0]

/**
 * Fetch all collections in the calendar home from the server
 *
 * @return {Promise<Collection[]>}
 */
const findAll = () => {
	return getCalendarHome().findAllCalDAVCollectionsGrouped()
}

/**
 * Fetch all calendars in the calendar home from the server
 *
 * @return {Promise<Calendar[]>}
 */
const findAllCalendars = () => {
	return getCalendarHome().findAllCalendars()
}

/**
 * Fetch all subscriptions in the calendar home from the server
 */
export const findAllSubscriptions = async () => {
	const headers = {
		'X-NC-CalDAV-Webcal-Caching': 'Off',
	}

	// Ensure the client is initialized once
	await getClient(headers).connect({ enableCalDAV: true })

	return getCalendarHome(headers).findAllSubscriptions()
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
 * Enables the birthday calendar
 *
 * @return {Promise<Calendar>}
 */
const enableBirthdayCalendar = async () => {
	await getCalendarHome().enableBirthdayCalendar()
	return getBirthdayCalendar()
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

/**
 * Finds all principals in a collection at the given URL
 *
 * @param {string} url The URL of the principal collection
 * @param {object} options Passed to cdav-library/Principal::getPropFindList()
 * @return {Promise<Principal[]>}
 */
const findPrincipalsInCollection = async (url, options = {}) => {
	return getClient().findPrincipalsInCollection(url, options)
}

export {
	initializeClientForUserView,
	initializeClientForPublicView,
	findAll,
	findAllCalendars,
	findAllDeletedCalendars,
	findPublicCalendarsByTokens,
	findSchedulingInbox,
	findSchedulingOutbox,
	createCalendar,
	createSubscription,
	enableBirthdayCalendar,
	getBirthdayCalendar,
	getCurrentUserPrincipal,
	principalPropertySearchByDisplaynameOrEmail,
	advancedPrincipalPropertySearch,
	findPrincipalByUrl,
	findPrincipalsInCollection,
}
