/**
 * SPDX-FileCopyrightText: 2026 Nextcloud GmbH and Nextcloud contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */
import { showError } from '@nextcloud/dialogs'
import { translate as t } from '@nextcloud/l10n'
import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import useCalendarsStore from './calendars.js'
import usePrincipalsStore from './principals.js'
import { mapDavCollectionToCalendar } from '@/models/calendar.js'
import { mapDavToPrincipal } from '@/models/principal.js'
import { findCalendarsAtUrl, findPrincipalByUrl, getClient } from '@/services/caldavService.js'
import logger from '@/utils/logger.js'

export interface DelegatePrincipal {
	id: string | null
	calendarUserType: string
	emailAddress: string | null
	displayname: string | null
	principalScheme: string | null
	userId: string | null
	url: string | null
	dav: unknown
	isCircle: boolean
	isUser: boolean
	isGroup: boolean
	isCalendarResource: boolean
	isCalendarRoom: boolean
	principalId: string | null
	scheduleDefaultCalendarUrl: string | null
	permission: 'write' | 'read'
}

export interface Delegator {
	principalUrl: string
	permission: 'write' | 'read'
}

export default defineStore('delegation', () => {
	/**
	 * List of principal objects that the current user has delegated to.
	 * Each entry has the principal fields plus a `permission` field ('write'|'read').
	 */
	const delegates = ref<DelegatePrincipal[]>([])

	/**
	 * Users who have granted the current user proxy access, with permission level.
	 */
	const delegators = ref<Delegator[]>([])

	/**
	 * Whether any delegated calendars exist (i.e. the current user is a delegate for someone).
	 */
	const hasDelegatedCalendars = computed(() => delegators.value.length > 0)

	/**
	 * Fetch the current user's delegates (members of their calendar-proxy-write
	 * and calendar-proxy-read groups) and resolve their principal details.
	 */
	async function fetchDelegates(): Promise<void> {
		const principalsStore = usePrincipalsStore()
		const currentUser = principalsStore.getCurrentUserPrincipal
		if (!currentUser?.url) {
			return
		}

		let writeUrls: string[] = []
		let readUrls: string[] = []
		try {
			const delegateUrls = await getClient().getDelegatesForPrincipal(currentUser.url)
			writeUrls = delegateUrls.write
			readUrls = delegateUrls.read
		} catch (error) {
			logger.error('Could not fetch delegate URLs', { error })
			return
		}

		const result: DelegatePrincipal[] = []

		for (const url of writeUrls) {
			try {
				const dav = await findPrincipalByUrl(url)
				if (dav) {
					result.push({ ...mapDavToPrincipal(dav), permission: 'write' })
				}
			} catch (error) {
				logger.error('Could not resolve write delegate principal', { url, error })
			}
		}

		for (const url of readUrls) {
			try {
				const dav = await findPrincipalByUrl(url)
				if (dav) {
					result.push({ ...mapDavToPrincipal(dav), permission: 'read' })
				}
			} catch (error) {
				logger.error('Could not resolve read delegate principal', { url, error })
			}
		}

		delegates.value = result
		logger.debug('Fetched delegates', { delegates: delegates.value })
	}

	/**
	 * Fetch the principal URLs and permission level of users who have granted
	 * the current user proxy access (both read and write).
	 */
	async function fetchDelegators(): Promise<void> {
		const principalsStore = usePrincipalsStore()
		const currentUser = principalsStore.getCurrentUserPrincipal
		if (!currentUser?.url) {
			return
		}

		try {
			delegators.value = await getClient().getDelegatorsWithPermission(currentUser.url)
			logger.debug('Fetched delegators', { delegators: delegators.value })
		} catch (error) {
			logger.error('Could not fetch delegator information', { error })
		}
	}

	/**
	 * Add a user as a delegate with the given permission level.
	 *
	 * @param principalUrl - Absolute URL of the principal to add
	 * @param permission - The permission level to grant
	 */
	async function addDelegate({ principalUrl, permission = 'write' as 'write' | 'read' }): Promise<void> {
		const principalsStore = usePrincipalsStore()
		const currentUser = principalsStore.getCurrentUserPrincipal
		if (!currentUser?.url) {
			return
		}

		await getClient().addDelegate(currentUser.url, principalUrl, permission)
		await fetchDelegates()
	}

	/**
	 * Remove a delegate from whichever proxy group(s) they are in.
	 *
	 * @param principalUrl - Absolute URL of the principal to remove
	 */
	async function removeDelegate({ principalUrl }: { principalUrl: string }): Promise<void> {
		const principalsStore = usePrincipalsStore()
		const currentUser = principalsStore.getCurrentUserPrincipal
		if (!currentUser?.url) {
			return
		}

		// Find the delegate's current permission so we remove from the right group.
		const existing = delegates.value.find((d) => d.url === principalUrl)
		const permission = existing?.permission ?? 'write'

		await getClient().removeDelegate(currentUser.url, principalUrl, permission)
		delegates.value = delegates.value.filter((d) => d.url !== principalUrl)
	}

	/**
	 * Fetch all calendars from delegators' calendar homes and add them to the
	 * calendars store so they participate in normal event fetching and rendering.
	 * The calendars are tagged with isDelegated=true so CalendarList can show them
	 * in their own section.
	 *
	 * Read-only delegators' calendars are additionally marked readOnly=true so they
	 * are excluded from the calendar picker (which only lists writable calendars).
	 */
	async function fetchDelegatedCalendars(): Promise<void> {
		if (!delegators.value.length) {
			return
		}

		const principalsStore = usePrincipalsStore()
		const calendarsStore = useCalendarsStore()
		const currentUser = principalsStore.getCurrentUserPrincipal

		for (const { principalUrl: delegatorPrincipalUrl, permission } of delegators.value) {
			const calendarHomeUrl = await getClient().getCalendarHomeUrlForPrincipal(delegatorPrincipalUrl)
			if (!calendarHomeUrl) {
				logger.warn('Could not determine calendar home URL for delegator', { delegatorPrincipalUrl })
				showError(t('calendar', 'Could not load delegated calendars. Make sure the server supports calendar delegation.'))
				continue
			}

			try {
				const delegatorPrincipal = await principalsStore.fetchPrincipalByUrl({ url: delegatorPrincipalUrl })
				const canonicalDelegatorUrl = delegatorPrincipal?.url || delegatorPrincipalUrl

				const rawCalendars = await findCalendarsAtUrl(calendarHomeUrl)
				const mappedCalendars = rawCalendars
					.map((cal: unknown) => mapDavCollectionToCalendar(cal, currentUser))
					.map((cal: Record<string, unknown>) => ({
						...cal,
						isDelegated: true,
						delegatorUrl: canonicalDelegatorUrl,
						// Read-only proxy access: prevent editing and hide from calendar picker
						...(permission === 'read' ? { readOnly: true } : {}),
					}))

				for (const calendar of mappedCalendars) {
					if (!calendarsStore.getCalendarById(calendar.id)) {
						calendarsStore.addCalendarMutation({ calendar })
					}
				}

				const ownerUrls = [...new Set(mappedCalendars.map((cal: Record<string, unknown>) => cal.owner).filter(Boolean))] as string[]
				await Promise.all(ownerUrls.map((url) => principalsStore.fetchPrincipalByUrl({ url })))

				logger.debug('Fetched delegated calendars from', { calendarHomeUrl, permission, count: mappedCalendars.length })
			} catch (error) {
				logger.error('Could not fetch calendars for delegator', { delegatorPrincipalUrl, error })
				showError(t('calendar', 'Could not load delegated calendars. Make sure the server supports calendar delegation.'))
			}
		}
	}

	return {
		delegates,
		delegators,
		hasDelegatedCalendars,
		fetchDelegates,
		fetchDelegators,
		addDelegate,
		removeDelegate,
		fetchDelegatedCalendars,
	}
})
