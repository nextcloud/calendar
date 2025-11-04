/**
 * SPDX-FileCopyrightText: 2025 Nextcloud GmbH and Nextcloud contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import { defineConfig } from 'vitest/config'
import vue from '@vitejs/plugin-vue2'
import { fileURLToPath } from 'node:url'

export default defineConfig({
	plugins: [vue()],
	resolve: {
		alias: {
			'@': fileURLToPath(new URL('./src', import.meta.url))
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
		// Required for transforming CSS files
		pool: 'vmForks',
	},
});
