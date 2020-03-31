'use strict'

const merge = require('webpack-merge')
const baseConfig = require('./webpack.config.base')
const MiniCssExtractPlugin  = require('mini-css-extract-plugin')
const { CleanWebpackPlugin } = require('clean-webpack-plugin');

module.exports = merge(baseConfig, {
  mode: 'production',
  optimization: {
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
        test: /\.css?$/,
        use: [
          MiniCssExtractPlugin.loader, 
          'css-loader'
        ]
      }, {
        test: /\.styl(us)?$/,
        use: [
          MiniCssExtractPlugin.loader, 
          'css-loader', 
          'stylus-loader'
        ]
      },
      {
        test: /\.s[ac]ss$/i,
        use: [
          MiniCssExtractPlugin.loader,
          'vue-style-loader',
          'css-loader',
          'sass-loader'
        ]
      },
    ]
  },
  plugins: [
    new CleanWebpackPlugin(),
    new MiniCssExtractPlugin({
      filename: 'main.css'
    })
  ]
})