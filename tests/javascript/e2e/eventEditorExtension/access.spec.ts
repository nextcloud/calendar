/**
 * SPDX-FileCopyrightText: 2026 Nextcloud GmbH and Nextcloud contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import type { Page } from '@playwright/test'
import type { EditFullDialog } from '../support/pages/EditFullDialog.ts'
import type { EditSimpleDialog } from '../support/pages/EditSimpleDialog.ts'

import { expect } from '@playwright/test'
import { test } from '../support/fixtures.ts'
import { createEventFromAppMenu, gotoPageOutsideCalendar, supportsCreatingEventsFromAppMenu } from '../support/pages/appMenu.ts'
import { CalendarPage } from '../support/pages/CalendarPage.ts'
import { login } from '../support/utils/login.ts'

// The tests register their extensions on the page with `window.registerEventEditorExtension`.
// For loading extensions registered by apps, see app.spec.ts.

test.use({ eventEditorExtensionApi: true })

/**
 * Register an extension adding a field that shows the access of the user to the event.
 * Register it after the page is loaded and before the editor is opened.
 *
 * @param page The page to register the extension on
 */
async function registerAccessExtension(page: Page) {
	await page.evaluate(() => {
		window.registerEventEditorExtension({
			app: 'e2e',
			name: 'access',
			setup({ editor }) {
				const field = document.createElement('div')
				field.textContent = `Access: ${editor.access}`
				editor.addCustomField({ element: field })
			},
		})
	})
}

/**
 * Expect the field added by `registerAccessExtension` to show the access.
 *
 * @param editor The editor to look for the field in
 * @param access The expected access, e.g. `view`
 */
async function expectAccess(editor: EditFullDialog | EditSimpleDialog, access: string) {
	await expect(editor.locator.getByText(/^Access: /)).toHaveText(`Access: ${access}`)
}

test.describe('propagate the access to the event to extensions', () => {
	test.describe('on the calendar page', () => {
		test('view', async ({ page, api, provisioning, user, calendarPage }) => {
			// An event in a calendar another user shared read-only with the user
			const eventTitle = 'Shared event'
			const owner = await provisioning.createUser()
			const calendar = await api(owner).createCalendar('Shared calendar')
			await calendar.createEvent(eventTitle)
			await calendar.shareReadOnlyWith(user)

			await calendarPage.goto()
			await registerAccessExtension(page)
			const simpleEditor = await calendarPage.openEventInPopover(eventTitle)

			await expectAccess(simpleEditor, 'view')
		})

		test('respond', async ({ page, api, provisioning }) => {
			// An event in a calendar of the user, organized by someone else, who invited the user
			const eventTitle = 'Invitation'
			const attendeeEmail = 'attendee@example.com'
			const attendee = await provisioning.createUser({ email: attendeeEmail })
			const calendar = await api(attendee).createCalendar()
			await calendar.createEvent(eventTitle, {
				organizerEmail: 'organizer@example.com',
				attendeeEmails: [attendeeEmail],
			})

			// Not the `calendarPage` fixture, which logs in the user of the `user` fixture.
			await login(page, attendee)
			const calendarPage = new CalendarPage(page)
			await calendarPage.goto()
			await registerAccessExtension(page)
			const simpleEditor = await calendarPage.openEventInPopover(eventTitle)

			await expectAccess(simpleEditor, 'respond')
		})

		test('full', async ({ page, calendarPage }) => {
			// A new event of the user
			await calendarPage.goto()
			await registerAccessExtension(page)
			const simpleEditor = await calendarPage.createNewEvent()

			await expectAccess(simpleEditor, 'full')
		})
	})

	// Public calendars are read-only, so `respond` and `full` are not possible.
	test.describe('on the embedded public calendar page', () => {
		test('view', async ({ page, api, user, publicCalendarPage }) => {
			const eventTitle = 'Embedded event'
			const calendar = await api(user).createCalendar()
			await calendar.createEvent(eventTitle)
			const token = await calendar.publish()

			await publicCalendarPage.gotoEmbedded(token)
			await registerAccessExtension(page)
			const fullEditor = await publicCalendarPage.openEventInFullEditor(eventTitle)

			await expectAccess(fullEditor, 'view')
		})
	})

	// The app menu only creates new events, so `view` and `respond` are not possible.
	test.describe('for the app menu on other apps', () => {
		test('full', async ({ page, user, serverMajorVersion }) => {
			// eslint-disable-next-line playwright/no-skipped-test -- Feature not available on older servers
			test.skip(!supportsCreatingEventsFromAppMenu(serverMajorVersion), 'The server does not offer to create events from the app menu')

			await login(page, user)
			await gotoPageOutsideCalendar(page)
			await registerAccessExtension(page)
			const fullEditor = await createEventFromAppMenu(page)

			await expectAccess(fullEditor, 'full')
		})
	})

	test.describe('in references', () => {
		test('view', async ({ page, api, user, referencePage }) => {
			const eventTitle = 'Referenced event'
			const calendar = await api(user).createCalendar()
			await calendar.createEvent(eventTitle)
			const token = await calendar.publish()

			await referencePage.gotoPublicCalendar(token)
			await registerAccessExtension(page)
			const simpleEditor = await referencePage.openEventInPopover(eventTitle)

			await expectAccess(simpleEditor, 'view')
		})

		test('view of a calendar the user can change', async ({ page, api, user, referencePage }) => {
			const eventTitle = 'Referenced own event'
			const calendar = await api(user).createCalendar()
			await calendar.createEvent(eventTitle)

			// The reference by the CalDAV URL of the calendar requires the user to be logged in.
			await login(page, user)
			await referencePage.gotoCalendar(calendar)
			await registerAccessExtension(page)
			const simpleEditor = await referencePage.openEventInPopover(eventTitle)

			await expectAccess(simpleEditor, 'view')
		})
	})
})
