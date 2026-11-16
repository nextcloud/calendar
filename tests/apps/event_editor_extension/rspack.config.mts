/*
 * SPDX-FileCopyrightText: 2026 Nextcloud GmbH and Nextcloud contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

// Builds the scripts of the E2E test app.
// It has no package.json, its dependencies are resolved from the node_modules of the Calendar app.
// Kept minimal on purpose, the app only needs TypeScript and the CSS of @nextcloud/vue.

import { defineConfig } from '@rspack/cli'
import { CssExtractRspackPlugin, DefinePlugin } from '@rspack/core'
import path from 'node:path'

const appDir = import.meta.dirname
const srcDir = path.join(appDir, 'src')

export default defineConfig({
	target: 'web',
	mode: 'development',
	devtool: 'source-map',

	entry: {
		'editor-extension': path.join(srcDir, 'editor-extension.ts'),
		reference: path.join(srcDir, 'reference.ts'),
	},

	output: {
		path: path.join(appDir, 'js'),
		// Loaded with `Util::addScript(Application::APP_ID, '<name>')`
		filename: '[name].js',
		clean: true,
	},

	module: {
		rules: [
			{
				test: /\.ts$/,
				exclude: [/node_modules/],
				loader: 'builtin:swc-loader',
				options: {
					jsc: {
						parser: {
							syntax: 'typescript',
						},
					},
				},
				type: 'javascript/auto',
			},
			{
				test: /\.css$/,
				use: [CssExtractRspackPlugin.loader, 'css-loader'],
				type: 'javascript/auto',
			},
		],
	},

	plugins: [
		// Loaded with `Util::addStyle(Application::APP_ID, '<name>')`
		new CssExtractRspackPlugin({
			filename: '../css/[name].css',
		}),
		new DefinePlugin({
			// See: https://vuejs.org/api/compile-time-flags.html
			__VUE_OPTIONS_API__: true,
			__VUE_PROD_DEVTOOLS__: false,
			__VUE_PROD_HYDRATION_MISMATCH_DETAILS__: false,
		}),
	],

	resolve: {
		extensions: ['.ts', '.js'],
	},
})
