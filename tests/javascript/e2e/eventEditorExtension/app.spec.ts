/**
 * SPDX-FileCopyrightText: 2026 Nextcloud GmbH and Nextcloud contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import type { EditFullDialog } from '../support/pages/EditFullDialog.ts'
import type { EditSimpleDialog } from '../support/pages/EditSimpleDialog.ts'

import { expect } from '@playwright/test'
import { test } from '../support/fixtures.ts'
import { createEventFromAppMenu, gotoPageOutsideCalendar, supportsCreatingEventsFromAppMenu } from '../support/pages/appMenu.ts'
import { login } from '../support/utils/login.ts'

// Loads the extension registered by the E2E test app (see tests/apps/event_editor_extension).
// For extensions the tests register themselves, see the other specs in this folder.

test.use({ eventEditorExtensionTestApp: true })

/**
 * Expect the editor to show the field added by the extension of the test app.
 *
 * @param editor The editor to look for the field in
 */
async function expectExtensionField(editor: EditFullDialog | EditSimpleDialog) {
	await expect(editor.locator.getByText('Field of the event editor extension')).toBeVisible()
}

test.describe('load event editor extensions registered by apps', () => {
	test('on the calendar page', async ({ calendarPage }) => {
		await calendarPage.goto()
		const simpleEditor = await calendarPage.createNewEvent()
		await expectExtensionField(simpleEditor)

		const fullEditor = await simpleEditor.openDetailedEditor()
		await expectExtensionField(fullEditor)
	})

	test('on the edit proposal page', async ({ page, calendarPage }) => {
		// The edit proposal page is the main calendar page with the proposal shown in a modal.
		// For the test it does not matter whether the proposal exists or not.
		await calendarPage.gotoProposal('non-existing-proposal')

		// After closing the message about the proposal, the user can navigate client-side to the event editor.
		// Therefore, editor extensions need to be loaded.
		await page.getByText('This meeting proposal no longer exists').getByRole('button', { name: 'Close' }).click()
		const simpleEditor = await calendarPage.createNewEvent()
		await expectExtensionField(simpleEditor)
	})

	test('on the public calendar page', async ({ api, user, publicCalendarPage }) => {
		const eventTitle = 'Public event'
		const calendar = await api(user).createCalendar()
		await calendar.createEvent(eventTitle)
		const token = await calendar.publish()

		await publicCalendarPage.goto(token)
		const fullEditor = await publicCalendarPage.openEventInFullEditor(eventTitle)

		await expectExtensionField(fullEditor)
	})

	test('on the embedded public calendar page', async ({ api, user, publicCalendarPage }) => {
		const eventTitle = 'Embedded event'
		const calendar = await api(user).createCalendar()
		await calendar.createEvent(eventTitle)
		const token = await calendar.publish()

		await publicCalendarPage.gotoEmbedded(token)
		const fullEditor = await publicCalendarPage.openEventInFullEditor(eventTitle)

		await expectExtensionField(fullEditor)
	})

	test('for the app menu on other apps', async ({ page, user, serverMajorVersion }) => {
		// eslint-disable-next-line playwright/no-skipped-test -- Feature not available on older servers
		test.skip(!supportsCreatingEventsFromAppMenu(serverMajorVersion), 'The server does not offer to create events from the app menu')

		await login(page, user)
		await gotoPageOutsideCalendar(page)
		const fullEditor = await createEventFromAppMenu(page)

		await expectExtensionField(fullEditor)
	})

	test('in references', async ({ api, user, referencePage }) => {
		const eventTitle = 'Referenced event'
		const calendar = await api(user).createCalendar()
		await calendar.createEvent(eventTitle)
		const token = await calendar.publish()

		await referencePage.gotoPublicCalendar(token)
		const simpleEditor = await referencePage.openEventInPopover(eventTitle)

		await expectExtensionField(simpleEditor)
	})
})
