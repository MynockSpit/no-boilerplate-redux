
import _ from 'lodash'

import { createDraft, finishDraft } from 'immer'

export function getPatches({store, payload, action, path}) {
  let state = store.getState()

  // default state from both undefined and null to {} if we have a path
  if (path) {
    state = (state === undefined || state === null) ? {} : state

    let notObject = typeof state !== 'object'
    let notFunction = typeof state !== 'function'

    if (notObject && notFunction) {
      const error = `To use a path, your store must be either an Object, Array or Function, but got ${typeof state}`
      console.error(error, state)
      throw new Error(error)
    }
  }

  // if we don't throw here, the function continues "successfully" and throws obliquely later. :s
  if (action) {
    let notObject = typeof action !== 'object' 
    let notFunction = typeof action !== 'function'

    if (notObject && notFunction) {
      const error = `Actions must be either an Object or Function, but got ${typeof action}`
      console.error(error, action)
      throw new Error(error)
    }
  }

  // Try to create a draft. If we can't, it's a value we can't proxy (i.e. null, boolean, number)
  let draft = safeCreateDraft(state)

  // this is a little bit of a mess.
  // We're trying to take four different shapes and convert them into one shape
  // `action`  (function) -> action() gives us the `returnAction`
  // `action`  (non-fn)   -> action is the `returnAction`
  // `payload` (function) -> payload() gives us the payload of `returnAction`
  // `payload` (non-fn)   -> payload is the payload of `returnAction`

  // if we were passed an action, process the payload
  // if we were passed a payload, process the payload and stuff it in an action
  const actionOrPayload = action || payload
  const isFunction = typeof (actionOrPayload) === 'function'

  let returnAction

  if (isFunction) {
    returnAction = actionOrPayload(path ? _.get(draft, path) : draft)
  } else {
    returnAction = actionOrPayload
  }

  if (!action) {
    returnAction = {
      payload: returnAction
    }
  }

  // handle the payload so that we can do it all in one step
  if (path) {
    returnAction.payload = _.set(draft, path, returnAction.payload)
  }

  let patches = safeBuildPatches(returnAction.payload)

  if (!patches) 
    _.set(returnAction, 'meta.nbpr', 'REPLACE')
  else {
    returnAction.payload = patches
    _.set(returnAction, 'meta.nbpr', 'UPDATE')
  }

  return returnAction
}

function safeCreateDraft(state) {
  let draft

  try {
    draft = createDraft(state)
  }

  catch (error) {
    if (error.message !== '[Immer] First argument to `createDraft` must be a plain object, an array, or an immerable object') {
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
    if (error.message !== "[Immer] First argument to `finishDraft` must be a draft returned by `createDraft`") {
      throw error
    }

    return null
  }

  return changes
}