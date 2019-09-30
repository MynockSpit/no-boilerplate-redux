import { fireUpdateAction } from './fire-update-action';

/**
 * 
 * A setState-style interface to a Redux store with the ability to customize the action fired.
 * 
 * @param {String|Array} [path]   A lodash-style path value to set. Optional.
 * @param {Object|Function} action   An object representing the action you want to fire, or a function that produces the action you want to fire.
 * @param {Object} action   Any properties to add to the actions to be fired to make these changes.
 * 
 */
export function action(path, action) {

  let store = this

  // if we only have two arguments, the signature is `.set(action, action)`
  if (arguments.length === 1) {
    path = undefined
    action = arguments[0]

    return fireUpdateAction({ store, path, action })
  }

  else if (arguments.length === 2) {
    return fireUpdateAction({ store, path, action })
  }

  if (process.env.NODE_ENV !== 'production') {
    throw new Error(`.action expects one parameter ( .action(action) ), or two parameters ( .action(path, action) ), but received ${arguments.length}: ${[].join.call(arguments, ', ')})`)
  }
}