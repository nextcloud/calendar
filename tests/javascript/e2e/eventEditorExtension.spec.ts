/**
 * SPDX-FileCopyrightText: 2026 Nextcloud GmbH and Nextcloud contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import type { Page } from '@playwright/test'

import { expect } from '@playwright/test'
import { test } from './support/fixtures.js'

declare global {
	interface Window {
		/** Set by the script of the test app */
		editorExtensionLoaded?: boolean
	}
}

/**
 * Assert that the script registered for BeforeEventEditorLoadedEvent was loaded.
 *
 * @param page The page to check
 */
async function expectEditorExtensionLoaded(page: Page) {
	await expect.poll(() => page.evaluate(() => window.editorExtensionLoaded)).toBe(true)
}

test.describe('load event editor extensions', () => {
	test('on the calendar page', async ({ page, calendarPage }) => {
		await calendarPage.goto()

		await expectEditorExtensionLoaded(page)
	})

	test('on the edit proposal page', async ({ page, user }) => {
		await user.login()

		// The edit proposal page is the main calendar page with the proposal shown in a modal.
		// For the test it does not matter whether the proposal exists or not.
		await page.goto('./index.php/apps/calendar/proposal/view/non-existing-proposal')

		// After closing the modal, the user can navigate client-side to the event editor.
		// Therefore, editor extensions need to be loaded.
		await expectEditorExtensionLoaded(page)
	})

	test('on the public calendar page', async ({ page, user }) => {
		const token = await user.createPublicCalendar()

		await page.goto(`./index.php/apps/calendar/p/${token}`)

		await expectEditorExtensionLoaded(page)
	})

	test('on the embedded public calendar page', async ({ page, user }) => {
		const token = await user.createPublicCalendar()

		await page.goto(`./index.php/apps/calendar/embed/${token}`)

		await expectEditorExtensionLoaded(page)
	})

	test('for the app menu on other apps', async ({ page, user, serverMajorVersion }) => {
		// See AppMenuActionListener::APP_MENU_ACTION_VERSION
		// eslint-disable-next-line playwright/no-skipped-test -- Feature not available on older servers
		test.skip(serverMajorVersion < 35, 'The app menu action requires Nextcloud 35 or later')

		await user.login()

		await page.goto('./index.php/settings/user')

		await expectEditorExtensionLoaded(page)
	})

	test('when references are rendered', async ({ page }) => {
		await page.goto('./index.php/apps/event_editor_extension/reference')

		await expectEditorExtensionLoaded(page)
	})
})

test('do not load event editor extensions where the event editor cannot open', async ({ page }) => {
	await page.goto('./index.php/login')

	expect(await page.evaluate(() => window.editorExtensionLoaded)).toBeUndefined()
})
