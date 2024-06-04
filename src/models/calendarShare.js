/**
 * SPDX-FileCopyrightText: 2020 Nextcloud GmbH and Nextcloud contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */
import {
	PRINCIPAL_PREFIX_CIRCLE,
	PRINCIPAL_PREFIX_GROUP,
	PRINCIPAL_PREFIX_USER,
} from './consts.js'

/**
 * Creates a complete calendar-share-object based on given props
 *
 * @param {object} props Calendar-share-props already provided
 * @return {object}
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
 * @param {object} sharee The sharee object from the cdav library shares
 * @return {object}
 */
const mapDavShareeToCalendarShareObject = (sharee) => {
	// sharee.href might contain non-latin characters, so let's uri encode it first
	const id = btoa(encodeURI(sharee.href))

	let displayName
	if (sharee['common-name'] && sharee['common-name'].trim() !== '') {
		displayName = sharee['common-name']
	} else if (sharee.href.startsWith(PRINCIPAL_PREFIX_GROUP)) {
		displayName = decodeURIComponent(sharee.href.slice(28))
	} else if (sharee.href.startsWith(PRINCIPAL_PREFIX_USER)) {
		displayName = decodeURIComponent(sharee.href.slice(27))
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
