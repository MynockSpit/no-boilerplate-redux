import {
  combineReducers,
  createStore as createReduxStore
} from 'redux'
import {
  get as _get,
  cloneDeep as _cloneDeep,
  set as _set
} from 'lodash-es'

// this prefex SHOULD make sure that no reducerless reducers and normal reducers collide
const reducerlessPrefix = 'REDUCERLESS_ACTION'

// store a map of reducers so we can add reducers to it on the fly
const reducers = {}

// build the inital store
let storeReference

// takes a stateKey (for reducerless redux) and an optional normalReducer
// builds a reducer for the statekey (reducerlessReducer) that gets called
//   if there isn't a normalReducer
//   OR if the action matches the reducerlessPrefix
// normalReducers exists only when createStore() was called with reducers

// once everything is created by the factory, the flow is either
// action --> reducerRouter --> reducerlessReducer
// OR
// action --> reducerRouter --> normalReducer
function reducerFactory(stateKey, normalReducer) {

  let setAction = `${reducerlessPrefix}_${stateKey}`.toUpperCase()

  // build a reducerlessReducer here in the same context as setAction
  // used by reducerReducer
  function reducerlessReducer(state = null, action) {
    const {
      path = null,
        value = null,
        fn = null
    } = _get(action, 'payload', {})

    if ((action.type).indexOf(setAction) != -1) {
      // REDUCERLESS_SET sets the value (works best on anything that isn't an array)
      // Operates on either a path you pass in (and modifies a part) of the state or 
      // replaces the entire state without a path
      let newState = _cloneDeep(state)

      // if path isn't null, it means we're setting a PART of the state (leaf)
      if (path !== null) {

        if (newState === null)
          newState = {}

        if (typeof newState !== "object") {
          console.error(`Did not set ${path} of ${stateKey} -- ${stateKey} is not an object (${newState}).`)

          // setting newState back to state to prevent rerenders without changes
          newState = state
        }

        // if the input was a function, use it to generate new state leaf
        else if (fn) {
          const statePart = _get(newState, path)
          _set(newState, path, fn(statePart))
        }

        // if it was a value, replace the leaf with the input value
        else
          _set(newState, path, value)
      }

      // if path is null it means we're setting the entire state (tree)
      else {
        // if the input was a function, use it to generate new state 
        if (fn)
          newState = fn(newState)

        // if the input wasn't a function, replace the tree with the input value
        else
          newState = value
      }

      return newState
    }

    return state
  }

  // reducer reducer is a small function that decides which reducer to use
  // does it use the normalReducer? (preferred if it exists)
  // or the reducerlessReducer (always used if normalReducer doesn't)
  function reducerRouter(state, action) {
    // if there's a normal reducer, prefer it
    if (normalReducer) {
      if ((action.type).indexOf(reducerlessPrefix) == -1)
        return normalReducer(state, action)
      else
        return reducerlessReducer(state, action)
    }

    // if there isn't, don't
    return reducerlessReducer(state, action)
  }

  // indicate that this reducer has been reducerless'd
  reducerRouter.reducerless = true

  // return
  return reducerRouter
}

export const createStore = (baseReducers, preloadedState, enhancer) => {
  // unlike redux's createStore, baseReducers MUST BE an uncombined reducers object -- the object you'd pass to combineReducers 
  // https://github.com/reactjs/redux/blob/master/docs/api/combineReducers.md 

  // the other arguments are described in the redux documentation and behave identically
  // https://github.com/reactjs/redux/blob/master/docs/api/createStore.md

  if (typeof preloadedState === 'function' && typeof enhancer === 'undefined') {
    enhancer = preloadedState
    preloadedState = undefined
  }

  // if we get baseReducers, insert them into reducers
  if (baseReducers)
    Object.assign(reducers, baseReducers)

  // build reducerless reducers for each piece of the preloadedState that isn't matched already
  if (preloadedState)
    Object.keys(preloadedState).forEach(addReducerIfNeeded)

  // always need at least one reducer to start; redux_loaded is a dummy reducer that doesn't do anything except let us build an initial store; we only add it if we didn't get a baseReducer or an initialState from the user
  if (!Object.keys(reducers).length)
    reducers.redux_loaded = () => true

  storeReference = createReduxStore(
    combineReducers(reducers),
    preloadedState,
    enhancer
  );

  storeReference.select = select

  return storeReference
}

function select(stateKey, path) {

  if (stateKey === null)
    throw new Error('stateKey cannot be undefined!')

  let action = `${reducerlessPrefix}_${stateKey}`.toUpperCase()

  return {
    set(valOrFn, customAction) {

      addReducerIfNeeded(stateKey)

      const isFunction = (typeof valOrFn === "function")
      const value = isFunction ? undefined : valOrFn
      const fn = isFunction ? valOrFn : undefined

      if (customAction !== undefined)
        action += `_${customAction.toUpperCase().replace(/\s+/,'_')}`.replace(/^__/,'_')

      storeReference.dispatch({
        type: action,
        payload: {
          path,
          value,
          fn
        }
      })
    }
  }
}

function addReducerIfNeeded(stateKey) {
  // returns true if it created a new reducer for it, false if it didn't

  if (stateKey !== null) {
    // if this store doesn't exist, create a reducer for it
    if (!reducers[stateKey]) {
      reducers[stateKey] = reducerFactory(stateKey)
  
      if (storeReference)
        storeReference.replaceReducer(combineReducers(reducers))

      return true
    }
    // if this does exist, but isn't reducerless, make a reducerless reducer for it
    else if (!reducers[stateKey].reducerless) {
      reducers[stateKey] = reducerFactory(stateKey, reducers[stateKey])

      if (storeReference)
        storeReference.replaceReducer(combineReducers(reducers))

      return true
    }
  }

  return false
}