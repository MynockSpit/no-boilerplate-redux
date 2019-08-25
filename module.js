'use strict';

if (process.env.NODE_ENV === 'production') {
  module.exports = require('./es/no-boilerplate-redux.min.js');
} else {
  module.exports = require('./es/no-boilerplate-redux.js');
}
