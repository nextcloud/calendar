/**
 * SPDX-FileCopyrightText: 2026 Nextcloud GmbH and Nextcloud contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import type { FullConfig } from '@playwright/test'

import { request } from '@playwright/test'

/**
 * Environment variable holding the major version of the Nextcloud server under test.
 * Set once in the global setup, so that it is available in all workers.
 */
export const SERVER_MAJOR_VERSION_ENV = 'CALENDAR_E2E_NC_SERVER_MAJOR_VERSION'

/**
 * Run once before all tests.
 *
 * @param config The Playwright configuration
 */
export default async function globalSetup(config: FullConfig) {
	const { baseURL, ignoreHTTPSErrors } = config.projects[0].use
	const api = await request.newContext({ baseURL, ignoreHTTPSErrors })
	try {
		const res = await api.get('./status.php')
		if (!res.ok()) {
			throw new Error(`Failed to get server status: ${res.status()} ${res.statusText()}`)
		}
		const status = await res.json()
		process.env[SERVER_MAJOR_VERSION_ENV] = status.version.split('.')[0]
	} finally {
		await api.dispose()
	}
}
