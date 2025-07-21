/**
 * SPDX-FileCopyrightText: 2025 Nextcloud GmbH and Nextcloud contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import { type Page } from '@playwright/test'

/**
 * Log in as the admin user.
 * This method is best used in a beforeEach hook.
 *
 * @param page The page object to use
 */
export async function login(page: Page): Promise<void> {
	await page.goto('./index.php/login')
	await page.locator('#user').fill('admin')
	await page.locator('#password').fill('admin')
	await page.locator('#password').press('Enter')

	// Wait for login to finish
	await page.waitForURL('**/apps/**', { waitUntil: 'domcontentloaded' })
}
