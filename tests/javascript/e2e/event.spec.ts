/**
 * SPDX-FileCopyrightText: 2025 Nextcloud GmbH and Nextcloud contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import { test, expect } from '@playwright/test'
import { login } from './login.js'

test.beforeEach(async ({ page }) => {
	await login(page)
})

test('create an event', async ({ page }) => {
	await page.goto('./index.php/apps/calendar')

	const eventTitle = Math.random().toString(16).slice(2)

	// Create new event with random title
	await page.getByRole('button', { name: 'Create new event' }).click()
	await page.getByRole('textbox', { name: 'Event title' }).click()
	await page.getByRole('textbox', { name: 'Event title' }).fill(eventTitle)
	await page.getByRole('button', { name: 'Save' }).click()

	// Wait for modal to close
	await expect(page.getByRole('dialog')).not.toBeVisible()

	// Assert that the new event exists
	await expect(page.getByText(eventTitle)).toBeVisible()
})
