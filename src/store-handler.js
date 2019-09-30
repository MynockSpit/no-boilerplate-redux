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

const stores = {}

/**
 * 
 * A createStore replacement. Does all the same things as createStore 
 * (and accepts very similar arguments), and initializes no boilerplate redux.
 * 
 * @param {Object} config   A config object used to reference, create and recreate the store.
 * @param {String} [key='global']   A key used to save and get the store.
 * @param {Object|Function} [config.reducer={}]   A reducer function or an object of reducers function to include alongside no-boilerplate-redux
 * @param {Object} [config.preloadedState={}]   An object of default state; does not require `reducer` param to function
 * @param {Function} [config.enhancer]   A function to enhance your store with third-party capabilities. (see  https://github.com/reduxjs/redux/blob/master/docs/api/createStore.md)
 */
export const createStore = ({ key = 'global', reducer = noopReducer, preloadedState = {}, enhancer } = {}) => {
  if (process.env.NODE_ENV !== 'production' && stores[key]) {
    console.warn(`Store with key "${key}" already initialized! Overwriting reference to original store with this key.`)
  }

  let rootReducer = reducer
  let addReducer
  let reducerObject

  if (reducer && typeof reducer === 'object') {
    reducerObject = reducer
    rootReducer = combineReducers(reducerObject)

    addReducer = (key) => {
      if (key && !reducerObject[key]) {
        reducerObject[key] = noopReducer
        rootReducer = combineReducers(reducerObject)
      }
    }

    Object.keys(preloadedState).forEach(addReducer)
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

  if (addReducer)
    store.addReducer = addReducer

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