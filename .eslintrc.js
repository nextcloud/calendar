/**
 * SPDX-FileCopyrightText: 2018 Nextcloud GmbH and Nextcloud contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

module.exports = {
	extends: [
		'@nextcloud/eslint-config/typescript',
	],
	settings: {
		'import/resolver': {
			typescript: {},
		},
	},
	plugins: [
		'@stylistic',
	],
	rules: {
		'@stylistic/no-mixed-spaces-and-tabs': 'error',
	}
}
