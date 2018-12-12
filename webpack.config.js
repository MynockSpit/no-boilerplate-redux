const path = require('path');

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
    redux: "redux",
    lodash: "lodash"
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: "babel-loader"
        }
      }
    ]
  }
}

module.exports = defaults