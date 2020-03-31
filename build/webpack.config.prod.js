'use strict'

const merge = require('webpack-merge')
const baseConfig = require('./webpack.config.base')
const MiniCssExtractPlugin  = require('mini-css-extract-plugin')
const { CleanWebpackPlugin } = require('clean-webpack-plugin');

module.exports = merge(baseConfig, {
  mode: 'production',
  
  output: {    
    filename: '[name].[hash].js',
    publicPath: "/",
  }, 

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
    })
  ]
})