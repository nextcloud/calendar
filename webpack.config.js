const path = require('path')
const webpack = require('webpack')

const webpackConfig = require('@nextcloud/webpack-vue-config')
const webpackRules = require('@nextcloud/webpack-vue-config/rules')
const BabelLoaderExcludeNodeModulesExcept = require('babel-loader-exclude-node-modules-except')

// Add dashboard entry
webpackConfig.entry.dashboard = path.join(__dirname, 'src', 'dashboard.js')

// Add appointments entries
webpackConfig.entry['appointments-booking'] = path.join(__dirname, 'src', 'appointments/main-booking.js')
webpackConfig.entry['appointments-confirmation'] = path.join(__dirname, 'src', 'appointments/main-confirmation.js')
webpackConfig.entry['appointments-conflict'] = path.join(__dirname, 'src', 'appointments/main-conflict.js')
webpackConfig.entry['appointments-overview'] = path.join(__dirname, 'src', 'appointments/main-overview.js')

// Edit JS rule
webpackRules.RULE_JS.test = /\.m?js$/
webpackRules.RULE_JS.exclude = BabelLoaderExcludeNodeModulesExcept([
	'p-limit',
	'p-defer',
	'p-queue',
	'p-try',
	'yocto-queue',
])

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

webpackConfig.plugins.push(
	new webpack.IgnorePlugin({
		resourceRegExp: /^\.\/locale$/,
		contextRegExp: /moment$/,
	}),
	new webpack.ProvidePlugin({
		// Shim ICAL to prevent using the global object (window.ICAL).
		// The library ical.js heavily depends on instanceof checks which will
		// break if two separate versions of the library are used (e.g. bundled one
		// and global one).
		ICAL: 'ical.js',
	}),
)

module.exports = webpackConfig
