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
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program. If not, see <http://www.gnu.org/licenses/>.
 *
 */
import { detectColor, uidToHexColor } from '../utils/color.js'

/**
 * Creates a complete calendar-object based on given props
 *
 * @param {Object} props Calendar-props already provided
 * @returns {Object}
 */
export const getDefaultCalendarObject = (props = {}) => Object.assign({}, {
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
}, props)

/**
 * Map a dav collection to our calendar object model
 *
 * @param {Object} calendar The calendar object from the cdav library
 * @param {Object=} currentUserPrincipal The principal model of the current user principal
 * @returns {Object}
 */
export function mapDavCollectionToCalendar(calendar, currentUserPrincipal) {
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
		// we will display the calendar by default if it's owned by the user
		// or hide it by default it it's just shared with them
		enabled = !isSharedWithMe
	}

	const shares = []
	if (!!currentUserPrincipal && Array.isArray(calendar.shares)) {
		for (const share of calendar.shares) {
			if (share.href === currentUserPrincipal.principalScheme) {
				continue
			}

			shares.push(mapDavShareeToSharee(share))
		}
	}

	return {
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
		dav: calendar,
	}
}

/**
 * Map a dav collection to our calendar object model
 *
 * @param {Object} sharee The sharee object from the cdav library shares
 * @returns {Object}
 */
export function mapDavShareeToSharee(sharee) {
	// sharee.href might contain non-latin characters, so let's uri encode it first
	const id = btoa(encodeURI(sharee.href))

	let displayName
	if (sharee['common-name']) {
		displayName = sharee['common-name']
	} else if (sharee.href.startsWith('principal:principals/groups/')) {
		displayName = sharee.href.substr(28)
	} else if (sharee.href.startsWith('principal:principals/users/')) {
		displayName = sharee.href.substr(27)
	} else {
		displayName = sharee.href
	}

	const writeable = sharee.access[0].endsWith('read-write')
	const isGroup = sharee.href.indexOf('principal:principals/groups/') === 0
	const isCircle = sharee.href.indexOf('principal:principals/circles/') === 0
	const uri = sharee.href

	return {
		id,
		displayName,
		writeable,
		isGroup,
		isCircle,
		uri,
	}
}

/**
 * Gets the calendar uri from the url
 *
 * @param {String} url The url to get calendar uri from
 * @returns {string}
 */
function getCalendarUriFromUrl(url) {
	if (url.endsWith('/')) {
		url = url.substring(0, url.length - 1)
	}

	return url.substring(url.lastIndexOf('/') + 1)
}
