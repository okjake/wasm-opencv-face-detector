const webpack = require('webpack');
const path = require('path');
const Html = require('html-webpack-plugin');

module.exports = {
  entry: [
    'babel-polyfill',
    path.resolve(__dirname, 'src', 'index.js')
  ],
  devtool: 'none',
  output: {
    path: path.join(__dirname, 'build'),
    filename: 'bundle.js'
  },
  plugins: [ new Html() ],
  module: {
    loaders: [
      {
        test: /index\.js$/,
        loader: 'babel-loader',
        include: path.resolve(__dirname, 'src', 'index.js'),
        options: {
          presets: ['@babel/preset-env']
        }
      }
    ]
  }
};
