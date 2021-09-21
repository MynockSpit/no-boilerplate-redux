import { applyPatches, enablePatches } from 'immer'
enablePatches()

export function nbprReducer(state = {}, { meta, payload }) {
  let returnState = state

  if (meta.nbpr === 'UPDATE') {
    if (state === undefined || state === null) {
      returnState = {}
    }

    returnState = applyPatches(returnState, payload)
  } else if (meta.nbpr === 'REPLACE') {
    returnState = payload
  }

  return returnState
}