import { store, makeReducer, makeStore } from '../src/main'
import _ from 'lodash'

const newTest = (testRunner, name, actualTest) => {
  return testRunner(name, () => {
    console.log(`STARTING: ${name}`)
    return Promise.resolve()
      .then(actualTest)
      .then(testRun => {
        console.log(`ENDING: ${name}`)
        return testRun
      })
      .catch(error => {
        console.log(`ENDING (error): ${name}`)
        console.error(error)
        throw error
      })
  })
}

const globalTest = test
test = newTest.bind(null, globalTest) // eslint-disable-line no-global-assign
test.only = newTest.bind(null, globalTest.only)
test.skip = newTest.bind(null, globalTest.skip)

let storeKey = (function () {
  let key = 1
  return () => key++
}())

// test as much of the functionality that users will experience as reasonable
// this test suite is going to break if this ever starts running concurrently
describe('basic store test', () => {
  let storeObject
  test("store initializes", () => {
    storeObject = makeStore({ key: storeKey })

    expect(storeObject.getState()).toEqual(undefined)
  })

  test("can overwrite entire store", () => {
    storeObject.set('todos', [{
      id: 0,
      value: "write unit tests"
    }])

    expect(storeObject.getState()).toEqual({
      todos: [{
        id: 0,
        value: "write unit tests"
      }]
    })
  })

  test("can add new property via path", () => {
    storeObject.set('todos[1]', {
      id: 1,
      value: "write integ tests"
    })

    expect(storeObject.getState()).toEqual({
      todos: [
        { id: 0, value: "write unit tests" },
        { id: 1, value: "write integ tests" }
      ]
    })
  })

  test("can modify property via path", () => {
    storeObject.set('todos.[0].value', 'finish writing unit tests')

    expect(storeObject.getState()).toEqual({
      todos: [
        { id: 0, value: "finish writing unit tests" },
        { id: 1, value: "write integ tests" }
      ]
    })
  })
})

// this test suite is going to break if this ever starts running concurrently
describe('store with preloadedState and functions', () => {
  let storeObject
  test("store initializes", () => {
    storeObject = makeStore({
      key: storeKey(),
      preloadedState: {
        songPlaysByArtist: {
          'Talking Heads': {
            'Burning Down The House': 11,
            'City of Dreams': 14,
            'Stay up Late': 8
          }
        }
      },
      reducer: makeReducer({
        artists: (state = {}) => state
      })
    })

    expect(storeObject.getState()).toEqual({
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
    storeObject.set('songPlaysByArtist', songPlaysByArtist => {
      songPlaysByArtist['Talking Heads']['Burning Down The House']++
      return songPlaysByArtist
    })

    expect(storeObject.getState()).toEqual({
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
    storeObject.set(
      'songPlaysByArtist.["Talking Heads"]["Psycho Killer"]',
      (psychoKillerPlays = 0) => (psychoKillerPlays) + 1
    )

    expect(storeObject.getState()).toEqual({
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
    storeObject.set(
      'artists.["Talking Heads"].members',
      [
        'David Byrne',
        'Chris Frantz',
        'Tina Weymouth',
        'Jerry Harrison'
      ])

    expect(storeObject.getState()).toEqual({
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
    storeObject.set('songPlaysByArtist', {
      'Talking Heads': {}
    })

    expect(storeObject.getState()).toEqual({
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
    const storeObject = makeStore({ key: storeKey() })

    // set a store from nothing
    storeObject.set('todos', [
      { id: 0, value: "finish writing unit tests" },
      { id: 1, value: "write integ tests" }
    ])

    expect(storeObject.getState()).toEqual({
      todos: [
        { id: 0, value: "finish writing unit tests" },
        { id: 1, value: "write integ tests" }
      ],
    })

    // return the store to nothing
    storeObject.set('todos', undefined)

    // undefined is not a valid value for reducers to return, so it gets set to null instead
    expect(storeObject.getState()).toEqual({
      todos: undefined,
    })

    // and back once more to something
    storeObject.set('todos', [
      { id: 0, value: "finish writing unit tests" },
      { id: 1, value: "write integ tests" }
    ])

    expect(storeObject.getState()).toEqual({
      todos: [
        { id: 0, value: "finish writing unit tests" },
        { id: 1, value: "write integ tests" }
      ],
    })
  })

  test('user can set a store part to undefined and back with a function', () => {
    const storeObject = makeStore({ key: storeKey() })

    // set the store to something
    storeObject.set('todos', () => ([
      { id: 0, value: "finish writing unit tests" },
      { id: 1, value: "write integ tests" }
    ]))

    expect(storeObject.getState()).toEqual({
      todos: [
        { id: 0, value: "finish writing unit tests" },
        { id: 1, value: "write integ tests" }
      ],
    })

    // return the store to nothing
    storeObject.set('todos', () => undefined)
    // undefined is not a valid value for reducers to return, so it gets set to null instead
    expect(storeObject.getState()).toEqual({
      todos: undefined,
    })

    // set the store back to something
    storeObject.set('todos', () => ([
      { id: 0, value: "finish writing unit tests" },
      { id: 1, value: "write integ tests" }
    ]))

    expect(storeObject.getState()).toEqual({
      todos: [
        { id: 0, value: "finish writing unit tests" },
        { id: 1, value: "write integ tests" }
      ],
    })
  })

  test('user can set a path on a store part to undefined and back with a value', () => {
    const storeObject = makeStore({ key: storeKey() })

    // store goes from nothing to something
    storeObject.set('one.step.too', { few: true })

    expect(storeObject.getState()).toEqual({
      one: { step: { too: { few: true } } },
    })

    // store part goes from something -> nothing
    storeObject.set('one.step.too', undefined)

    expect(storeObject.getState()).toEqual({
      one: { step: { too: undefined } },
    })

    // store goes from nothing to something (again)
    storeObject.set('one.step.too', { few: true })

    expect(storeObject.getState()).toEqual({
      one: { step: { too: { few: true } } },
    })
  })

  test('user can set a path on a store part to undefined and back with a function', () => {
    const storeObject = makeStore({ key: storeKey() })

    // can the store handle being deeply set from nothing?
    storeObject.set('one.step.too', () => ({ few: true }))

    expect(storeObject.getState()).toEqual({
      one: { step: { too: { few: true } } },
    })

    // can the store handle being deeply unset?
    storeObject.set('one.step.too', () => undefined)

    expect(storeObject.getState()).toEqual({
      one: { step: { too: undefined } },
    })

    // can the store handle being deeply reset?
    storeObject.set('one.step.too', () => ({ few: true }))

    expect(storeObject.getState()).toEqual({
      one: { step: { too: { few: true } } },
    })
  })
})

describe('user can customize the action being fired', () => {
  test('user can customize the action using the action method', () => {
    const storeObject = makeStore({ key: storeKey() })
    let dispatch = jest.spyOn(storeObject, 'dispatch')

    storeObject.action('todos', {
      type: 'REPLACE_ALL_TODOS',
      payload: [
        {
          id: 0,
          value: "make sure string action customization works"
        }
      ]
    })

    let lastCallArguments = dispatch.mock.calls[dispatch.mock.calls.length - 1]
    let firstArgument = lastCallArguments[0]

    expect(firstArgument).toEqual({
      type: 'REPLACE_ALL_TODOS',
      payload: expect.any(Array),
      meta: { nbpr: 'UPDATE' }
    })

    expect(storeObject.getState()).toEqual({
      todos: [{
        id: 0,
        value: "make sure string action customization works"
      }]
    })
  })

  test('user can customize the action using the action creator method', () => {
    const storeObject = makeStore({ key: storeKey() })
    let dispatch = jest.spyOn(storeObject, 'dispatch')

    storeObject.action((store = {}) => {
      let { todos = [] } = store

      todos.push({
        id: todos.length,
        value: "make sure object action customization works"
      })

      store.todos = todos

      return {
        type: "PUSH_TODO",
        payload: store,
        meta: {
          moreExtraData: 11
        }
      }
    })

    let lastCallArguments = dispatch.mock.calls[dispatch.mock.calls.length - 1]
    let firstArgument = lastCallArguments[0]

    expect(firstArgument).toEqual({
      type: 'PUSH_TODO',
      payload: {
        todos: [
          { id: 0, value: "make sure object action customization works" }
        ]
      },
      meta: {
        moreExtraData: 11,
        nbpr: 'REPLACE'
      }
    })

    expect(storeObject.getState()).toEqual({
      todos: [
        { id: 0, value: "make sure object action customization works" }
      ]
    })
  })

  test('action should throw when passed an improper number of args', () => {
    const storeObject = makeStore({ key: storeKey() })

    expect(() => {
      storeObject.action('path.to.var', { payload: 'f' }, false)
    }).toThrow()
  })

  test('action should throw if the argument provided is not a function or an object', () => {
    const storeObject = makeStore({ key: storeKey() })
    const error = jest.spyOn(global.console, 'error').mockImplementation(() => null) // swallow the error

    expect(() => {
      storeObject.action("{ payload: 'f' }")
    }).toThrow()

    expect(error).toHaveBeenCalledTimes(1)

    error.mockRestore()
  })

})

describe("user can modify the store using `.set()`", () => {
  test("using a fn and modifying the `store` object performs a merge", () => {
    const storeObject = makeStore({
      key: storeKey(),
      preloadedState: {
        todos: [
          { id: 0, value: "finish writing unit tests" },
          { id: 1, value: "write integ tests" }
        ]
      }
    })

    // update using a function
    storeObject.set((state) => {
      state.username = 'MynockSpit'
      state.isAuthenticated = true

      return state
    })

    expect(storeObject.getState()).toEqual({
      todos: [
        { id: 0, value: "finish writing unit tests" },
        { id: 1, value: "write integ tests" }
      ],
      username: 'MynockSpit',
      isAuthenticated: true
    })
  })

  test("using a fn and returning an object replaces the store", () => {
    const storeObject = makeStore({
      key: storeKey(),
      preloadedState: {
        todos: [
          { id: 0, value: "finish writing unit tests" },
          { id: 1, value: "write integ tests" }
        ]
      }
    })

    // update using a function
    storeObject.set(() => {
      return {
        username: 'MynockSpit',
        isAuthenticated: true
      }
    })

    expect(storeObject.getState()).toEqual({
      username: 'MynockSpit',
      isAuthenticated: true
    })
  })

  test("using an object without a path performs full store replace", () => {
    const storeObject = makeStore({
      key: storeKey(),
      preloadedState: {
        todos: [
          { id: 0, value: "finish writing unit tests" },
          { id: 1, value: "write integ tests" }
        ]
      }
    })

    // update using an object (should merge)
    storeObject.set({
      username: 'MynockSpit',
      isAuthenticated: true
    })

    expect(storeObject.getState()).toEqual({
      username: 'MynockSpit',
      isAuthenticated: true
    })
  })

  test("user can set entire store to a non-object from a .set()", () => {
    const storeObject = makeStore({ key: storeKey() })

    storeObject.set(() => {
      return 'MynockSpit'
    })

    expect(storeObject.getState()).toEqual('MynockSpit')
  })

  test("throws when user tries to .set() to a value that isn't an object or function", () => {
    const storeObject = makeStore({ key: storeKey() })

    storeObject.set('MynockSpit')

    expect(storeObject.getState()).toEqual('MynockSpit')
  })

  test('.set should throw when passed an improper number of args', () => {
    const storeObject = makeStore({ key: storeKey() })

    expect(() => {
      storeObject.set('foo', { payload: 'f' }, false)
    }).toThrow()
  })

  test('.set should throw if a path is provided but the state is not a function, array, or object', () => {
    const storeObject = makeStore({ key: storeKey(), preloadedState: 'foo' })

    const error = jest.spyOn(global.console, 'error').mockImplementation(() => null) // swallow the error

    expect(() => {
      storeObject.set('path.to.state', " f ")
    }).toThrow()

    expect(error).toHaveBeenCalledTimes(1)

    error.mockRestore()
  })
})

describe("make sure some weird edge-cases work", () => {

  test("undefined and the store", () => {
    const storeObject = makeStore({ key: storeKey() })
    storeObject.set(undefined)
    expect(storeObject.getState()).toEqual(undefined)

    // if the store is undefined, and you set a path on it, it should convert it to an object
    storeObject.set('foo.bar.baz', true)
    expect(storeObject.getState()).toEqual({ foo: { bar: { baz: true } } })

    // make sure when we set undefined, it gets set
    storeObject.set(undefined)
    expect(storeObject.getState()).toEqual(undefined)
  })

  test("null and the store", () => {
    const storeObject = makeStore({ key: storeKey(), preloadedState: null })
    expect(storeObject.getState()).toEqual(null)

    // if the store is undefined, and you set a path on it, it should convert it to an object
    storeObject.set('foo.bar.baz', true)
    expect(storeObject.getState()).toEqual({ foo: { bar: { baz: true } } })

    // make sure when we set undefined, it gets set
    storeObject.set(null)
    expect(storeObject.getState()).toEqual(null)
  })

  test("other primatives and the store", () => {
    const storeObject = makeStore({ key: storeKey(), preloadedState: 1000 })
    expect(storeObject.getState()).toEqual(1000)

    storeObject.set(23)
    expect(storeObject.getState()).toEqual(23)

    // Probably warn here too.
    storeObject.set('', 28)
    expect(storeObject.getState()).toEqual(28)

    // Not really sure what I want this to be? Warn, probably.
    storeObject.set(undefined, 28)
    expect(storeObject.getState()).toEqual(28)

    // expect(() => {
    //   store.set('foo.bar.baz', 23)
    // }).toThrow() // do I?
  })
})

// there's quite a bit of logic that makes the vanilla reducers (especially ones made with 
// `combineReducers`) work with nbpr. This test makes sure that that code is still working.
describe("store works with vanilla reducers", () => {
  const storeConfig = {
    reducer: makeReducer({
      todos(state = [], action) {
        switch (action.type) {
          case "ADD_TODO":
            return [
              ...state,
              {
                text: action.text,
                completed: false
              }
            ]
          case "TOGGLE_TODO":
            return state.map((todo, index) => {
              if (index === action.index) {
                return Object.assign({}, todo, {
                  completed: !todo.completed
                })
              }
              return todo
            })
          default:
            return state
        }
      }
    }),
    preloadedState: {
      todos: [
        { text: 'go skiing', completed: false }
      ],
      tomaybes: [
        { text: "nope, nevermind" }
      ]
    }
  }

  test("store with vanilla reducer works with path set", () => {

    // make sure we initialize correctly with a reducer, matching preloaded state AND extra preloaded state
    const storeObject = makeStore(_.merge({ key: storeKey() }, _.cloneDeep(storeConfig)))
    expect(storeObject.getState()).toEqual({
      todos: [
        { text: 'go skiing', completed: false }
      ],
      tomaybes: [
        { text: "nope, nevermind" }
      ]
    })

    // make sure a vanilla reducer doesn't screw anything up
    storeObject.dispatch({
      type: "ADD_TODO",
      text: "learn how to fly a spaceship"
    })

    expect(storeObject.getState()).toEqual({
      todos: [
        { text: 'go skiing', completed: false },
        { text: 'learn how to fly a spaceship', completed: false },
      ],
      tomaybes: [
        { text: "nope, nevermind" }
      ]
    })

    // make sure nbpr doesn't screw anything up (and can add a new path)
    storeObject.set('todonts', [
      { text: 'fall off a cliff', goodSoFar: true },
      { text: 'get lost in another galaxy', goodSoFar: true }
    ])

    expect(storeObject.getState()).toEqual({
      todos: [
        { text: 'go skiing', completed: false },
        { text: 'learn how to fly a spaceship', completed: false },
      ],
      todonts: [
        { text: 'fall off a cliff', goodSoFar: true },
        { text: 'get lost in another galaxy', goodSoFar: true }
      ],
      tomaybes: [
        { text: "nope, nevermind" }
      ]
    })

    // make sure vanilla doesn't screw up the nbpr stuff we just added
    storeObject.dispatch({
      type: "ADD_TODO",
      text: "go rock climbing"
    })

    expect(storeObject.getState()).toEqual({
      todos: [
        { text: 'go skiing', completed: false },
        { text: 'learn how to fly a spaceship', completed: false },
        { text: 'go rock climbing', completed: false },
      ],
      todonts: [
        { text: 'fall off a cliff', goodSoFar: true },
        { text: 'get lost in another galaxy', goodSoFar: true }
      ],
      tomaybes: [
        { text: "nope, nevermind" }
      ]
    })
  })

  test("store with vanilla reducer works with full set", () => {

    // make sure we initialize correctly with a reducer, matching preloaded state AND extra preloaded state
    const storeObject = makeStore(_.merge({ key: storeKey() }, _.cloneDeep(storeConfig)))
    expect(storeObject.getState()).toEqual({
      todonts: null,
      todos: [
        { text: 'go skiing', completed: false }
      ],
      tomaybes: [
        { text: "nope, nevermind" }
      ]
    })

    // make sure a vanilla reducer doesn't screw anything up
    storeObject.dispatch({
      type: "ADD_TODO",
      text: "learn how to fly a spaceship"
    })

    expect(storeObject.getState()).toEqual({
      todonts: null,
      todos: [
        { text: 'go skiing', completed: false },
        { text: 'learn how to fly a spaceship', completed: false },
      ],
      tomaybes: [
        { text: "nope, nevermind" }
      ]
    })

    // make sure nbpr doesn't screw anything up (and can add a new path)
    storeObject.set({
      todonts: [
        { text: 'fall off a cliff', goodSoFar: true },
        { text: 'get lost in another galaxy', goodSoFar: true }
      ]
    })

    expect(storeObject.getState()).toEqual({
      todonts: [
        { text: 'fall off a cliff', goodSoFar: true },
        { text: 'get lost in another galaxy', goodSoFar: true }
      ],
      todos: [],
      tomaybes: null
    })

    // make sure vanilla doesn't screw up the nbpr stuff we just added
    // running a vanilla reducer will add back any previously removed stores with a value of 'null'
    storeObject.dispatch({
      type: "ADD_TODO",
      text: "go rock climbing"
    })

    expect(storeObject.getState()).toEqual({
      todos: [
        { text: 'go rock climbing', completed: false },
      ],
      todonts: [
        { text: 'fall off a cliff', goodSoFar: true },
        { text: 'get lost in another galaxy', goodSoFar: true }
      ],
      tomaybes: null
    })
  })
})

describe("user can read the store", () => {
  test("user can read the store", () => {
    let preloadedState = {
      todos: [
        { id: 0, value: "finish writing unit tests" },
        { id: 1, value: "write integ tests" }
      ]
    }
    const storeObject = makeStore({ key: storeKey(), preloadedState })

    const getWithoutPath = storeObject.get()
    expect(getWithoutPath).toEqual(preloadedState)

    const getWithTodosPath = storeObject.get('todos')
    expect(getWithTodosPath).toEqual(preloadedState.todos)

    const firstTodoText = storeObject.get('todos.0.value', false)
    expect(firstTodoText).toEqual("finish writing unit tests")

    const tenthTodoText = storeObject.get('todos.10.value', false)
    expect(tenthTodoText).toEqual(false)

    const noStoreValue = storeObject.get('nonExistant')
    expect(noStoreValue).toEqual(undefined)
  })

  test('.get should throw when passed an improper number of args', () => {
    const storeObject = makeStore({ key: storeKey() })

    expect(() => {
      storeObject.get('path.to.val', 'DEFAULT_VALUE', 'EXTRA_VALUE')
    }).toThrow()
  })
})

describe("creating and selecting a store works", () => {
  test('creating a store and then selecting it works', () => {
    const storeObject = makeStore()

    expect(storeObject).toBe(store())

    const storeObject2 = makeStore({ key: 'foo' })

    expect(storeObject2).toBe(store('foo'))
  })

  test('creating a store with the same key twice should throw', () => {
    makeStore({ key: 'bar' })

    expect(() => {
      makeStore({ key: 'bar' })
    }).toThrow()
  })
})
