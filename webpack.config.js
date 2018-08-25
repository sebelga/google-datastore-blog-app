const webpack = require('webpack');
const path = require('path');
const exec = require('child_process').exec;
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const autoprefixer = require('autoprefixer');
const CleanWebpackPlugin = require('clean-webpack-plugin');
const UglifyJsPlugin = require('uglifyjs-webpack-plugin');
const AssetsPlugin = require('assets-webpack-plugin');

module.exports = env => {
  env = env || {};

  if (!process.env.NODE_ENV) {
    process.env.NODE_ENV = 'development';
  }

  console.log('WEBPACK build environement:', process.env.NODE_ENV);

  const devMode = process.env.NODE_ENV !== 'production';

  const cleanBuild = new CleanWebpackPlugin(['src/server/public/dist/*.*', 'src/server/public/assets.json']);
  const extractCSS = new MiniCssExtractPlugin({
    filename: '[name].[contenthash].css',
  });

  const assetsManifest = new AssetsPlugin({
    filename: 'assets.json',
    // path: path.join(__dirname, 'src', 'server', 'public'),
    path: path.join(__dirname, 'public'),
    fullPath: false,
    processOutput: assets => {
      Object.keys(assets).forEach(bundle => {
        Object.keys(assets[bundle]).forEach(type => {
          const filename = assets[bundle][type];
          assets[bundle][type] = filename.slice(filename.indexOf(bundle));
        });
      });
      return JSON.stringify(assets, null, 4);
    },
  });

  const postBuild = {
    apply: compiler => {
      compiler.hooks.afterEmit.tap('AfterEmitPlugin', compilation => {
        exec('node ./scripts/postbuild.js', (err, stdout, stderr) => {
          if (stdout) process.stdout.write(stdout);
          if (stderr) process.stderr.write(stderr);
        });
      });
    },
  };

  const uglifyJS = new UglifyJsPlugin({ sourceMap: true });

  const config = {
    mode: process.env.NODE_ENV,
    entry: {
      main: path.join(__dirname, 'src', 'client', 'js', 'main.js'),
    },
    output: {
      filename: '[name].[chunkhash].js',
      // path: path.join(__dirname, 'src', 'server', 'public', 'dist'),
      path: path.join(__dirname, 'public', 'dist'),
    },
    module: {
      rules: [
        {
          test: /\.js$/,
          include: path.join(__dirname, 'src', 'client', 'js'),
          use: {
            loader: 'babel-loader',
            options: { presets: ['es2015'] },
          },
        },
        {
          test: /\.(sa|sc|c)ss$/,
          use: [
            MiniCssExtractPlugin.loader,
            {
              loader: 'css-loader?sourceMap',
              options: { importLoaders: 1 },
            },
            {
              loader: 'postcss-loader',
              options: {
                plugins: [
                  autoprefixer({
                    browsers: ['> 1%', 'last 2 versions'],
                  }),
                ],
                sourceMap: true,
              },
            },
            {
              loader: 'sass-loader?sourceMap',
              options: {
                outputStyle: devMode ? 'nested' : 'compressed',
              },
            },
          ],
        },
      ],
    },
    resolve: {
      extensions: ['.js', '.scss'],
    },
    plugins: [postBuild, extractCSS, assetsManifest, cleanBuild],
    devtool: 'source-map',
  };

  if (!devMode) {
    config.plugins = [...config.plugins, uglifyJS];
  }

  return config;
};
