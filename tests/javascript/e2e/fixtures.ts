/**
 * SPDX-FileCopyrightText: 2026 Nextcloud GmbH and Nextcloud contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import type { APIRequestContext, Locator, Page } from '@playwright/test'

import { test as base, expect, request } from '@playwright/test'

interface UserAccount {
	userId: string
	password: string
}

const ADMIN_ACCOUNT = {
	userId: 'admin',
	password: 'admin',
}

const DEFAULT_USER_PASSWORD = 'userPassword'

/**
 * Used to configure the Nextcloud instance.
 * Also keeps track of made changes to revert them after tests are done.
 */
class ProvisioningFacade {
	createdUsers: UserAccount[] = []
	private api?: APIRequestContext
	private previousConfigValues: { app: string, key: string, value: string }[] = []

	private async getAPI() {
		if (this.api !== undefined) {
			return this.api
		}
		const auth = Buffer.from(`${ADMIN_ACCOUNT.userId}:${ADMIN_ACCOUNT.password}`).toString('base64')
		this.api = await request.newContext({
			extraHTTPHeaders: {
				'OCS-APIRequest': 'true',
				Authorization: `Basic ${auth}`,
				Accept: 'application/json',
			},
		})
		return this.api
	}

	async createUser() {
		const user = {
			userId: `user-${crypto.randomUUID()}`,
			password: DEFAULT_USER_PASSWORD,
		}
		const api = await this.getAPI()

		// NOTE Possible improvement: Generate client from OpenAPI spec
		// See https://docs.nextcloud.com/server/stable/developer_manual/_static/openapi.html#/operations/provisioning_api-users-add-user
		const res = await api.post('/ocs/v2.php/cloud/users', {
			data: { userid: user.userId, password: user.password },
		})

		if (!res.ok()) {
			throw new Error(`Failed to create user ${user.userId}: ${res.status()} ${res.statusText()}`)
		}
		this.createdUsers.push(user)
		return user
	}

	async deleteAllCreatedUsers() {
		const api = await this.getAPI()
		for (const user of this.createdUsers) {
			// See https://docs.nextcloud.com/server/stable/developer_manual/_static/openapi.html#/operations/provisioning_api-users-delete-user
			const res = await api.delete(`/ocs/v2.php/cloud/users/${user.userId}`)
			if (!res.ok()) {
				console.error(`Failed to delete user ${user.userId}: ${res.status()} ${res.statusText()}`)
			}
		}
		this.createdUsers = []
	}

	async updateAppConfigValue(app: string, key: string, value: string) {
		await this.recordPreviousConfigValue(app, key)
		await this.doUpdateAppConfigValue(app, key, value)
	}

	private async doUpdateAppConfigValue(app: string, key: string, value: string) {
		const api = await this.getAPI()
		const body = { value }
		// See https://docs.nextcloud.com/server/stable/developer_manual/_static/openapi.html#/operations/provisioning_api-app_config-set-value
		const res = await api.post(`/ocs/v2.php/apps/provisioning_api/api/v1/config/apps/${app}/${key}`, { data: body })
		if (!res.ok()) {
			throw new Error(`Failed to update app config value for ${app}/${key}: ${res.status()} ${res.statusText()}`)
		}
	}

	private async recordPreviousConfigValue(app: string, key: string) {
		const api = await this.getAPI()
		// See https://docs.nextcloud.com/server/stable/developer_manual/_static/openapi.html#/operations/provisioning_api-app_config-get-keys
		const res = await api.get(`/ocs/v2.php/apps/provisioning_api/api/v1/config/apps/${app}/${key}`)
		if (!res.ok()) {
			throw new Error(`Failed to get app config value for ${app}/${key}: ${res.status()} ${res.statusText()}`)
		}
		const body = await res.json()
		const previousValue = body?.ocs?.data?.data
		if (previousValue === undefined) {
			throw new Error(`Failed to get previous app config value for ${app}/${key}: No value in response 
                ${JSON.stringify(body)}`)
		}
		this.previousConfigValues.push({ app, key, value: previousValue })
	}

	async revertAllPreviousConfigValues() {
		for (const { app, key, value } of this.previousConfigValues) {
			await this.doUpdateAppConfigValue(app, key, value)
		}
		this.previousConfigValues = []
	}

	async revert() {
		await this.deleteAllCreatedUsers()
		await this.revertAllPreviousConfigValues()
		await this.api?.dispose()
	}
}

/**
 * Log in as the as privded user.
 *
 * @param page The page object to use
 * @param user The user to log in as
 */
async function login(page: Page, user: UserAccount): Promise<void> {
	await page.goto('./index.php/login')
	await page.locator('#user').fill(user.userId)
	await page.locator('#password').fill(user.password)
	await page.locator('#password').press('Enter')

	// Wait for login to finish
	await page.waitForURL('**/apps/**', { waitUntil: 'domcontentloaded' })
}

/**
 * Encapsulate common interactions with the public calendar subscription dialog.
 */
class PublicCalendarSubscriptionDialog {
	dialog: Locator

	constructor(private readonly page: Page) {
		this.dialog = page.getByRole('dialog', { name: 'Public calendar subscriptions' })
	}

	async open() {
		await this.page
			.getByText('My calendarsAdd new')
			.getByRole('button', { name: 'Actions' })
			.click()

		await this.page.getByRole('menuitem', { name: 'Add custom public calendar' }).click()

		await expect(this.dialog).toBeVisible()
	}

	async close() {
		await this.dialog.getByLabel('Close').click()
	}

	async subscribeToCalendar(calendarName: string) {
		await this.dialog.getByText(calendarName + 'Subscribe').getByRole('button', { name: 'Subscribe' }).click()
		await this.expectSubscribed(calendarName)
	}

	async expectSubscribed(calendarName: string) {
		await expect(this.dialog.getByText(calendarName + 'Subscribed')).toBeVisible()
	}
}

/**
 * Encapsulate common interactions with the calendar page.
 */
export class CalendarPage {
	calendarNavigation: Locator
	publicCalendarSubscriptionDialog: PublicCalendarSubscriptionDialog

	constructor(private readonly page: Page) {
		this.publicCalendarSubscriptionDialog = new PublicCalendarSubscriptionDialog(page)
		this.calendarNavigation = page.getByRole('navigation', { name: 'Calendar navigation' })
	}

	async goto() {
		await this.page.goto('./index.php/apps/calendar')
	}

	async expectCalendarExists(calendarName: string) {
		return this.calendarNavigation.getByRole('link', { name: calendarName }).isVisible()
	}
}

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
