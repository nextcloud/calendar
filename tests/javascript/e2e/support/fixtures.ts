/**
 * SPDX-FileCopyrightText: 2026 Nextcloud GmbH and Nextcloud contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import { test as base } from '@playwright/test'
import { login } from './login.ts'
import { CalendarPage } from './pages/CalendarPage.ts'
import { ProvisioningFacade } from './provisioning.ts'

export const test = base.extend<{ provisioning: ProvisioningFacade, calendarPage: CalendarPage }>({
	// eslint-disable-next-line no-empty-pattern -- Playwright requires the first argument to be object destructuring.
	provisioning: async ({ }, use) => {
		const provisioning = new ProvisioningFacade()
		await use(provisioning)
		await provisioning.revert()
	},
	calendarPage: async ({ page, provisioning }, use) => {
		const calendarPage = new CalendarPage(page)
		// It's easier to create a new user for each test
		// instead of trying to revert all changes done during test runs.
		const user = await provisioning.createUser()
		await login(page, user)
		await calendarPage.goto()
		await use(calendarPage)
	},
})
