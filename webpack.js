const path = require('path')
const webpack = require('webpack')
const md5 = require('md5')

const webpackConfig = require('@nextcloud/webpack-vue-config')
const webpackRules = require('@nextcloud/webpack-vue-config/rules')
const BabelLoaderExcludeNodeModulesExcept = require('babel-loader-exclude-node-modules-except')
const IconfontPlugin = require('iconfont-plugin-webpack')

const appVersion = JSON.stringify(process.env.npm_package_version)

// Add dashboard entry
webpackConfig.entry.dashboard = path.join(__dirname, 'src', 'dashboard.js')

// Edit JS rule
webpackRules.RULE_JS.test = /\.m?js$/
webpackRules.RULE_JS.exclude = BabelLoaderExcludeNodeModulesExcept([
	'p-limit',
	'p-defer',
	'p-queue',
	'p-try',
	'cdav-library',
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
],

webpackConfig.plugins.push(
	new IconfontPlugin({
		src: './src/assets/iconfont',
		family: `iconfont-calendar-app-${md5(appVersion)}`,
		dest: {
			font: './src/fonts/[family].[type]',
			css: './src/fonts/scss/iconfont-calendar-app.scss'
		},
		watch: {
			pattern: './src/assets/iconfont/*.svg'
		}
	}),
	new webpack.IgnorePlugin(/^\.\/locale(s)?$/, /(moment)$/)
)

module.exports = webpackConfig
