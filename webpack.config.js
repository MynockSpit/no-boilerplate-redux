const path = require('path');
const LodashModuleReplacementPlugin = require('lodash-webpack-plugin');
 
const defaults = {
  entry: './src/main.js',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'no-boilerplate-redux.js',
    library: 'reducerlessRedux',
    libraryTarget: 'umd'
  },
  externals: {
    // not wrapping redux b/c you can't use this without redux anyways, so the user necessarily must have it
    redux: {
      commonjs: "redux",
      commonjs2: "redux",
      amd: "redux",
      root: "redux" // indicates global variable
    }
  },
  module: {
    rules: [{
      use: 'babel-loader',
      test: /\.js$/,
      exclude: /node_modules/,
    }]
  },
  plugins: [
    new LodashModuleReplacementPlugin()
  ]
}

module.exports = defaults