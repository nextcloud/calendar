/**
 * SPDX-FileCopyrightText: 2018 Nextcloud GmbH and Nextcloud contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */
module.exports = {
	extends: [
		'@nextcloud',
	],
	settings: {
		'import/resolver': {
			typescript: {
				project: [__dirname + '/tsconfig.json'],
			},
			node: {
				extensions: ['.js', '.ts', '.vue'],
			},
		},
	},
	rules: {
		// Let TS resolver handle path aliases like "@/…"
		'n/no-missing-import': 'off',
		// Allow both extensionless and extension-based imports
		// (the bundler/TS config handles resolution)
		'import/extensions': 'off',
	},
	overrides: [
		// Ensure TypeScript in Vue SFCs is parsed correctly in this app
		{
			files: ['**/*.vue'],
			parser: 'vue-eslint-parser',
			parserOptions: {
				parser: '@typescript-eslint/parser',
				ecmaVersion: 'latest',
				sourceType: 'module',
				extraFileExtensions: ['.vue'],
				project: [__dirname + '/tsconfig.json'],
			},
		},
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
