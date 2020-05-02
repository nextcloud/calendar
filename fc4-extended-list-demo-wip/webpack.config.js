const { VueLoaderPlugin } = require('vue-loader')

module.exports = {
  mode: 'development',
  entry: './main.js',
  module: {
    rules: [
      {
        test: /\.vue$/,
        use: 'vue-loader'
      },
      {
        test: /\.scss$/,
        use: [
          'vue-style-loader',
          'css-loader',
          'sass-loader'
        ]
      },
      {
        test: /\.js$/,
        use: [ 'source-map-loader' ],
        enforce: 'pre'
      }
    ]
  },
  plugins: [
    new VueLoaderPlugin()
  ],
  devtool: 'source-map'
}
