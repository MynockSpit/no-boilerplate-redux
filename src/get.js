import _get from 'lodash/get'
const _ = { get: _get }

/**
 * 
 * A lodash-style getter for stores.
 * 
 * @param {String|Array} path   The path of the property to get. Can be defined as a dot-separated string or an array of keys. (e.g. `path.to.value` or ['path', 'to', 'value'])
 * @param {*} [defaultValue=undefined]   If the property doesn't exist, the default value to return. 
 */
export function get(path, defaultValue) {
  let store = this
  return _.get(store.getState(), path, defaultValue)
}