import { createStore } from 'redux'

import { set } from './set'
import { get } from './get'
import { action } from './action'
import { nbprReducer } from './default-reducer';

import lodash_get from 'lodash/get'

const stores = {}

/**
 * 
 * A createStore replacement. Does all the same things as createStore 
 * (and accepts very similar arguments), and initializes no boilerplate redux.
 * 
 * @param {Object} config   A config object used to reference, create and recreate the store.
 * @param {String} [key='global']   A key used to save and get the store.
 * @param {Object|Function} [config.reducer]   A reducer function or an object of reducers function to include alongside no-boilerplate-redux
 * @param {Object} [config.reducerCombiner=combineReducers]   If reducer is an object and not a function, the function we use to combine them. Defaults to redux's combineReducers
 * @param {Object} [config.preloadedState]   An object of default state; does not require `reducer` param to function
 * @param {Function} [config.enhancer]   A function to enhance your store with third-party capabilities. (see  https://github.com/reduxjs/redux/blob/master/docs/api/createStore.md)
 */
export const makeStore = ({
  key = 'global',
  reducer: userReducer,
  preloadedState,
  enhancer
} = {}) => {
  if (stores[key]) {
    throw new Error(`Store with key "${key}" already initialized! If you wanted a second store please use another key, and if you wanted to clear the store, use \`store().set()\`.`)
  }

  let passThroughArguments = [preloadedState, enhancer]

  function reducerRouter(state, action) {
    let nbprMeta = lodash_get(action, 'meta.nbpr', Symbol.for('nbpr-meta-not-set'))

    // if meta.nbpr is not set, don't bother with running the nbprReducer
    if (nbprMeta === Symbol.for('nbpr-meta-not-set'))
      return userReducer ? userReducer(state, action) : state

    // if the user didn't provide a reducer, just to nbpr
    if (!userReducer)
      return nbprReducer(state, action)

    // if the user provided one, run it to make sure we don't remove anything we're not supposed to.
    return userReducer(nbprReducer(state, action), {
      ...action,
      type: '', // clear the type so we don't accidentally trigger some default reducers
    })
  }

  let store = createStore(reducerRouter, ...passThroughArguments)

  store.set = set.bind(store)
  store.get = get.bind(store)
  store.action = action.bind(store)

  stores[key] = store

  return store
}

/**
 * 
 * Get the store referenced by the provided key.
 * 
 * @param {String} [storeKey='global']  The key of the store. If not provided, use the global store. 
 */
export function getStore(storeKey = 'global') {
  return stores[storeKey]
}