import _set from 'lodash/set'
import _get from 'lodash/get'
import _merge from 'lodash/merge'
const _ = { get: _get, set: _set, merge: _merge }

import { createDraft, finishDraft } from 'immer'

export function produceWithValue(state, value, path) {
  // normalize the initial state
  // if we have a path and the state is null, use a blank object as the state
  let initialState = state === null ? {} : state

  // Try to create a draft. If we can't, it's a value we can't proxy (i.e. null, boolean, number)
  let draft = safeCreateDraft(initialState)

  // modify the state
  let updates = _.set(draft, path, value)

  // finish the draft, and return the resulting data
  return safeFinishDraft(updates)
}

export function produceWithFn(state, fn, path) {
  // normalize the initial state
  // if we have a path and the state is null, use a blank object as the state
  let initialState = (path !== undefined && state === null) ? {} : state

  // Try to create a draft. If we can't, it's a value we can't proxy (i.e. null, boolean, number)
  let draft = safeCreateDraft(initialState)

  // modify the state
  // if we have a path, apply the modification to just that part, otherwise, apply it to the entire draft
  let updates = (!path) ? fn(draft) : _.set(draft, path, fn(_.get(draft, path)))

  // finish the draft, and return the resulting data
  return safeFinishDraft(updates)
}

function safeCreateDraft(state) {
  let draft

  try {
    draft = createDraft(state)
  }

  catch (error) {
    if (error.message !== 'First argument to `createDraft` must be a plain object, an array, or an immerable object') {
      throw error
    }

    draft = state
  }

  return draft
}

function safeFinishDraft(draft) {
  let finalState

  try {
    finalState = finishDraft(draft)
  }
  // or (if it wasn't a draft) replace it
  catch (error) {
    if (error.message !== 'First argument to `finishDraft` must be a draft returned by `createDraft`') {
      throw error
    }

    finalState = draft
  }

  return finalState
}