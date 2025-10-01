/**
 * SPDX-FileCopyrightText: 2025 Nextcloud GmbH and Nextcloud contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import { defineConfig } from 'eslint/config'

// TODO: replace with recommended when migrating to Vue 3
import { recommendedVue2 } from '@nextcloud/eslint-config'

export default defineConfig([
	...recommendedVue2,
	{
		rules: {
			// Relax some rules for now. Can be improved later one (baseline).
			'no-console': 'off',
			'@typescript-eslint/no-unused-vars': 'off',
			'vue/multi-word-component-names': 'off',
			// JSDocs are welcome but lint:fix should not create empty ones
			'jsdoc/require-jsdoc': 'off',
			'jsdoc/require-param': 'off',
			// Forbid empty JSDocs
			// TODO: Enable this rule once @nextcloud/eslint-config was updated and pulls the
			//       newest version of eslint-plugin-jsdoc (is a recent feature/rule).
			// 'jsdoc/no-blank-blocks': 'error',
		},
	},
])
