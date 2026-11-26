/**
 * SPDX-FileCopyrightText: 2026 Nextcloud GmbH and Nextcloud contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import type { UserAccount } from './utils/users.ts'

import { test as base } from '@playwright/test'
import { CalendarPage } from './pages/CalendarPage.ts'
import { PublicCalendarPage } from './pages/PublicCalendarPage.ts'
import { ReferencePage } from './pages/ReferencePage.ts'
import { ProvisioningFacade } from './provisioning.ts'
import { UserApi } from './utils/api.ts'
import { addEventEditorExtensionApiScript, EVENT_EDITOR_EXTENSION_TEST_APP_HEADER } from './utils/eventEditorExtensions.ts'
import { login } from './utils/login.ts'

interface Options {
	/**
	 * Expose `window.registerEventEditorExtension` on every page, so that tests can register their own extensions,
	 * see `addEventEditorExtensionApiScript`. Enable it with `test.use({ eventEditorExtensionApi: true })`.
	 */
	eventEditorExtensionApi: boolean
	/**
	 * Let the E2E test app load its event editor extension, see `EVENT_EDITOR_EXTENSION_TEST_APP_HEADER`.
	 * Enable it with `test.use({ eventEditorExtensionTestApp: true })`.
	 */
	eventEditorExtensionTestApp: boolean
}

interface TestFixtures {
	provisioning: ProvisioningFacade
	/** A new user for this test, not logged in by this fixture (but e.g. by `calendarPage`) */
	user: UserAccount
	/** Prepare data on the server as a user, e.g. `api(user).createCalendar()` */
	api: (user: UserAccount) => UserApi
	/** The calendar page, with `user` logged in. Call `goto` after preparing the data it shows. */
	calendarPage: CalendarPage
	/** The page of a public calendar, which needs no login */
	publicCalendarPage: PublicCalendarPage
	/** The reference page of the E2E test app, not logged in by this fixture */
	referencePage: ReferencePage
}

interface WorkerFixtures {
	/** Major version of the Nextcloud server under test, e.g. 35 */
	serverMajorVersion: number
}

export const test = base.extend<Options & TestFixtures, WorkerFixtures>({
	eventEditorExtensionApi: [false, { option: true }],
	eventEditorExtensionTestApp: [false, { option: true }],

	extraHTTPHeaders: async ({ extraHTTPHeaders, eventEditorExtensionTestApp }, use) => {
		await use(eventEditorExtensionTestApp
			? { ...extraHTTPHeaders, [EVENT_EDITOR_EXTENSION_TEST_APP_HEADER]: '1' }
			: extraHTTPHeaders)
	},
	page: async ({ page, eventEditorExtensionApi }, use) => {
		// Before any fixture or test navigates, as the script is added to the pages loaded afterwards.
		if (eventEditorExtensionApi) {
			await addEventEditorExtensionApiScript(page)
		}
		await use(page)
	},

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
	api: async ({ request }, use) => {
		await use((user) => new UserApi(request, user))
	},

	calendarPage: async ({ page, user }, use) => {
		await login(page, user)
		await use(new CalendarPage(page))
	},
	publicCalendarPage: async ({ page }, use) => {
		await use(new PublicCalendarPage(page))
	},
	referencePage: async ({ page }, use) => {
		await use(new ReferencePage(page))
	},

	serverMajorVersion: [async ({ playwright }, use, workerInfo) => {
		const { baseURL, ignoreHTTPSErrors } = workerInfo.project.use
		const api = await playwright.request.newContext({ baseURL, ignoreHTTPSErrors })
		let status: { version: string }
		try {
			const response = await api.get('./status.php')
			if (!response.ok()) {
				throw new Error(`Failed to get server status: ${response.status()} ${response.statusText()}`)
			}
			status = await response.json()
		} finally {
			await api.dispose()
		}
		await use(Number(status.version.split('.')[0]))
	}, { scope: 'worker' }],
})
