/**
 * SPDX-FileCopyrightText: 2021 Nextcloud GmbH and Nextcloud contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

/**
 * Remove the mailto prefix from a URI and return it
 *
 * @param {string} uri URI to remove the prefix from
 * @return {string} URI without a mailto prefix
 */
export function removeMailtoPrefix(uri) {
	if (typeof uri !== 'string') {
		return ''
	}

	if (uri.toLowerCase().startsWith('mailto:')) {
		return uri.slice(7)
	}

	return uri
}

/**
 * Add the mailto prefix to a URI if it doesn't have one yet and return it
 *
 * @param {string} uri URI to add the prefix to
 * @return {string} URI with a mailto prefix
 */
export function addMailtoPrefix(uri) {
	if (typeof uri !== 'string') {
		return 'mailto:'
	}

	if (uri.startsWith('mailto:')) {
		return uri
	}

	return `mailto:${uri}`
}

/**
 * Get the display name of an organizer
 *
 * @param {?object} organizer Organizer object to extract a display name from
 * @return {string} Display name of given organizer
 */
export function organizerDisplayName(organizer) {
	if (!organizer) {
		return ''
	}

	if (organizer.commonName) {
		return organizer.commonName
	}

	return removeMailtoPrefix(organizer.uri)
}

/**
 * Get all attendees with the given calendar user type
 *
 * @param {object[]} attendees Attendees of a calendar-object-instance
 * @param {string} userType Calendar user type to filter by, e.g. ROOM
 * @return {object[]} Attendees with the given user type
 */
function getAttendeesByUserType(attendees, userType) {
	if (!Array.isArray(attendees)) {
		return []
	}

	return attendees.filter((attendee) => {
		return attendee.attendeeProperty.userType === userType
	})
}

/**
 * Get all attendees that represent a room
 *
 * @param {object[]} attendees Attendees of a calendar-object-instance
 * @return {object[]} Attendees with a ROOM user type
 */
export function getRoomAttendees(attendees) {
	return getAttendeesByUserType(attendees, 'ROOM')
}

/**
 * Get all attendees that represent a resource
 *
 * @param {object[]} attendees Attendees of a calendar-object-instance
 * @return {object[]} Attendees with a RESOURCE user type
 */
export function getResourceAttendees(attendees) {
	return getAttendeesByUserType(attendees, 'RESOURCE')
}

/**
 * Check if the current user is an attendee
 *
 * @param {string} currentUserPrincipalEmail Email address of the current user
 * @param {string} organizer Email address of the organizer with prefix
 * @return {boolean} True if the current user is an attendee
 */
export function isOrganizer(currentUserPrincipalEmail, organizer) {
	if (!organizer || !currentUserPrincipalEmail) {
		return true
	}

	return removeMailtoPrefix(organizer) === currentUserPrincipalEmail
}
