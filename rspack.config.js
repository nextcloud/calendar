/*
 * SPDX-FileCopyrightText: 2026 Nextcloud GmbH and Nextcloud contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

const browserslistConfig = require('@nextcloud/browserslist-config')
const { RsdoctorRspackPlugin } = require('@rsdoctor/rspack-plugin')
const { defineConfig } = require('@rspack/cli')
const { CssExtractRspackPlugin, LightningCssMinimizerRspackPlugin, DefinePlugin, ProgressPlugin, SwcJsMinimizerRspackPlugin, IgnorePlugin } = require('@rspack/core')
const NodePolyfillPlugin = require('@rspack/plugin-node-polyfill')
const browserslist = require('browserslist')
const path = require('node:path')
const { VueLoaderPlugin } = require('vue-loader')

// browserslist-rs does not support baseline queries yet
// Manually resolving the browserslist config to the list of browsers with minimal versions
// See: https://github.com/browserslist/browserslist-rs/issues/40
const browsers = browserslist(browserslistConfig)
const minBrowserVersion = browsers
	.map((str) => str.split(' '))
	.reduce((minVersion, [browser, version]) => {
		minVersion[browser] = minVersion[browser] ? Math.min(minVersion[browser], parseFloat(version)) : parseFloat(version)
		return minVersion
	}, {})
const targets = Object.entries(minBrowserVersion).map(([browser, version]) => `${browser} >=${version}`).join(',')

const transpilePackages = [
	'p-limit',
	'p-defer',
	'p-queue',
	'p-try',
	'yocto-queue',
]

const shouldExcludeFromJsTranspile = (resourcePath) => {
	if (!resourcePath.includes(`${path.sep}node_modules${path.sep}`)) {
		return false
	}

	return !transpilePackages.some((moduleName) => resourcePath.includes(`${path.sep}node_modules${path.sep}${moduleName}${path.sep}`))
}

module.exports = defineConfig((env) => {
	const appName = process.env.npm_package_name
	const appVersion = process.env.npm_package_version

	const mode = (env.development && 'development') || (env.production && 'production') || process.env.NODE_ENV || 'production'
	const isDev = mode === 'development'
	process.env.NODE_ENV = mode

	console.info('Building', appName, appVersion, '\n')

	return {
		target: 'web',
		mode,
		devtool: isDev ? 'cheap-source-map' : 'source-map',
		stats: 'normal',

		entry: {
			main: path.join(__dirname, 'src', 'main.js'),
			reference: path.join(__dirname, 'src', 'reference.js'),
			'contacts-menu': path.join(__dirname, 'src', 'contactsMenu.js'),
			'appointments-booking': path.join(__dirname, 'src', 'appointments', 'main-booking.js'),
			'appointments-confirmation': path.join(__dirname, 'src', 'appointments', 'main-confirmation.js'),
			'appointments-overview': path.join(__dirname, 'src', 'appointments', 'main-overview.js'),
			'proposal-public': path.join(__dirname, 'src', 'proposal-public.ts'),
		},

		output: {
			path: path.resolve('./js'),
			filename: `${appName}-[name].js?v=[contenthash]`,
			chunkFilename: `${appName}-[name].js?v=[contenthash]`,
			publicPath: 'auto',
			assetModuleFilename: '[name].[ext]?v=[contenthash]',
			clean: true,
			devtoolNamespace: appName,
			devtoolModuleFilenameTemplate(info) {
				const rootDir = process.cwd()
				const rel = path.relative(rootDir, info.absoluteResourcePath)
				return `webpack:///${appName}/${rel}`
			},
		},

		optimization: {
			chunkIds: 'named',
			splitChunks: {
				automaticNameDelimiter: '-',
				cacheGroups: {
					defaultVendors: {
						reuseExistingChunk: true,
					},
				},
			},
			minimize: !isDev,
			minimizer: [
				new SwcJsMinimizerRspackPlugin({
					minimizerOptions: {
						targets,
					},
				}),
				new LightningCssMinimizerRspackPlugin({
					minimizerOptions: {
						targets,
					},
				}),
			],
		},

		module: {
			rules: [
				{
					test: /\.vue$/,
					loader: 'vue-loader',
					options: {
						experimentalInlineMatchResource: true,
					},
				},
				{
					test: /\.css$/,
					use: [
						'vue-style-loader',
						'css-loader',
					],
				},
				{
					test: /\.scss$/,
					use: [
						'vue-style-loader',
						'css-loader',
						'sass-loader',
					],
				},
				{
					test: /\.[cm]?js$/,
					exclude: shouldExcludeFromJsTranspile,
					loader: 'builtin:swc-loader',
					options: {
						jsc: {
							parser: {
								syntax: 'ecmascript',
							},
						},
						env: {
							targets,
						},
					},
					type: 'javascript/auto',
				},
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
						env: {
							targets,
						},
					},
					type: 'javascript/auto',
				},
				{
					test: /\.(png|jpe?g|gif|svg|webp)$/i,
					type: 'asset',
				},
				{
					test: /\.(woff2?|eot|ttf|otf)$/i,
					type: 'asset/resource',
				},
				{
					test: /\.wasm$/i,
					type: 'asset/resource',
				},
				{
					test: /\.tflite$/i,
					type: 'asset/resource',
				},
				{
					resourceQuery: /raw/,
					type: 'asset/source',
				},
				{
					resourceQuery: /url$/,
					type: 'asset/resource',
				},
			],
		},

		plugins: [
			new ProgressPlugin(),
			new VueLoaderPlugin(),
			new NodePolyfillPlugin(),
			new DefinePlugin({
				appName: JSON.stringify(appName),
				appVersion: JSON.stringify(appVersion),
				// Vue compile time flags
				// See: https://vuejs.org/api/compile-time-flags.html#compile-time-flags
				// See: https://github.com/vuejs/core/blob/v3.5.24/packages/vue/README.md#bundler-build-feature-flags
				// > The build will work without configuring these flags,
				// > however it is strongly recommended to properly configure them in order to get proper tree-shaking in the final bundle
				// Unlike Vite plugin, vue-loader does not do this automatically for Webpack
				// Although documentation says, it is optional, sometimes it breaks with:
				// ReferenceError: __VUE_PROD_DEVTOOLS__ is not defined
				__VUE_OPTIONS_API__: true,
				__VUE_PROD_DEVTOOLS__: false,
				__VUE_PROD_HYDRATION_MISMATCH_DETAILS__: false,
			}),
			new IgnorePlugin({
				resourceRegExp: /^\.\/locale$/,
				contextRegExp: /moment$/,
			}),
			process.env.RSDOCTOR && new RsdoctorRspackPlugin(),
		],

		resolve: {
			extensions: ['*', '.tsx', '.ts', '.js', '.vue', '.json'],
			symlinks: false,
			alias: {
				'@': path.resolve(__dirname, 'src'),
			},
			fallback: {
				fs: false,
			},
		},

		cache: true,
	}
})