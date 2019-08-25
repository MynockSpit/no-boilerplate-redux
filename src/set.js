import { fireUpdateAction } from './fire-update-action';

/**
 * 
 * A setState-style interface to a Redux store. If you need to customize the action fire, use .action
 * 
 * @param {String|Array} [path]   A lodash-style path value to set. Optional.
 * @param {*|Function} valOrFn   An object representing changes you want to make to the store, or a function that produces the changes you want to make to the store.
 */
export function set(path, valOrFn) {
  let store = this

  // if we only have one argument, the signature is `.set(valOrFn)`
  if (arguments.length === 1) {
    path = undefined
    valOrFn = arguments[0]
    return fireUpdateAction({ store, path, valOrFn })
  } 

  else if (arguments.length === 2) {
    return fireUpdateAction({ store, path, valOrFn })
  }

  throw new Error(`.set expects one parameter ( .set(valOrFn) ), two parameters ( .set(path, valOrFn) ), but received ${arguments.length}: ${[].join.call(arguments, ', ')})`)
}