import lodash_get from 'lodash/get'
import lodash_merge from 'lodash/merge'
import lodash_stringToPath from 'lodash/_stringToPath'

import { getPatches } from './produce'

/**
 * 
 * Generates the action to fire.
 * 
 * @param {Object} firingParameters   An object that contains the data needed to fire an update action
 * @param {*} firingParameters.store   The redux store. 
 * @param {Array} [firingParameters.path]   A sub-path to pass to the valueFn or be set to during the reducer phase
 * @param {*|Function} firingParameters.payload   If a function, will be run during the reducer phase. If a value, will be set during the reducer phase.
 * @param {String|Object} [firingParameters.action]   A set of params from the user that can add/remove params in the action.
 */
export function fireUpdateAction({ store, path, payload, action }) {

  // properties that are defaulted that can be overridden
  const canOverride = { 
    type: undefined // 'SET_STORE' 
  }

  // properties that are defaulted that can't be overridden
  const cantOverride = {
    payload: undefined, // what we're replacing
    meta: {
      // nbpr: 'UPDATE' || 'REPLACE' 
    }
  }

  // turn path into an array
  let pathAsArray

  if (typeof path === 'string' || Array.isArray(path)) {
    pathAsArray = lodash_stringToPath(path)

    if (!pathAsArray.length) pathAsArray = undefined
  }

  // pre-run the function 
  const baseAction = (action) ? getPatches({store, action, path}) : getPatches({store, payload, path})

  if (lodash_get(baseAction, 'meta.nbpr') === 'UPDATE') {
    canOverride.type = 'UPDATE'
  }

  // We do a replace in every other case. This is so that we can replace with falsy values.
  else {
    canOverride.type = 'REPLACE'
  } 
  
  // customize the action
  // customize the action type, first
  canOverride.type += `_${(pathAsArray ? pathAsArray[0] : 'store').toUpperCase()}`

  const completeAction = lodash_merge(
    canOverride,
    baseAction,
    cantOverride
  )

  store.dispatch(completeAction)

  return pathAsArray ? store.get(pathAsArray) : store.get()
}