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
  * [`store.create({ reducers, reducerCombiner, preloadedState, enhancer })`](#storecreate-reducers-reducercombiner-preloadedstate-enhancer-)
    + [Arguments](#arguments)
    + [Returns](#returns)
    + [Examples](#examples)
      - [Basic store](#basic-store)
      - [Store with vanilla reducers](#store-with-vanilla-reducers)
      - [Store with vanilla reducers and base state](#store-with-vanilla-reducers-and-base-state)
      - [Store with vanilla reducers and react-router](#store-with-vanilla-reducers-and-react-router)
  * [`store([storeKey])`](#storestorekey)
    + [Arguments](#arguments-1)
    + [Returns](#returns-1)
    + [Examples](#examples-1)
  * [`storeObject.set([path], payload)`](#storeobjectsetpath-payload)
    + [Arguments](#arguments-2)
    + [Examples](#examples-2)
      - [Value `.set`](#value-set)
      - [Function `.set`](#function-set)
  * [`storeObject.action([path], action)`](#storeobjectactionpath-action)
    + [Arguments](#arguments-3)
    + [Examples](#examples-3)
      - [Action method](#action-method)
      - [Action creator method](#action-creator-method)
  * [`storeObject.get([path, defaultValue])`](#storeobjectgetpath-defaultvalue)
    + [Arguments](#arguments-4)
    + [Returns](#returns-2)
    + [Examples](#examples-4)

<!-- tocstop -->

## Usage (with React)

Most of the following you'll recognize from setting up Redux.

1. Install no-boilerplate-redux

    ```sh
    npm install --save no-boilerplate-redux
    ```

2. Import `store` from `no-boilerplate-redux` in your app, and use it like redux's `createStore`.

    ```jsx
    /* index.jsx */

    // import store
    import store from 'no-boilerplate-redux'

    // create your store and export it so we can set state on it
    export const myStore = store.create()

    // use the imported store
    render(
      <Provider store={myStore}>
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

    import store from 'no-boilerplate-redux'

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

Integrating with redux (and no-boilerplate-redux) often as simple as customizing the initial configuration. Where vanilla redux uses `createStore`, `no-boilerplate-redux` uses `store.create`. The parameters these two functions take are fundamentally the same. In cases where only initial configuration is need, no-boilerplate-redux is no harder to integrate with than vanilla redux.

See the docs on [`store.create`](#storecreate-reducers-reducercombiner-preloadedstate-enhancer-) for details on what's different.

### Integration with Redux Dev Tools

Redux Dev Tools integrates by providing an enhancer. Use `store.create`'s `enhancer` prop to set it. 

#### Basic integration example (no middlewares)

```js
const myStore = store.create({
  enhancer: window.__REDUX_DEVTOOLS_EXTENSION__ && window.__REDUX_DEVTOOLS_EXTENSION__()
});
```

#### Advanced integration example (with middlewares)

```js
import { createStore, applyMiddleware, compose } from 'redux';

const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose

export const myStore = store.create({
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
import store from 'no-boilerplate-redux'
import { connectRouter, routerMiddleware } from 'connected-react-router'
import { createBrowserHistory } from 'history'

export const history = createBrowserHistory(...config)

export const myStore = store.create({
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

### `store.create({ reducers, reducerCombiner, preloadedState, enhancer })`

Creates the Redux store for use with no-boilerplate-redux.

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
store.create({
  reducers: myReducers,
  reducerCombiner: combineReducers,
  preloadedState: myBaseStateObject,
  enhancer: myCoolEnhancer
})
```

#### Returns
`store`: the store object created. This is normally used for things like passing to a provider. 

#### Examples

##### Basic store
```js
import store from 'no-boilerplate-redux'

const myStore = store.create()

// use store e.g. in a react-redux <Provider> component
```

##### Store with vanilla reducers
```js
import store from 'no-boilerplate-redux'
import baseReducers from './reducers'

const myStore = store.create({
  reducers: baseReducers
})
```

##### Store with vanilla reducers and base state
```js
// create a new store with vanilla reducer for 'albums' and default values for 'albums' and 'artists'
import store from 'no-boilerplate-redux'
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

const myStore = store.create({
  reducer: myReducers, 
  preloadedState: myPreloadedState
})

// use store e.g. in a react-redux <Provider> component

```

##### Store with vanilla reducers and react-router
```js
import store from 'no-boilerplate-redux'
import myReducers from './reducers'
import { applyMiddleware, compose, combineReducers } from 'redux'
import { routerMiddleware, connectRouter } from 'connected-react-router'

const reducer = connectRouter(history)(combineReducers(myReducers))

const myStore = store.create({
  reducer: reducer,
  enhancer: compose(applyMiddleware(routerMiddleware(history)))
})

// use store e.g. in a react-redux <Provider> component

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
import store from 'no-boilerplate-redux'

const storeObject = store()

---

```

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

storeObject.get('developers[1]')

{ name: "Nathaniel", title: "Web Developer" }

```


```js
// developers: {
//   "1": { name: "Nathaniel", title: "Web Developer" }
//   "2": { name: "Eddie", title: "Web Developer" }
// }

storeObject.get('developers[4]', 'DEFAULT VALUE')

'DEFAULT VALUE'

```