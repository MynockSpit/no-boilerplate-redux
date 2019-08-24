import { fireUpdateAction } from './fire-update-action';

/**
 * 
 * A setState-style interface to a Redux store with the ability to customize the action fired.
 * 
 * @param {String|Array} [path]   A lodash-style path value to set. Optional.
 * @param {Object|Function} valueOrFunction   An object representing changes you want to make to the store, or a function that produces the changes you want to make to the store.
 * @param {Object} [actionCustomization]   Any properties to add to the actions to be fired to make these changes.
 */
export function action(path, valueOrFunction, actionCustomization) {

  let store = this

  // if we only have one argument, the signature is `.set(valueOrFunction)`
  if (arguments.length === 2) {
    path = undefined
    valueOrFunction = arguments[0]
    actionCustomization = arguments[1]

    return fireUpdateAction({ store, path, valOrFn: valueOrFunction, actionCustomization })
  }

  if (arguments.length === 3) {
    return fireUpdateAction({ store, path, valOrFn: valueOrFunction, actionCustomization })
  }

  throw new Error(`.action expects two parameters ( .action(valueOrFunction, actionCustomization) ), or three parameters ( .action(path, valueOrFunction, actionCustomization) ), but received ${arguments.length}: ${[].join.call(arguments, ', ')})`)
}