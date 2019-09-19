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
import { getDefaultColor } from '../services/colorService.js'
import client from '../services/caldavService.js'

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
	color: getDefaultColor(),
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
 * @returns {Object}
 */
export function mapDavCollectionToCalendar(calendar) {
	let color = calendar.color || getDefaultColor()
	if (color.length === 9) {
		// Make sure it's #RRGGBB, not #RRGGBBAA
		color = color.substr(0, 7)
	}

	let shares = calendar.shares || []

	return {
		id: btoa(calendar.url),
		displayName: calendar.displayname,
		color: color,
		enabled: !!calendar.enabled,
		supportsEvents: calendar.components.includes('VEVENT'),
		supportsJournals: calendar.components.includes('VJOURNAL'),
		supportsTasks: calendar.components.includes('VTODO'),
		owner: calendar.owner,
		readOnly: !calendar.isWriteable(),
		order: calendar.order || 0,
		url: calendar.url,
		dav: calendar,
		shares: shares
			.filter((sharee) => sharee.href !== client.currentUserPrincipal.principalScheme) // public shares create a share with yourself ... should be fixed in server
			.map(sharee => Object.assign({}, mapDavShareeToSharee(sharee))),
		publishURL: calendar.publishURL || null,
		isSharedWithMe: calendar.owner !== client.currentUserPrincipal.principalUrl,
		canBeShared: calendar.isShareable(),
		canBePublished: calendar.isPublishable()
	}
}

/**
 * Map a dav collection to our calendar object model
 *
 * @param {Object} sharee The sharee object from the cdav library shares
 * @returns {Object}
 */
export function mapDavShareeToSharee(sharee) {
	const id = btoa(sharee.href)
	const name = sharee['common-name']
		? sharee['common-name']
		: id

	return {
		displayName: name,
		id: id,
		writeable: sharee.access[0].endsWith('read-write'),
		isGroup: sharee.href.indexOf('principal:principals/groups/') === 0,
		uri: sharee.href
	}
}
