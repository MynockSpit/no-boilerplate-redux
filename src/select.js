import { addReducerIfNeeded } from './add-reducer-if-needed'
import {
  merge as _merge,
  set as _set,
  cloneDeep as _cloneDeep
} from 'lodash-es'

import { cacheFn, getFn } from './fn-cache.js'

export function select(stateKey, path) {

  let store = this

  if (typeof stateKey !== 'string' || !stateKey)
    throw new Error('stateKey must be a non-empty string')

  return {
    set(valOrFn, actionCustomization = {}) {

      addReducerIfNeeded(stateKey, store.reducers, store)

      let value = valOrFn
      let fn = undefined

      if (typeof valOrFn === "function") {
        value = undefined
        fn = cacheFn(valOrFn)
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

      const action = _merge(
        canOverride,
        customProperties,
        cantOverride
      )

      store.dispatch(action)

      return _set(
        _cloneDeep(action),
        'payload.fn',
        getFn(fn)
      )
    }
  }
}