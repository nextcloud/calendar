/**
 * SPDX-FileCopyrightText: 2026 Nextcloud GmbH and Nextcloud contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */
import axios from '@nextcloud/axios'
import { generateRemoteUrl } from '@nextcloud/router'
import logger from '../utils/logger.js'

/**
 * Returns the URL of a user's calendar proxy group.
 *
 * @param {string} userId The user ID (login name)
 * @param {'read'|'write'} type Proxy group type
 * @return {string} Absolute URL to the proxy group principal
 */
function getProxyGroupUrl(userId, type) {
	return generateRemoteUrl(`dav/principals/users/${encodeURIComponent(userId)}/calendar-proxy-${type}`)
}

/**
 * Convert a potentially relative DAV href to an absolute URL.
 *
 * @param {string} href The href value from a DAV response
 * @return {string} Absolute URL
 */
function toAbsoluteUrl(href) {
	if (href.startsWith('http://') || href.startsWith('https://')) {
		return href
	}
	return window.location.origin + href
}

/**
 * Parse href elements contained in a named DAV property element.
 *
 * @param {Document} doc Parsed XML document
 * @param {string} propLocalName The local name of the DAV property (e.g. 'group-member-set')
 * @return {string[]} List of absolute href strings
 */
function parseHrefsFromProp(doc, propLocalName) {
	const propElements = doc.getElementsByTagNameNS('DAV:', propLocalName)
	if (!propElements.length) {
		return []
	}
	const hrefElements = propElements[0].getElementsByTagNameNS('DAV:', 'href')
	return Array.from(hrefElements).map((el) => toAbsoluteUrl(el.textContent.trim()))
}

/**
 * Perform a PROPFIND request and return the parsed response document.
 *
 * @param {string} url Request URL
 * @param {string} body XML body
 * @return {Promise<Document>}
 */
async function propfind(url, body) {
	const response = await axios({
		method: 'PROPFIND',
		url,
		data: body,
		headers: {
			'Content-Type': 'application/xml; charset=utf-8',
			Depth: '0',
		},
	})
	const parser = new DOMParser()
	return parser.parseFromString(response.data, 'text/xml')
}

/**
 * Fetch the group-member-set of a principal collection (proxy group).
 *
 * @param {string} groupUrl Absolute URL of the proxy group principal
 * @return {Promise<string[]>} Absolute URLs of member principals
 */
async function fetchGroupMemberSet(groupUrl) {
	const body = `<?xml version="1.0" encoding="utf-8"?>
<d:propfind xmlns:d="DAV:">
  <d:prop>
    <d:group-member-set/>
  </d:prop>
</d:propfind>`

	try {
		const doc = await propfind(groupUrl, body)
		return parseHrefsFromProp(doc, 'group-member-set')
	} catch (error) {
		logger.error('Could not fetch group-member-set', { groupUrl, error })
		return []
	}
}

/**
 * Fetch the group-membership list of a principal (groups it belongs to).
 *
 * @param {string} principalUrl Absolute URL of the user principal
 * @return {Promise<string[]>} Absolute URLs of groups the principal belongs to
 */
async function fetchGroupMembership(principalUrl) {
	const body = `<?xml version="1.0" encoding="utf-8"?>
<d:propfind xmlns:d="DAV:">
  <d:prop>
    <d:group-membership/>
  </d:prop>
</d:propfind>`

	try {
		const doc = await propfind(principalUrl, body)
		return parseHrefsFromProp(doc, 'group-membership')
	} catch (error) {
		logger.error('Could not fetch group-membership', { principalUrl, error })
		return []
	}
}

/**
 * Inspect a PROPPATCH 207 Multi-Status response body for per-property
 * failures. PROPPATCH returns 207 even when individual properties fail,
 * so a 2xx HTTP status alone is not proof of success.
 *
 * @param {string} responseBody The XML response body
 * @throws {Error} If any propstat reports a non-2xx status
 */
function assertProppatchSuccess(responseBody) {
	if (typeof responseBody !== 'string' || !responseBody.trim()) {
		return
	}
	let doc
	try {
		doc = new DOMParser().parseFromString(responseBody, 'text/xml')
	} catch (e) {
		return
	}
	const propstats = doc.getElementsByTagNameNS('DAV:', 'propstat')
	for (const propstat of Array.from(propstats)) {
		const statusEl = propstat.getElementsByTagNameNS('DAV:', 'status')[0]
		if (!statusEl) {
			continue
		}
		const match = statusEl.textContent.match(/HTTP\/[\d.]+\s+(\d{3})/)
		if (!match) {
			continue
		}
		const code = parseInt(match[1], 10)
		if (code < 200 || code >= 300) {
			throw new Error(`PROPPATCH group-member-set failed with status ${code}`)
		}
	}
}

/**
 * Set the group-member-set of a proxy group via PROPPATCH.
 *
 * @param {string} groupUrl Absolute URL of the proxy group principal
 * @param {string[]} memberUrls Absolute URLs of the new member set
 * @return {Promise<void>}
 */
async function setGroupMemberSet(groupUrl, memberUrls) {
	const hrefs = memberUrls.map((url) => `<d:href>${url}</d:href>`).join('\n        ')
	const body = `<?xml version="1.0" encoding="utf-8"?>
<d:propertyupdate xmlns:d="DAV:">
  <d:set>
    <d:prop>
      <d:group-member-set>
        ${hrefs}
      </d:group-member-set>
    </d:prop>
  </d:set>
</d:propertyupdate>`

	const response = await axios({
		method: 'PROPPATCH',
		url: groupUrl,
		data: body,
		headers: {
			'Content-Type': 'application/xml; charset=utf-8',
		},
	})

	assertProppatchSuccess(response.data)
}

/**
 * Get the absolute URLs of delegates of the given access level for a user.
 * Delegates are principals in the user's calendar-proxy-{type} group.
 *
 * @param {string} userId The current user's login name
 * @param {'read'|'write'} type Proxy access level
 * @return {Promise<string[]>} Absolute principal URLs of delegates
 */
async function getDelegateUrls(userId, type = 'write') {
	const groupUrl = getProxyGroupUrl(userId, type)
	return fetchGroupMemberSet(groupUrl)
}

/**
 * Add a delegate to the current user's calendar-proxy-{type} group.
 *
 * @param {string} userId The current user's login name
 * @param {string} delegatePrincipalUrl Absolute URL of the principal to add
 * @param {'read'|'write'} type Proxy access level
 * @return {Promise<void>}
 */
async function addDelegateToGroup(userId, delegatePrincipalUrl, type = 'write') {
	const groupUrl = getProxyGroupUrl(userId, type)
	const current = await fetchGroupMemberSet(groupUrl)
	if (!current.includes(delegatePrincipalUrl)) {
		await setGroupMemberSet(groupUrl, [...current, delegatePrincipalUrl])
	}
}

/**
 * Remove a delegate from the current user's calendar-proxy-{type} group.
 *
 * @param {string} userId The current user's login name
 * @param {string} delegatePrincipalUrl Absolute URL of the principal to remove
 * @param {'read'|'write'} type Proxy access level
 * @return {Promise<void>}
 */
async function removeDelegateFromGroup(userId, delegatePrincipalUrl, type = 'write') {
	const groupUrl = getProxyGroupUrl(userId, type)
	const current = await fetchGroupMemberSet(groupUrl)
	await setGroupMemberSet(groupUrl, current.filter((url) => url !== delegatePrincipalUrl))
}

/**
 * Get the principal URLs of users who have delegated access to the current user,
 * along with the access level they granted.
 *
 * Inspects the group-membership property for entries ending in
 * /calendar-proxy-write or /calendar-proxy-read and strips the suffix to return
 * the owner's principal URL directly, ready for CalDAV discovery.
 *
 * If the same delegator appears in both read and write groups (which shouldn't
 * normally happen — write implies read), the write entry wins.
 *
 * @param {string} principalUrl Absolute URL of the current user's principal
 * @return {Promise<Array<{principalUrl: string, access: 'read'|'write'}>>}
 *   Delegators with their access level
 */
async function getDelegatorPrincipalUrls(principalUrl) {
	const groups = await fetchGroupMembership(principalUrl)
	const byPrincipal = new Map()
	for (const url of groups) {
		const match = url.match(/^(.+\/principals\/users\/[^/]+)\/calendar-proxy-(read|write)/)
		if (!match) {
			continue
		}
		const owner = match[1]
		const access = match[2]
		// Write supersedes read for the same delegator.
		if (byPrincipal.get(owner) === 'write') {
			continue
		}
		byPrincipal.set(owner, access)
	}
	return Array.from(byPrincipal.entries()).map(([principalUrl, access]) => ({
		principalUrl,
		access,
	}))
}

/**
 * Discover the calendar home URL for a principal via CalDAV PROPFIND.
 *
 * Performs a PROPFIND depth-0 on the principal URL requesting
 * {urn:ietf:params:xml:ns:caldav}calendar-home-set, then returns the first href.
 * This is the standards-correct (RFC 4791 §6.2.1) way to locate a user's calendar home
 * and avoids hard-coding any URL path conventions.
 *
 * @param {string} principalUrl Absolute URL of the owner's principal
 * @return {Promise<string|null>} Absolute URL of the calendar home, or null on failure
 */
async function getCalendarHomeUrl(principalUrl) {
	const body = `<?xml version="1.0" encoding="utf-8"?>
<d:propfind xmlns:d="DAV:" xmlns:c="urn:ietf:params:xml:ns:caldav">
  <d:prop>
    <c:calendar-home-set/>
  </d:prop>
</d:propfind>`

	try {
		const doc = await propfind(principalUrl, body)
		const propEl = doc.getElementsByTagNameNS('urn:ietf:params:xml:ns:caldav', 'calendar-home-set')[0]
		if (!propEl) {
			return null
		}
		const hrefs = Array.from(propEl.getElementsByTagNameNS('DAV:', 'href'))
			.map((el) => toAbsoluteUrl(el.textContent.trim()))
			.filter(Boolean)
		return hrefs[0] ?? null
	} catch (error) {
		logger.error('Could not fetch calendar-home-set', { principalUrl, error })
		return null
	}
}

export {
	addDelegateToGroup,
	getCalendarHomeUrl,
	getDelegateUrls,
	getDelegatorPrincipalUrls,
	getProxyGroupUrl,
	removeDelegateFromGroup,
}
