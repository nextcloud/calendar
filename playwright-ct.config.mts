/**
 * SPDX-FileCopyrightText: 2026 Nextcloud GmbH and Nextcloud contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import { defineConfig, devices } from '@playwright/test'

const GALLERY_URL = 'http://localhost:5173/index.html'

export default defineConfig({
	testDir: 'tests/javascript/component',
	snapshotDir: 'tests/javascript/component/snapshots',
	forbidOnly: !!process.env.CI,
	fullyParallel: true,
	workers: process.env.CI ? 1 : undefined,
	reporter: process.env.CI ? [['github'], ['html', { open: 'never' }]] : 'html',

	use: {
		...devices['Desktop Chrome'],
		baseURL: GALLERY_URL,
		serviceWorkers: 'block',
		reuseContext: true,
		trace: 'retain-on-failure',
	},
	webServer: {
		command: 'npx rspack serve --config rspack-ct.config.mts',
		url: GALLERY_URL,
		reuseExistingServer: !process.env.CI,
	},
})
