const path = require('path')
const webpack = require('webpack')
const { VueLoaderPlugin } = require('vue-loader')
const StyleLintPlugin = require('stylelint-webpack-plugin')

module.exports = {
	entry: path.join(__dirname, 'src', 'main.js'),
	output: {
		path: path.resolve(__dirname, './js'),
		publicPath: '/js/',
		filename: 'calendar.js',
		chunkFilename: 'chunks/calendar.[name].[contenthash].js'
	},
	module: {
		rules: [
			{
				test: /\.css$/,
				use: ['vue-style-loader', 'css-loader']
			},
			{
				test: /\.scss$/,
				use: ['vue-style-loader', 'css-loader', 'sass-loader']
			},
			{
				test: /src\/.*\.(js|vue)$/,
				use: 'eslint-loader',
				enforce: 'pre'
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
				test: /\.(png|jpg|gif|svg)$/,
				loader: 'url-loader'
			}
		]
	},
	plugins: [
		new VueLoaderPlugin(),
		new StyleLintPlugin(),
		new webpack.IgnorePlugin(/^\.\/locale(s)?$/, /(@fullcalendar\/core)$|(moment)$/),
		new webpack.DefinePlugin({
			appVersion: JSON.stringify(require('./package.json').version)
		})
	],
	resolve: {
		alias: {
			Components: path.resolve(__dirname, 'src/components/'),
			Mixins: path.resolve(__dirname, 'src/mixins/'),
			Models: path.resolve(__dirname, 'src/models/'),
			Services: path.resolve(__dirname, 'src/services/'),
			Store: path.resolve(__dirname, 'src/store/'),
			Views: path.resolve(__dirname, 'src/views/')
		},
		extensions: ['*', '.js', '.vue', '.json']
	}
}
