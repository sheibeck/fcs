'use strict'

const HtmlWebpackPlugin = require('html-webpack-plugin')
const CopyWebpackPlugin = require('copy-webpack-plugin')
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const { VueLoaderPlugin } = require('vue-loader')

const utils = require('./utils')

module.exports = {  
  resolve: {
    extensions: ['.js', '.vue', '.json'],
    alias: {
      'assets': utils.resolve('src/assets'),
      //'pages': utils.resolve('src/pages'),YT
      'static': utils.resolve('static'),
      'components': utils.resolve('src/components'),
      'vue': 'vue/dist/vue.js'
    }
  },

  module: {
    rules: [
      /*{
        test: /\.(js|vue)$/,
        use: 'eslint-loader',
        enforce: 'pre'
      },*/
      {
        test: /\.vue$/,
        use: 'vue-loader'
      }, {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
        }
      }, {
        test: /\.(png|jpe?g|gif|svg)(\?.*)?$/,
        use: {
          loader: 'url-loader',
          options: {
            limit: 10000,
            name: utils.assetsPath('img/[name].[ext]'),
            esModule: false,
          }
        }
      }, {
        test: /\.(mp4|webm|ogg|mp3|wav|flac|aac)(\?.*)?$/,
        use: {
          loader: 'url-loader',
          options: {
            limit: 10000,
            name: utils.assetsPath('media/[name].[hash:7].[ext]')
          }
        }
      }, {
        test: /\.(woff2?|eot|ttf|otf)(\?.*)?$/,
        use: {
          loader: 'url-loader',
          options: {
            limit: 10000,
            name: utils.assetsPath('fonts/[name].[hash:7].[ext]')
          }
        }
      }
    ]
  },

  plugins: [
    new CleanWebpackPlugin(),
    new HtmlWebpackPlugin({
      filename: 'index.html',
      template: 'index.html',
      inject: false,      
    }),
    new VueLoaderPlugin(),
    new CopyWebpackPlugin([{      
      from: utils.resolve('static'),
      to: utils.resolve('dist/static'),
      toType: 'dir'    
    }])
  ]
}