import { fireUpdateAction } from './fire-update-action';

/**
 * 
 * A setState-style interface to a Redux store. If you need to customize the action fire, use .action
 * 
 * @param {String|Array} [path]   A lodash-style path value to set. Optional.
 * @param {*|Function} payload   Data you want to replace the store with, or a function that produces the changes you want to make to the store.
 */
export function set(path, payload) {
  let store = this

  // if we only have one argument, the signature is `.set(payload)`
  if (arguments.length === 1) {
    path = undefined
    payload = arguments[0]
    return fireUpdateAction({ store, path, payload })
  } 

  // if we have two arguments, the signature is `.set(path, payload)`
  else if (arguments.length === 2) {
    return fireUpdateAction({ store, path, payload })
  }

  if (process.env.NODE_ENV !== 'production') {
    throw new Error(`.set expects one parameter ( .set(payload) ), two parameters ( .set(path, payload) ), but received ${arguments.length}: ${[].join.call(arguments, ', ')})`)
  }
}