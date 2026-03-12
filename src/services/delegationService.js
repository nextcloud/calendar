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

	await axios({
		method: 'PROPPATCH',
		url: groupUrl,
		data: body,
		headers: {
			'Content-Type': 'application/xml; charset=utf-8',
		},
	})
}

/**
 * Get the absolute URLs of all write-delegates for a user.
 * Delegates are principals in the user's calendar-proxy-write group.
 *
 * @param {string} userId The current user's login name
 * @return {Promise<string[]>} Absolute principal URLs of delegates
 */
async function getDelegateUrls(userId) {
	const groupUrl = getProxyGroupUrl(userId, 'write')
	return fetchGroupMemberSet(groupUrl)
}

/**
 * Add a delegate to the current user's calendar-proxy-write group.
 *
 * @param {string} userId The current user's login name
 * @param {string} delegatePrincipalUrl Absolute URL of the principal to add
 * @return {Promise<void>}
 */
async function addDelegateToGroup(userId, delegatePrincipalUrl) {
	const groupUrl = getProxyGroupUrl(userId, 'write')
	const current = await fetchGroupMemberSet(groupUrl)
	if (!current.includes(delegatePrincipalUrl)) {
		await setGroupMemberSet(groupUrl, [...current, delegatePrincipalUrl])
	}
}

/**
 * Remove a delegate from the current user's calendar-proxy-write group.
 *
 * @param {string} userId The current user's login name
 * @param {string} delegatePrincipalUrl Absolute URL of the principal to remove
 * @return {Promise<void>}
 */
async function removeDelegateFromGroup(userId, delegatePrincipalUrl) {
	const groupUrl = getProxyGroupUrl(userId, 'write')
	const current = await fetchGroupMemberSet(groupUrl)
	await setGroupMemberSet(groupUrl, current.filter((url) => url !== delegatePrincipalUrl))
}

/**
 * Get the user IDs of principals who have delegated write access to the current user.
 * This is done by inspecting the group-membership property of the current user's principal.
 *
 * @param {string} principalUrl Absolute URL of the current user's principal
 * @return {Promise<string[]>} User IDs of users who delegated to the current user
 */
async function getDelegatorUserIds(principalUrl) {
	const groups = await fetchGroupMembership(principalUrl)
	return groups
		.filter((url) => url.includes('calendar-proxy-write'))
		.map((url) => {
			// URL pattern: .../principals/users/{userId}/calendar-proxy-write[/]
			const match = url.match(/\/principals\/users\/([^/]+)\/calendar-proxy-write/)
			return match ? decodeURIComponent(match[1]) : null
		})
		.filter(Boolean)
}

export {
	addDelegateToGroup,
	getDelegateUrls,
	getDelegatorUserIds,
	getProxyGroupUrl,
	removeDelegateFromGroup,
}
