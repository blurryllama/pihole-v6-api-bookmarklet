const path = require('path');
const CopyPlugin = require('copy-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const fs = require('fs');

// Create a modified version of browser-polyfill.js without the sourcemap reference
const polyfillPath = path.resolve(__dirname, 'node_modules/webextension-polyfill/dist/browser-polyfill.js');
const polyfillContent = fs.readFileSync(polyfillPath, 'utf8').replace(/\/\/# sourceMappingURL=.*$/gm, '');
const tempPolyfillPath = path.resolve(__dirname, '.temp-polyfill.js');
fs.writeFileSync(tempPolyfillPath, polyfillContent);

module.exports = {
  mode: 'development',
  entry: {
    popup: [tempPolyfillPath, './src/popup/index.tsx']
  },
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: '[name].js',
    clean: true
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: 'ts-loader',
        exclude: /node_modules/
      },
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader']
      }
    ]
  },
  resolve: {
    extensions: ['.tsx', '.ts', '.js'],
    alias: {
      '@': path.resolve(__dirname, 'src')
    }
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: './src/popup/index.html',
      filename: 'popup.html',
      chunks: ['popup']
    }),
    new CopyPlugin({
      patterns: [
        { from: 'src/icons', to: 'icons' },
        { from: 'src/manifest.json', to: 'manifest.json' }
      ]
    })
  ],
  devtool: 'source-map'
}; 