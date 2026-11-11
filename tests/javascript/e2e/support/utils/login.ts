/**
 * SPDX-FileCopyrightText: 2026 Nextcloud GmbH and Nextcloud contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import type { Page } from '@playwright/test'
import type { UserAccount } from './users.ts'

/**
 * Log in as the as privded user.
 *
 * @param page The page object to use
 * @param user The user to log in as
 */
export async function login(page: Page, user: UserAccount): Promise<void> {
	await page.goto('./index.php/login')
	await page.locator('#user').fill(user.userId)
	await page.locator('#password').fill(user.password)
	await page.locator('#password').press('Enter')

	// Wait for login to finish
	await page.waitForURL('**/apps/**', { waitUntil: 'domcontentloaded' })
}
