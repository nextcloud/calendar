/**
 * SPDX-FileCopyrightText: 2026 Nextcloud GmbH and Nextcloud contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import type { Locator } from '@playwright/test'

import { expect } from '@playwright/test'
import { test } from './support/fixtures.ts'
import { CalendarPage } from './support/pages/CalendarPage.ts'
import { EditFullDialog } from './support/pages/EditFullDialog.ts'
import { EditSimpleDialog } from './support/pages/EditSimpleDialog.ts'

/**
 * Get the field added by the extension of the test app.
 *
 * @param editor The editor to look for the field in
 */
function getExtensionField(editor: EditFullDialog | EditSimpleDialog): Locator {
	return editor.locator.getByText('Field of the event editor extension')
}

/**
 * Assert that the editor looks as expected, e.g. how it lays out the field of the extension.
 *
 * Masks the parts that change between test runs:
 * the date and time of new events, which default to the current time,
 * and the calendar, which shows the random id of the owner for calendars shared with the user.
 *
 * @param editor The editor to take a screenshot of
 */
async function expectEditorScreenshot(editor: EditFullDialog | EditSimpleDialog) {
	await expect(editor.locator).toHaveScreenshot({
		mask: [
			editor.locator.locator('.property-title-time-picker'),
			editor.locator.locator('.calendar-picker-header'),
		],
	})
}

test.describe('show fields of event editor extensions', () => {
	test('on the calendar page', async ({ calendarPage }) => {
		const simpleEditor = await calendarPage.createNewEvent()
		const simpleEditorExtensionField = getExtensionField(simpleEditor)
		await expect(simpleEditorExtensionField).toBeVisible()
		await expectEditorScreenshot(simpleEditor)

		const fullEditor = await simpleEditor.openDetailedEditor()
		const fullEditorExtensionField = getExtensionField(fullEditor)
		await expect(fullEditorExtensionField).toBeVisible()
		await expectEditorScreenshot(fullEditor)
	})

	test('on the edit proposal page', async ({ page, user }) => {
		await user.login()

		// The edit proposal page is the main calendar page with the proposal shown in a modal.
		// For the test it does not matter whether the proposal exists or not.
		await page.goto('./index.php/apps/calendar/proposal/view/non-existing-proposal')

		// After closing the message about the proposal, the user can navigate client-side to the event editor.
		// Therefore, editor extensions need to be loaded.
		await page.getByRole('alert').filter({ hasText: 'This meeting proposal no longer exists' }).getByRole('button', { name: 'Close' }).click()
		const calendarPage = new CalendarPage(page)
		const simpleEditor = await calendarPage.createNewEvent()
		const extensionField = getExtensionField(simpleEditor)
		await expect(extensionField).toBeVisible()
		await expectEditorScreenshot(simpleEditor)
	})

	test('on the public calendar page', async ({ page, user }) => {
		const eventTitle = 'Public event'
		const calendar = await user.createPublicCalendar()
		await user.createEvent(calendar.url, eventTitle)

		await page.goto(`./index.php/apps/calendar/p/${calendar.token}`)
		await page.locator('.fc-event').filter({ hasText: eventTitle }).click()

		const fullEditor = new EditFullDialog(page)
		const extensionField = getExtensionField(fullEditor)
		await expect(extensionField).toBeVisible()
		await expectEditorScreenshot(fullEditor)
	})

	test('on the embedded public calendar page', async ({ page, user }) => {
		const eventTitle = 'Embedded event'
		const calendar = await user.createPublicCalendar()
		await user.createEvent(calendar.url, eventTitle)

		await page.goto(`./index.php/apps/calendar/embed/${calendar.token}`)
		await page.locator('.fc-event').filter({ hasText: eventTitle }).click()

		const fullEditor = new EditFullDialog(page)
		const extensionField = getExtensionField(fullEditor)
		await expect(extensionField).toBeVisible()
		await expectEditorScreenshot(fullEditor)
	})

	test('for the app menu on other apps', async ({ page, user, serverMajorVersion }) => {
		// See AppMenuActionListener::APP_MENU_ACTION_VERSION
		// eslint-disable-next-line playwright/no-skipped-test -- Feature not available on older servers
		test.skip(serverMajorVersion < 35, 'The app menu action requires Nextcloud 35 or later')

		await user.login()

		await page.goto('./index.php/settings/user')
		await page.getByRole('button', { name: 'Open apps menu', exact: true }).click()
		await page.getByRole('group', { name: 'Actions' }).getByRole('menuitem', { name: 'Event' }).click()

		const fullEditor = new EditFullDialog(page)
		const extensionField = getExtensionField(fullEditor)
		await expect(extensionField).toBeVisible()
		await expectEditorScreenshot(fullEditor)
	})

	test('in references', async ({ page, user }) => {
		const eventTitle = 'Referenced event'
		const calendar = await user.createPublicCalendar()
		await user.createEvent(calendar.url, eventTitle)

		// Renders the reference to the public calendar, like e.g. Talk does for a link to it in a message.
		await page.goto(`./index.php/apps/event_editor_extension/reference/${calendar.token}`)
		await page.locator('.fc-event').filter({ hasText: eventTitle }).click()

		const simpleEditor = new EditSimpleDialog(page)
		const extensionField = getExtensionField(simpleEditor)
		await expect(extensionField).toBeVisible()
		await expectEditorScreenshot(simpleEditor)
	})
})
