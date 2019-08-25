import lodash_merge from 'lodash/merge'
import lodash_stringToPath from 'lodash/_stringToPath'

import { getPatches } from './produce'

/**
 * 
 * @param {Object} firingParameters   An object that contains the data needed to fire an update action
 * @param {*} firingParameters.store   The redux store. 
 * @param {*|Function} firingParameters.valOrFn   If a function, will be run during the reducer phase. If a value, will be set during the reducer phase.
 * @param {Array} [firingParameters.path]   A sub-path to pass to the valueFn or be set to during the reducer phase
 * @param {String|Object} [firingParameters.action]   A set of params from the user that can add/remove params in the action.
 */
export function fireUpdateAction({ store, valOrFn, path, action }) {

  // properties that are defaulted that can be overridden
  const canOverride = { type: 'SET_STORE' }

  // properties that are defaulted that can't be overridden
  const cantOverride = {
    payload: {
      // patch: undefined,
      // replace: undefined
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
  let updates = getPatches(store, valOrFn, path)

  if (!updates) {
    return pathAsArray ? store.get(pathAsArray) : store.get()
  }

  if (updates.patch) {
    canOverride.type = 'UPDATE'
    cantOverride.payload.patch = updates.patch

    if (store.addReducer)
      updates.patch.forEach(({ path }) => store.addReducer(path[0]))
  }

  // We do a replace in every other case. This is so that we can replace with falsy values.
  else {
    canOverride.type = 'REPLACE'
    cantOverride.payload.replace = updates.replace

    if (store.addReducer && updates.replace && typeof updates.replace === 'object')
      Object.keys(updates.replace).forEach(key => store.addReducer(key))
  } 
  
  // customize the action
  // customize the action type, first
  canOverride.type += `_${(pathAsArray ? pathAsArray[0] : 'store').toUpperCase()}`

  // handle the action property
  let customProperties = action

  if (typeof action === 'string') {
    canOverride.type += `_${action.toUpperCase()}`
    customProperties = {}
  }

  const completeAction = lodash_merge(
    canOverride,
    customProperties,
    cantOverride
  )

  store.dispatch(completeAction)

  return pathAsArray ? store.get(pathAsArray) : store.get()
}