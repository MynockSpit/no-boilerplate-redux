import _isEqual from 'lodash/isEqual'
const _ = { isEqual: _isEqual }

import { fireUpdateAction } from './select';
import { produceWithFn } from './produce'

/**
 * 
 * A setState-style interface to a Redux store.
 * 
 * @param {Object|Function} objectOrFn   An object representing changes you want to make to the store, or a function that produces the changes you want to make to the store. In the same style as React's setState.
 * @param {Object} [actionCustomization]   Any properties to add to the actions to be fired to make these changes.
 */
export function set(objectOrFn, actionCustomization) {
  let store = this

  if (typeof objectOrFn === 'function') {
    setFunction(store, objectOrFn, actionCustomization)
  } else if (objectOrFn && typeof objectOrFn === 'object') {
    setObject(store, objectOrFn, actionCustomization)
  } else {
    throw new Error(`objectOrFn must be an Object or a Function; got ${typeof objectOrFn}`)
  }
}

/**
 * 
 * Shallowly "merges" a store with an object. It's not actually a merge, but it behaves like one. Any top-level property defined in the object gets replaced or added to the store.
 * 
 * @param {Object} store   The redux store.
 * @param {Object} object   An object to be "merged" with the redux store. (Not really, but it behaves that way.)
 * @param {Object} actionCustomization   Any properties to add to the actions to be fired to make these changes.
 */
function setObject(store, object, actionCustomization) {
  Object.entries(object).forEach(([ stateKey, stateValue ]) => {
    fireUpdateAction({ store, stateKey, valOrFn: stateValue, actionCustomization  })
  })
}

/**
 * 
 * Performs a modification to a store using a setState-style function.
 * 
 * @param {Object} store   The redux store.
 * @param {Object} object   A function that produces a merge object.
 * @param {Object} actionCustomization   Any properties to add to the actions to be fired to make these changes.
 */
function setFunction(store, fn, actionCustomization) {
  // initial solution is to do the modification right now, then fire actions that apply that modification
  // a (possibly) better solution would be to write a middleware
  // another solution would be to subscribe directly to redux (but that means the handler fires on every action? not sure I want that unless it gets the action)

  const result = produceWithFn(store.getState(), fn)

  if (!result || typeof result !== 'object') {
    throw new Error('Return value from set function must be an object.')
  }

  const changedStoreParts = diff(store.getState(), result) // get the things that changed

  // produce an object of full stores that changed
  const changes = changedStoreParts.reduce((acc, key) => {
    acc[key] = result[key]
    return acc
  }, {})

  // send them to setObject
  setObject(store, changes, actionCustomization)
}

/*
 * Compare two objects by reducing an array of keys in obj1, having the
 * keys in obj2 as the intial value of the result. Key points:
 *
 * - All keys of obj2 are initially in the result.
 *
 * - If the loop finds a key (from obj1, remember) not in obj2, it adds
 *   it to the result.
 *
 * - If the loop finds a key that are both in obj1 and obj2, it compares
 *   the value. If it's the same value, the key is removed from the result.
 */
function diff(obj1, obj2) {
  const differences = Object.keys(obj1).reduce((result, key) => {
    if (!obj2.hasOwnProperty(key)) {
      result.push(key)
    } 
    
    else if (_.isEqual(obj1[key], obj2[key])) {
      const resultKeyIndex = result.indexOf(key)
      result.splice(resultKeyIndex, 1)
    }

    return result
    
  }, Object.keys(obj2))

  return differences
}