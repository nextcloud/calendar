/**
 * SPDX-FileCopyrightText: 2025 Nextcloud GmbH and Nextcloud contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import { recommended } from '@nextcloud/eslint-config'
import eslintPluginPath from 'eslint-plugin-path'
import pluginVue from 'eslint-plugin-vue'
import tseslint from 'typescript-eslint'
import vitest from '@vitest/eslint-plugin'
import jsdoc from 'eslint-plugin-jsdoc'
import playwright from 'eslint-plugin-playwright'

export default [
	...recommended,
	{
		files: ['**/*.js', '**/*.vue', '**/*.ts'],
		plugins: {
			vue: pluginVue,
			'@typescript-eslint': tseslint.plugin,
			'jsdoc': jsdoc,
		},
		rules: {
			// Relax some rules for now. Can be improved later on (baseline).
			'vue/multi-word-component-names': 'warn',
			// Force to use the caught errors e.g. log, rethrow or comment about explicit exceptions.
			'no-restricted-syntax': ['error', {
				selector: 'CatchClause[param=null]',
				message: 'Bind the caught error: use `catch (error)`.',
			}],
			'preserve-caught-error': 'warn',
			'@nextcloud/no-deprecated-library-props': 'warn',
			'vue/custom-event-name-casing': 'warn',
			// JSDocs are welcome but lint:fix should not create empty ones
			'jsdoc/require-jsdoc': ['warn', { enableFixer: false }],
			'jsdoc/require-param': ['warn', { enableFixer: false }],
			// Forbid empty JSDocs
			'jsdoc/no-blank-blocks': ['error', { enableFixer: true }],
		},
	},
	{
		// Unit tests run with Vitest
		files: ['tests/javascript/unit/**'],
		plugins: {
			vitest,
		},
		rules: {
			...vitest.configs.recommended.rules,
		},
		languageOptions: {
			globals: {
				...vitest.environments.env.globals,
			},
		},
	},
	{
		// Component and E2E tests run with Playwright
		...playwright.configs['flat/recommended'],
		files: ['tests/javascript/component/**', 'tests/javascript/e2e/**'],
		rules: {
			...playwright.configs['flat/recommended'].rules,
			// Page objects assert in methods named `expect…`, e.g. `dialog.expectSubscribed()`
			'playwright/expect-expect': ['warn', { assertFunctionPatterns: ['^expect[A-Z]'] }],
		},
	},
	{
		files: ['**/*.js', '**/*.vue', '**/*.ts'],
		plugins: {
			path: eslintPluginPath,
		},
		rules: {
			'path/only-absolute-imports': 'error',
		},
	},
]
