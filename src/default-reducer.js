import lodash_get from 'lodash/get'

import { getFn } from './fn-store.js'
import { produceWithValue, produceWithFn } from './produce'

export function defaultReducer(state = {}, action) {
  const {
    path,
    value,
    fn
  } = lodash_get(action, 'payload', {})

  let returnState = state

  if (path !== undefined && path !== null && typeof state !== 'object') { // we don't support fn's currently
      console.error(`Could not set path ${path} on the store: state is not an Object or Array. Recieved: `, state)

      return returnState
  }

  if (fn)
    returnState = produceWithFn(state, getFn(fn), path)

  // input isn't a function -- replace the tree with the input value
  else
    returnState = produceWithValue(state, value, path)

  return returnState
}