/**
 * SPDX-FileCopyrightText: 2025 Nextcloud GmbH and Nextcloud contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import { defineConfig } from 'vitest/config'
import vue from '@vitejs/plugin-vue2'

export default defineConfig({
	plugins: [vue()],
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
