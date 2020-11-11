'use strict'

const merge = require('webpack-merge');
const baseConfig = require('./webpack.config.base');
const MiniCssExtractPlugin  = require('mini-css-extract-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const TerserPlugin = require('terser-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const utils = require('./utils')
const SentryWebpackPlugin = require("@sentry/webpack-plugin");
var PACKAGE = require('../package.json');
var version = PACKAGE.version;

module.exports = merge(baseConfig, {
  mode: 'development',

  output: {
    filename: '[name].[hash].js',   
  },
  devtool: "source-map",
  optimization: {
    minimize: true,
    minimizer: [
      new TerserPlugin({
        sourceMap: true, // Must be set to true if using source-maps in production
        terserOptions: {
          compress: {
            drop_console: true,
          },
        },
      }),
    ],
    splitChunks: {
      cacheGroups: {
        commons: {
          test: /[\\/]node_modules[\\/]/,
          name: "vendor",
          chunks: "all",
        },
      },
    },
  },
  module: {
    rules: [
      {
        test: /\.(sa|sc|c)ss$/,
        use: [
          MiniCssExtractPlugin.loader,
          //'vue-style-loader',
          'css-loader',
          'sass-loader'
        ]
      },

    ]
  },
  plugins: [
    new CleanWebpackPlugin(),
    new MiniCssExtractPlugin({
       // Options similar to the same options in webpackOptions.output
      // both options are optional
      filename: '[name].[hash].css',
      chunkFilename: '[id].[hash].css',
    }),
    new CopyWebpackPlugin([{
      //copy sitemap and robots.txt
      from: utils.resolve('src/assets/beta'),
      to: utils.resolve('dist'),
      toType: 'dir'
    }]),
    new SentryWebpackPlugin({
      // sentry-cli configuration
      authToken: process.env.SENTRY_AUTH_TOKEN,
      org: "darktier-studios",
      project: "fatecharactersheet",
      //dist: version,
      release: version,
      validate: true,
      debug: true,
      deploy: {
        env: "development",
        name: version,
      },
      // webpack specific configuration
      include: ["./dist"],
      ignore: ["node_modules", "webpack.config.*.js"],
    }),
  ]
})
