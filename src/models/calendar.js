/**
 * SPDX-FileCopyrightText: 2019 Nextcloud GmbH and Nextcloud contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */
import { detectColor, uidToHexColor } from '../utils/color.js'
import { mapDavShareeToCalendarShareObject } from './calendarShare.js'

/**
 * Creates a complete calendar-object based on given props
 *
 * @param {object} props Calendar-props already provided
 * @return {object}
 */
const getDefaultCalendarObject = (props = {}) => Object.assign({}, {
	// Id of the calendar
	id: '',
	// Visible display name
	displayName: '',
	// Color of the calendar
	color: uidToHexColor(''),
	// Whether or not the calendar is visible in the grid
	enabled: true,
	// Whether or not the calendar is loading events at the moment
	loading: false,
	// Whether this calendar supports VEvents
	supportsEvents: true,
	// Whether this calendar supports VJournals
	supportsJournals: false,
	// Whether this calendar supports VTodos
	supportsTasks: false,
	// The principal uri of the owner
	owner: '',
	// Timezone set for this calendar
	timezone: null,
	// List of shares
	shares: [],
	// Published url
	publishURL: null,
	// Internal CalDAV url of this calendar
	url: '',
	// Whether this calendar is read-only
	readOnly: false,
	// The order of this calendar in the calendar-list
	order: 0,
	// Whether or not the calendar is shared with me
	isSharedWithMe: false,
	// Whether or not the calendar can be shared by me
	canBeShared: false,
	// Whether or not the calendar can be published by me
	canBePublished: false,
	// Reference to cdav-lib object
	dav: false,
	// All calendar-objects from this calendar that have already been fetched
	calendarObjects: [],
	// Time-ranges that have already been fetched for this calendar
	fetchedTimeRanges: [],
	// Scheduling transparency
	transparency: 'opaque',
}, props)

/**
 * Map a dav collection to our calendar object model
 *
 * @param {object} calendar The calendar object from the cdav library
 * @param {object=} currentUserPrincipal The principal model of the current user principal
 * @return {object}
 */
const mapDavCollectionToCalendar = (calendar, currentUserPrincipal) => {
	const id = btoa(calendar.url)
	const displayName = calendar.displayname || getCalendarUriFromUrl(calendar.url)

	// calendar.color can be set to anything on the server,
	// so make sure it's something that remotely looks like a color
	let color = detectColor(calendar.color)
	if (!color) {
		// As fallback if we don't know what color that is supposed to be
		color = uidToHexColor(displayName)
	}

	const supportsEvents = calendar.components.includes('VEVENT')
	const supportsJournals = calendar.components.includes('VJOURNAL')
	const supportsTasks = calendar.components.includes('VTODO')
	const owner = calendar.owner
	const readOnly = !calendar.isWriteable()
	const canBeShared = calendar.isShareable()
	const canBePublished = calendar.isPublishable()
	const order = calendar.order || 0
	const url = calendar.url
	const publishURL = calendar.publishURL || null
	const timezone = calendar.timezone || null
	// If this property is not present on a calendar collection,
	// then the default value CALDAV:opaque MUST be assumed.
	// https://datatracker.ietf.org/doc/html/rfc6638#section-9.1
	const transparency = calendar.transparency || 'opaque'

	let isSharedWithMe = false
	if (!currentUserPrincipal) {
		// If the user is not authenticated, the calendar
		// will always be marked as shared with them
		isSharedWithMe = true
	} else {
		isSharedWithMe = (owner !== currentUserPrincipal.url)
	}

	let enabled
	if (!currentUserPrincipal) {
		// If the user is not authenticated,
		// always enable the calendar
		enabled = true
	} else if (typeof calendar.enabled === 'boolean') {
		// If calendar-enabled is set, we will just take that
		enabled = calendar.enabled
	} else {
		// If there is no calendar-enabled,
		// we will display the calendar by default and set enabled
		enabled = true
		calendar.enabled = true
	}

	const shares = []
	if (!!currentUserPrincipal && Array.isArray(calendar.shares)) {
		for (const share of calendar.shares) {
			if (share.href === currentUserPrincipal.principalScheme) {
				continue
			}

			shares.push(mapDavShareeToCalendarShareObject(share))
		}
	}

	return getDefaultCalendarObject({
		id,
		displayName,
		color,
		order,
		url,
		enabled,
		supportsEvents,
		supportsJournals,
		supportsTasks,
		isSharedWithMe,
		owner,
		readOnly,
		publishURL,
		canBeShared,
		canBePublished,
		shares,
		timezone,
		transparency,
		dav: calendar,
	})
}

/**
 * Gets the calendar uri from the url
 *
 * @param {string} url The url to get calendar uri from
 * @return {string}
 */
function getCalendarUriFromUrl(url) {
	if (url.endsWith('/')) {
		url = url.substring(0, url.length - 1)
	}

	return url.substring(url.lastIndexOf('/') + 1)
}

export {
	getDefaultCalendarObject,
	mapDavCollectionToCalendar,
}
