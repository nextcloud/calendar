/**
 * SPDX-FileCopyrightText: 2026 Nextcloud GmbH and Nextcloud contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import { translate as t } from '@nextcloud/l10n'
import { initializeClientForUserView } from '@/services/caldavService.js'
import useCalendarsStore from '@/store/calendars.js'
import usePrincipalsStore from '@/store/principals.js'
import useSettingsStore from '@/store/settings.js'
import { uidToHexColor } from '@/utils/color.js'
import logger from '@/utils/logger.js'
import loadMomentLocalization from '@/utils/moment.js'
import { getSettingsFromInitialState } from '@/utils/settings.js'

/**
 * Prepare the stores needed to run the event editor standalone, that is outside
 * of the calendar app where `Calendar.vue` takes care of this setup.
 *
 * Requires an active pinia instance, so this must be called from a component
 * of the app the editor is mounted in.
 */
export async function bootstrapEditor(): Promise<void> {
	const settingsStore = useSettingsStore()
	const principalsStore = usePrincipalsStore()
	const calendarsStore = useCalendarsStore()

	settingsStore.loadSettingsFromServer(getSettingsFromInitialState())
	settingsStore.initializeCalendarJsConfig()
	settingsStore.setMomentLocale({ locale: await loadMomentLocalization() })

	await initializeClientForUserView()
	await principalsStore.fetchCurrentUserPrincipal()

	const { calendars } = await calendarsStore.loadCollections()
	logger.debug('Calendars loaded for the event editor', { calendars })

	// The owners are needed to tell delegated calendars apart
	for (const owner of new Set(calendars.map((calendar) => calendar.owner))) {
		principalsStore.fetchPrincipalByUrl({ url: owner })
	}

	// A new event has to be created somewhere, same as in the calendar app itself
	if (!calendars.some((calendar) => !calendar.readOnly)) {
		logger.info('User has no writable calendar, a new personal calendar will be created')
		await calendarsStore.appendCalendar({
			displayName: t('calendar', 'Personal'),
			color: uidToHexColor(t('calendar', 'Personal')),
			order: 0,
		})
	}

	// Not awaited, the editor picks them up as soon as they are available
	if (settingsStore.showResources) {
		principalsStore.fetchRoomAndResourcePrincipals()
			.catch((error: unknown) => logger.error('Could not fetch rooms and resources', { error }))
	}
}
