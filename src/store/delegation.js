/**
 * SPDX-FileCopyrightText: 2026 Nextcloud GmbH and Nextcloud contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */
import { generateRemoteUrl } from '@nextcloud/router'
import { defineStore } from 'pinia'
import { mapDavCollectionToCalendar } from '../models/calendar.js'
import { mapDavToPrincipal } from '../models/principal.js'
import { findCalendarsAtUrl, findPrincipalByUrl } from '../services/caldavService.js'
import {
	addDelegateToGroup,
	getDelegateUrls,
	getDelegatorUserIds,
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
			 * User IDs of principals who have granted the current user proxy access.
			 * Used to identify "delegated" calendars in the sidebar.
			 *
			 * @type {string[]}
			 */
			delegatorUserIds: [],
		}
	},

	getters: {
		/**
		 * Whether any delegated calendars exist (i.e. the current user is a delegate for someone).
		 *
		 * @param {object} state The store state
		 * @return {boolean}
		 */
		hasDelegatedCalendars: (state) => state.delegatorUserIds.length > 0,
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
		 * Fetch the user IDs of principals who have granted the current user proxy access.
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
				this.delegatorUserIds = await getDelegatorUserIds(currentUser.url)
				logger.debug('Fetched delegators', { delegatorUserIds: this.delegatorUserIds })
			} catch (error) {
				logger.error('Could not fetch delegator user IDs', { error })
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
		 * @return {Promise<void>}
		 */
		async fetchDelegatedCalendars() {
			if (!this.delegatorUserIds.length) {
				return
			}

			const principalsStore = usePrincipalsStore()
			const calendarsStore = useCalendarsStore()
			const currentUser = principalsStore.getCurrentUserPrincipal

			for (const delegatorUserId of this.delegatorUserIds) {
				// Guard against empty or suspicious user IDs before constructing the URL.
				if (!delegatorUserId || delegatorUserId.includes('/') || delegatorUserId.includes('..')) {
					logger.warn('Skipping invalid delegator user ID', { delegatorUserId })
					continue
				}

				// Construct the delegator's calendar home URL using Nextcloud's path convention.
				const calendarHomeUrl = generateRemoteUrl(`dav/calendars/${encodeURIComponent(delegatorUserId)}/`)

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
					logger.error('Could not fetch calendars for delegator', { delegatorUserId, error })
				}
			}
		},
	},
})
