/*
 *  Copyright 2017 Adobe Systems Incorporated. All rights reserved.
 *  This file is licensed to you under the Apache License, Version 2.0 (the "License");
 *  you may not use this file except in compliance with the License. You may obtain a copy
 *  of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 *  Unless required by applicable law or agreed to in writing, software distributed under
 *  the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 *  OF ANY KIND, either express or implied. See the License for the specific language
 *  governing permissions and limitations under the License.
 *
 */

const HtmlWebpackPlugin = require('html-webpack-plugin');
const autoprefixer = require('autoprefixer');
const path = require('path');
const webpack = require('webpack');

const isProduction = process.env.NODE_ENV === 'production';
const browserTargets = 'last 2 versions';

// TODO: We should use the proper base class for the TwistConfiguration, rather than hacking this here
const autoImport = {};
const config = {
    addDecorator: (name, opts) => {
        opts.module = __dirname + '/index'; // Hack because @twist/core isn't defined
        if (opts.inherits) {
            opts.inherits.module = opts.module;
        }
        autoImport[name] = opts;
        return config;
    }
};
require('./config')(config);

module.exports = {
    context: __dirname,
    entry: './example/Main.jsx',
    devServer: {
        contentBase: path.join(__dirname, 'build'),
        compress: true,
        port: 9000
    },
    resolve: {
        extensions: [ '.js', '.jsx' ],
        alias: {
            src: './src'
        },
    },
    output: {
        path: path.join(__dirname, 'build'),
        filename: '[name].js'
    },
    devtool: isProduction ? 'source-map' : 'cheap-module-eval-source-map',
    module: {
        rules: [ {
            test: /\.jsx$/,
            use: {
                loader: 'babel-loader',
                options: {
                    presets: [
                        [ 'env', { targets: { browsers: browserTargets } } ]
                    ],
                    plugins: [
                        [ '@twist/babel-plugin-transform', { autoImport } ],
                        'transform-decorators-legacy',
                        'transform-class-properties',
                        process.env.NODE_ENV === 'test' && 'istanbul'
                    ].filter(x => x),
                    sourceMaps: !isProduction
                }
            }
        }, {
            test: /\.css$/,
            use: [ {
                loader: 'style-loader'
            }, {
                loader: 'css-loader',
                options: { sourceMap: !isProduction, importLoaders: 1 }
            }, {
                loader: 'postcss-loader',
                options: { plugins: [ autoprefixer(browserTargets) ] }
            } ]
        }, {
            test: /\.less$/,
            use: [ {
                loader: 'style-loader'
            }, {
                loader: 'css-loader',
                options: { sourceMap: !isProduction, importLoaders: 1 }
            }, {
                loader: 'postcss-loader',
                options: { plugins: [ autoprefixer(browserTargets) ] }
            }, {
                loader: 'less-loader',
                options: { sourceMap: !isProduction }
            } ]
        }, {
            test: /\.(gif|png|jpg|svg|eot|woff|woff2|ttf|mp4|cur)$/,
            loader: 'file-loader'
        } ]
    },
    plugins: [
        new webpack.DefinePlugin({
            'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV),
        }),
        new webpack.optimize.UglifyJsPlugin({ sourceMap: !isProduction }),
        new HtmlWebpackPlugin({ title: 'sample-project' })
    ]
};
