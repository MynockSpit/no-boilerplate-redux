# Reducerless Redux

## How to Use (with React)

Most of the following you'll recognize from setting up Redux.

1. Import `createStore` from `reducerless-redux` (**not redux!**) in your app, and use it like redux's `createStore`.

    ```jsx
    // index.jsx

    // import createStore
    import { createStore } from 'reducerless-redux'

    // create your store and export it so we can set state on it
    export const store = createStore()

    // use the imported store
    render(
      <Provider store={store}>
        <App />
      </Provider>,
      document.getElementById('root')
    )
    ```

2. Connect your React components to your state. This causes the "magic" auto-update we're familiar with from React. (example uses [`react-redux`](https://github.com/reduxjs/react-redux))

    ```jsx
    // MyComponent.jsx

    // import the connect function from react-redux
    import { connect } from 'react-redux'
        
    ...

    // connect parts of your state
    const mapStateToProps = ({ count }) => ({ count })
    
    export default connect(mapStateToProps)(MyComponent)
    ```

3. Import your `store` and use it in your components (or in a services file).

    ```jsx
    // MyComponent.jsx or MyService.js or AnythingElse.really

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

## Documentation

### `createStore(baseReducers, preloadedState, enhancer)`

Creates the Redux store. Has a very similar signature to redux's createStore with the single exception that the first argument is `baseReducers` and must either undefined or an object that maps to multiple (vanilla) redux reducers.

#### Arguments
`baseReducers (undefined, null or Object)`: undefined or null (or empty object) indicated that all reducers are to be defined by reducerless-redux; an object that maps to vanilla redux reducers will set up those reducers as normal and add a reducerless-redux reducer for each.  
`preloadedState`: must be a plain object where keys map reducers
`enhancer`: identical to redux's `enhancer` argument [(docs)](https://github.com/reduxjs/redux/blob/master/docs/api/createStore.md#arguments)

#### Returns
`store`: the store object created; used to `.select` parts of state and then `.set` them later.

#### Examples

```js
// create a basic new store 
import { createStore } from 'reducerless-redux'

export const store = createStore()
```

```js
// create a new store with default values for todos and visibilityFilter
import { createStore } from 'reducerless-redux'

export const store = createStore(null, {
  todos: [],
  visibilityFilter: 'SHOW_ALL'
})
```

```js
// create a new store with vanilla reducer for 'albums' and default values for 'albums' and 'artists'
import { createStore } from 'reducerless-redux'
import { albums } from './reducers'

export const store = createStore({ albums }, {
  albums: [{
    title: 'Talking Heads: 77',
    artist: 'Talking Heads',
    released: 'September 16, 1977'
  }, {
    title: 'Little Creatures',
    artist: 'Talking Heads',
    released: 'June 10, 1985'
  }]
  artists: {
    'Talking Heads': {
      formed: '1975',
      activeUntil: '1991'
    }
  }
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
### `store.select(...).set(valueOrFunction, [asAction])`

Sets the selected state's path to the value specified. If path is not set, replaces the state with the value specified.

#### Arguments

`valueOrFunction (value OR Function)`: If this is a function, it is run, and the value returned is the new state. Function is passed the old state as an argument.
`asAction (string)`: A string to describe the action you're doing. Used as the action type for redux, and appended to the reducerless prefix. 

#### Examples

```js
// set full state (without path)
// given 'developers': null
 
store.select('developers').set({
  "1": { name: "Nathaniel", title: "Web Developer" }
  "2": { name: "Eddie", title: "Web Developer" }
}, "EDDIE_NATHANIEL")

// Action: REDUCERLESS_ACTION_DEVELOPERS_EDDIE_NATHANIEL
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

// Action: REDUCERLESS_ACTION_DEVELOPERS
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

// Action: REDUCERLESS_ACTION_TODOS_COMPLETE_TODO
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

// 'music': {
//   "This Must Be The Place": {
//     artist: "Talking Heads", plays: 12, skips: 0
//   },
//   "Burning Down The House": {
//     artist: "Talking Heads", plays: 9, skips: 0
//   }
// }
```