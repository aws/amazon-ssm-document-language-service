/*!
 * Copyright 2020 Amazon.com, Inc. or its affiliates. All Rights Reserved.
 * SPDX-License-Identifier: Apache-2.0
 */
'use strict'

const path = require('path')
const TerserPlugin = require('terser-webpack-plugin')
const CircularDependencyPlugin = require('circular-dependency-plugin')

/**@type {import('webpack').Configuration}*/
const config = {
    target: 'node',
    entry: {
        server: './src/ssmServer.ts'
    },
    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: '[name].js',
        libraryTarget: 'commonjs2',
        devtoolModuleFilenameTemplate: '../[resource-path]',
    },
    devtool: 'source-map',
    externals: {
        vscode: 'commonjs vscode',
        // "yaml-language-service" has an optional dependency to "prettier", ignoring it since we are not using that functionality for now
        prettier: 'require(\'prettier\')',
    },
    resolve: {
        extensions: ['.ts', '.js'],
        alias: {
            // webpack can't bundle yaml-language-server because it is importing UMD modules from vscode-json-languageservice
            "vscode-json-languageservice/lib/umd": "vscode-json-languageservice/lib/esm"
        },
        modules: ['node_modules']
    },
    module: {
        rules: [
            {
                test: /\.ts$/,
                exclude: /node_modules/,
                use: [
                    {
                        loader: 'ts-loader',
                        options: {
                            compilerOptions: {
                                sourceMap: true,
                            },
                        },
                    },
                ],
            },
        ],
    },
    plugins: [
        new CircularDependencyPlugin({
            exclude: /(node_modules|src\/util|src\/ssmLanguageService\.ts|src\/ssmServer\.ts)/,
            failOnError: true,
        }),
    ],
    optimization: {
        minimize: true,
        minimizer: [new TerserPlugin()],
    }
}

module.exports = config;