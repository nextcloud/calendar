/**
 * SPDX-FileCopyrightText: 2025 Nextcloud GmbH and Nextcloud contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import { expect } from '@playwright/test'
import { test } from './support/fixtures.ts'

test('removing last attendee closes dialog', async ({ page, calendarPage, provisioning }) => {
	await provisioning.createUser({ displayName: 'UserA', email: 'userA@example.com' })
	await calendarPage.goto()
	const simpleEditor = await calendarPage.createNewEvent()
	await simpleEditor.addAttendee('UserA')
	const fullEditor = await simpleEditor.openDetailedEditor()
	const freeBusyDialog = await fullEditor.openFreeBusyDialog()

	await freeBusyDialog.removeUser('UserA')

	await expect(freeBusyDialog.locator).toBeHidden()
	const warning = page.getByText('Please add at least one attendee to use the "Find a time" feature.')
	await expect(warning).toBeVisible()
})
