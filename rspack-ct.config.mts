/*
 * SPDX-FileCopyrightText: 2026 Nextcloud GmbH and Nextcloud contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import type { RspackOptions } from '@rspack/core'

import { defineConfig } from '@rspack/cli'
import { CssExtractRspackPlugin, HtmlRspackPlugin } from '@rspack/core'
import path from 'node:path'
import createBaseConfig from './rspack.config.js'

const componentTestsDir = path.join(import.meta.dirname, 'tests', 'javascript', 'component')
const gallerySrcDir = path.join(componentTestsDir, 'gallery')

export default defineConfig((env, argv) => {
	const base = createBaseConfig({ ...env, development: true }, argv) as RspackOptions

	return {
		...base,
		entry: { gallery: path.join(gallerySrcDir, 'main.ts') },
		plugins: [
			...(base.plugins ?? [])
				// Replace `CssExtractRspackPlugin`
				// because it outputs CSS in `./js/../css`.
				// This works for building.
				// But it breask when serving
				// because paths outside `./js/` are not served.
				.filter((p) => p && p.constructor.name !== 'CssExtractRspackPlugin'),
			new CssExtractRspackPlugin({
				filename: 'css/[name].css',
				ignoreOrder: true,
			}),
			new HtmlRspackPlugin({
				template: path.join(gallerySrcDir, 'index.html'),
				filename: 'index.html',
			}),
		],

		devServer: {
			port: 5173,
			hot: true,
			static: { directory: gallerySrcDir, publicPath: '/' },
		},
	}
})
