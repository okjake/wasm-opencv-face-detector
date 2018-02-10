const webpack = require('webpack');
const UglifyJsPlugin = webpack.optimize.UglifyJsPlugin;

const env = process.env.WEBPACK_ENV;
const plugins = [];

const name = 'wasm-opencv-face-detector';

if (env === 'build') {
  plugins.push(new UglifyJsPlugin({ minimize: true }));
  outputFile = name + '.min.js';
} else {
  outputFile = name + '.js';
}

module.exports = {
  entry: ['babel-polyfill', __dirname + '/src/index.js'],
  entry: __dirname + '/src/index.js',
  devtool: 'source-map',
  output: {
    path: __dirname + '/lib',
    filename: outputFile,
    libraryTarget: 'umd',
    umdNamedDefine: true
  },
  node: { fs: 'empty' },
  module: {
    loaders: [
      {
        test: /\.js$/,
        loader: 'babel-loader',
        exclude: /node_modules/,
        options: {
          presets: ['@babel/preset-env']
        }
      },
      {
        test: /\.xml$/,
        loader: 'raw-loader',
        exclude: /node_modules/
      }
    ]
  },
  plugins: plugins
};
