import { combineReducers } from 'redux'

function nullReducer(state = null) { return state }

/**
 * 
 * @param {Object} reducers   An object whose values correspond to different reducer 
 *    functions that need to be combined into one. One handy way to obtain it is to 
 *    use ES6 `import * as reducers` syntax. The reducers may never return undefined 
 *    for any action. Instead, they should return their initial state if the state 
 *    passed to them was undefined, and the current state for any unrecognized action.
 * @param {Function} [combiner]   A function used to combine the reducers object into
 *    a reducer function. Defaults to redux's combineReducers function.
 */
export function makeReducer(reducers, combiner = combineReducers) {
  let reducerKeys = Object.keys(reducers).sort().join()
  let reducer = combiner(reducers)

  return function nbprCombination (state, action) {
    let newReducerKeys = Object.keys(state).sort()

    if (reducerKeys !== newReducerKeys.join()) {
      newReducerKeys.forEach(key => {
        if (!reducers[key]) reducers[key] = nullReducer
      })
      reducerKeys = newReducerKeys.join()
      reducer = combiner(reducers)
    }

    return reducer(state, action)
  }
}