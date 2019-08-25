import { fireUpdateAction } from './fire-update-action';

/**
 * 
 * A setState-style interface to a Redux store with the ability to customize the action fired.
 * 
 * @param {String|Array} [path]   A lodash-style path value to set. Optional.
 * @param {*|Function} valOrFn   An object representing changes you want to make to the store, or a function that produces the changes you want to make to the store.
 * @param {Object} [action]   Any properties to add to the actions to be fired to make these changes.
 */
export function action(path, valOrFn, action) {

  let store = this

  // if we only have one argument, the signature is `.set(valOrFn)`
  if (arguments.length === 2) {
    path = undefined
    valOrFn = arguments[0]
    action = arguments[1]

    return fireUpdateAction({ store, path, valOrFn, action })
  }

  if (arguments.length === 3) {
    return fireUpdateAction({ store, path, valOrFn, action })
  }

  throw new Error(`.action expects two parameters ( .action(valOrFn, action) ), or three parameters ( .action(path, valOrFn, action) ), but received ${arguments.length}: ${[].join.call(arguments, ', ')})`)
}