/**
 * SPDX-FileCopyrightText: 2025 Nextcloud GmbH and Nextcloud contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import { recommended } from '@nextcloud/eslint-config'

export default [
	...recommended,
	{
		files: ['**/*.js', '**/*.vue', '**/*.ts'],
		rules: {
			// Relax some rules for now. Can be improved later on (baseline).
			'no-console': 'off',
			'@typescript-eslint/no-unused-vars': 'off',
			'vue/multi-word-component-names': 'off',
			'preserve-caught-error': 'off',
			'@nextcloud/no-deprecated-library-props': 'off',
			'vue/custom-event-name-casing': 'off',
			'no-useless-assignment': 'off',
			// JSDocs are welcome but lint:fix should not create empty ones
			'jsdoc/require-jsdoc': ['warn', { enableFixer: false }],
			'jsdoc/require-param': ['warn', { enableFixer: false }],
			// Forbid empty JSDocs
			'jsdoc/no-blank-blocks': ['error', { enableFixer: true }],
		},
	},
]
