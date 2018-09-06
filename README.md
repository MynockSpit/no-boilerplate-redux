# No Boilerplate Redux

Never write a reducer, an action, or worry about immutability again!

## How to Use (with React)

Most of the following you'll recognize from setting up Redux.

1. Install no-boilerplate-redux (and redux if you don't have it)

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

## API Reference

### `initializeStore({ reducers, reducerCombiner, preloadedState, enhancer })`

Initializes the Redux store for use with no-boilerplate-redux.

All argument accepted are things you already know about in redux, so here's a quick primer on how they may have changed.
 
The first argument in `createStore` has been split into two parts, `reducers` and `reducerCombiner`. `reducers` is a plain object that maps to your reducer functions and reducerCombiner is a function that takes that object and returns a "root reducer". In a default case, `reducerCombiner` is the 

```js
let myReducers = {
  todos: todoReducerFn,
  reminders: remindersReducerFn,
  event: eventsReducerFn
}

// redux's createStore
createStore(
  combineReducers(myReducers)
)
// becomes ...
initializeStore({
  reducers: myReducers,
  reducerCombiner: combineReducers
})
```

Unless you use a module that modifies the reducer AFTER combining them (e.g. `connected-react-router`), you shouldn't need to change `reducerCombiner`.
 
*See [combineReducers](https://github.com/reduxjs/redux/blob/master/docs/api/combineReducers.md) for  more details on `reducers` and how a `reducerCombiner` works.*
 
The second and third arguments (`preloadedState` and `enhancers`) are merely repeated here. 

*See [createStore#arguments](https://github.com/reduxjs/redux/blob/master/docs/api/createStore.md#arguments) for more info.*

The combineReducers helper function turns an object whose values are different reducing functions into a single reducing function you can pass to createStore.



#### Arguments
`[reducers] (Object)`: An object whose values are standard Redux reducers. Not necessary if you have no standard Redux reducers. 
`[reducerCombiner=combineReducers] (Function)`: A function that turns an object of reducers into a single reducing function. Not necessary unless using a library that injects reducers by way of functions. (e.g. connected-react-router)`  
`[preloadedState] (Object)`: The initial state. Identical to the `preloadedState` argument in Redux's `createStore`.[(more info)](https://github.com/reduxjs/redux/blob/master/docs/api/createStore.md#arguments)  
`[enhancer] (Function)`: The store enhancer. Identical to the `enhancer` argument in Redux's `createStore`. [(more info)](https://github.com/reduxjs/redux/blob/master/docs/api/createStore.md#arguments)

#### Returns
`store`: the store object created; used to `.select` parts of state and then `.set` them later.

#### Examples

```js
// create a basic new store 
import { initializeStore } from 'no-boilerplate-redux'

export const store = initializeStore()
```

```js
// create a new store with default values for todos and visibilityFilter
import { initializeStore } from 'no-boilerplate-redux'

export const store = initializeStore({
  preloadedState: {
    todos: [],
    visibilityFilter: 'SHOW_ALL'
  }
})
```

```js
// create a new store with vanilla reducer for 'albums' and default values for 'albums' and 'artists'
import { initializeStore } from 'no-boilerplate-redux'
import { albums } from './reducers'

let myReducers = { albums }
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

```js
// example use with react-route (using connected-react-router)

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
`.set()`: a method to set the state you just selected

---
### `store.select(...).set(valueOrFunction, [actionCustomization])`

Sets the selected state's path to the value specified. If path is not set, replaces the state with the value specified.

#### Arguments

`valueOrFunction (value OR Function)`: If this is a function, it is run, and the value returned is the new state. Function is passed the old state as an argument.
`actionCustomization (string OR Object)`: If this is a string, it is appended to the default type to make it more specific. If it is an object, the properties on the object are merged into the action.

#### Examples

```js
// set full state (without path)
// given 'developers': null
 
store.select('developers').set({
  "1": { name: "Nathaniel", title: "Web Developer" }
  "2": { name: "Eddie", title: "Web Developer" }
}, "SET_DEVELOPERS_EDDIE_NATHANIEL")

// Action Type: SET_DEVELOPERS_EDDIE_NATHANIEL
// 'developers': {
//   "1": { name: "Nathaniel", title: "Web Developer" }
//   "2": { name: "Eddie", title: "Web Developer" }
// }
```

```js
// set full state (without path)
// given 'developers': {
//   "1": { name: "Nathaniel", title: "Web Developer" }
//   "2": { name: "Eddie", title: "Web Developer" }
// }
 
store.select('developers', '1.name').set("Nathaniel Hutchins")

// or, if you don't like a string path
store.select('developers').set((developers) => {
  developers['1'].name = "Nathaniel Hutchins"
  return developers
})

// Action: SET_DEVELOPERS
// 'developers': {
//   "1": { name: "Nathaniel Hutchins", title: "Web Developer" }
//   "2": { name: "Eddie", title: "Web Developer" }
// }
```

```js
// given 'todos': [
//   { text: "write documentation", complete: true },
//   { text: "add support for middleware", complete: false },
//   { text: "take a break from writing code", complete: false }
// ]

// delete completed todos
store
  .select('todos')
  .set(
    (data) => data.filter((todo) => !todo.complete),
    "COMPLETE_TODO"
  )

// Action: SET_TODOS_COMPLETE_TODO
// 'todos': [
//   { text: "add support for middleware", complete: false },
//   { text: "take a break from writing code", complete: false }
// ]
```

```js
// given 'music': {
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
  .set((plays) => plays + 1)

// or, if you don't like a string path
store.select('music').set((music) => {
  music['Burning Down The House'].plays++
  return music
})

// Action: SET_MUSIC
// 'music': {
//   "This Must Be The Place": {
//     artist: "Talking Heads", plays: 12, skips: 0
//   },
//   "Burning Down The House": {
//     artist: "Talking Heads", plays: 9, skips: 0
//   }
// }
```