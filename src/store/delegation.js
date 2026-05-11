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
			 * List of principal objects that the current user has delegated to
			 * (members of the current user's calendar-proxy-write group).
			 *
			 * @type {object[]}
			 */
			delegates: [],

			/**
			 * Principal URLs of users who have granted the current user proxy access.
			 * Stored as full absolute principal URLs so calendar-home discovery can
			 * be performed without reconstructing paths from user IDs.
			 *
			 * @type {string[]}
			 */
			delegatorPrincipalUrls: [],
		}
	},

	getters: {
		/**
		 * Whether any delegated calendars exist (i.e. the current user is a delegate for someone).
		 *
		 * @param {object} state The store state
		 * @return {boolean}
		 */
		hasDelegatedCalendars: (state) => state.delegatorPrincipalUrls.length > 0,
	},

	actions: {
		/**
		 * Fetch the current user's delegates (members of their calendar-proxy-write group)
		 * and resolve their principal details.
		 *
		 * @return {Promise<void>}
		 */
		async fetchDelegates() {
			const principalsStore = usePrincipalsStore()
			const currentUser = principalsStore.getCurrentUserPrincipal
			if (!currentUser?.userId) {
				return
			}

			let memberUrls
			try {
				memberUrls = await getDelegateUrls(currentUser.userId)
			} catch (error) {
				logger.error('Could not fetch delegate URLs', { error })
				return
			}

			const delegates = []
			for (const url of memberUrls) {
				try {
					const dav = await findPrincipalByUrl(url)
					if (dav) {
						delegates.push(mapDavToPrincipal(dav))
					}
				} catch (error) {
					logger.error('Could not resolve delegate principal', { url, error })
				}
			}
			this.delegates = delegates
			logger.debug('Fetched delegates', { delegates: this.delegates })
		},

		/**
		 * Fetch the principal URLs of users who have granted the current user proxy access.
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
				this.delegatorPrincipalUrls = await getDelegatorPrincipalUrls(currentUser.url)
				logger.debug('Fetched delegators', { delegatorPrincipalUrls: this.delegatorPrincipalUrls })
			} catch (error) {
				logger.error('Could not fetch delegator principal URLs', { error })
			}
		},

		/**
		 * Add a user as a delegate (add them to the current user's calendar-proxy-write group).
		 *
		 * @param {object} data The destructuring object
		 * @param {string} data.principalUrl Absolute URL of the principal to add
		 * @return {Promise<void>}
		 */
		async addDelegate({ principalUrl }) {
			const principalsStore = usePrincipalsStore()
			const currentUser = principalsStore.getCurrentUserPrincipal
			if (!currentUser?.userId) {
				return
			}

			await addDelegateToGroup(currentUser.userId, principalUrl)
			await this.fetchDelegates()
		},

		/**
		 * Remove a delegate (remove them from the current user's calendar-proxy-write group).
		 *
		 * @param {object} data The destructuring object
		 * @param {string} data.principalUrl Absolute URL of the principal to remove
		 * @return {Promise<void>}
		 */
		async removeDelegate({ principalUrl }) {
			const principalsStore = usePrincipalsStore()
			const currentUser = principalsStore.getCurrentUserPrincipal
			if (!currentUser?.userId) {
				return
			}

			await removeDelegateFromGroup(currentUser.userId, principalUrl)
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
			if (!this.delegatorPrincipalUrls.length) {
				return
			}

			const principalsStore = usePrincipalsStore()
			const calendarsStore = useCalendarsStore()
			const currentUser = principalsStore.getCurrentUserPrincipal

			for (const delegatorPrincipalUrl of this.delegatorPrincipalUrls) {
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
					const mappedCalendars = rawCalendars
						.map((cal) => mapDavCollectionToCalendar(cal, currentUser))
						.map((cal) => ({ ...cal, isDelegated: true }))

					for (const calendar of mappedCalendars) {
						// Only add if not already present
						if (!calendarsStore.getCalendarById(calendar.id)) {
							calendarsStore.addCalendarMutation({ calendar })
						}
					}

					logger.debug('Fetched delegated calendars from', { calendarHomeUrl, count: mappedCalendars.length })
				} catch (error) {
					logger.error('Could not fetch calendars for delegator', { delegatorPrincipalUrl, error })
					showError(t('calendar', 'Could not load delegated calendars. Make sure the server supports calendar delegation.'))
				}
			}
		},
	},
})
