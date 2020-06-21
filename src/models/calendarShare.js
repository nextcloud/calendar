/**
 * @copyright Copyright (c) 2020 Georg Ehrke
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
 * but WITHOUT ANY WARRANTY without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program. If not, see <http://www.gnu.org/licenses/>.
 *
 */
import {
	PRINCIPAL_PREFIX_CIRCLE,
	PRINCIPAL_PREFIX_GROUP,
	PRINCIPAL_PREFIX_USER,
} from './consts.js'

/**
 * Creates a complete calendar-share-object based on given props
 *
 * @param {Object} props Calendar-share-props already provided
 * @returns {Object}
 */
const getDefaultCalendarShareObject = (props = {}) => Object.assign({}, {
	// Unique identifier
	id: null,
	// Displayname of the sharee
	displayName: null,
	// Whether or not share is writable
	writeable: false,
	// Whether or not sharee is an individual user
	isUser: false,
	// Whether or not sharee is an admin-defined group
	isGroup: false,
	// Whether or not sharee is a user-defined group
	isCircle: false,
	// Uri necessary for deleting / updating share
	uri: null,
}, props)

/**
 * Map a dav collection to our calendar object model
 *
 * @param {Object} sharee The sharee object from the cdav library shares
 * @returns {Object}
 */
const mapDavShareeToCalendarShareObject = (sharee) => {
	// sharee.href might contain non-latin characters, so let's uri encode it first
	const id = btoa(encodeURI(sharee.href))

	let displayName
	if (sharee['common-name'] && sharee['common-name'].trim() !== '') {
		displayName = sharee['common-name']
	} else if (sharee.href.startsWith(PRINCIPAL_PREFIX_GROUP)) {
		displayName = sharee.href.substr(28)
	} else if (sharee.href.startsWith(PRINCIPAL_PREFIX_USER)) {
		displayName = sharee.href.substr(27)
	} else {
		displayName = sharee.href
	}

	const writeable = sharee.access[0].endsWith('read-write')
	const isUser = sharee.href.startsWith(PRINCIPAL_PREFIX_USER)
	const isGroup = sharee.href.startsWith(PRINCIPAL_PREFIX_GROUP)
	const isCircle = sharee.href.startsWith(PRINCIPAL_PREFIX_CIRCLE)
	const uri = sharee.href

	return getDefaultCalendarShareObject({
		id,
		displayName,
		writeable,
		isUser,
		isGroup,
		isCircle,
		uri,
	})
}

export {
	getDefaultCalendarShareObject,
	mapDavShareeToCalendarShareObject,
}
