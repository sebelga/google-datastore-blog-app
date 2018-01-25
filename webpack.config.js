const webpack = require("webpack");
const path = require("path");
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const autoprefixer = require("autoprefixer");
const CleanWebpackPlugin = require("clean-webpack-plugin");
const UglifyJsPlugin = require("uglifyjs-webpack-plugin");

module.exports = env => {
    env = env || {};

    if (!env.NODE_ENV) {
        env.NODE_ENV = "dev";
    }

    const isProd = env.NODE_ENV === "prod";

    const cleanBuild = new CleanWebpackPlugin([
        "server/public/css/*",
        "server/public/js/*"
    ]);

    const extractCSS = new ExtractTextPlugin({
        filename: getPath => getPath('css/main.css').replace('css', '../css'),
    });

    const uglifyJS = new UglifyJsPlugin({ sourceMap: true });

    const config = {
        entry: {
            main: path.join(__dirname, "client", "src", "scripts", "main.js")
        },
        output: {
            filename: "main.js",
            path: path.join(__dirname, "server", "public", "js")
        },
        module: {
            rules: [
                {
                    test: /\.js$/,
                    include: path.join(__dirname, "src", "scripts"),
                    use: {
                        loader: "babel-loader",
                        options: { presets: ["es2015"] }
                    }
                },
                {
                    test: /\.scss$/,
                    include: path.join(__dirname, 'client', "src", "styles"),
                    loader: extractCSS.extract({
                        use: [
                            {
                                loader: 'css-loader?sourceMap',
                                options: { importLoaders: 1 },
                            },
                            {
                                loader: 'postcss-loader',
                                options: {
                                    plugins: [
                                        autoprefixer({ browsers: ['> 1%', 'last 2 versions'] }),
                                    ],
                                    sourceMap: true,
                                }
                            },
                            // 'resolve-url-loader',
                            {
                                loader: 'sass-loader?sourceMap',
                                options: {
                                    outputStyle: isProd ? 'compressed' : 'nested',
                                },
                            }
                        ]
                    })
                }
            ]
        },
        resolve: {
            extensions: [".js", ".scss"]
        },
        plugins: [extractCSS],
        devtool: "source-map"
    };

    if (env.NODE_ENV === "prod") {
        config.plugins = [...config.plugins, uglifyJS, cleanBuild];
    }

    return config;
};
