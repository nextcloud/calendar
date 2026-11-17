/**
 * SPDX-FileCopyrightText: 2026 Nextcloud GmbH and Nextcloud contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import type { Page } from '@playwright/test'
import type { CalendarPage } from '../support/pages/CalendarPage.ts'
import type { UpdateScope } from '../support/pages/EditSimpleDialog.ts'
import type { UserApi } from '../support/utils/api.ts'

import { expect } from '@playwright/test'
import { test } from '../support/fixtures.ts'

// The tests register their extensions on the page with `window.registerEventEditorExtension`.
// For loading extensions registered by apps, see app.spec.ts.

test.use({ eventEditorExtensionApi: true })

const eventTitle = 'Recurring event with extension input'
const inputValue = 'Saved by the extension'

/**
 * Register an extension that copies its input to the event only when it is saved.
 * Register it after the page is loaded and before the editor is opened.
 *
 * @param page The page to register the extension on
 */
async function registerSaveInputExtension(page: Page) {
	await page.evaluate(() => {
		window.registerEventEditorExtension({
			app: 'e2e',
			name: 'save-input',
			setup({ editor, event }) {
				const field = document.createElement('input')
				field.setAttribute('aria-label', 'Input of the extension')
				editor.addField({ field })
				event.onSave({
					callback() {
						event.setProperty({ name: 'X-TEST-INPUT', value: field.value })
					},
				})
			},
		})
	})
}

/**
 * Create an event of the user occurring daily three times, starting today.
 *
 * @param userApi The API of the user
 */
async function createRecurringEvent(userApi: UserApi) {
	const calendar = await userApi.createCalendar()
	const event = await calendar.createEvent(eventTitle, { recurrenceRule: 'FREQ=DAILY;COUNT=3' })
	const starts = await event.getOccurrenceStarts()
	return { calendar, event, starts }
}

/**
 * Open an occurrence of the recurring event, fill the input of the extension and save it.
 *
 * @param page The page showing the calendar page
 * @param calendarPage The calendar page
 * @param start The start of the occurrence
 * @param scope Which occurrences to update
 */
async function updateOccurrenceWithExtensionInput(page: Page, calendarPage: CalendarPage, start: Date, scope: UpdateScope) {
	// Show the day of the occurrence, as it might be in another week or month.
	await calendarPage.gotoDay(start)
	await registerSaveInputExtension(page)
	const simpleEditor = await calendarPage.openEventInPopover(eventTitle)
	await simpleEditor.edit()
	await simpleEditor.locator.getByRole('textbox', { name: 'Input of the extension' }).fill(inputValue)
	await simpleEditor.update(scope)
}

test.describe('save properties set by onSave hooks', () => {
	test('editing the first occurrence and updating the entire series', async ({ page, api, user, calendarPage }) => {
		const { event, starts } = await createRecurringEvent(api(user))

		await updateOccurrenceWithExtensionInput(page, calendarPage, starts[0], 'entire series')

		const components = await event.getComponents()
		// All three occurrences inherit the property from the series, without an occurrence exception.
		expect(components).toHaveLength(1)
		expect(components[0].hasProperty('recurrence-id')).toBe(false)
		expect(components[0].getFirstPropertyValue('rrule')?.toString()).toBe('FREQ=DAILY;COUNT=3')
		expect(components[0].getFirstPropertyValue('x-test-input')).toBe(inputValue)
	})

	test('editing the second occurrence and updating this occurrence', async ({ page, api, user, calendarPage }) => {
		const { calendar, starts } = await createRecurringEvent(api(user))

		await updateOccurrenceWithExtensionInput(page, calendarPage, starts[1], 'this occurrence')

		// Adds an exception for the second occurrence to the series.
		expect(await calendar.getOccurrences('x-test-input')).toEqual({
			resourceCount: 1,
			occurrences: [
				{ start: starts[0], value: null },
				{ start: starts[1], value: inputValue },
				{ start: starts[2], value: null },
			],
		})
	})

	test('editing the second occurrence and updating this and future occurrences', async ({ page, api, user, calendarPage }) => {
		const { calendar, starts } = await createRecurringEvent(api(user))

		await updateOccurrenceWithExtensionInput(page, calendarPage, starts[1], 'this and future occurrences')

		// Splits the series into two event resources, the second one starting with the second occurrence.
		expect(await calendar.getOccurrences('x-test-input')).toEqual({
			resourceCount: 2,
			occurrences: [
				{ start: starts[0], value: null },
				{ start: starts[1], value: inputValue },
				{ start: starts[2], value: inputValue },
			],
		})
	})
})
