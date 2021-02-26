const path = require('path')
const webpack = require('webpack')
const { VueLoaderPlugin } = require('vue-loader')

const IconfontPlugin = require('iconfont-plugin-webpack')

const md5 = require('md5')
const appVersion = JSON.stringify(process.env.npm_package_version)
const versionHash = md5(appVersion).substr(0, 7)
const SCOPE_VERSION = JSON.stringify(versionHash)
const ICONFONT_NAME = `iconfont-calendar-app-${versionHash}`

module.exports = {
	entry: {
		calendar: path.join(__dirname, 'src', 'main.js'),
		dashboard: path.join(__dirname, 'src', 'dashboard.js'),
	},
	output: {
		path: path.resolve(__dirname, './js'),
		publicPath: '/js/',
		filename: '[name].js',
		chunkFilename: 'chunks/calendar.[name].[contenthash].js'
	},
	module: {
		rules: [
			{
				test: /\.css$/,
				use: ['vue-style-loader', 'css-loader', 'resolve-url-loader']
			},
			{
				test: /\.scss$/,
				use: [
					'vue-style-loader',
					'css-loader',
					'resolve-url-loader',
					{
						loader: 'sass-loader',
						options: {
							additionalData: `$scope_version:${SCOPE_VERSION};`,
							/**
							 * ! needed for resolve-url-loader
							 */
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
			},
			{
				test: /\.vue$/,
				loader: 'vue-loader'
			},
			{
				test: /\.js$/,
				use: {
					loader: 'babel-loader',
					options: {
						plugins: [
							'@babel/plugin-syntax-dynamic-import',
							'@babel/plugin-proposal-object-rest-spread'
						],
						presets: ['@babel/preset-env']
					}
				},
				exclude: /node_modules\/(?!(p-limit|p-defer|p-queue|p-try|cdav-library|calendar-js))/
			},
			{
				test: /\.(png|jpg|gif|svg|eot|ttf|woff|woff2)$/i,
				loader: 'url-loader'
			}
		]
	},
	plugins: [
		new IconfontPlugin({
			src: './src/assets/iconfont',
			family: ICONFONT_NAME,
			dest: {
				font: './src/fonts/[family].[type]',
				css: './src/fonts/scss/iconfont-calendar-app.scss'
			},
			watch: {
				pattern: './src/assets/iconfont/*.svg'
			}
		}),
		new VueLoaderPlugin(),
		new webpack.IgnorePlugin(/^\.\/locale(s)?$/, /(moment)$/),
		new webpack.DefinePlugin({
			appVersion: JSON.stringify(require('./package.json').version)
		})
	],
	resolve: {
		extensions: ['*', '.js', '.vue', '.json'],
		symlinks: false,
	}
}
