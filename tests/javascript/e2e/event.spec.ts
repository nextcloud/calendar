/**
 * SPDX-FileCopyrightText: 2025 Nextcloud GmbH and Nextcloud contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import { expect } from '@playwright/test'
import { test } from './support/fixtures.ts'

test('create an event', async ({ page, calendarPage }) => {
	// Create new event with random title
	const eventTitle = Math.random().toString(16).slice(2)
	const simpleEditor = await calendarPage.createNewEvent()
	await simpleEditor.fillTitle(eventTitle)
	await simpleEditor.save()

	// Wait for modal to close
	await expect(simpleEditor.locator).not.toBeVisible()

	// Assert that the new event exists
	await expect(page.getByText(eventTitle)).toBeVisible()
})
