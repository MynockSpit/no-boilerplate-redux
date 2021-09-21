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
- [Migrating to `no-boilerplate-redux`](#migrating-to-no-boilerplate-redux)
- [API](#api)
  * [`makeStore({ key, reducer, preloadedState, enhancer })`](#makestore-key-reducer-preloadedstate-enhancer-)
    + [Arguments](#arguments)
    + [Returns](#returns)
    + [Usage Notes](#usage-notes)
    + [Examples](#examples)
      - [Basic store](#basic-store)
      - [Store with vanilla reducers](#store-with-vanilla-reducers)
      - [Store with vanilla reducers and base state](#store-with-vanilla-reducers-and-base-state)
      - [Store with vanilla reducers and react-router](#store-with-vanilla-reducers-and-react-router)
  * [`makeReducer(reducers, [combiner])`](#makereducerreducers-combiner)
    + [Arguments](#arguments-1)
    + [Returns](#returns-1)
    + [Examples](#examples-1)
  * [`store([storeKey])`](#storestorekey)
    + [Arguments](#arguments-2)
    + [Returns](#returns-2)
    + [Examples](#examples-2)
  * [`storeObject.set([path], payload)`](#storeobjectsetpath-payload)
    + [Arguments](#arguments-3)
    + [Examples](#examples-3)
      - [Value `.set`](#value-set)
      - [Function `.set`](#function-set)
  * [`storeObject.action([path], action)`](#storeobjectactionpath-action)
    + [Arguments](#arguments-4)
    + [Examples](#examples-4)
      - [Action method](#action-method)
      - [Action creator method](#action-creator-method)
  * [`storeObject.get([path, defaultValue])`](#storeobjectgetpath-defaultvalue)
    + [Arguments](#arguments-5)
    + [Returns](#returns-3)
    + [Examples](#examples-5)

<!-- tocstop -->

## Usage (with React)

Most of the following you'll recognize from setting up Redux. This assumes you weren't using Redux previously. Please see the migration section for details on how to use vanilla reducers with `no-boilerplate-redux`.

1. Install no-boilerplate-redux

    ```sh
    npm install --save no-boilerplate-redux
    ```

2. Create your store using from `no-boilerplate-redux` in your app, and use it like redux's `makeStore`.

    ```js
    // import store
    import { makeStore, makeReducer } from 'no-boilerplate-redux'

    // create your store so you can attach it to your app
    const myStore = makeStore()
    ```

    If you already have reducers, you can use them like so:

    ```js
    import { makeStore, makeReducer } from 'no-boilerplate-redux'
    import { baseReducers } from './reducers'

    const myStore = makeStore({
      reducer: makeReducer(baseReducers)
    })
    ```

3. Connect your React components to your state like you normally would. This causes the "magic" auto-update we're familiar with from React. (example uses [`react-redux`](https://github.com/reduxjs/react-redux))

    ```jsx
    // Provide the store to your app.
    render(
      <Provider store={myStore}>
        <App />
      </Provider>,
      document.getElementById('root')
    )
    ```

    For your `Function` components:
    ```jsx
    import { useSelector } from 'react-redux'
        
    export const MyFunctionalComponent = () => {

      // useSelector subscribes your component the a part of state you return from the interior function
      const count = useSelector(state => state.count)

      // ...
    }
    ```

    For your `Class` components:
    ```jsx
    import { connect } from 'react-redux'

    // ...

    const mapStateToProps = ({ count }) => ({ count })

    // connect subscribes your component to the parts of state you return from mapStateToProps
    export default connect(mapStateToProps)(MyClassComponent)
    ```


4. Import `store` and use update and get your store.

    ```jsx
    /* MyComponent.jsx or MyService.js or AnythingElse.really */

    import { store } from 'no-boilerplate-redux'

    // store() gets your global store
    // .set an optional path and a value (to replace state with) or a function (which should return new state) 

    store()
      .set('count', count => ++count)

    store()
      .set('users["Nathaniel Hutchins"].title', 'Web Developer')

    store()
      .set(store => {
        store.username = "MynockSpit"
        return store
      })
    ```

## Integrations

Integrating with `redux` (and `no-boilerplate-redux`) often as simple as customizing the initial configuration. Where vanilla redux uses `createStore`, `no-boilerplate-redux` uses `makeStore`. The parameters these two functions take are fundamentally the same. In cases where only initial configuration is need, no-boilerplate-redux is no harder to integrate with than vanilla redux.

See the docs on [`makeStore`](#storecreate-reducers-reducercombiner-preloadedstate-enhancer-) for details on what's different.

### Integration with Redux Dev Tools

Redux Dev Tools integrates by providing an enhancer. Use `makeStore`'s `enhancer` prop to set it. 

#### Basic integration example (no middlewares)

```js
const myStore = makeStore({
  enhancer: window.__REDUX_DEVTOOLS_EXTENSION__ && window.__REDUX_DEVTOOLS_EXTENSION__()
});
```

#### Advanced integration example (with middlewares)

```js
import { applyMiddleware, compose } from 'redux';
import { makeStore } from 'no-boilerplate-redux';

const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose

export const myStore = makeStore({
  enhancer: composeEnhancers(
    applyMiddleware(...middleware)
  ),
})
```

See [DevTools with Redux](https://github.com/zalmoxisus/redux-devtools-extension#1-with-redux) for more info.

### Integration with React Router (using `connected-react-router`)

This example uses `connected-react-router` to integrate `react-router` with `redux` and `no-boilerplate-redux`.

```js
import { applyMiddleware, compose } from 'redux'
import { makeStore, makeReducer } from 'no-boilerplate-redux'
import { connectRouter, routerMiddleware } from 'connected-react-router'
import { createBrowserHistory } from 'history'
import { todoReducer } from './todos'
import { userReducer } from './users'

export const history = createBrowserHistory()

const reducerObject = {
  todoReducer,
  userReducer
}

export const myStore = makeStore({
  // wrap the store w/ react-router
  reducer: makeReducer({ // note that this combineReducer is imported from `no-boilerplate-redux`
    router: connectRouter(history),
    ...reducers
  }),

  // enhance the store w/ react-router
  enhancer: compose(applyMiddleware(routerMiddleware(history)))
})
```

## A note on Middleware

no-boilerplate-redux sets the `nbpr` property on the `meta` object of your actions. If you use a middleware and overwrite the meta tag or change the `nbpr` property, your no-boilerplate-redux actions won't fire. Be careful you don't overwrite or remove this tag!

```js
// example action
{
  type: "SET_DEVELOPERS",
  payload: {
    value: 2
    path: "Nathaniel Hutchins"
  },
  meta: {
    nbpr: 'update' // don't overwrite this!
  }
}
```

## Migrating to `no-boilerplate-redux`

The main difference between `redux`'s `createStore` and `no-boilerplate-redux`'s `makeStore` is that `createStore` takes positional arguments, and `makeStore` takes object arguments. See the example below for the corresponding calls in each. Similarly, we use `makeReducer` instead of `combineReducer`. `makeReducer` is only necessary if you want to start with an object of reducers.

```js
// redux
import { createStore, combineReducers } from 'redux'

export const myStore = createStore(
  combineReducers({ todos: todoReducer, users: userReducer }),          // reducer
  { todos: [], users: []},                                              // preloadedState
  window.__REDUX_DEVTOOLS_EXTENSION__()                                 // enhancer
)

// no-boilerplate-redux
import { makeStore, makeReducer } from 'no-boilerplate-redux'

export const myStore = makeStore({
  reducer: makeReducer({ todos: todoReducer, users: userReducer }), // reducer
  preloadedState: { todos: [], users: []},                              // preloadedState
  enhancer: window.__REDUX_DEVTOOLS_EXTENSION__()                       // enhancer
})
```

## API

### `makeStore({ key, reducer, preloadedState, enhancer })`

Creates the Redux store for use with `no-boilerplate-redux`. See the migration section above for quirks and caveats.

#### Arguments
`[key] (String)`: A string representing the key of this  Allows you to use multiple stores.  
`[reducer] (Function|Object)`: The reducer function. Not necessary if you have no standard Redux reducers. Identical to the `reducer` argument in Redux's [`createStore`](https://github.com/reduxjs/redux/blob/master/docs/api/createStore.md#arguments).  
`[preloadedState] (Object)`: The initial state. Identical to the `preloadedState` argument in Redux's [`createStore`](https://github.com/reduxjs/redux/blob/master/docs/api/createStore.md#arguments).  
`[enhancer] (Function)`: The store enhancer. Identical to the `enhancer` argument in Redux's [`createStore`](https://github.com/reduxjs/redux/blob/master/docs/api/createStore.md#arguments).

#### Returns
`store`: the store object created. This is normally used for things like passing to a provider. 

#### Usage Notes

- Do not use `redux`'s `combineReducers`! Use `makeReducer` instad. If you forget and use `combineReducers`, parts of your store not in your initial `reducers` object will disappear when an action is fired. Example below.
  ```js
  // Bad
  import { combineReducers } from 'redux' 
  import { makeStore } from 'no-boilerplate-redux' 
  
  // Good
  import { makeStore, makeReducer } from 'no-boilerplate-redux' 
  ```

- If you use `combineReducers` from `no-boilerplate-redux`, all top-level keys will always be set to `null`. This is the same behavior found in vanilla redux. If you do NOTE use `combineReducers` from `no-boilerplate-redux` there is no restriction on the values you can set.

- If you want to use multiple stores, the second create call **must provide a `key` property**. Multiple stores is not recommended.

#### Examples

##### Basic store
```js
import { makeStore } from 'no-boilerplate-redux'

const myStore = makeStore()

// use store e.g. in a react-redux <Provider> component
```

##### Store with vanilla reducers
```js
import { makeStore, makeReducer } from 'no-boilerplate-redux'
import baseReducers from './reducers' // an object of [key]: [reducer fn]

const myStore = makeStore({
  reducer: makeReducer(baseReducers)
})
```

##### Store with vanilla reducers and base state
```js
// create a new store with vanilla reducer for 'albums' and default values for 'albums' and 'artists'
import { makeStore, makeReducer } from 'no-boilerplate-redux'
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

const myStore = makeStore({
  reducer: makeReducer(myReducers), 
  preloadedState: myPreloadedState
})

// use store e.g. in a react-redux <Provider> component
```

##### Store with vanilla reducers and react-router
```js
import { makeStore, makeReducer } from 'no-boilerplate-redux'
import myReducers from './reducers'
import { applyMiddleware, compose } from 'redux'
import { routerMiddleware, connectRouter } from 'connected-react-router'

const myStore = makeStore({
  reducer: connectRouter(history)(makeReducer(myReducers)),
  enhancer: compose(applyMiddleware(routerMiddleware(history)))
})

// use store e.g. in a react-redux <Provider> component
```

---

### `makeReducer(reducers, [combiner])`

#### Arguments
`reducers (Object)`: An object whose values correspond to different reducer functions that need to be combined into one. One handy way to obtain it is to use ES6 `import * as reducers` syntax. The reducers may never return undefined for any action. Instead, they should return their initial state if the state passed to them was undefined, and the current state for any unrecognized action. Identical to the reducer object you'd pass into `redux`'s [`combineReducers`](https://github.com/reduxjs/redux/blob/master/docs/api/combineReducers.md).  
 * @param {Function} [combiner]   A function used to combine the reducers object into
`[combiner] (Function)`: A function used to combine the reducers in the `reducers` object. If not set, defaults to `redux`'s [`combineReducers`](https://github.com/reduxjs/redux/blob/master/docs/api/combineReducers.md).  

#### Returns
`reducer` (Function): A reducer function that invokes every reducer inside the passed object, adds a null reducer for state keys not provided in the initial object, and builds a state object with the same shape.

#### Examples

```js
// rootReducer.js
import { makeReducer } from 'no-boilerplate-redux'

import albumsReducer from './albums'
import artistsReducer from './artists'
import songsReducer from './songs'

export const rootReducers = makeReducer({
  albums: albumsReducer, 
  artists: artistsReducer, 
  songs: songsReducer 
})
```

---

### `store([storeKey])`

Get a store. While it is possible to use the generated store directly, this is the recommended way to interact with stores b/c it prevents store from becoming singletons. 

#### Arguments

`[storeKey] (string OR Array)`: The name of the store you want to access. If not provided, returns the default global store.

#### Returns

`storeObject`: the store object with chaining methods (see below)

#### Examples

```js
import { store } from 'no-boilerplate-redux'

const storeObject = store()
```

---

### `storeObject.set([path], payload)`

Sets the store to an arbitrary value. Takes an optional path to scope the changes. NOTE: It is recommended to use `store()` (see above) to get reference your store. All examples use this method.

#### Arguments

`[path] (string OR Array)`: The lodash-style path (string or array) representing where in the store to modify data. If not specified, the selection is the entire store.  
`payload (value OR Function)`: If this is a value, replace the selected state with this value. If this is a function, it is run, and the value returned is the new state. Function is passed the old state as an argument.

#### Examples

##### Value `.set`

```js
// initial store = {
//   developers: null
// }
import { store } from 'no-boilerplate-redux'
const storeObject = store()
 
// replace the entire developers store
storeObject.set({
  developers: {
    "1": { name: "Nathaniel", title: "Web Developer" }
    "2": { name: "Eddie", title: "Web Developer" }
  }
})

// final store = {
//   developers: {
//     "1": { name: "Nathaniel", title: "Web Developer" }
//     "2": { name: "Eddie", title: "Web Developer" }
//   }
// }
```

##### Function `.set`

```js
// initial store = {
//   todos: [
//     { text: "write documentation", complete: true },
//     { text: "add support for middleware", complete: false },
//     { text: "take a break from writing code", complete: false }
//   ]
// }
import { store } from 'no-boilerplate-redux'
const storeObject = store()

// remove completed todos from the store
storeObject.set(store => {
  store.todos = store.todos.filter((todo) => !todo.complete)
  return store
})

// final store = {
//   todos: [
//     { text: "add support for middleware", complete: false },
//     { text: "take a break from writing code", complete: false }
//   ]
// }
```

```js
// initial store = {
//   todos: [
//     { text: "write documentation", complete: true },
//     { text: "add support for middleware", complete: false },
//     { text: "take a break from writing code", complete: false }
//   ]
// }
import { store } from 'no-boilerplate-redux'
const storeObject = store()

// entirely re-write store
storeObject.set(store => {
  return {
    username: "MynockSpit"
  }
})

// final store = {
//   todos: null,
//   username: "MynockSpit"
// }
```

---

### `storeObject.action([path], action)`

Sets the store to an arbitrary value using an action / action creator. Takes an optional path to scope the changes.

#### Arguments

`[path] (string OR Array)`: The lodash-style path (string or array) representing where in the store to modify data. If not specified, the selection is the entire store.  
`action (Object OR Function)`: If this is an Object, treat it like a redux action, and fire it. If this is a Function, treat it like a action creator, run it, then fire the resulting action. Function is passed the old state as an argument.

#### Examples

##### Action method

```js
// initial store = {
//   developers: null
// }
import { store } from 'no-boilerplate-redux'
const storeObject = store()
 
// replace the entire developers store
storeObject.action({
  type: "ADD_NATHANIEL_EDDIE",
  payload: {
    developers: {
      "1": { name: "Nathaniel", title: "Web Developer" }
      "2": { name: "Eddie", title: "Web Developer" }
    }
  }
})

// action type = "ADD_NATHANIEL_EDDIE"
// final store = {
//   developers: {
//     "1": { name: "Nathaniel", title: "Web Developer" }
//     "2": { name: "Eddie", title: "Web Developer" }
//   }
// }
```

##### Action creator method

```js
// initial store = {
//   todos: [
//     { text: "write documentation", complete: true },
//     { text: "add support for middleware", complete: false },
//     { text: "take a break from writing code", complete: false }
//   ]
// }
import { store } from 'no-boilerplate-redux'
const storeObject = store()

// remove completed todos from the store
storeObject.action(store => {
  store.todos = store.todos.filter((todo) => !todo.complete)
  return {
    type: "DELETE_COMPLETED_TODOS",
    payload: store
  }
})

// action type = "DELETE_COMPLETED_TODOS"
// final store = {
//   todos: [
//     { text: "add support for middleware", complete: false },
//     { text: "take a break from writing code", complete: false }
//   ]
// }
```

```js
// initial store = {
//   todos: [
//     { text: "write documentation", complete: true },
//     { text: "add support for middleware", complete: false },
//     { text: "take a break from writing code", complete: false }
//   ]
// }
import { store } from 'no-boilerplate-redux'
const storeObject = store()

// entirely re-write store
// type is not required
storeObject.action(store => {
  return {
    payload: {
      username: "MynockSpit"
    }
  }
})

// final store = {
//   username: "MynockSpit"
// }
```

---

### `storeObject.get([path, defaultValue])`

Get the store, or a part of the store. 

#### Arguments

`[path] (string OR Array)`: The lodash-style path (string or array) representing where in the store to look for state. If not specified, the entire store is returned.  
`[defaultValue] (*)`: The value to default to if there is no value at the path. Only valid if a path is specified. 

#### Returns

`*`: The value at the store

#### Examples

```js
// developers: {
//   "1": { name: "Nathaniel", title: "Web Developer" }
//   "2": { name: "Eddie", title: "Web Developer" }
// }
import { store } from 'no-boilerplate-redux'
const storeObject = store()

storeObject.get()

// Note, the above is identical to store().get()

{ developers: {
  "1": { name: "Nathaniel", title: "Web Developer" }
  "2": { name: "Eddie", title: "Web Developer" }
} }
```

```js
// developers: {
//   "1": { name: "Nathaniel", title: "Web Developer" }
//   "2": { name: "Eddie", title: "Web Developer" }
// }
import { store } from 'no-boilerplate-redux'
const storeObject = store()

storeObject.get('developers[1]')

{ name: "Nathaniel", title: "Web Developer" }
```


```js
// developers: {
//   "1": { name: "Nathaniel", title: "Web Developer" }
//   "2": { name: "Eddie", title: "Web Developer" }
// }
import { store } from 'no-boilerplate-redux'
const storeObject = store()

storeObject.get('developers[4]', 'DEFAULT VALUE')

'DEFAULT VALUE'
```