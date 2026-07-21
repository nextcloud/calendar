/**
 * SPDX-FileCopyrightText: 2025 Nextcloud GmbH and Nextcloud contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import { recommended } from '@nextcloud/eslint-config'
import pluginVue from 'eslint-plugin-vue'
import tseslint from 'typescript-eslint'

export default [
	...recommended,
	{
		files: ['**/*.js', '**/*.vue', '**/*.ts'],
		plugins: {
			vue: pluginVue,
			'@typescript-eslint': tseslint.plugin,
		},
		rules: {
			// Relax some rules for now. Can be improved later on (baseline).
			'no-console': 'warn',
			'@typescript-eslint/no-unused-vars': 'warn',
			'vue/multi-word-component-names': 'warn',
			'preserve-caught-error': 'warn',
			'@nextcloud/no-deprecated-library-props': 'warn',
			'vue/custom-event-name-casing': 'warn',
			'no-useless-assignment': 'warn',
			// JSDocs are welcome but lint:fix should not create empty ones
			'jsdoc/require-jsdoc': ['warn', { enableFixer: false }],
			'jsdoc/require-param': ['warn', { enableFixer: false }],
			// Forbid empty JSDocs
			'jsdoc/no-blank-blocks': ['error', { enableFixer: true }],
		},
	},
]
