# Reducerless Redux

## How to Use

1. Import `createStore` from `reducerless-redux` in your app, and use it like redux's `createStore` but without the first argument (reducers).

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

2. Connect your React components to your state.

    ```jsx
    // MyComponent.jsx

    // import the connect function from react-redux
    import { connect } from 'react-redux'
        
    ...

    // connect parts of your state
    const mapStateToProps = ({ count }) => ({ count })
    
    export default connect(mapStateToProps)(MyComponent)
    ```

3. Import `setStore` and use it in your components (or in a services file).

    ```jsx
    // MyComponent.jsx

    import { store } from './index.js' // this is the store you created

    // use .select to select your storePart (and an optional path) and .set to 
    store.select('count')
      .set(count => ++count)

    // use .select to select your storePart (and an optional path) and .set to 
    store.select('users', `${devId}.title`).set('Web Developer')
    ```

## Documentation
 globalStore is the function that lets us act on the store easily
 there are two main functions, .set and .do


---
### `store.select(storePart, [path])`

Selects the state you're going to use and returns an object with modification methods. 

#### Arguments
`storePart (string)`: The key of the state object you want to interact with
`path (string OR Array)`: The path to specific data

#### Returns
`.set()`: a method to set the state you just selected

---
### `store.select(...).set(valueOrFunction, [asAction])`

Sets the selected state's path to the value specified. If path is not set, replaces the state with the value specified.

#### Arguments

`setter (value OR Function)`: If this is a function, it is run, and the value returned is the new state. Function is passed the old state as an argument.
`asAction (string)`: A string to describe the action you're doing. Used as the action type for redux, and appended to the reducerless prefix. (example: REDUCERLESS_SET_STOREPART_MYCUSTOMACTION)

#### Examples

```js
// set full state (without path)
// given 'developers': null
 
store.select('developers').set({
  "1": { name: "Nathaniel", title: "Web Developer" }
  "2": { name: "Eddie", title: "Web Developer" }
})

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
store.select('todos').set((data) => data.filter((todo) => !todo.complete))

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
store.select('music', '["Burning Down The House"].plays').set((plays) => plays + 1)

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