/**
 * SPDX-FileCopyrightText: 2026 Nextcloud GmbH and Nextcloud contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import type { UserAccount } from './utils/users.ts'

import { test as base } from '@playwright/test'
import { SERVER_MAJOR_VERSION_ENV } from './globalSetup.ts'
import { CalendarPage } from './pages/CalendarPage.ts'
import { ProvisioningFacade } from './provisioning.ts'
import { login } from './utils/login.ts'

export const test = base.extend<{
	provisioning: ProvisioningFacade
	/** A new user for this test, not logged in by this fixture (but e.g. by `calendarPage`) */
	user: UserAccount
	calendarPage: CalendarPage
	/** Major version of the Nextcloud server under test, e.g. 35 */
	serverMajorVersion: number
}>({
	provisioning: async ({ }, use) => {
		const provisioning = new ProvisioningFacade()
		await use(provisioning)
		await provisioning.revert()
	},
	user: async ({ provisioning }, use) => {
		// It's easier to create a new user for each test
		// instead of trying to revert all changes done during test runs.
		await use(await provisioning.createUser())
	},
	calendarPage: async ({ page, user }, use) => {
		const calendarPage = new CalendarPage(page)
		await login(page, user)
		await calendarPage.goto()
		await use(calendarPage)
	},
	serverMajorVersion: async ({ }, use) => {
		const version = Number(process.env[SERVER_MAJOR_VERSION_ENV])
		if (Number.isNaN(version)) {
			throw new Error(`${SERVER_MAJOR_VERSION_ENV} is not set, is the global setup configured?`)
		}
		await use(version)
	},
})
