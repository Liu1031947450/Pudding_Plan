const path = require('path');
const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = (_env, argv) => ({
  entry: './index.web.js',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'bundle.js',
  },
  resolve: {
    alias: {
      'react-native$': 'react-native-web',
      'expo-notifications$': false,
    },
    extensions: [
      '.web.js',
      '.web.tsx',
      '.web.ts',
      '.js',
      '.jsx',
      '.ts',
      '.tsx',
      '.json',
    ],
    fullySpecified: false, // This fixes the module resolution issue
  },
  module: {
    rules: [
      {
        test: /\.m?js$/,
        resolve: {
          fullySpecified: false,
        },
      },
      {
        test: /\.(js|jsx|ts|tsx)$/,
        exclude:
          /node_modules\/(?!(?:@expo|expo[^/]*|@react-native|react-native|@react-navigation|react-navigation|@react-native-community|react-native-svg|react-native-chart-kit)\/)/,
        use: {
          loader: 'babel-loader',
        },
      },
      {
        test: /\.(png|jpe?g|gif|svg)$/i,
        type: 'asset/resource',
      },
      {
        test: /\.(ttf|woff2?)$/i,
        type: 'asset/resource',
      },
    ],
  },
  plugins: [
    new webpack.DefinePlugin({
      __DEV__: JSON.stringify(argv.mode !== 'production'),
      'process.env.EXPO_OS': JSON.stringify('web'),
      'process.env.EXPO_PUBLIC_API_URL': JSON.stringify(
        process.env.EXPO_PUBLIC_API_URL || '',
      ),
    }),
    new HtmlWebpackPlugin({
      template: './public/index.html',
      favicon: './assets/favicon.png',
    }),
  ],
  devServer: {
    static: {
      directory: path.join(__dirname, 'public'),
    },
    compress: true,
    port: 8080,
    hot: true,
    historyApiFallback: true,
  },
});
