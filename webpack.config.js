const path = require('path')
const webpack = require('webpack')
const md5 = require('md5')

const { VueLoaderPlugin } = require('vue-loader')
const NodePolyfillPlugin = require('node-polyfill-webpack-plugin')
const TerserPlugin = require('terser-webpack-plugin')
const BabelLoaderExcludeNodeModulesExcept = require('babel-loader-exclude-node-modules-except')
const IconfontPlugin = require('iconfont-plugin-webpack')
const HtmlWebpackPlugin = require('html-webpack-plugin')

const appName = process.env.npm_package_name
const appVersion = JSON.stringify(process.env.npm_package_version)
const buildMode = process.env.NODE_ENV
const isDev = buildMode === 'development'
console.info('Building', appName, appVersion, '\n')
const nextcloudproxyheader = {Cookie : 'oc_sessionPassphrase=P2fxAZiU9AMQnQ7BmTwl97Z44lbT5qi4220o41mZjQTXnlSgn4XSrBKHzz8BRPJ5ohgEjyTrGDm%2F4ZAwIyA06aeqJJqd4509bejOH%2F6jzGKrjwbi%2FwLYydq64I0jtFg8; nc_sameSiteCookielax=true; nc_sameSiteCookiestrict=true; ocb41rjp85zh=5243183c1f8d685e98eabec9075f9e2c; nc_username=panxf; nc_token=UXRtpcAy8kG2V%2BLvOaLkPGIijV71fAhG; nc_session_id=5243183c1f8d685e98eabec9075f9e2c'};
const nextcloudproxytarget = 'http://43.142.154.107:8080/'
const bedeproxytarget = 'http://10.32.20.145:8080/'
const bedeproxyheader = {Authorization: 'Basic dmJlZGU6YmVkZXdvcms='};
proxytarget = bedeproxytarget
proxyheader = bedeproxyheader

module.exports = {
	target: 'web',
	mode: buildMode,
	devtool: isDev ? 'cheap-source-map' : 'source-map',

	entry: {
		main: path.resolve(path.join('src', 'main.js')),
		// Add dashboard entry
        dashboard: path.join(__dirname, 'src', 'dashboard.js'),

		// Add appointments entries,
		appointmentsbooking: path.join(__dirname, 'src', 'appointments/main-booking.js'),
		appointmentsconfirmation: path.join(__dirname, 'src', 'appointments/main-confirmation.js'),
		appointmentsconflict: path.join(__dirname, 'src', 'appointments/main-conflict.js'),
		appointmentsoverview : path.join(__dirname, 'src', 'appointments/main-overview.js'),
	},
	output: {
		path: path.resolve('./js'),
		publicPath: path.join('/apps/', appName, '/js/'),
		filename: `${appName}-[name].js?v=[contenthash]`,
		chunkFilename: `${appName}-[name].js?v=[contenthash]`,
		// Make sure sourcemaps have a proper path and do not
		// leak local paths https://github.com/webpack/webpack/issues/3603
		devtoolNamespace: appName,
		devtoolModuleFilenameTemplate(info) {
			const rootDir = process.cwd()
			const rel = path.relative(rootDir, info.absoluteResourcePath)
			return `webpack:///${appName}/${rel}`
		},
	},
	infrastructureLogging: {
		debug: [name => name.includes('webpack-dev-server')],
	},

	devServer: {
		hot: false,
		host: '127.0.0.1',
		port: 3000,
		client: {
			overlay: false,
		},
		devMiddleware: {
			writeToDisk: true,
		},
		headers: {
			'Access-Control-Allow-Origin': '*',
		},
		proxy: {
			'//remote.php/dav/': {
				target: proxytarget,	
				pathRewrite: {'^//remote.php/dav/':'/ucaldav/'},
				changeOrigin: true,
        		logLevel: 'debug',
				headers: proxyheader,
				onProxyReq: proxyReq => {
					// Browers may send Origin headers even with same-origin
					// requests. To prevent CORS issues, we have to change
					// the Origin to match the target URL.
					if (proxyReq.getHeader('origin')) {
					  proxyReq.setHeader('origin', proxytarget);
					}
				}
			},
			'/remote.php/dav/': {
				target: proxytarget,	
				pathRewrite: {'^/remote.php/dav/':'/ucaldav/'},
				changeOrigin: true,
        		logLevel: 'debug',
				headers: proxyheader,
				onProxyReq: proxyReq => {
					// Browers may send Origin headers even with same-origin
					// requests. To prevent CORS issues, we have to change
					// the Origin to match the target URL.
					if (proxyReq.getHeader('origin')) {
					  proxyReq.setHeader('origin', proxytarget);
					}
				}
			},
			'/ucaldav/user/vbede/personal/': {
				//target: 'http://43.142.154.107:8080/',	
				target: 'http://10.32.20.145:8080/',	
				//pathRewrite: {'^/remote.php/dav/':'/ucaldav/'},
				changeOrigin: true,
        		logLevel: 'debug',
				headers: {Authorization: 'Basic dmJlZGU6YmVkZXdvcms='},
				//headers: {Cookie: 'oc_sessionPassphrase=%2B6JUSF%2FsOqMrBeARgldFk2Wh8%2BSgnkth3nAeFfgCdfOx5VZstbAkuoxFrn5XjJtW1DsLLlYv2p7XxiLzkr6n1A6RTiaX%2B9gLt0s19B9DqbJM8PUpF2ymc%2BGZnTVBe46s; nc_sameSiteCookielax=true; nc_sameSiteCookiestrict=true; nc_username=panxf; ocb41rjp85zh=31a667e4cee37c98abaf4e7fb49dc8d2; nc_token=GG2%2BQwkGXQnVifgf9HMCRVUEobwm573J; nc_session_id=31a667e4cee37c98abaf4e7fb49dc8d2'},
				onProxyReq: (proxyReq,req) => {
					// Browers may send Origin headers even with same-origin
					// requests. To prevent CORS issues, we have to change
					// the Origin to match the target URL.
					console.log(req)
					if (proxyReq.getHeader('origin')) {
					  proxyReq.setHeader('origin', 'http://10.32.20.145:8080/');
					}
				}
			},
			'/ucaldav/user/vbede': {
				//target: 'http://43.142.154.107:8080/',	
				target: 'http://10.32.20.145:8080/',	
				//pathRewrite: {'^/ucaldav/user/vbede':'/ucaldav/user/vbede/calendar'},
				//pathRewrite: {'^/ucaldav/user/vbede':'/ucaldav/user/vbede/calendar'},
				changeOrigin: true,
        		logLevel: 'debug',
				headers: {Authorization: 'Basic dmJlZGU6YmVkZXdvcms='},
				//headers: {Cookie: 'oc_sessionPassphrase=%2B6JUSF%2FsOqMrBeARgldFk2Wh8%2BSgnkth3nAeFfgCdfOx5VZstbAkuoxFrn5XjJtW1DsLLlYv2p7XxiLzkr6n1A6RTiaX%2B9gLt0s19B9DqbJM8PUpF2ymc%2BGZnTVBe46s; nc_sameSiteCookielax=true; nc_sameSiteCookiestrict=true; nc_username=panxf; ocb41rjp85zh=31a667e4cee37c98abaf4e7fb49dc8d2; nc_token=GG2%2BQwkGXQnVifgf9HMCRVUEobwm573J; nc_session_id=31a667e4cee37c98abaf4e7fb49dc8d2'},
				onProxyReq: (proxyReq,req) => {
					// Browers may send Origin headers even with same-origin
					// requests. To prevent CORS issues, we have to change
					// the Origin to match the target URL.
					console.log(req)
					if (proxyReq.getHeader('origin')) {
					  proxyReq.setHeader('origin', 'http://10.32.20.145:8080/');
					}
				}
			},
			'/ucaldav/': {
				//target: 'http://43.142.154.107:8080/',	
				target: 'http://10.32.20.145:8080/',	
				//pathRewrite: {'^/remote.php/dav/':'/ucaldav/'},
				changeOrigin: true,
        		logLevel: 'debug',
				headers: {Authorization: 'Basic dmJlZGU6YmVkZXdvcms='},
				//headers: {Cookie: 'oc_sessionPassphrase=%2B6JUSF%2FsOqMrBeARgldFk2Wh8%2BSgnkth3nAeFfgCdfOx5VZstbAkuoxFrn5XjJtW1DsLLlYv2p7XxiLzkr6n1A6RTiaX%2B9gLt0s19B9DqbJM8PUpF2ymc%2BGZnTVBe46s; nc_sameSiteCookielax=true; nc_sameSiteCookiestrict=true; nc_username=panxf; ocb41rjp85zh=31a667e4cee37c98abaf4e7fb49dc8d2; nc_token=GG2%2BQwkGXQnVifgf9HMCRVUEobwm573J; nc_session_id=31a667e4cee37c98abaf4e7fb49dc8d2'},
				onProxyReq: proxyReq => {
					// Browers may send Origin headers even with same-origin
					// requests. To prevent CORS issues, we have to change
					// the Origin to match the target URL.
					if (proxyReq.getHeader('origin')) {
					  //proxyReq.setHeader('origin', 'http://43.142.154.107:8080/');
					  proxyReq.setHeader('origin', 'http://10.32.20.145:8080/');
					}
				}
			},


		},
	},
	
	optimization: {
		chunkIds: 'named',
		splitChunks: {
			automaticNameDelimiter: '-',
		},
		minimize: !isDev,
		minimizer: [
			new TerserPlugin({
				terserOptions: {
					output: {
						comments: false,
					}
				},
				extractComments: true,
			}),
		],
	},

	module: {
		rules: [
			{
				test: /\.css$/,
				use: ['style-loader', 'css-loader'],
			},
			{
				test: /\.scss$/,
				use:  [
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
			},
			{
				test: /\.vue$/,
				loader: 'vue-loader',
			},
			{
				test: /\.m?js$/,
				loader: 'babel-loader',
				exclude: BabelLoaderExcludeNodeModulesExcept([
					'p-limit',
					'p-defer',
					'p-queue',
					'p-try',
					'yocto-queue',
				]),
			},
			{
				test: /\.(png|jpe?g|gif|svg|woff2?|eot|ttf)$/,
				type: 'asset/inline',
			},
		],
	},

	plugins: [
		new VueLoaderPlugin(),

		// Make sure we auto-inject node polyfills on demand
		// https://webpack.js.org/blog/2020-10-10-webpack-5-release/#automatic-nodejs-polyfills-removed
		new NodePolyfillPlugin(),
		new HtmlWebpackPlugin({template: "./templates/index.html",}),

		// Make appName & appVersion available as a constant
		new webpack.DefinePlugin({ appName: JSON.stringify(appName) }),
		new webpack.DefinePlugin({ appVersion: JSON.stringify(appVersion) }),
		new IconfontPlugin({
			src: './src/assets/iconfont',
			family: `iconfont-calendar-app-${md5(appVersion)}`,
			dest: {
				font: './src/fonts/[family].[type]',
				css: './src/fonts/scss/iconfont-calendar-app.scss',
			},
			watch: {
				pattern: './src/assets/iconfont/*.svg',
			},
		}),
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
	],

	resolve: {
		extensions: ['*', '.js', '.vue'],
		symlinks: false,
	},
}

