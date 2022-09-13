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

module.exports = {
	target: 'web',
	mode: buildMode,
	devtool: isDev ? 'cheap-source-map' : 'source-map',

	entry: {
		main: path.resolve(path.join('src', 'main.js')),
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
				target: 'http://43.142.154.107:8080/',	
				//target: 'http://10.32.20.145:8080/',	
				//pathRewrite: {'^//remote.php/dav/':'/ucaldav/'},
				changeOrigin: true,
        		logLevel: 'debug',
				//headers: {Authorization: 'Basic dmJlZGU6YmVkZXdvcms='},
				headers: {Cookie: 'oc_sessionPassphrase=5UkCgPP2AI03QdYpqz6kQIWXrxs5sq9nW825yRvhui2l0%2F0pBEDNgzcOa46rRtkRHctiLWap49mqaUl%2Fd7fBv90sOtb3SE8voIJ4zledaJ3%2Bo7XEVrALI0c4j4xwP224; nc_sameSiteCookielax=true; nc_sameSiteCookiestrict=true; ocb41rjp85zh=8b43b66894cccaf95c1e089a46f30a26; nc_username=panxf; nc_token=%2BkRlO7A5WK%2FBFMMEejnzTQz5zgb%2FVegR; nc_session_id=8b43b66894cccaf95c1e089a46f30a26'},
				onProxyReq: proxyReq => {
					// Browers may send Origin headers even with same-origin
					// requests. To prevent CORS issues, we have to change
					// the Origin to match the target URL.
					if (proxyReq.getHeader('origin')) {
					  proxyReq.setHeader('origin', 'http://43.142.154.107:8080/');
					  //proxyReq.setHeader('origin', 'http://10.32.20.145:8080/');
					}
				}
			},
			'/remote.php/dav/': {
				target: 'http://43.142.154.107:8080/',	
				//target: 'http://10.32.20.145:8080/',	
				//pathRewrite: {'^/remote.php/dav/':'/ucaldav/'},
				changeOrigin: true,
        		logLevel: 'debug',
				//headers: {Authorization: 'Basic dmJlZGU6YmVkZXdvcms='},
				headers: {Cookie: 'oc_sessionPassphrase=5UkCgPP2AI03QdYpqz6kQIWXrxs5sq9nW825yRvhui2l0%2F0pBEDNgzcOa46rRtkRHctiLWap49mqaUl%2Fd7fBv90sOtb3SE8voIJ4zledaJ3%2Bo7XEVrALI0c4j4xwP224; nc_sameSiteCookielax=true; nc_sameSiteCookiestrict=true; ocb41rjp85zh=8b43b66894cccaf95c1e089a46f30a26; nc_username=panxf; nc_token=%2BkRlO7A5WK%2FBFMMEejnzTQz5zgb%2FVegR; nc_session_id=8b43b66894cccaf95c1e089a46f30a26'},
				onProxyReq: proxyReq => {
					// Browers may send Origin headers even with same-origin
					// requests. To prevent CORS issues, we have to change
					// the Origin to match the target URL.
					if (proxyReq.getHeader('origin')) {
					  proxyReq.setHeader('origin', 'http://43.142.154.107:8080/');
					  //proxyReq.setHeader('origin', 'http://10.32.20.145:8080/');
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
					  //proxyReq.setHeader('origin', 'http://43.142.154.107:8080/');
					  proxyReq.setHeader('origin', 'http://10.32.20.145:8080/');
					}

					if ( req.method == "PROPFIND" && req.body ) {
						delete req.body;
						let body= '<x0:propfind xmlns:x0="DAV:"><x0:prop><x0:getcontenttype/><x0:getetag/><x0:resourcetype/><x0:displayname/><x0:owner/><x0:resourcetype/><x0:sync-token/><x0:current-user-privilege-set/><x0:getcontenttype/><x0:getetag/><x0:resourcetype/><x1:calendar-data xmlns:x1="urn:ietf:params:xml:ns:caldav"/></x0:prop></x0:propfind>'
						proxyReq.setHeader( 'content-length', body.length );

						// Write out body changes to the proxyReq stream
						proxyReq.write( body );
						proxyReq.end();
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

