
import lodash_set from 'lodash/set'
import lodash_get from 'lodash/get'

import { createDraft, finishDraft } from 'immer'

export function getPatches(store, valOrFn, path) {
  let state = store.getState()

  // default state from both undefined and null to {} if we have a path
  if (path) {
    state = (state === undefined || state === null) ? {} : state

    let notObject = typeof state !== 'object'
    let notFunction = typeof state !== 'function'

    if (notObject && notFunction) {
      console.error(`Not updating store. To use a path, your store must be either an Object, Array or Function, but got ${typeof state} :`, state)

      return
    }
  }

  // Try to create a draft. If we can't, it's a value we can't proxy (i.e. null, boolean, number)
  let draft = safeCreateDraft(state)

  // modify the state
  // if we're updating using a fn...
  if (typeof valOrFn === 'function') {
    if (path) {
      draft = lodash_set(draft, path, valOrFn(lodash_get(draft, path), path))
    } else {
      draft = valOrFn(draft)
    }
  }

  // if we're replacing/merging in a value
  else {
    if (path) {
      draft = lodash_set(draft, path, valOrFn)
    } else {
      draft = valOrFn
    }
  }

  let patches = safeBuildPatches(draft)

  if (!patches) return { replace: draft }

  return { patch: patches }
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

function safeBuildPatches(draft) {
  let changes = []

  try {
    finishDraft(draft, patches => changes.push(...patches))
  } catch (error) {
    // or (if it wasn't a draft) replace it
    if (
      error.message !==
      "First argument to `finishDraft` must be a draft returned by `createDraft`"
    ) {
      throw error
    }

    return null
  }

  return changes
}