/**
 * SPDX-FileCopyrightText: 2018 Nextcloud GmbH and Nextcloud contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */
module.exports = {
	extends: [
		'@nextcloud',
	],
	overrides: [
		{
			files: ['**/*.ts', '**/*.tsx'],
			extends: [
				'@nextcloud',
				'@nextcloud/eslint-config/typescript',
			],
			parser: '@typescript-eslint/parser',
			plugins: ['@typescript-eslint'],
		},
	],
}
