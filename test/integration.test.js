import { initializeStore } from '../src/initialize-store'

// test as much of the functionality that users will experience as reasonable

describe('basic store test', () => {
  let store

  test("store initializes", () => {
    store = initializeStore()

    expect(store.getState()).toEqual({
      redux_loaded: true
    })
  })

  test("can overwrite entire store", () => {
    store.select('todos').set([{
      id: 0,
      value: "write unit tests"
    }])

    expect(store.getState()).toEqual({
      redux_loaded: true,
      todos: [{
        id: 0,
        value: "write unit tests"
      }]
    })
  })

  test("can add new property via path", () => {
    store.select('todos', '[1]').set({
      id: 1,
      value: "write integ tests"
    })

    expect(store.getState()).toEqual({
      redux_loaded: true,
      todos: [
        { id: 0, value: "write unit tests" },
        { id: 1, value: "write integ tests" }
      ]
    })
  })

  test("can modify property via path", () => {
    store.select('todos', '[0].value').set('finish writing unit tests')

    expect(store.getState()).toEqual({
      redux_loaded: true,
      todos: [
        { id: 0, value: "finish writing unit tests" },
        { id: 1, value: "write integ tests" }
      ]
    })
  })
})

describe('store with preloadedState and functions', () => {
  let store

  test("store initializes", () => {
    store = initializeStore({
      preloadedState: {
        songPlaysByArtist: {
          'Talking Heads': {
            'Burning Down The House': 11,
            'City of Dreams': 14,
            'Stay up Late': 8
          }
        }
      },
      reducers: {
        artists: (state = {}) => state
      }
    })

    expect(store.getState()).toEqual({
      songPlaysByArtist: {
        'Talking Heads': {
          'Burning Down The House': 11,
          'City of Dreams': 14,
          'Stay up Late': 8
        }
      },
      artists: {}
    })
  })

  test('can update a store part using a function w/o a path', () => {
    store.select('songPlaysByArtist').set(songPlaysByArtist => {
      songPlaysByArtist['Talking Heads']['Burning Down The House']++
      return songPlaysByArtist
    })

    expect(store.getState()).toEqual({
      songPlaysByArtist: {
        'Talking Heads': {
          'Burning Down The House': 12,
          'City of Dreams': 14,
          'Stay up Late': 8
        }
      },
      artists: {}
    })
  })

  test('can update a store part using a function w/ a path', () => {
    store.select('songPlaysByArtist', '["Talking Heads"]["Psycho Killer"]')
      .set((psychoKillerPlays = 0) => (psychoKillerPlays) + 1)

    expect(store.getState()).toEqual({
      songPlaysByArtist: {
        'Talking Heads': {
          'Burning Down The House': 12,
          'City of Dreams': 14,
          'Stay up Late': 8,
          'Psycho Killer': 1
        }
      },
      artists: {}
    })
  })

  test('can replace a path on a store part with a value', () => {
    store.select('artists', '["Talking Heads"].members').set([
      'David Byrne',
      'Chris Frantz',
      'Tina Weymouth',
      'Jerry Harrison'
    ])

    expect(store.getState()).toEqual({
      songPlaysByArtist: {
        'Talking Heads': {
          'Burning Down The House': 12,
          'City of Dreams': 14,
          'Stay up Late': 8,
          'Psycho Killer': 1
        }
      },
      artists: {
        'Talking Heads': {
          'members': [
            'David Byrne',
            'Chris Frantz',
            'Tina Weymouth',
            'Jerry Harrison'
          ]
        }
      }
    })
  })

  test('can replace an entire store part with a value', () => {
    store.select('songPlaysByArtist').set({
      'Talking Heads': {}
    })

    expect(store.getState()).toEqual({
      songPlaysByArtist: {
        'Talking Heads': {}
      },
      artists: {
        'Talking Heads': {
          'members': [
            'David Byrne',
            'Chris Frantz',
            'Tina Weymouth',
            'Jerry Harrison'
          ]
        }
      }
    })
  })
})

describe('user can set parts of the store to undefined (or null) values', () => {
  test('user can set a store part to undefined and back with a value', () => {
    let store = initializeStore()

    // set a store from nothing
    store.select('todos').set([
      { id: 0, value: "finish writing unit tests" },
      { id: 1, value: "write integ tests" }
    ])

    expect(store.getState()).toEqual({
      todos: [
        { id: 0, value: "finish writing unit tests" },
        { id: 1, value: "write integ tests" }
      ],
      redux_loaded: true
    })

    // return the store to nothing
    store.select('todos').set(undefined)

    // undefined is not a valid value for reducers to return, so it gets set to null instead
    expect(store.getState()).toEqual({
      todos: null,
      redux_loaded: true
    })

    // and back once more to something
    store.select('todos').set([
      { id: 0, value: "finish writing unit tests" },
      { id: 1, value: "write integ tests" }
    ])

    expect(store.getState()).toEqual({
      todos: [
        { id: 0, value: "finish writing unit tests" },
        { id: 1, value: "write integ tests" }
      ],
      redux_loaded: true
    })
  })

  test('user can set a store part to undefined and back with a function', () => {
    let store = initializeStore()

    // set the store to something
    store.select('todos').set(() => ([
      { id: 0, value: "finish writing unit tests" },
      { id: 1, value: "write integ tests" }
    ]))

    expect(store.getState()).toEqual({
      todos: [
        { id: 0, value: "finish writing unit tests" },
        { id: 1, value: "write integ tests" }
      ],
      redux_loaded: true
    })

    // return the store to nothing
    store.select('todos').set(() => undefined)
    // undefined is not a valid value for reducers to return, so it gets set to null instead
    expect(store.getState()).toEqual({
      todos: null,
      redux_loaded: true
    })

    // set the store back to something
    store.select('todos').set(() => ([
      { id: 0, value: "finish writing unit tests" },
      { id: 1, value: "write integ tests" }
    ]))

    expect(store.getState()).toEqual({
      todos: [
        { id: 0, value: "finish writing unit tests" },
        { id: 1, value: "write integ tests" }
      ],
      redux_loaded: true
    })
  })

  test('user can set a path on a store part to undefined and back with a value', () => {
    let store = initializeStore()

    // store goes from nothing to something
    store.select('one', 'step.too').set({ few: true })

    expect(store.getState()).toEqual({
      one: { step: { too: { few: true } } },
      redux_loaded: true
    })

    // store part goes from something -> nothing
    store.select('one', 'step.too').set(undefined)

    expect(store.getState()).toEqual({
      one: { step: { too: undefined } },
      redux_loaded: true
    })

    // store goes from nothing to something (again)
    store.select('one', 'step.too').set({ few: true })

    expect(store.getState()).toEqual({
      one: { step: { too: { few: true } } },
      redux_loaded: true
    })
  })

  test('user can set a path on a store part to undefined and back with a function', () => {
    let store = initializeStore()

    // can the store handle being deeply set from nothing?
    store.select('one', 'step.too').set(() => ({ few: true }))

    expect(store.getState()).toEqual({
      one: { step: { too: { few: true } } },
      redux_loaded: true
    })

    // can the store handle being deeply unset?
    store.select('one', 'step.too').set(() => undefined)

    expect(store.getState()).toEqual({
      one: { step: { too: undefined } },
      redux_loaded: true
    })

    // can the store handle being deeply reset?
    store.select('one', 'step.too').set(() => ({ few: true }))

    expect(store.getState()).toEqual({
      one: { step: { too: { few: true } } },
      redux_loaded: true
    })
  })
})

describe('user can customize the action being fired', () => {
  let store = initializeStore()
  let dispatch = jest.spyOn(store, 'dispatch')

  test('user can customize the action with a string', () => {
    store.select('todos').set((todos) => {
      if (todos === null)
        todos = []

      todos.push({
        id: todos.length,
        value: "make sure string action customization works"
      })

      return todos
    }, 'with_push')

    let lastCallArguments = dispatch.mock.calls[dispatch.mock.calls.length - 1]
    let firstArgument = lastCallArguments[0]

    expect(firstArgument).toEqual({
      type: 'SET_TODOS_WITH_PUSH',
      payload:
      {
        path: undefined,
        value: undefined,
        fn: expect.any(String)
      },
      meta: { nbpr: 'todos' }
    })

    expect(store.getState()).toEqual({
      redux_loaded: true,
      todos: [{
        id: 0,
        value: "make sure string action customization works"
      }]
    })
  })

  test('user can customize the action with an object', () => {

    store.select('todos').set((todos) => {
      if (todos === null)
        todos = []

      todos.push({
        id: todos.length,
        value: "make sure object action customization works"
      })

      return todos
    }, {
      type: "PUSH_TODO",
      payload: {
        someExtraData: 10
      },
      meta: {
        moreExtraData: 11
      }
    })

    let lastCallArguments = dispatch.mock.calls[dispatch.mock.calls.length - 1]
    let firstArgument = lastCallArguments[0]

    expect(firstArgument).toEqual({
      type: 'PUSH_TODO',
      payload: {
        someExtraData: 10,
        path: undefined,
        value: undefined,
        fn: expect.any(String)
      },
      meta: { 
        moreExtraData: 11,
        nbpr: 'todos' 
      }
    })

    expect(store.getState()).toEqual({
      redux_loaded: true,
      todos: [
        { id: 0, value: "make sure string action customization works" },
        { id: 1, value: "make sure object action customization works" }
    ]
    })
  })
})

describe("user can modify the store using `.set()`", () => {
  test("using a fn and modifying the `store` object performs a merge", () => {
    let store = initializeStore({
      preloadedState: {
        todos: [
          { id: 0, value: "finish writing unit tests" },
          { id: 1, value: "write integ tests" }
        ]
      }
    })
    let dispatch = jest.spyOn(store, 'dispatch')

    // update using a function
    store.set((state) => {
      state.username = 'MynockSpit'
      state.isAuthenticated = true

      return state
    })

    expect(dispatch).toHaveBeenCalledTimes(2)
    expect(store.getState()).toEqual({
      todos: [
        { id: 0, value: "finish writing unit tests" },
        { id: 1, value: "write integ tests" }
      ],
      username: 'MynockSpit',
      isAuthenticated: true
    })
  })

  // confirm that using a fn and returning an object replaces the store
  test("using a fn and returning an object replaces the store", () => {
    let store = initializeStore({
      preloadedState: {
        todos: [
          { id: 0, value: "finish writing unit tests" },
          { id: 1, value: "write integ tests" }
        ]
      }
    })
    let dispatch = jest.spyOn(store, 'dispatch')

    // update using a function
    store.set(() => {
      return {
        username: 'MynockSpit',
        isAuthenticated: true
      }
    })

    expect(dispatch).toHaveBeenCalledTimes(3)
    expect(store.getState()).toEqual({
      todos: null,
      username: 'MynockSpit',
      isAuthenticated: true
    })
  })

  test("using an object performs shallow merge", () => {
    let store = initializeStore({
      preloadedState: {
        todos: [
          { id: 0, value: "finish writing unit tests" },
          { id: 1, value: "write integ tests" }
        ]
      }
    })
    let dispatch = jest.spyOn(store, 'dispatch')

    // update using an object (should merge)
    store.set({
      username: 'MynockSpit',
      isAuthenticated: true
    })

    expect(dispatch).toHaveBeenCalledTimes(2)
    expect(store.getState()).toEqual({
      todos: [
        { id: 0, value: "finish writing unit tests" },
        { id: 1, value: "write integ tests" }
      ],
      username: 'MynockSpit',
      isAuthenticated: true
    })
  })

  test("throws when user tries to return a non-object from a .set()", () => {
    let store = initializeStore()

    expect(() => {
      store.set(() => {
        return 'MynockSpit'
      })
    }).toThrow()
  })

  test("throws when user tries to .set() to a value that isn't an object or function", () => {
    let store = initializeStore()

    expect(() => {
      store.set('MynockSpit')
    }).toThrow()
  })
})

test("user can read the store using `.select().get()`", () => {
  let preloadedState = {
    todos: [
      { id: 0, value: "finish writing unit tests" },
      { id: 1, value: "write integ tests" }
    ]
  }
  let store = initializeStore({ preloadedState })

  // update using a function
  const getWithoutPath = store.select('todos').get()
  expect(getWithoutPath).toEqual(preloadedState.todos)

  const firstTodoText = store.select('todos', '0.value').get(false)
  expect(firstTodoText).toEqual("finish writing unit tests")

  const tenthTodoText = store.select('todos', '10.value').get(false)
  expect(tenthTodoText).toEqual(false)

  const noStoreValue = store.select('nonExistant').get()
  expect(noStoreValue).toEqual(undefined)
})

test("user can read the store using `.get()`", () => {
  let preloadedState = {
    todos: [
      { id: 0, value: "finish writing unit tests" },
      { id: 1, value: "write integ tests" }
    ]
  }
  let store = initializeStore({ preloadedState })

  // update using a function
  const getWithoutPath = store.get()
  expect(getWithoutPath).toEqual(preloadedState)

  // any argument causes store.get to throw
  expect(() => { store.get('path.to.whatever') }).toThrow()
})