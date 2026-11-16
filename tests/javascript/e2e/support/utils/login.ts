/**
 * SPDX-FileCopyrightText: 2026 Nextcloud GmbH and Nextcloud contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import type { Page } from '@playwright/test'
import type { UserAccount } from './users.ts'

/**
 * Log in as the user. Does not navigate the page, so call `goto` of the page under test afterwards.
 *
 * Logs in over HTTP instead of using the login form. The form and the dashboard it redirects to
 * take ~90 requests, which is a lot of load for the single-process PHP server on CI.
 * `page.request` shares its cookies with the page, so the page is logged in as well.
 *
 * @param page The page to log in on
 * @param user The user to log in as
 */
export async function login(page: Page, user: UserAccount): Promise<void> {
	const tokenResponse = await page.request.get('./index.php/csrftoken')
	if (!tokenResponse.ok()) {
		throw new Error(`Failed to get a CSRF token: ${tokenResponse.status()} ${tokenResponse.statusText()}`)
	}
	const { token } = await tokenResponse.json()

	const response = await page.request.post('./index.php/login', {
		// The server only accepts logins from its own origin (see LoginController::tryLogin),
		// which browsers send with forms, but `page.request` does not.
		headers: { Origin: new URL(tokenResponse.url()).origin },
		form: { user: user.userId, password: user.password, requesttoken: token },
		maxRedirects: 0,
	})
	// Both success and failure redirect; a failed login redirects back to the login page
	const location = response.headers().location ?? ''
	if (response.status() !== 303 || location.includes('/login')) {
		throw new Error(`Failed to log in as ${user.userId}: ${response.status()} ${location}`)
	}
}
