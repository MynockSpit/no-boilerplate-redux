import _ from 'lodash'

/**
 * 
 * Get the store or a part of the store.
 * 
 * @param {String|Array} [path]   A lodash-style path value to get. Optional.
 * @param {*} [defaultValue]   A value to return as the default value if no value exists on the path. Optional. Path is required if this value is set.
 */
export function get(path, defaultValue) {
  let store = this

  // .get()
  if (arguments.length === 0) {
    return store.getState()
  } 
  
  // .get(path) or .get(path, defaultValue)
  else if (arguments.length === 1 || arguments.length === 2) {
    return _.get(store.getState(), path, defaultValue)
  }

  if (process.env.NODE_ENV !== 'production') {
    throw new Error(`.get expects zero parameters ( .get() ), one parameter ( .get(path) ), or two parameters ( .get(path, defaultValue), but received ${arguments.length}: ${[].join.call(arguments, ', ')})`)
  }
}