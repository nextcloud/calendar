/**
 * SPDX-FileCopyrightText: 2025 Nextcloud GmbH and Nextcloud contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import { expect } from '@playwright/test'
import { test } from './support/fixtures.ts'

test('removing last attendee closes dialog', async ({ page, calendarPage, provisioning }) => {
	await provisioning.createUser({ displayName: "UserA", email: "userA@example.com" })
	const simpleEditor = await calendarPage.createNewEvent()
	await simpleEditor.addAttende("UserA")
	const detailedEditor = await simpleEditor.openDetailedEditor()
	const freeBusyDialog = await detailedEditor.openFreeBusyDialog()

	await freeBusyDialog.removeUser("UserA")

	expect(freeBusyDialog.locator).not.toBeVisible()
	const warning = page.getByText('Please add at least one attendee to use the "Find a time" feature.')
	expect(warning).toBeVisible()
})
