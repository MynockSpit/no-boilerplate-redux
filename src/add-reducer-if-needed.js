import { reducerFactory } from './reducer-factory'

export function addReducerIfNeeded(stateKey, reducers, store) {
  // returns true if it created a new reducer for it, false if it didn't

  if (reducers && stateKey && typeof stateKey === 'string') {

    // if this store doesn't exist, create it
    if (!reducers[stateKey]) {
      reducers[stateKey] = reducerFactory(stateKey)
  
      if (store)
        store.replaceReducer(store.reducerCombiner(reducers))

      return true
    }
    // if this does exist, but isn't reducerless, make a reducerless reducer for it
    else if (!reducers[stateKey].reducerless) {
      reducers[stateKey] = reducerFactory(stateKey, reducers[stateKey])

      if (store)
        store.replaceReducer(store.reducerCombiner(reducers))

      return true
    }
  }

  return false
}