const path = require('path');

const defaults = {
  entry: './src/main.js',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'reducerless-redux.js',
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
  }
}

module.exports = defaults