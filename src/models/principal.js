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
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program. If not, see <http://www.gnu.org/licenses/>.
 *
 */

import {
	PRINCIPAL_PREFIX_CALENDAR_RESOURCE,
	PRINCIPAL_PREFIX_CALENDAR_ROOM,
	PRINCIPAL_PREFIX_CIRCLE,
	PRINCIPAL_PREFIX_GROUP,
	PRINCIPAL_PREFIX_USER,
} from './consts.js'

/**
 * Creates a complete principal-object based on given props
 *
 * @param {object} props Principal-props already provided
 * @return {any}
 */
const getDefaultPrincipalObject = (props) => Object.assign({}, {
	// Id of the principal
	id: null,
	// Calendar-user-type. This can be INDIVIDUAL, GROUP, RESOURCE or ROOM
	calendarUserType: 'INDIVIDUAL',
	// E-Mail address of principal used for scheduling
	emailAddress: null,
	// The principals display-name
	// TODO: this should be renamed to displayName
	displayname: null,
	// principalScheme
	principalScheme: null,
	// The internal user-id in case it is of type INDIVIDUAL and a user
	// TODO: userId is deprecrated, use principalId instead
	userId: null,
	// url to the DAV-principal-resource
	url: null,
	// The cdav-library object
	dav: null,
	// Whether or not this principal represents a circle
	isCircle: false,
	// Whether or not this principal represents a user
	isUser: false,
	// Whether or not this principal represents a group
	isGroup: false,
	// Whether or not this principal represents a calendar-resource
	isCalendarResource: false,
	// Whether or not this principal represents a calendar-room
	isCalendarRoom: false,
	// The id of the principal without prefix. e.g. userId / groupId / etc.
	principalId: null,
	// The url of the default calendar for invitations
	scheduleDefaultCalendarUrl: null,
}, props)

/**
 * converts a dav principal into a vuex object
 *
 * @param {object} dav cdav-library Principal object
 * @return {object}
 */
const mapDavToPrincipal = (dav) => {
	const id = btoa(encodeURI(dav.url))
	const calendarUserType = dav.calendarUserType
	const principalScheme = dav.principalScheme
	const emailAddress = dav.email

	const displayname = dav.displayname
	const scheduleDefaultCalendarUrl = dav.scheduleDefaultCalendarUrl

	const isUser = dav.principalScheme.startsWith(PRINCIPAL_PREFIX_USER)
	const isGroup = dav.principalScheme.startsWith(PRINCIPAL_PREFIX_GROUP)
	const isCircle = dav.principalScheme.startsWith(PRINCIPAL_PREFIX_CIRCLE)
	const isCalendarResource = dav.principalScheme.startsWith(PRINCIPAL_PREFIX_CALENDAR_RESOURCE)
	const isCalendarRoom = dav.principalScheme.startsWith(PRINCIPAL_PREFIX_CALENDAR_ROOM)

	let principalId = null
	if (isUser) {
		principalId = dav.principalScheme.substring(PRINCIPAL_PREFIX_USER.length)
	} else if (isGroup) {
		principalId = dav.principalScheme.substring(PRINCIPAL_PREFIX_GROUP.length)
	} else if (isCircle) {
		principalId = dav.principalScheme.substring(PRINCIPAL_PREFIX_CIRCLE.length)
	} else if (isCalendarResource) {
		principalId = dav.principalScheme.substring(PRINCIPAL_PREFIX_CALENDAR_RESOURCE.length)
	} else if (isCalendarRoom) {
		principalId = dav.principalScheme.substring(PRINCIPAL_PREFIX_CALENDAR_ROOM.length)
	}

	const url = dav.principalUrl
	const userId = dav.userId

	return getDefaultPrincipalObject({
		id,
		calendarUserType,
		principalScheme,
		emailAddress,
		displayname,
		url,
		dav,
		isUser,
		isGroup,
		isCircle,
		isCalendarResource,
		isCalendarRoom,
		principalId,
		userId,
		scheduleDefaultCalendarUrl,
	})
}

export {
	getDefaultPrincipalObject,
	mapDavToPrincipal,
}
