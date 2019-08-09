# No Boilerplate Redux

Never write a reducer, an action, or worry about immutability again!

<!-- toc -->

- [Usage (with React)](#usage-with-react)
- [Integrations](#integrations)
  * [Integration with Redux Dev Tools](#integration-with-redux-dev-tools)
    + [Basic integration example (no middlewares)](#basic-integration-example-no-middlewares)
    + [Advanced integration example (with middlewares)](#advanced-integration-example-with-middlewares)
  * [Integration with React Router (using `connected-react-router`)](#integration-with-react-router-using-connected-react-router)
- [A note on Middleware](#a-note-on-middleware)
- [API](#api)
  * [`initializeStore({ reducers, reducerCombiner, preloadedState, enhancer })`](#initializestore-reducers-reducercombiner-preloadedstate-enhancer-)
    + [Arguments](#arguments)
    + [Returns](#returns)
    + [Examples](#examples)
      - [Basic store](#basic-store)
      - [Store with vanilla reducers](#store-with-vanilla-reducers)
      - [Store with vanilla reducers and base state](#store-with-vanilla-reducers-and-base-state)
      - [Store with vanilla reducers and react-router](#store-with-vanilla-reducers-and-react-router)
  * [`store.select(storePart, [path])`](#storeselectstorepart-path)
    + [Arguments](#arguments-1)
    + [Returns](#returns-1)
  * [`store.select(...).set(valueOrFunction, [actionCustomization])`](#storeselectsetvalueorfunction-actioncustomization)
    + [Arguments](#arguments-2)
    + [Returns](#returns-2)
    + [Examples](#examples-1)
      - [Value Set](#value-set)
      - [Function Set](#function-set)
      - [Customized Action](#customized-action)
  * [`store.select(...).get([defaultValue])`](#storeselectgetdefaultvalue)
    + [Arguments](#arguments-3)
    + [Returns](#returns-3)
    + [Examples](#examples-2)
  * [`store.set(valueOrFunction, [actionCustomization])`](#storesetvalueorfunction-actioncustomization)
    + [Arguments](#arguments-4)
    + [Examples](#examples-3)
      - [Value Set](#value-set-1)
      - [Function Set](#function-set-1)
  * [`store.get(path, [defaultValue])`](#storegetpath-defaultvalue)
    + [Arguments](#arguments-5)
    + [Returns](#returns-4)
    + [Examples](#examples-4)

<!-- tocstop -->

## Usage (with React)

Most of the following you'll recognize from setting up Redux.

1. Install no-boilerplate-redux

    ```sh
    npm install --save no-boilerplate-redux
    ```

2. Import `initializeStore` from `no-boilerplate-redux` in your app, and use it like redux's `createStore`.

    ```jsx
    /* index.jsx */

    // import initializeStore
    import { initializeStore } from 'no-boilerplate-redux'

    // initialize your store and export it so we can set state on it
    export const store = initializeStore()

    // use the imported store
    render(
      <Provider store={store}>
        <App />
      </Provider>,
      document.getElementById('root')
    )
    ```

3. Connect your React components to your state. This causes the "magic" auto-update we're familiar with from React. (example uses [`react-redux`](https://github.com/reduxjs/react-redux))

    ```jsx
    /* MyComponent.jsx */

    // import the connect function from react-redux
    import { connect } from 'react-redux'
        
    ...

    // connect parts of your state
    const mapStateToProps = ({ count }) => ({ count })
    
    export default connect(mapStateToProps)(MyComponent)
    ```

4. Import your `store` and use it in your components (or in a services file).

    ```jsx
    /* MyComponent.jsx or MyService.js or AnythingElse.really */

    import { store } from './index.js' // this is the store you created

    // .select to select what part of the store you're modifying (and an optional path)
    // .set takes a value or a function to set the selected storeBranch

    store
      .select('count')
      .set(count => ++count)

    store
      .select('users', '["Nathaniel Hutchins"].title')
      .set('Web Developer')

    store
      .set(store => {
        store.username = "MynockSpit"
        return store
      })
    ```

## Integrations

Integrating with redux (and no-boilerplate-redux) often as simple as customizing the initial configuration. Where vanilla redux uses `createStore`, `no-boilerplate-redux` uses `initializeStore`. The parameters these two functions take are fundamentally the same. In cases where only initial configuration is need, no-boilerplate-redux is no harder to integrate with than vanilla redux.

See the docs on [`initializeStore`](#initializestore-reducers-reducercombiner-preloadedstate-enhancer-) for details on what's different.

### Integration with Redux Dev Tools

Redux Dev Tools integrates by providing an enhancer. Use `initializeStore`'s `enhancer` prop to set it. 

#### Basic integration example (no middlewares)

```js
const store = initializeStore({
  enhancer: window.__REDUX_DEVTOOLS_EXTENSION__ && window.__REDUX_DEVTOOLS_EXTENSION__()
});
```

#### Advanced integration example (with middlewares)

```js
import { createStore, applyMiddleware, compose } from 'redux';

const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose

export const store = initializeStore({
  enhancer: composeEnhancers(
    applyMiddleware(...middleware)
  ),
})
```

See [DevTools with Redux](https://github.com/zalmoxisus/redux-devtools-extension#1-with-redux) for more info.

### Integration with React Router (using `connected-react-router`)

This example uses connected-react-router to integrate with redux.

```js
import { applyMiddleware, compose, combineReducers } from 'redux'
import { initializeStore } from 'no-boilerplate-redux'
import { connectRouter, routerMiddleware } from 'connected-react-router'
import { createBrowserHistory } from 'history'

export const history = createBrowserHistory(...config)

export const store = initializeStore({
  reducerCombiner: (reducers) => connectRouter(history)(combineReducers(reducers)),
  enhancer: compose(applyMiddleware(routerMiddleware(history))),
})
```

## A note on Middleware

no-boilerplate-redux sets the `nbpr` property on the `meta` object of your actions. If you use a middleware and overwrite the meta tag or change the `nbpr` property, your no-boilerplate-redux actions won't fire. Be careful you don't overwrite this tag!

```js
// example action
{
  type: "SET_DEVELOPERS",
  payload: {
    value: 2
    path: "Nathaniel Hutchins"
  },
  meta: {
    nbpr: 'developers' // don't overwrite this!
  }
}
```

## API

### `initializeStore({ reducers, reducerCombiner, preloadedState, enhancer })`

Initializes the Redux store for use with no-boilerplate-redux.

#### Arguments
`[reducers={}] (Object)`: An object whose values are standard Redux reducers. Not necessary if you have no standard Redux reducers. In vanilla redux, this is the object you pass into [`combineReducers`](https://github.com/reduxjs/redux/blob/master/docs/api/combineReducers.md).
`[reducerCombiner=combineReducers] (Function)`: A function that turns an object of reducers into a single reducing function. Not necessary unless using a library that injects reducers by way of functions. (e.g. connected-react-router) In vanilla redux, this is the function [`combineReducers`](https://github.com/reduxjs/redux/blob/master/docs/api/combineReducers.md).  
`[preloadedState] (Object)`: The initial state. Identical to the `preloadedState` argument in Redux's `createStore`.[(more info)](https://github.com/reduxjs/redux/blob/master/docs/api/createStore.md#arguments)  
`[enhancer] (Function)`: The store enhancer. Identical to the `enhancer` argument in Redux's `createStore`. [(more info)](https://github.com/reduxjs/redux/blob/master/docs/api/createStore.md#arguments)

All argument are fundamentally the same as the arguments vanilla redux's `createStore` accepts.

- `reducer`, `createStore`'s first argument, has been split into two parts, `reducers` and `reducerCombiner`. Unlike vanilla redux, both are optional. 
- `preloadedState`, `createStore`'s second and optional argument, is identical and remains optional. See [redux's documentation](https://github.com/reduxjs/redux/blob/master/docs/api/createStore.md#arguments) for more info.
- `enhancers`, `createStore`'s third and optional argument, is identical and remains optional. See [redux's documentation](https://github.com/reduxjs/redux/blob/master/docs/api/createStore.md#arguments) for more info.

```js
// redux's createStore
createStore(
  combineReducers(myReducers),
  myBaseStateObject,
  myCoolEnhancer
)

// becomes ...
initializeStore({
  reducers: myReducers,
  reducerCombiner: combineReducers,
  preloadedState: myBaseStateObject,
  enhancer: myCoolEnhancer
})
```

#### Returns
`store`: the store object created; used to `.select` parts of state and then `.set` them later.

#### Examples

##### Basic store
```js
import { initializeStore } from 'no-boilerplate-redux'

export const store = initializeStore()
```

##### Store with vanilla reducers
```js
import { initializeStore } from 'no-boilerplate-redux'
import baseReducers from './reducers'

export const store = initializeStore({
  reducers: baseReducers
})
```

##### Store with vanilla reducers and base state
```js
// create a new store with vanilla reducer for 'albums' and default values for 'albums' and 'artists'
import { initializeStore } from 'no-boilerplate-redux'
import albums from './albums/reducer'

let myReducers = { albums: albums }
let myPreloadedState = {
    albums: [{
      title: 'Talking Heads: 77',
      artist: 'Talking Heads',
      released: 'September 16, 1977'
    }, {
      title: 'Little Creatures',
      artist: 'Talking Heads',
      released: 'June 10, 1985'
    }],
    artists: {
      'Talking Heads': {
        formed: '1975',
        activeUntil: '1991'
      }
    }
  }

export const store = initializeStore({
  reducers: myReducers, 
  preloadedState: myPreloadedState
})
```

##### Store with vanilla reducers and react-router
```js
import { initializeStore } from 'no-boilerplate-redux'
import myReducers from './reducers'
import { applyMiddleware, compose, combineReducers } from 'redux'
import { routerMiddleware, connectRouter } from 'connected-react-router'

export const store = initializeStore({
  reducers: myReducers,
  reducerCombiner: (reducers) => connectRouter(history)(combineReducers(reducers)),
  enhancer: compose(applyMiddleware(routerMiddleware(history)))
})
```

---

### `store.select(storePart, [path])`

Selects the state you're going to use and returns an object with modification methods. 

#### Arguments
`storePart (string)`: The key of the state object you want to interact with  
`path (string OR Array)`: The path to specific data (uses [`lodash`](https://github.com/lodash/lodash)-style paths)

#### Returns
`(Object)`: an object with the `.set` and `.get` methods (see below)

---

### `store.select(...).set(valueOrFunction, [actionCustomization])`

Sets the selected state's path to the value specified. If path is not set, replaces the state with the value specified.

#### Arguments

`valueOrFunction (value OR Function)`: If this is a function, it is run, and the value returned is the new state. Function is passed the old state as an argument.
`actionCustomization (string OR Object)`: If this is a string, it is appended to the default type to make it more specific. If it is an object, the properties on the object are merged into the action.

#### Returns
`action (Object)`: a copy of the action fired; useful for testing your Function Sets

#### Examples

##### Value Set

```js
// developers: null
 
// replace the entire developers store
store.select('developers').set({
  "1": { name: "Nathaniel", title: "Web Developer" }
  "2": { name: "Eddie", title: "Web Developer" }
}, "EDDIE_NATHANIEL")

// action.type: SET_DEVELOPERS_EDDIE_NATHANIEL
// developers: {
//   "1": { name: "Nathaniel", title: "Web Developer" }
//   "2": { name: "Eddie", title: "Web Developer" }
// }

// use lodash-style set to deeply set data
store.select('developers', '1.name').set("Nathaniel Hutchins")

// action.type: SET_DEVELOPERS
// developers: {
//   "1": { name: "Nathaniel Hutchins", title: "Web Developer" }
//   "2": { name: "Eddie", title: "Web Developer" }
// }
```

##### Function Set

```js
// todos: [
//   { text: "write documentation", complete: true },
//   { text: "add support for middleware", complete: false },
//   { text: "take a break from writing code", complete: false }
// ]

// remove completed todos from the store
store
  .select('todos')
  .set(data => data.filter((todo) => !todo.complete))

// action.type: SET_TODOS_COMPLETE_TODO
// todos: [
//   { text: "add support for middleware", complete: false },
//   { text: "take a break from writing code", complete: false }
// ]
```

##### Customized Action

```js
// music: {
//   "This Must Be The Place": {
//     artist: "Talking Heads", plays: 12, skips: 0
//   },
//   "Burning Down The House": {
//     artist: "Talking Heads", plays: 8, skips: 0
//   }
// }

// increment play count
store
  .select('music', '["Burning Down The House"].plays')
  .set((plays) => plays + 1, {
    type: "MY_COOL_ACTION_TYPE",
    meta: {
      logger: false
    }
  })

// action.type: "MY_COOL_ACTION_TYPE",
// action.meta: {
//   logger: false
// }
//
// music: {
//   "This Must Be The Place": {
//     artist: "Talking Heads", plays: 12, skips: 0
//   },
//   "Burning Down The House": {
//     artist: "Talking Heads", plays: 9, skips: 0
//   }
// }
```

---

### `store.select(...).get([defaultValue])`

#### Arguments

Gets the value at the selected state's path. Returns the default value (if provided) or undefined if the value does not exist. Equivalent to _.get(store.getState()[stateKey], path, defaultValue).

`defaultValue (*)`: If the property doesn't exist on the store, return this default value. 

#### Returns

`(*)`: The value on the store or the defaultValue specified.

#### Examples

```js
// developers: {
//   "1": { name: "Nathaniel", title: "Web Developer" }
//   "2": { name: "Eddie", title: "Web Developer" }
// }

// use lodash-style set to deeply set data
store.select('developers', '1.name').get() // --> "Nathaniel"
store.select('developers', '10.name').get(false) // --> false
```

---

### `store.set(valueOrFunction, [actionCustomization])`

Sets the entire store to the value specified (or returned).

#### Arguments

`valueOrFunction (value OR Function)`: If this is a function, it is run, and the value returned is the new state. Function is passed the old state as an argument.
`actionCustomization (string OR Object)`: If this is a string, it is appended to the default type to make it more specific. If it is an object, the properties on the object are merged into the action.

#### Examples

##### Value Set

```js
// initial store: {
//   developers: null
// }
 
// replace the entire developers store
store.set({
  developers: {
    "1": { name: "Nathaniel", title: "Web Developer" }
    "2": { name: "Eddie", title: "Web Developer" }
  }
}, "EDDIE_NATHANIEL")

// action.type: SET_DEVELOPERS_EDDIE_NATHANIEL
// final store: {
//   developers: {
//     "1": { name: "Nathaniel", title: "Web Developer" }
//     "2": { name: "Eddie", title: "Web Developer" }
//   }
// }

// use lodash-style set to deeply set data
store.set({
  developers: {
    "1": { name: "Nathaniel", title: "Web Developer" }
  },
  username: "MynockSpit"
})

// two actions fired: SET_DEVELOPERS and SET_USERNAME
// final store: {
//   developers: {
//     "1": { name: "Nathaniel Hutchins", title: "Web Developer" }
//     "2": { name: "Eddie", title: "Web Developer" }
//   }
//   username: "MynockSpit"
// }
```

##### Function Set

```js
// initial store: {
//   todos: [
//     { text: "write documentation", complete: true },
//     { text: "add support for middleware", complete: false },
//     { text: "take a break from writing code", complete: false }
//   ]
// }

// remove completed todos from the store
store.set(store => {
  store.todos = store.todos.filter((todo) => !todo.complete)
  return store
})

// action.type: SET_TODOS
// final store: {
//   todos: [
//     { text: "add support for middleware", complete: false },
//     { text: "take a break from writing code", complete: false }
//   ]
// }


// entirely re-write store
store.set(store => {
  return {
    username: "MynockSpit"
  }
})

// two actions fired: SET_TODOS & SET_USERNAME
// final store: {
//   todos: null,
//   username: "MynockSpit"
// }
```

### `store.get(path, [defaultValue])`

#### Arguments

[Lodash-style get](https://lodash.com/docs/4.17.10#get) from the store. Equivalent to _.get(store.getState(), path, defaultValue).

`path (string OR Array)`: The path of the property to get. Can be defined as a dot-separated string or an array of keys. (e.g. `path.to.value` or ['path', 'to', 'value'])
`defaultValue (*)`: If the property doesn't exist on the store, return this default value. 

#### Returns

`*`: The value on the store or the defaultValue specified.

#### Examples

```js
// developers: {
//   "1": { name: "Nathaniel", title: "Web Developer" }
//   "2": { name: "Eddie", title: "Web Developer" }
// }

// use lodash-style set to deeply set data
store.get('developers.1.name') // --> "Nathaniel"
store.get('developers.10.name', false) // --> false
```