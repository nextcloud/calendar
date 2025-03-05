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

	if (uri.startsWith('mailto:')) {
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
