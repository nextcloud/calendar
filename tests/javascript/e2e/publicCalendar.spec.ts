/**
 * SPDX-FileCopyrightText: 2026 Nextcloud GmbH and Nextcloud contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import { test } from './support/fixtures.ts'

test('subscribe to a public calendar', async ({ provisioning, calendarPage }) => {
	const publicCalendarName = 'a public calendar'
	const publicCalendarConfValue = JSON.stringify([{ name: publicCalendarName, source: 'http://aPublicCalendarSource' }])
	// Before loading the page, which loads the config value.
	await provisioning.updateAppConfigValue('calendar', 'publicCalendars', publicCalendarConfValue)
	await calendarPage.goto()
	let dialog = await calendarPage.openPublicCalendarSubscriptionDialog()

	await dialog.subscribeToCalendar(publicCalendarName)
	await dialog.close()

	await calendarPage.expectCalendarExists(publicCalendarName)
	dialog = await calendarPage.openPublicCalendarSubscriptionDialog()
	await dialog.expectSubscribed(publicCalendarName)
})
