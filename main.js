'use strict';

if (process.env.NODE_ENV === 'production') {
  module.exports = require('./cjs/no-boilerplate-redux.min.js');
} else {
  module.exports = require('./cjs/no-boilerplate-redux.js');
}
