/**
 * SPDX-FileCopyrightText: 2026 Nextcloud GmbH and Nextcloud contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import type { Page } from '@playwright/test'
import type { CalendarPage } from '../support/pages/CalendarPage.ts'
import type { EditFullDialog } from '../support/pages/EditFullDialog.ts'
import type { EditSimpleDialog } from '../support/pages/EditSimpleDialog.ts'
import type { UserApi } from '../support/utils/api.ts'

import { expect } from '@playwright/test'
import { test } from '../support/fixtures.ts'
import { createEventFromAppMenu, gotoPageOutsideCalendar, supportsCreatingEventsFromAppMenu } from '../support/pages/appMenu.ts'
import { login } from '../support/utils/login.ts'

// The tests register their extensions on the page with `window.registerEventEditorExtension`.
// For loading extensions registered by apps, see app.spec.ts.

test.use({ eventEditorExtensionApi: true })

const typedValue = 'Typed into the extension'

/**
 * Register an extension adding a field that shows the view of the editor and each change of it,
 * e.g. `View: preview -> simple`, next to an input.
 * The field is created again if the extension is set up again, which resets the chain of views and the input.
 * Register it after the page is loaded and before the editor is opened.
 *
 * @param page The page to register the extension on
 */
async function registerViewExtension(page: Page) {
	await page.evaluate(() => {
		window.registerEventEditorExtension({
			app: 'e2e',
			name: 'view',
			setup({ editor }) {
				const views = document.createElement('span')
				views.textContent = `View: ${editor.view}`
				editor.onViewChange({
					callback: ({ view: nextView }) => {
						views.textContent += ` -> ${nextView}`
					},
				})
				const input = document.createElement('input')
				input.setAttribute('aria-label', 'Input of the extension')
				const field = document.createElement('div')
				field.append(views, input)
				editor.addCustomField({ element: field })
			},
		})
	})
}

/**
 * Get the input in the field added by `registerViewExtension`.
 * Its value is kept as long as the extension is not set up again.
 *
 * @param editor The editor to look for the input in
 */
function getExtensionInput(editor: EditFullDialog | EditSimpleDialog) {
	return editor.locator.getByRole('textbox', { name: 'Input of the extension' })
}

/**
 * Expect the field added by `registerViewExtension` to show the views of the editor since the extension was set up.
 *
 * @param editor The editor to look for the field in
 * @param views The views, e.g. `preview -> simple`
 */
async function expectViews(editor: EditFullDialog | EditSimpleDialog, views: string) {
	await expect(editor.locator.getByText(/^View: /)).toHaveText(`View: ${views}`)
}

/**
 * Type into the input of the extension, to tell later whether it was set up again.
 *
 * @param editor The editor showing the input
 */
async function typeIntoExtensionInput(editor: EditFullDialog | EditSimpleDialog) {
	await getExtensionInput(editor).fill(typedValue)
}

/**
 * Expect the input of the extension to keep what `typeIntoExtensionInput` typed, i.e. the extension was not set up again.
 *
 * @param editor The editor showing the input
 */
async function expectTypedInputKept(editor: EditFullDialog | EditSimpleDialog) {
	await expect(getExtensionInput(editor)).toHaveValue(typedValue)
}

test.describe('propagate the view of the editor to extensions', () => {
	test.describe('on the calendar page', () => {
		const eventTitle = 'Own event'

		/**
		 * Create an event of the user, to show on the calendar page.
		 *
		 * @param userApi The API of the user
		 */
		async function createOwnEvent(userApi: UserApi) {
			const calendar = await userApi.createCalendar()
			await calendar.createEvent(eventTitle)
		}

		/**
		 * Open the event created by `createOwnEvent` in the popover viewing it,
		 * after registering the extension, and type into the input of the extension.
		 *
		 * @param page The page showing the calendar page
		 * @param calendarPage The calendar page
		 */
		async function openOwnEventInPreview(page: Page, calendarPage: CalendarPage): Promise<EditSimpleDialog> {
			await calendarPage.goto()
			await registerViewExtension(page)
			const simpleEditor = await calendarPage.openEventInPopover(eventTitle)
			await expectViews(simpleEditor, 'preview')
			await typeIntoExtensionInput(simpleEditor)
			return simpleEditor
		}

		test.describe('new event', () => {
			test('simple', async ({ page, calendarPage }) => {
				// The popover editing the new event
				await calendarPage.goto()
				await registerViewExtension(page)
				const simpleEditor = await calendarPage.createNewEvent()

				await expectViews(simpleEditor, 'simple')
			})

			test('simple -> full', async ({ page, calendarPage }) => {
				// The popover hands the new event over to the full editor, which keeps the extension.
				// Unlike for existing events (see `existing event` › `preview -> simple -> full`), the full editor creates the new event again,
				// which keeps the open one instead.
				await calendarPage.goto()
				await registerViewExtension(page)
				const simpleEditor = await calendarPage.createNewEvent()
				await expectViews(simpleEditor, 'simple')
				await typeIntoExtensionInput(simpleEditor)

				const fullEditor = await simpleEditor.openDetailedEditor()
				await expectViews(fullEditor, 'simple -> full')
				await expectTypedInputKept(fullEditor)
			})
		})

		test.describe('existing event', () => {
			test('preview -> simple -> full', async ({ page, api, user, calendarPage }) => {
				// The popover switches from viewing to editing the event in place, then hands it over to the full editor.
				await createOwnEvent(api(user))
				const simpleEditor = await openOwnEventInPreview(page, calendarPage)

				await simpleEditor.edit()
				const fullEditor = await simpleEditor.openDetailedEditor()
				await expectViews(fullEditor, 'preview -> simple -> full')
				await expectTypedInputKept(fullEditor)
			})

			test('preview -> full', async ({ page, api, user, calendarPage }) => {
				// The popover viewing the event also offers to show more details.
				await createOwnEvent(api(user))
				const simpleEditor = await openOwnEventInPreview(page, calendarPage)

				const fullEditor = await simpleEditor.openDetailedEditor()
				await expectViews(fullEditor, 'preview -> full')
				await expectTypedInputKept(fullEditor)
			})

			test('preview -> simple -> preview', async ({ page, api, user, calendarPage }) => {
				// Saving in the popover switches it back to viewing the event, which stays open.
				await createOwnEvent(api(user))
				const simpleEditor = await openOwnEventInPreview(page, calendarPage)

				await simpleEditor.edit()
				await simpleEditor.update()
				await expectViews(simpleEditor, 'preview -> simple -> preview')
				await expectTypedInputKept(simpleEditor)
			})

			test('full without the simplified editor', async ({ page, api, user, calendarPage }) => {
				// With the simplified editor disabled in the settings, events open in the full editor directly.
				await api(user).setSkipPopover(true)
				await createOwnEvent(api(user))
				await calendarPage.goto()
				await registerViewExtension(page)
				const fullEditor = await calendarPage.openEventInFullEditor(eventTitle)

				await expectViews(fullEditor, 'full')
			})

			test('preview -> simple -> full, closed by saving', async ({ page, api, user, calendarPage }) => {
				// Saving in the full editor closes it, which removes the field of the extension.
				await createOwnEvent(api(user))
				const simpleEditor = await openOwnEventInPreview(page, calendarPage)
				await simpleEditor.edit()
				const fullEditor = await simpleEditor.openDetailedEditor()
				await expectViews(fullEditor, 'preview -> simple -> full')

				await fullEditor.update()
				await expect(fullEditor.locator).toBeHidden()
				await expect(page.getByText(/^View: /)).toBeHidden()
			})
		})
	})

	test.describe('on the embedded public calendar page', () => {
		test('full', async ({ page, api, user, publicCalendarPage }) => {
			const eventTitle = 'Embedded event'
			const calendar = await api(user).createCalendar()
			await calendar.createEvent(eventTitle)
			const token = await calendar.publish()

			await publicCalendarPage.gotoEmbedded(token)
			await registerViewExtension(page)
			const fullEditor = await publicCalendarPage.openEventInFullEditor(eventTitle)

			await expectViews(fullEditor, 'full')
		})
	})

	test.describe('for the app menu on other apps', () => {
		test('full', async ({ page, user, serverMajorVersion }) => {
			// eslint-disable-next-line playwright/no-skipped-test -- Feature not available on older servers
			test.skip(!supportsCreatingEventsFromAppMenu(serverMajorVersion), 'The server does not offer to create events from the app menu')

			await login(page, user)
			await gotoPageOutsideCalendar(page)
			await registerViewExtension(page)
			const fullEditor = await createEventFromAppMenu(page)

			await expectViews(fullEditor, 'full')
		})
	})

	test.describe('in references', () => {
		test('preview', async ({ page, api, user, referencePage }) => {
			// The popover of the widget only views events.
			const eventTitle = 'Referenced event'
			const calendar = await api(user).createCalendar()
			await calendar.createEvent(eventTitle)
			const token = await calendar.publish()

			await referencePage.gotoPublicCalendar(token)
			await registerViewExtension(page)
			const simpleEditor = await referencePage.openEventInPopover(eventTitle)

			await expectViews(simpleEditor, 'preview')
		})
	})
})
