import lodash_cloneDeep from 'lodash/cloneDeep'
import lodash_set from 'lodash/set'
import lodash_merge from 'lodash/merge'
import lodash_stringToPath from 'lodash/_stringToPath'

import { storeFn, getFn } from './fn-store'

/**
 * 
 * @param {Object} firingParameters   An object that contains the data needed to fire an update action
 * @param {Object} firingParameters.store   The redux store. 
 * @param {String} firingParameters.stateKey   The state part we're updating.
 * @param {*|Function} firingParameters.valOrFn   If a function, will be run during the reducer phase. If a value, will be set during the reducer phase.
 * @param {String} [firingParameters.path]   A sub-path to pass to the valueFn or be set to during the reducer phase
 * @param {Object} [firingParameters.actionCustomization]   A set of params from the user that can add/remove params in the action.
 */
export function fireUpdateAction({ store, valOrFn, path, actionCustomization }) {

  let value = valOrFn
  let fn = undefined

  // if valOrFn is a function, swap the variables
  if (typeof valOrFn === "function") {
    value = undefined
    fn = storeFn(valOrFn)
  }

  let pathAsArray

  // turn path into an array
  if (typeof path === 'string' || Array.isArray(path)) {
    pathAsArray = lodash_stringToPath(path)
    
    if (!pathAsArray.length) {
      pathAsArray = undefined
    }
  }

  let stateKey = pathAsArray ? pathAsArray[0] : 'store'

  // customize the action
  let type = `SET_${stateKey.toUpperCase()}`

  let customProperties = actionCustomization

  if (typeof actionCustomization === 'string') {
    type += `_${actionCustomization.toUpperCase()}`
    customProperties = {}
  }

  // properties that are defaulted that can be overridden
  const canOverride = { type }

  // properties that are defaulted that can't be overridden
  const cantOverride = {
    payload: {
      path: pathAsArray,
      value,
      fn
    },
    meta: { nbpr: stateKey || true }
  }

  const action = lodash_merge(
    canOverride,
    customProperties,
    cantOverride
  )

  store.dispatch(action)

  return pathAsArray ? store.get(pathAsArray) : store.get()
}