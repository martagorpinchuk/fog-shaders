
const path = require('path');
const webpack = require('webpack');
const CopyWebpackPlugin = require('copy-webpack-plugin');

//

module.exports = conf = {
    devtool: false,
    mode: 'development',
    watchOptions: {
        poll: 500
    },
    entry: {
        main: './src/scripts/index.tsx'
    },
    resolve: {
        extensions: [ '.ts', '.tsx', '.js' ]
    },
    module: {
        rules: [
            {
                test: /\.ts?$/,
                use: [{
                    loader: 'ts-loader',
                    options: {
                        configFile: 'tsconfig.webpack.json',
                        onlyCompileBundledFiles: true
                    }
                }],
                exclude: [/node_modules/]
            },
            {
                test: /\.tsx?$/,
                use: [{
                    loader: 'ts-loader',
                    options: {
                        configFile: 'tsconfig.webpack.json',
                        onlyCompileBundledFiles: true
                    }
                }],
                exclude: /node_modules/
            },
            // Shaders
            {
                test: /\.(glsl|vs|fs|vert|frag)$/,
                exclude: /node_modules/,
                use: [
                    'raw-loader'
                ]
            }
        ]
    },
    output: {
        filename: '[name].bundle.js',
        path: path.resolve(__dirname, 'dist/scripts')
    },
    plugins: [
        new CopyWebpackPlugin({
            patterns: [
                { from: path.resolve(__dirname, 'src/static'), to: path.resolve(__dirname, 'dist') },
                { from: path.resolve(__dirname, 'src/resources'), to: path.resolve(__dirname, 'dist/resources') },
                { from: path.resolve(__dirname, 'src/css'), to: path.resolve(__dirname, 'dist/css') },
                { from: path.resolve(__dirname, 'node_modules/three/examples/js/libs/draco/gltf'), to: path.resolve(__dirname, 'dist/libs/draco') },
            ]
        }),
        new webpack.SourceMapDevToolPlugin({
            filename: '[name].js.map',
            exclude: ['vendor.bundle.js']
        })
    ],
    optimization: {
        // runtimeChunk: 'single',
        splitChunks: {
            chunks: 'all',
            maxInitialRequests: Infinity,
            minSize: 0,
            cacheGroups: {
                vendor: {
                    chunks: 'initial',
                    name: 'vendor',
                    test: /node_modules/,
                    enforce: true
                }
            },
        },
    }
};
