import _cloneDeep from 'lodash/cloneDeep'
import _set from 'lodash/set'
import _get from 'lodash/get'
import _merge from 'lodash/merge'
const _ = { cloneDeep: _cloneDeep, set: _set, merge: _merge, get: _get }

import { addReducerIfNeeded } from './add-reducer-if-needed'

import { storeFn, getFn } from './fn-store'

export function select(stateKey, path) {

  let store = this

  if (typeof stateKey !== 'string' || !stateKey)
    throw new Error('stateKey must be a non-empty string')

  return {
    set: (valOrFn, actionCustomization = {}) => fireUpdateAction({ store, stateKey, path, valOrFn, actionCustomization }),
    get: (defaultValue) => get(store.getState()[stateKey], path, defaultValue)
  }
}

/**
 * 
 * @param {Object} firingParameters   An object that contains the data needed to fire an update action
 * @param {Object} firingParameters.store   The redux store. 
 * @param {String} firingParameters.stateKey   The state part we're updating.
 * @param {*|Function} firingParameters.valOrFn   If a function, will be run during the reducer phase. If a value, will be set during the reducer phase.
 * @param {String} [firingParameters.path]   A sub-path to pass to the valueFn or be set to during the reducer phase
 * @param {Object} [firingParameters.actionCustomization]   A set of params from the user that can add/remove params in the action.
 */
export function fireUpdateAction({ store, stateKey, valOrFn, path, actionCustomization }) {

  addReducerIfNeeded(stateKey, store.reducers, store)

  let value = valOrFn
  let fn = undefined

  if (typeof valOrFn === "function") {
    value = undefined
    fn = storeFn(valOrFn)
  }

  let type = `SET_${stateKey.toUpperCase()}`
  let customProperties = actionCustomization

  if (typeof actionCustomization === 'string') {
    type += `_${actionCustomization.toUpperCase()}`
    customProperties = {}
  }

  const canOverride = { type }
  const cantOverride = {
    payload: { path, value, fn },
    meta: { nbpr: stateKey }
  }

  const action = _.merge(
    canOverride,
    customProperties,
    cantOverride
  )

  store.dispatch(action)

  return _.set(
    _.cloneDeep(action),
    'payload.fn',
    getFn(fn)
  )
}