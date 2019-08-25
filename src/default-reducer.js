import lodash_get from 'lodash/get'
import { applyPatches } from 'immer'

export function defaultReducer(state = {}, action) {
  const payload = lodash_get(action, 'payload', {})

  let returnState = state

  if (payload.patch) {
    if (state === undefined || state === null) {
      returnState = {}
    }

    returnState = applyPatches(returnState, payload.patch)
  } else if (payload.hasOwnProperty('replace')) {
    returnState = payload.replace
  }

  return returnState
}