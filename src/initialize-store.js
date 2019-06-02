import {
  combineReducers,
  createStore as createReduxStore
} from 'redux'
import _ from 'lodash'

import { select } from './select'
import { set } from './set'
import { addReducerIfNeeded } from './add-reducer-if-needed'

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

  // build reducerless reducers for each piece of the preloadedState that isn't matched already
  Object.keys(preloadedState).forEach((stateKey) => addReducerIfNeeded(stateKey, reducers))

  // always need at least one reducer to start; redux_.loaded is a dummy reducer that doesn't do anything except let us build an initial store; we only add it if we didn't get a baseReducer or an initialState from the user
  if (!Object.keys(reducers).length)
    reducers.redux_loaded = () => true

  let store = createReduxStore(
    reducerCombiner(reducers),
    preloadedState,
    enhancer
  );

  store.select = select.bind(store)
  store.set = set.bind(store)
  store.reducers = reducers
  store.reducerCombiner = reducerCombiner

  return store
}