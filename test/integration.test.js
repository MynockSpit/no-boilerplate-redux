import { initializeStore } from '../src/initialize-store'

// test as much of the functionality that users will experience as reasonable

describe('basic store test', () => {
  let store

  test("store initializes", () => {
    store = initializeStore()

    expect(store.getState()).toEqual({
    })
  })

  test("can overwrite entire store", () => {
    store.set('todos', [{
      id: 0,
      value: "write unit tests"
    }])

    expect(store.getState()).toEqual({
      todos: [{
        id: 0,
        value: "write unit tests"
      }]
    })
  })

  test("can add new property via path", () => {
    store.set('todos[1]', {
      id: 1,
      value: "write integ tests"
    })

    expect(store.getState()).toEqual({
      todos: [
        { id: 0, value: "write unit tests" },
        { id: 1, value: "write integ tests" }
      ]
    })
  })

  test("can modify property via path", () => {
    store.set('todos.[0].value', 'finish writing unit tests')

    expect(store.getState()).toEqual({
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
    store.set('songPlaysByArtist', songPlaysByArtist => {
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
    store.set(
      'songPlaysByArtist.["Talking Heads"]["Psycho Killer"]',
      (psychoKillerPlays = 0) => (psychoKillerPlays) + 1
    )

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
    store.set(
      'artists.["Talking Heads"].members',
      [
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
    store.set('songPlaysByArtist', {
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
    store.set('todos', [
      { id: 0, value: "finish writing unit tests" },
      { id: 1, value: "write integ tests" }
    ])

    expect(store.getState()).toEqual({
      todos: [
        { id: 0, value: "finish writing unit tests" },
        { id: 1, value: "write integ tests" }
      ],
    })

    // return the store to nothing
    store.set('todos', undefined)

    // undefined is not a valid value for reducers to return, so it gets set to null instead
    expect(store.getState()).toEqual({
      todos: undefined,
    })

    // and back once more to something
    store.set('todos', [
      { id: 0, value: "finish writing unit tests" },
      { id: 1, value: "write integ tests" }
    ])

    expect(store.getState()).toEqual({
      todos: [
        { id: 0, value: "finish writing unit tests" },
        { id: 1, value: "write integ tests" }
      ],
    })
  })

  test('user can set a store part to undefined and back with a function', () => {
    let store = initializeStore()

    // set the store to something
    store.set('todos', () => ([
      { id: 0, value: "finish writing unit tests" },
      { id: 1, value: "write integ tests" }
    ]))

    expect(store.getState()).toEqual({
      todos: [
        { id: 0, value: "finish writing unit tests" },
        { id: 1, value: "write integ tests" }
      ],
    })

    // return the store to nothing
    store.set('todos', () => undefined)
    // undefined is not a valid value for reducers to return, so it gets set to null instead
    expect(store.getState()).toEqual({
      todos: undefined,
    })

    // set the store back to something
    store.set('todos', () => ([
      { id: 0, value: "finish writing unit tests" },
      { id: 1, value: "write integ tests" }
    ]))

    expect(store.getState()).toEqual({
      todos: [
        { id: 0, value: "finish writing unit tests" },
        { id: 1, value: "write integ tests" }
      ],
    })
  })

  test('user can set a path on a store part to undefined and back with a value', () => {
    let store = initializeStore()

    // store goes from nothing to something
    store.set('one.step.too', { few: true })

    expect(store.getState()).toEqual({
      one: { step: { too: { few: true } } },
    })

    // store part goes from something -> nothing
    store.set('one.step.too', undefined)

    expect(store.getState()).toEqual({
      one: { step: { too: undefined } },
    })

    // store goes from nothing to something (again)
    store.set('one.step.too', { few: true })

    expect(store.getState()).toEqual({
      one: { step: { too: { few: true } } },
    })
  })

  test('user can set a path on a store part to undefined and back with a function', () => {
    let store = initializeStore()

    // can the store handle being deeply set from nothing?
    store.set('one.step.too', () => ({ few: true }))

    expect(store.getState()).toEqual({
      one: { step: { too: { few: true } } },
    })

    // can the store handle being deeply unset?
    store.set('one.step.too', () => undefined)

    expect(store.getState()).toEqual({
      one: { step: { too: undefined } },
    })

    // can the store handle being deeply reset?
    store.set('one.step.too', () => ({ few: true }))

    expect(store.getState()).toEqual({
      one: { step: { too: { few: true } } },
    })
  })
})

describe('user can customize the action being fired', () => {
  test('user can customize the action with a string', () => {
    let store = initializeStore()
    let dispatch = jest.spyOn(store, 'dispatch')
    
    store.action('todos', (todos = []) => {
      todos.push({
        id: todos.length,
        value: "make sure string action customization works"
      })

      return todos
    }, 'with_push')

    let lastCallArguments = dispatch.mock.calls[dispatch.mock.calls.length - 1]
    let firstArgument = lastCallArguments[0]

    expect(firstArgument).toEqual({
      type: 'UPDATE_TODOS_WITH_PUSH',
      payload:
      {
        patch: expect.any(Array),
        replace: undefined,
      },
      meta: { nbpr: true }
    })

    expect(store.getState()).toEqual({
      todos: [{
        id: 0,
        value: "make sure string action customization works"
      }]
    })
  })

  test('user can customize the action with an object', () => {
    let store = initializeStore()
    let dispatch = jest.spyOn(store, 'dispatch')

    store.action(store => {
      let { todos = [] } = store

      todos.push({
        id: todos.length,
        value: "make sure object action customization works"
      })

      store.todos = todos

      return store
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
        replace: undefined,
        patch: expect.any(Array)
      },
      meta: {
        moreExtraData: 11,
        nbpr: true
      }
    })

    expect(store.getState()).toEqual({
      todos: [
        { id: 0, value: "make sure object action customization works" }
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

    // update using a function
    store.set((state) => {
      state.username = 'MynockSpit'
      state.isAuthenticated = true

      return state
    })

    expect(store.getState()).toEqual({
      todos: [
        { id: 0, value: "finish writing unit tests" },
        { id: 1, value: "write integ tests" }
      ],
      username: 'MynockSpit',
      isAuthenticated: true
    })
  })

  test("using a fn and returning an object replaces the store", () => {
    let store = initializeStore({
      preloadedState: {
        todos: [
          { id: 0, value: "finish writing unit tests" },
          { id: 1, value: "write integ tests" }
        ]
      }
    })

    // update using a function
    store.set(() => {
      return {
        username: 'MynockSpit',
        isAuthenticated: true
      }
    })

    expect(store.getState()).toEqual({
      username: 'MynockSpit',
      isAuthenticated: true
    })
  })

  test("using an object without a path performs full store replace", () => {
    let store = initializeStore({
      preloadedState: {
        todos: [
          { id: 0, value: "finish writing unit tests" },
          { id: 1, value: "write integ tests" }
        ]
      }
    })

    // update using an object (should merge)
    store.set({
      username: 'MynockSpit',
      isAuthenticated: true
    })

    expect(store.getState()).toEqual({
      username: 'MynockSpit',
      isAuthenticated: true
    })
  })

  test("user can set entire store to a non-object from a .set()", () => {
    let store = initializeStore()

    store.set(() => {
      return 'MynockSpit'
    })

    expect(store.getState()).toEqual('MynockSpit')
  })

  test("throws when user tries to .set() to a value that isn't an object or function", () => {
    let store = initializeStore()

    store.set('MynockSpit')

    expect(store.getState()).toEqual('MynockSpit')
  })
})

test("user can read the store using `.get(path)`", () => {
  let preloadedState = {
    todos: [
      { id: 0, value: "finish writing unit tests" },
      { id: 1, value: "write integ tests" }
    ]
  }
  let store = initializeStore({ preloadedState })

  // update using a function
  const getWithoutPath = store.get('todos')
  expect(getWithoutPath).toEqual(preloadedState.todos)

  const firstTodoText = store.get('todos.0.value', false)
  expect(firstTodoText).toEqual("finish writing unit tests")

  const tenthTodoText = store.get('todos.10.value', false)
  expect(tenthTodoText).toEqual(false)

  const noStoreValue = store.get('nonExistant')
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
})