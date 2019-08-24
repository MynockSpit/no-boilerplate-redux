import lodash_get from 'lodash/get'

import { applyPatches } from 'immer'

export function defaultReducer(state = {}, action) {
  const {
    patch,
    replace
  } = lodash_get(action, 'payload', {})

  let returnState = state

  // if (path !== undefined && path !== null && typeof state !== 'object') { // we don't support fn's currently
  //     console.error(`Could not set path ${path} on the store: state is not an Object or Array. Recieved: `, state)

  //     return returnState
  // }

  console.log('reducer', patch, replace)

  if (patch) {
    returnState = applyPatches(returnState, patch)
  } else if (replace) {
    returnState = replace
  }

  return returnState
}