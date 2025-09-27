/**
 * SPDX-FileCopyrightText: 2022 Nextcloud GmbH and Nextcloud contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

const path = require('path')
const webpackConfig = require('@nextcloud/webpack-vue-config')
const webpackRules = require('@nextcloud/webpack-vue-config/rules')
const BabelLoaderExcludeNodeModulesExcept = require('babel-loader-exclude-node-modules-except')

webpackConfig.entry.main = path.join(__dirname, 'src', 'main.ts')
webpackConfig.entry.reference = path.join(__dirname, 'src', 'reference.ts')
webpackConfig.entry['contacts-menu'] = path.join(__dirname, 'src', 'contactsMenu.ts')
webpackConfig.entry['appointments-booking'] = path.join(__dirname, 'src', 'appointments/main-booking.ts')
webpackConfig.entry['appointments-confirmation'] = path.join(__dirname, 'src', 'appointments/main-confirmation.ts')
webpackConfig.entry['appointments-conflict'] = path.join(__dirname, 'src', 'appointments/main-conflict.ts')
webpackConfig.entry['appointments-overview'] = path.join(__dirname, 'src', 'appointments/main-overview.ts')
webpackConfig.entry['proposal-public'] = path.join(__dirname, 'src', 'proposal-public.ts')

webpackConfig.resolve = {
	...webpackConfig.resolve,
	alias: {
		...webpackConfig.resolve.alias,
		'@': path.resolve(__dirname, 'src'),
	}
}

// Edit JS rule
webpackRules.RULE_JS.test = /\.m?js$/
webpackRules.RULE_JS.exclude = BabelLoaderExcludeNodeModulesExcept([
	'p-limit',
	'p-defer',
	'p-queue',
	'p-try',
	'yocto-queue',
])

// Add TypeScript rule
webpackRules.RULE_TS.use = [
	'babel-loader',
	{
		loader: 'ts-loader',
		options: {
			transpileOnly: true,
		},
	},
]

// Edit SCSS rule
webpackRules.RULE_SCSS.use = [
	'vue-style-loader',
	'css-loader',
	'resolve-url-loader',
	{
		loader: 'sass-loader',
		options: {
			// ! needed for resolve-url-loader
			sourceMap: true,
			sassOptions: {
				sourceMapContents: false,
				includePaths: [
					path.resolve(__dirname, './src/assets'),
				],
			},
		},
	},
]

module.exports = webpackConfig
