import _ from 'lodash'

import { getFn } from './fn-store.js'

export function reducerlessReducer(stateKey, state = null, action) {
  const {
    path = null,
    value = null,
    fn = null
  } = _.get(action, 'payload', {})

  if (_.get(action, 'meta.nbpr') === stateKey) {
    // Operates on either a path you pass in (and modifies a part) of the state or 
    // replaces the entire state without a path
    let newState = _.cloneDeep(state)

    // if path isn't null, it means we're setting a PART of the state (leaf)
    if (path !== null) {

      if (newState === null)
        newState = {}

      if (typeof newState !== "object") {
        console.error(`Could not set ${path}: ${state} must be an object.`)

        // setting newState back to state to prevent rerenders without changes
        newState = state
      }

      // if the input was a function, use it to generate new state leaf
      else if (fn) {
        const statePart = _.get(newState, path)
        _.set(newState, path, getFn(fn)(statePart))
      }

      // if it was a value, replace the leaf with the input value
      else
        _.set(newState, path, value)
    }

    // if path is null it means we're setting the entire state (tree)
    else {
      // if the input was a function, use it to generate new state 
      if (fn)
        newState = getFn(fn)(newState)

      // if the input wasn't a function, replace the tree with the input value
      else
        newState = value
    }

    return newState
  }

  return state
}