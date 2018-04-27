# `createStore(baseReducers, [preloadedState], [enhancer])`

An extension of redux's createStore, has a few differences.

1. `baseReducers` must be an object where the keys are names of store parts and values are functions that produce state. This is identical to the shape required by redux's `combineReducers` method. 

2. `preloadedState` must follow the pattern of baseReducers. This is identical to the shape required when using `combineReducers` in createStore.

2. Defining a `preloadedState` without a matching key in `baseReducer` will generate a reducerless reducer. In redux, this throws an error.

See https://github.com/reactjs/redux/blob/master/docs/api/combineReducers.md and  https://github.com/reactjs/redux/blob/master/docs/api/createStore.md for the redux documentation.


Example:

```js
import React from 'react';
import { render } from 'react-dom';
import App from './App';

import { Provider } from 'react-redux'
import { createStore } from 'reducerless-redux'

import { todos, pins } from './reducers'

const store = createStore(
  {
    // normal reducers
    todos,
    pins
  },
  {
    todos: [], // default state the todos reducer (no default state for pins)
    count: 0, // will generate a 'count' reducerless reducer
  }
)

render(
  <Provider store={store}>
    <App />
  </Provider>,
  document.getElementById('root')
)
```