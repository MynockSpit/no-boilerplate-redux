import {
  combineReducers,
  createStore as createReduxStore
} from 'redux'

import { set } from './set'
import { get } from './get'
import { action } from './action'
import { defaultReducer } from './default-reducer';

import lodash_get from 'lodash/get'

function noopReducer(state = null) { return state }

/**
 * 
 * A createStore replacement. Does all the same things as createStore 
 * (and accepts very similar arguments), and initializes no boilerplate redux.
 * 
 * @param {Object} config - A config object used to reference, create and recreate the store.
 * @param {Object} config.reducers={} - An object of normal redux reducers to include alongside no-boilerplate-redux
 * @param {Function} config.reducerCombiner=combineReducers - A function that takes in a reducers object (see above) and produces a root reducer
 * @param {Object} config.preloadedState={} - An object of default state; does not require `reducers` param to function
 * @param {Function} config.enhancer - A function to enhance your store with thirder-party capabilities. (see  https://github.com/reduxjs/redux/blob/master/docs/api/createStore.md)
 */
export const initializeStore = (config = {}) => {
  const {
    reducers = {},
    reducerCombiner = combineReducers,
    preloadedState = {},
    enhancer
  } = config

  let rootReducer

  if (reducers && typeof reducers === 'object' && Object.keys(reducers).length === 0) {
    rootReducer = noopReducer
  } 
  
  else {
    let patchedReducers = Object.assign(
      {},
      Object.keys(preloadedState).reduce((obj, key) => {
        obj[key] = noopReducer
        return obj
      }, {}),
      reducers
    )
    rootReducer = reducerCombiner(patchedReducers)
  }

  let passThroughArguments = [preloadedState, enhancer]


  function reducerRouter(state, action) {
    let nbprMeta = lodash_get(action, 'meta.nbpr', Symbol.for('meta.nbpr-not-set'))

    // if meta.nbpr is not set, use the passed in rootReducer
    if (nbprMeta === Symbol.for('meta.nbpr-not-set'))
      return rootReducer(state, action)

    // else, NO BOILERPLATE!!!
    return defaultReducer(state, action)
  }

  let store = createReduxStore(reducerRouter, ...passThroughArguments)

  store.set = set.bind(store)
  store.get = get.bind(store)
  store.action = action.bind(store)

  return store
}