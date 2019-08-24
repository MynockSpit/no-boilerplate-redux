import lodash_merge from 'lodash/merge'
import lodash_stringToPath from 'lodash/_stringToPath'

import { getPatches } from './produce'

/**
 * 
 * @param {Object} firingParameters   An object that contains the data needed to fire an update action
 * @param {Object} firingParameters.store   The redux store. 
 * @param {*|Function} firingParameters.valOrFn   If a function, will be run during the reducer phase. If a value, will be set during the reducer phase.
 * @param {String} [firingParameters.path]   A sub-path to pass to the valueFn or be set to during the reducer phase
 * @param {Object} [firingParameters.actionCustomization]   A set of params from the user that can add/remove params in the action.
 */
export function fireUpdateAction({ store, valOrFn, path, actionCustomization }) {

  // properties that are defaulted that can be overridden
  const canOverride = { type: 'SET_STORE' }

  // properties that are defaulted that can't be overridden
  const cantOverride = {
    payload: {
      patch: undefined,
      replace: undefined
    },
    meta: { nbpr: true }
  }

  // turn path into an array
  let pathAsArray

  if (typeof path === 'string' || Array.isArray(path)) {
    pathAsArray = lodash_stringToPath(path)
    
    if (!pathAsArray.length) pathAsArray = undefined
  }

  // pre-run the function 
    let { replace, patch } = getPatches(store.getState(), valOrFn, path)

    if (replace) {
      canOverride.type = 'REPLACE'
      cantOverride.payload.replace = replace
    }

    else {
      canOverride.type = 'UPDATE'
      cantOverride.payload.patch = patch
    }

  // customize the action
  // customize the action type, first
  canOverride.type += `_${(pathAsArray ? pathAsArray[0] : 'store').toUpperCase()}`

  // handle the actionCustomization property
  let customProperties = actionCustomization

  if (typeof actionCustomization === 'string') {
    canOverride.type += `_${actionCustomization.toUpperCase()}`
    customProperties = {}
  }

  const action = lodash_merge(
    canOverride,
    customProperties,
    cantOverride
  )

  console.log('action', action)

  store.dispatch(action)

  return pathAsArray ? store.get(pathAsArray) : store.get()
}