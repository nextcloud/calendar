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
 * Heuristically check if an email address looks like a mailing list address
 *
 * @param {string} email Email address to check (with or without mailto: prefix)
 * @return {boolean} True if the address looks like a mailing list
 */
export function looksLikeMailingList(email) {
	if (typeof email !== 'string') {
		return false
	}

	const address = removeMailtoPrefix(email).toLowerCase()
	const atIndex = address.indexOf('@')
	if (atIndex === -1) {
		return false
	}

	const local = address.slice(0, atIndex)
	const domain = address.slice(atIndex + 1)

	const exactMatches = new Set([
		'list', 'lists', 'ml', 'announce', 'announcements', 'noreply', 'no-reply',
		'newsletter', 'newsletters', 'mailer-daemon', 'postmaster', 'sympa',
		'majordomo', 'listserv', 'mailman', 'dmarc', 'bounce', 'bounces',
		'subscribe', 'unsubscribe',
	])
	if (exactMatches.has(local)) {
		return true
	}

	const suffixes = [
		'-bounces', '-request', '-subscribe', '-unsubscribe', '-owner', '-help',
		'-announce', '-devel', '-discuss', '-commits', '-bugs', '-patches',
		'-users', '-list', '+bounces', '+subscribe',
	]
	if (suffixes.some((s) => local.endsWith(s))) {
		return true
	}

	const knownDomains = new Set([
		'googlegroups.com', 'groups.io', 'freelists.org',
		'yahoogroups.com', 'listserv.com', 'topica.com',
	])
	if (knownDomains.has(domain)) {
		return true
	}

	const knownSubdomainPrefixes = ['lists.', 'ml.', 'listserv.', 'mailman.', 'sympa.']
	if (knownSubdomainPrefixes.some((p) => domain.startsWith(p))) {
		return true
	}

	return false
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
