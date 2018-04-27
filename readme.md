# Reducerless Redux

## How to Use

1. Import `createStore` from `reducerless-redux` in your app, and use it like redux's `createStore` but without the first argument (reducers).

    ```js
    // import createStore
    import { createStore } from 'reducerless-redux'

    // create your store
    const store = createStore()

    // use the imported store
    render(
      <Provider store={store}>
        <App />
      </Provider>,
      document.getElementById('root')
    )
    ```

2. Connect your React components to your state.

    ```js
    // import the connect function from react-redux
    import { connect } from 'react-redux'
        
    ...

    // connect parts of your state
    const mapStateToProps = ({ count }) => ({ count })
    
    export default connect(mapStateToProps)(App)
    ```

3. Import `setStore` and use it in your components (or in a services file).

    ```jsx
    import { globalStore } from 'reducerless-redux'

    // use .do to run a function on your data or a part of your data
    globalStore('count')
      .do(count => ++count)

    // use .set to set your data or a part of your data
    globalStore('users').set(`${devId}.title`, 'Web Developer')
    ```

## Documentation
 globalStore is the function that lets us act on the store easily
 there are two main functions, .set and .do


---
### `globalStore(state)`

Selects the state you're going to use and returns an object with modification methods. Current supported modification methods are `.set` and `.do`.

#### Arguments
`state (string)`: The key of the state object you want to interact with

#### Returns
`modifers (Object)`: Returns an object of modification methods.

---
### `globalStore(...).set([ path ,] value)`

Sets the selected state's path to the value specified. If path is not set, replaces the state with the value specified.

#### Arguments

`path (string)`: The path to use when setting state. If not specified, replaces state with the value specified.  
`value (any)`: The value to insert.

#### Returns

`undefined`

#### Examples

```js
// set full state (without path)
// given 'developers': null
 
globalStore('developers').set({
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
 
globalStore('developers').set('1.name', "Nathaniel Hutchins")

// 'developers': {
//   "1": { name: "Nathaniel Hutchins", title: "Web Developer" }
//   "2": { name: "Eddie", title: "Web Developer" }
// }
```

### `globalStore(...).do([ path ,] fn)`

Exposes the state, or the state part, to a user-written callback function.
 
#### Arguments

`path (string)`: The path to use when setting state. If not specified, replaces state with the value specified.  
`fn (Function)`: A function used to modify the state or state part.

#### Returns

`undefined`

#### Examples

```js
// given 'todos': [
//   { text: "write documentation", complete: true },
//   { text: "add support for middleware", complete: false },
//   { text: "take a break from writing code", complete: false }
// ]

// delete completed todos
globalStore('todos').do(function (data) {
  return data.filter(function (todo) { return !todo.complete })
})

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
globalStore('music').do('["Burning Down The House"].plays', function(data) {
  return data + 1
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


```js

// all config in object
store({ state: 'items', path: 'path.to.deep.state', action: 'delete_this'}).set(8)

// optional config in object
store('items', { path: 'path.to.deep.state', action: 'delete_this' })
  .set(8)

// optional path as second parameter
store('items', 'path.to.deep.state')
  .action('delete_this')
  .set(8)

// optional paths as chains
store('items')
  .path('path.to.deep.state')
  .action('delete_this')
  .set(8)


```