import get from 'lodash/get'
const _ = { get }

import { getFn } from './fn-store.js'
import { produceWithValue, produceWithFn } from './produce'

export function reducerlessReducer(stateKey, state = null, action) {
  const {
    path = null,
    value,
    fn
  } = _.get(action, 'payload', {})

  let returnState = state

  if (_.get(action, 'meta.nbpr') === stateKey) {

    // Operates on either a path you pass in (and modifies a part) of the state or 
    // replaces the entire state without a path

    // we have a path -- set PART of the state
    if (path !== null) {

      if (typeof state !== 'object') // we don't support fn's currently
        console.error(`Could not set path ${path} on ${stateKey}: state is not an Object or Array. Recieved: `, state)

      if (fn)
        returnState = produceWithFn(state, getFn(fn), path)

      else
        returnState = produceWithValue(state, value, path)

    }

    // we have no path -- set the entire state
    else {
      // input is a function -- use it to generate new state 

      if (fn)
        returnState = produceWithFn(state, getFn(fn))

      // input isn't a function -- replace the tree with the input value
      else
        returnState = value

      if (returnState === undefined)
        returnState = null
    }
  }

  return returnState
}