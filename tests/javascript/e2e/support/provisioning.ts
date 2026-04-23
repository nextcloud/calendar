/**
 * SPDX-FileCopyrightText: 2026 Nextcloud GmbH and Nextcloud contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import { type APIRequestContext, request } from '@playwright/test'
import { type UserAccount } from './users.ts'

const ADMIN_ACCOUNT = {
	userId: 'admin',
	password: 'admin',
}

const DEFAULT_USER_PASSWORD = 'userPassword'

/**
 * Used to configure the Nextcloud instance.
 * Also keeps track of made changes to revert them after tests are done.
 */
export class ProvisioningFacade {
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
