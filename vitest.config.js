/**
 * SPDX-FileCopyrightText: 2026 Nextcloud GmbH and Nextcloud contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import vue from '@vitejs/plugin-vue'
import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vitest/config'

export default defineConfig({
	plugins: [vue()],
	resolve: {
		alias: {
			'@': fileURLToPath(new URL('./src', import.meta.url)),
		},
	},
	test: {
		include: ['tests/javascript/unit/**/*.{test,spec}.?(c|m)[jt]s?(x)'],
		setupFiles: [
			'tests/javascript/unit/setup.js',
			'tests/assets/loadAsset.js',
		],
		globals: true,
		environment: 'jsdom',
		// Use forks pool for reliable vi.mock() hoisting with coverage
		pool: 'forks',
		// Increase timeouts for slow CI environments
		testTimeout: 300000, // 2 minutes per test
		hookTimeout: 60000, // 60 seconds for hooks
	},
})
