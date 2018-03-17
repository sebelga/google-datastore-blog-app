const webpack = require("webpack");
const path = require("path");
const ExtractTextPlugin = require("extract-text-webpack-plugin");
const autoprefixer = require("autoprefixer");
const CleanWebpackPlugin = require("clean-webpack-plugin");
const UglifyJsPlugin = require("uglifyjs-webpack-plugin");
const AssetsPlugin = require("assets-webpack-plugin");
const WebpackShellPlugin = require("webpack-shell-plugin");

module.exports = env => {
    env = env || {};

    if (!env.NODE_ENV) {
        env.NODE_ENV = "dev";
    }

    const isProd = env.NODE_ENV === "prod";

    const cleanBuild = new CleanWebpackPlugin([
        "server/public/dist/*",
        "server/public/assets.json"
    ], { watch: true });

    const extractCSS = new ExtractTextPlugin({
        filename: "[name].[contenthash].css"
    });

    const assetsManifest = new AssetsPlugin({
        filename: "assets.json",
        path: path.join(__dirname, "server", "public"),
        fullPath: false,
        processOutput: assets => {
            Object.keys(assets).forEach(bundle => {
                Object.keys(assets[bundle]).forEach(type => {
                    const filename = assets[bundle][type];
                    assets[bundle][type] = filename.slice(
                        filename.indexOf(bundle)
                    );
                });
            });
            return JSON.stringify(assets, null, 4);
        }
    });

    const shellPlugin = new WebpackShellPlugin({
        onBuildStart: ['echo "Webpack build started!"'],
        onBuildEnd: ["node ./scripts/postbuild.js"],
        dev: false,
    });

    const uglifyJS = new UglifyJsPlugin({ sourceMap: true });

    const config = {
        entry: {
            main: path.join(__dirname, "client", "src", "scripts", "main.js")
        },
        output: {
            filename: "[name].[chunkhash].js",
            path: path.join(__dirname, "server", "public", "dist")
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
                    include: path.join(__dirname, "client", "src", "styles"),
                    loader: extractCSS.extract({
                        use: [
                            {
                                loader: "css-loader?sourceMap",
                                options: { importLoaders: 1 }
                            },
                            {
                                loader: "postcss-loader",
                                options: {
                                    plugins: [
                                        autoprefixer({
                                            browsers: [
                                                "> 1%",
                                                "last 2 versions"
                                            ]
                                        })
                                    ],
                                    sourceMap: true
                                }
                            },
                            {
                                loader: "sass-loader?sourceMap",
                                options: {
                                    outputStyle: isProd
                                        ? "compressed"
                                        : "nested"
                                }
                            }
                        ]
                    })
                }
            ]
        },
        resolve: {
            extensions: [".js", ".scss"]
        },
        plugins: [shellPlugin, extractCSS, assetsManifest, cleanBuild],
        devtool: "source-map"
    };

    if (env.NODE_ENV === "prod") {
        config.plugins = [...config.plugins, uglifyJS];
    }

    return config;
};
