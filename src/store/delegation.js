/**
 * SPDX-FileCopyrightText: 2026 Nextcloud GmbH and Nextcloud contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */
import { showError } from '@nextcloud/dialogs'
import { translate as t } from '@nextcloud/l10n'
import { defineStore } from 'pinia'
import { mapDavCollectionToCalendar } from '../models/calendar.js'
import { mapDavToPrincipal } from '../models/principal.js'
import { findCalendarsAtUrl, findPrincipalByUrl } from '../services/caldavService.js'
import {
	addDelegateToGroup,
	getCalendarHomeUrl,
	getDelegateUrls,
	getDelegatorPrincipalUrls,
	removeDelegateFromGroup,
} from '../services/delegationService.js'
import logger from '../utils/logger.js'
import useCalendarsStore from './calendars.js'
import usePrincipalsStore from './principals.js'

export default defineStore('delegation', {
	state: () => {
		return {
			/**
			 * List of principals the current user has delegated to.
			 * Each entry is a principal object decorated with an `access`
			 * field ('read' or 'write').
			 *
			 * @type {Array<object & {access: 'read'|'write'}>}
			 */
			delegates: [],

			/**
			 * Delegators (users who have granted the current user proxy access),
			 * each annotated with the access level they granted.
			 *
			 * @type {Array<{principalUrl: string, access: 'read'|'write'}>}
			 */
			delegators: [],
		}
	},

	getters: {
		/**
		 * Whether any delegated calendars exist (i.e. the current user is a delegate for someone).
		 *
		 * @param {object} state The store state
		 * @return {boolean}
		 */
		hasDelegatedCalendars: (state) => state.delegators.length > 0,
	},

	actions: {
		/**
		 * Fetch the current user's delegates from both the read and write proxy
		 * groups and resolve their principal details. Each resulting delegate
		 * is annotated with its `access` level.
		 *
		 * @return {Promise<void>}
		 */
		async fetchDelegates() {
			const principalsStore = usePrincipalsStore()
			const currentUser = principalsStore.getCurrentUserPrincipal
			if (!currentUser?.userId) {
				return
			}

			let writeUrls = []
			let readUrls = []
			try {
				[writeUrls, readUrls] = await Promise.all([
					getDelegateUrls(currentUser.userId, 'write'),
					getDelegateUrls(currentUser.userId, 'read'),
				])
			} catch (error) {
				logger.error('Could not fetch delegate URLs', { error })
				return
			}

			// Write supersedes read if (somehow) the same principal is in both.
			const accessByUrl = new Map()
			for (const url of readUrls) {
				accessByUrl.set(url, 'read')
			}
			for (const url of writeUrls) {
				accessByUrl.set(url, 'write')
			}

			const delegates = []
			for (const [url, access] of accessByUrl.entries()) {
				try {
					const dav = await findPrincipalByUrl(url)
					if (dav) {
						delegates.push({ ...mapDavToPrincipal(dav), access })
					}
				} catch (error) {
					logger.error('Could not resolve delegate principal', { url, error })
				}
			}
			this.delegates = delegates
			logger.debug('Fetched delegates', { delegates: this.delegates })
		},

		/**
		 * Fetch the users who have granted the current user proxy access,
		 * along with the access level they granted (read or write).
		 *
		 * @return {Promise<void>}
		 */
		async fetchDelegators() {
			const principalsStore = usePrincipalsStore()
			const currentUser = principalsStore.getCurrentUserPrincipal
			if (!currentUser?.url) {
				return
			}

			try {
				this.delegators = await getDelegatorPrincipalUrls(currentUser.url)
				logger.debug('Fetched delegators', { delegators: this.delegators })
			} catch (error) {
				logger.error('Could not fetch delegators', { error })
			}
		},

		/**
		 * Add a user as a delegate. If a `from` access is supplied, the user is
		 * first removed from that group — used when changing a delegate's access
		 * level (e.g. promoting read → write).
		 *
		 * @param {object} data The destructuring object
		 * @param {string} data.principalUrl Absolute URL of the principal to add
		 * @param {'read'|'write'} [data.access] Access level to grant (default: 'write')
		 * @param {'read'|'write'} [data.from] If set, remove from this group first
		 * @return {Promise<void>}
		 */
		async addDelegate({ principalUrl, access = 'write', from = undefined }) {
			const principalsStore = usePrincipalsStore()
			const currentUser = principalsStore.getCurrentUserPrincipal
			if (!currentUser?.userId) {
				return
			}

			if (from && from !== access) {
				await removeDelegateFromGroup(currentUser.userId, principalUrl, from)
			}
			await addDelegateToGroup(currentUser.userId, principalUrl, access)
			await this.fetchDelegates()
		},

		/**
		 * Remove a delegate. Removes from the explicit `access` group if given,
		 * otherwise removes from both read and write to ensure full revocation.
		 *
		 * @param {object} data The destructuring object
		 * @param {string} data.principalUrl Absolute URL of the principal to remove
		 * @param {'read'|'write'} [data.access] Specific group to remove from
		 * @return {Promise<void>}
		 */
		async removeDelegate({ principalUrl, access = undefined }) {
			const principalsStore = usePrincipalsStore()
			const currentUser = principalsStore.getCurrentUserPrincipal
			if (!currentUser?.userId) {
				return
			}

			if (access) {
				await removeDelegateFromGroup(currentUser.userId, principalUrl, access)
			} else {
				await Promise.all([
					removeDelegateFromGroup(currentUser.userId, principalUrl, 'write'),
					removeDelegateFromGroup(currentUser.userId, principalUrl, 'read'),
				])
			}
			this.delegates = this.delegates.filter((d) => d.url !== principalUrl)
		},

		/**
		 * Fetch all calendars from delegators' calendar homes and add them to the
		 * calendars store so they participate in normal event fetching and rendering.
		 * The calendars are tagged with isDelegated=true so CalendarList can show them
		 * in their own section.
		 *
		 * Calendar home URLs are discovered via CalDAV PROPFIND on each delegator's
		 * principal (RFC 4791 §6.2.1) rather than being constructed from user IDs,
		 * which ensures correctness regardless of server path conventions.
		 *
		 * @return {Promise<void>}
		 */
		async fetchDelegatedCalendars() {
			if (!this.delegators.length) {
				return
			}

			const principalsStore = usePrincipalsStore()
			const calendarsStore = useCalendarsStore()
			const currentUser = principalsStore.getCurrentUserPrincipal

			for (const { principalUrl: delegatorPrincipalUrl, access } of this.delegators) {
				// Load the delegator's principal into the principals store so the
				// CalendarListItem avatar can resolve the owner. Without this,
				// `loadedOwnerPrincipal` stays false and the row shows a spinner.
				try {
					await principalsStore.fetchPrincipalByUrl({ url: delegatorPrincipalUrl })
				} catch (error) {
					logger.warn('Could not load delegator principal', { delegatorPrincipalUrl, error })
				}

				// Discover the delegator's calendar home URL via CalDAV principal PROPFIND.
				// This follows RFC 4791 §6.2.1 and avoids hard-coding any URL path convention.
				const calendarHomeUrl = await getCalendarHomeUrl(delegatorPrincipalUrl)
				if (!calendarHomeUrl) {
					logger.warn('Could not determine calendar home URL for delegator', { delegatorPrincipalUrl })
					showError(t('calendar', 'Could not load delegated calendars. Make sure the server supports calendar delegation.'))
					continue
				}

				try {
					const rawCalendars = await findCalendarsAtUrl(calendarHomeUrl)
					// For read-only delegation, force the readOnly flag on the local model
					// so the UI cannot offer editing affordances. (Server ACL would reject
					// edits anyway, but failing late is a worse UX.)
					const mappedCalendars = rawCalendars
						.map((cal) => mapDavCollectionToCalendar(cal, currentUser))
						.map((cal) => ({
							...cal,
							isDelegated: true,
							delegationAccess: access,
							readOnly: cal.readOnly || access === 'read',
						}))

					for (const calendar of mappedCalendars) {
						// Only add if not already present
						if (!calendarsStore.getCalendarById(calendar.id)) {
							calendarsStore.addCalendarMutation({ calendar })
						}
					}

					logger.debug('Fetched delegated calendars from', { calendarHomeUrl, access, count: mappedCalendars.length })
				} catch (error) {
					logger.error('Could not fetch calendars for delegator', { delegatorPrincipalUrl, error })
					showError(t('calendar', 'Could not load delegated calendars. Make sure the server supports calendar delegation.'))
				}
			}
		},
	},
})
