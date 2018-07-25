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
const nbprActionPrefix = 'NO_BOILERPLATE_REDUX_ACTION'

// store a map of reducers so we can add reducers to it on the fly
const nbprReducers = {}

// build the inital store
let nbprStore
let nbprReducerCombiner

// takes a stateKey (for no boilerplate redux) and an optional normalReducer
// builds a reducer for the statekey (reducerlessReducer) that gets called
//   a) if there isn't a normalReducer
//   OR b) if the action matches the reducerlessPrefix
// normalReducers exists only when createStore() was called with reducers

// once everything is created by the factory, the flow is either
// action --> reducerRouter --> reducerlessReducer
// OR
// action --> reducerRouter --> normalReducer
function reducerFactory(stateKey, normalReducer) {

  let setAction = `${nbprActionPrefix}_${stateKey}`.toUpperCase()

  // reducerRouter is a small function that decides which reducer to use
  // does it use the normalReducer? (preferred if it exists)
  // or the reducerlessReducer (always used if normalReducer doesn't)
  function reducerRouter(state, action) {
    // if there's a normal reducer and the action isn't prefixed, use the normal reducer
    if (normalReducer && (action.type).indexOf(nbprActionPrefix) === -1)
      return normalReducer(state, action)

    // otherwise, reducerless!
    return reducerlessReducer(setAction, state, action)
  }

  // indicate that this reducer has been reducerless'd
  reducerRouter.reducerless = true

  // return
  return reducerRouter
}

function reducerlessReducer(setAction, state = null, action) {
  const {
    path = null,
      value = null,
      fn = null
  } = _get(action, 'payload', {})

  if ((action.type).indexOf(setAction) != -1) {
    // REDUCERLESS_ACTION sets the value (works best on anything that isn't an array)
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
export const initializeStore = (config) => {
  const {
    reducers = {}, 
    reducerCombiner = combineReducers, 
    preloadedState = {}, 
    enhancer 
  } = config
  // if the user gives us some normal reducers, insert them into nbprReducers
  Object.assign(nbprReducers, reducers)

  // we'll use this function to combine our reducers
  // set this if you're using a plugin that adds itself to your reducers in a weird way (I'm looking at you connected-react-router)
  // the default is combineReducers
  nbprReducerCombiner = reducerCombiner

  // build reducerless reducers for each piece of the preloadedState that isn't matched already
  Object.keys(preloadedState).forEach(addReducerIfNeeded)

  // always need at least one reducer to start; redux_loaded is a dummy reducer that doesn't do anything except let us build an initial store; we only add it if we didn't get a baseReducer or an initialState from the user
  if (!Object.keys(nbprReducers).length)
    nbprReducers.redux_loaded = () => true

  nbprStore = createReduxStore(
    combineReducers(nbprReducers),
    preloadedState,
    enhancer
  );

  nbprStore.select = select

  return nbprStore
}

function select(stateKey, path) {

  if (stateKey === null)
    throw new Error('stateKey cannot be undefined!')

  let action = `${nbprActionPrefix}_${stateKey}`.toUpperCase()

  return {
    set(valOrFn, customAction) {

      addReducerIfNeeded(stateKey)

      const isFunction = (typeof valOrFn === "function")
      const value = isFunction ? undefined : valOrFn
      const fn = isFunction ? valOrFn : undefined

      if (customAction !== undefined)
        action += `_${customAction.toUpperCase().replace(/\s+/,'_')}`.replace(/^__/,'_')

      nbprStore.dispatch({
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

    // if this store doesn't exist, create one
    if (!nbprReducers[stateKey]) {
      nbprReducers[stateKey] = reducerFactory(stateKey)
  
      if (nbprStore)
        nbprStore.replaceReducer(nbprReducerCombiner(nbprReducers))

      return true
    }
    // if this does exist, but isn't reducerless, make a reducerless reducer for it
    else if (!nbprReducers[stateKey].reducerless) {
      nbprReducers[stateKey] = reducerFactory(stateKey, nbprReducers[stateKey])

      if (nbprStore)
        nbprStore.replaceReducer(nbprReducerCombiner(nbprReducers))

      return true
    }
  }

  return false
}