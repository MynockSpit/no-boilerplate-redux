import get from 'lodash/get'
const _ = { get }
import { reducerlessReducer } from './reducerless-reducer.js'

// creates a reducerRouter
// if action is nbpr:  action --> reducerRouter --> reducerlessReducer
// if action isn't:    action --> reducerRouter --> normalReducer
export function reducerFactory(stateKey, normalReducer) {
  // reducerRouter is a small function that decides which reducer to use
  // does it use the normalReducer? (preferred if it exists)
  // or the reducerlessReducer (always used if normalReducer doesn't)
  function reducerRouter(state, action) {
    let nbprMeta = _.get(action, 'meta.nbpr')
    // if there's a normal reducer and the action isn't marked, use the normal reducer
    if (normalReducer && !nbprMeta)
      return normalReducer(state, action)

    // otherwise, reducerless!
    return reducerlessReducer(stateKey, state, action)
  }

  // indicate that this reducer has been reducerless'd
  reducerRouter.reducerless = true

  // return
  return reducerRouter
}