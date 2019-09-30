import store from '../src/main'
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

// test as much of the functionality that users will experience as reasonable
describe('basic store test', () => {
  test("store initializes", () => {
    store.create()

    expect(store().getState()).toEqual({
    })
  })

  test("can overwrite entire store", () => {
    store().set('todos', [{
      id: 0,
      value: "write unit tests"
    }])

    expect(store().getState()).toEqual({
      todos: [{
        id: 0,
        value: "write unit tests"
      }]
    })
  })

  test("can add new property via path", () => {
    store().set('todos[1]', {
      id: 1,
      value: "write integ tests"
    })

    expect(store().getState()).toEqual({
      todos: [
        { id: 0, value: "write unit tests" },
        { id: 1, value: "write integ tests" }
      ]
    })
  })

  test("can modify property via path", () => {
    store().set('todos.[0].value', 'finish writing unit tests')

    expect(store().getState()).toEqual({
      todos: [
        { id: 0, value: "finish writing unit tests" },
        { id: 1, value: "write integ tests" }
      ]
    })
  })
})

describe('store with preloadedState and functions', () => {
  test("store initializes", () => {
    store.create({
      preloadedState: {
        songPlaysByArtist: {
          'Talking Heads': {
            'Burning Down The House': 11,
            'City of Dreams': 14,
            'Stay up Late': 8
          }
        }
      },
      reducer: {
        artists: (state = {}) => state
      }
    })

    expect(store().getState()).toEqual({
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
    store().set('songPlaysByArtist', songPlaysByArtist => {
      songPlaysByArtist['Talking Heads']['Burning Down The House']++
      return songPlaysByArtist
    })

    expect(store().getState()).toEqual({
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
    store().set(
      'songPlaysByArtist.["Talking Heads"]["Psycho Killer"]',
      (psychoKillerPlays = 0) => (psychoKillerPlays) + 1
    )

    expect(store().getState()).toEqual({
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
    store().set(
      'artists.["Talking Heads"].members',
      [
        'David Byrne',
        'Chris Frantz',
        'Tina Weymouth',
        'Jerry Harrison'
      ])

    expect(store().getState()).toEqual({
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
    store().set('songPlaysByArtist', {
      'Talking Heads': {}
    })

    expect(store().getState()).toEqual({
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
    store.create()

    // set a store from nothing
    store().set('todos', [
      { id: 0, value: "finish writing unit tests" },
      { id: 1, value: "write integ tests" }
    ])

    expect(store().getState()).toEqual({
      todos: [
        { id: 0, value: "finish writing unit tests" },
        { id: 1, value: "write integ tests" }
      ],
    })

    // return the store to nothing
    store().set('todos', undefined)

    // undefined is not a valid value for reducers to return, so it gets set to null instead
    expect(store().getState()).toEqual({
      todos: undefined,
    })

    // and back once more to something
    store().set('todos', [
      { id: 0, value: "finish writing unit tests" },
      { id: 1, value: "write integ tests" }
    ])

    expect(store().getState()).toEqual({
      todos: [
        { id: 0, value: "finish writing unit tests" },
        { id: 1, value: "write integ tests" }
      ],
    })
  })

  test('user can set a store part to undefined and back with a function', () => {
    store.create()

    // set the store to something
    store().set('todos', () => ([
      { id: 0, value: "finish writing unit tests" },
      { id: 1, value: "write integ tests" }
    ]))

    expect(store().getState()).toEqual({
      todos: [
        { id: 0, value: "finish writing unit tests" },
        { id: 1, value: "write integ tests" }
      ],
    })

    // return the store to nothing
    store().set('todos', () => undefined)
    // undefined is not a valid value for reducers to return, so it gets set to null instead
    expect(store().getState()).toEqual({
      todos: undefined,
    })

    // set the store back to something
    store().set('todos', () => ([
      { id: 0, value: "finish writing unit tests" },
      { id: 1, value: "write integ tests" }
    ]))

    expect(store().getState()).toEqual({
      todos: [
        { id: 0, value: "finish writing unit tests" },
        { id: 1, value: "write integ tests" }
      ],
    })
  })

  test('user can set a path on a store part to undefined and back with a value', () => {
    store.create()

    // store goes from nothing to something
    store().set('one.step.too', { few: true })

    expect(store().getState()).toEqual({
      one: { step: { too: { few: true } } },
    })

    // store part goes from something -> nothing
    store().set('one.step.too', undefined)

    expect(store().getState()).toEqual({
      one: { step: { too: undefined } },
    })

    // store goes from nothing to something (again)
    store().set('one.step.too', { few: true })

    expect(store().getState()).toEqual({
      one: { step: { too: { few: true } } },
    })
  })

  test('user can set a path on a store part to undefined and back with a function', () => {
    store.create()

    // can the store handle being deeply set from nothing?
    store().set('one.step.too', () => ({ few: true }))

    expect(store().getState()).toEqual({
      one: { step: { too: { few: true } } },
    })

    // can the store handle being deeply unset?
    store().set('one.step.too', () => undefined)

    expect(store().getState()).toEqual({
      one: { step: { too: undefined } },
    })

    // can the store handle being deeply reset?
    store().set('one.step.too', () => ({ few: true }))

    expect(store().getState()).toEqual({
      one: { step: { too: { few: true } } },
    })
  })
})

describe('user can customize the action being fired', () => {
  test('user can customize the action using the action method', () => {
    store.create()
    let dispatch = jest.spyOn(store(), 'dispatch')

    store().action('todos', {
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

    expect(store().getState()).toEqual({
      todos: [{
        id: 0,
        value: "make sure string action customization works"
      }]
    })
  })

  test('user can customize the action using the action creator method', () => {
    store.create()
    let dispatch = jest.spyOn(store(), 'dispatch')

    store().action(store => {
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
      payload: expect.any(Array),
      meta: {
        moreExtraData: 11,
        nbpr: 'UPDATE'
      }
    })

    expect(store().getState()).toEqual({
      todos: [
        { id: 0, value: "make sure object action customization works" }
      ]
    })
  })

  test('action should throw when passed an improper number of args', () => {
    store.create()

    expect(() => {
      store().action('path.to.var', { payload: 'f' }, false)
    }).toThrow()
  })

  test('action should throw if the argument provided is not a function or an object', () => {
    store.create()

    expect(() => {
      store().action("{ payload: 'f' }")
    }).toThrow()
  })
})

describe("user can modify the store using `.set()`", () => {
  test("using a fn and modifying the `store` object performs a merge", () => {
    store.create({
      preloadedState: {
        todos: [
          { id: 0, value: "finish writing unit tests" },
          { id: 1, value: "write integ tests" }
        ]
      }
    })

    // update using a function
    store().set((state) => {
      state.username = 'MynockSpit'
      state.isAuthenticated = true

      return state
    })

    expect(store().getState()).toEqual({
      todos: [
        { id: 0, value: "finish writing unit tests" },
        { id: 1, value: "write integ tests" }
      ],
      username: 'MynockSpit',
      isAuthenticated: true
    })
  })

  test("using a fn and returning an object replaces the store", () => {
    store.create({
      preloadedState: {
        todos: [
          { id: 0, value: "finish writing unit tests" },
          { id: 1, value: "write integ tests" }
        ]
      }
    })

    // update using a function
    store().set(() => {
      return {
        username: 'MynockSpit',
        isAuthenticated: true
      }
    })

    expect(store().getState()).toEqual({
      username: 'MynockSpit',
      isAuthenticated: true
    })
  })

  test("using an object without a path performs full store replace", () => {
    store.create({
      preloadedState: {
        todos: [
          { id: 0, value: "finish writing unit tests" },
          { id: 1, value: "write integ tests" }
        ]
      }
    })

    // update using an object (should merge)
    store().set({
      username: 'MynockSpit',
      isAuthenticated: true
    })

    expect(store().getState()).toEqual({
      username: 'MynockSpit',
      isAuthenticated: true
    })
  })

  test("user can set entire store to a non-object from a .set()", () => {
    store.create()

    store().set(() => {
      return 'MynockSpit'
    })

    expect(store().getState()).toEqual('MynockSpit')
  })

  test("throws when user tries to .set() to a value that isn't an object or function", () => {
    store.create()

    store().set('MynockSpit')

    expect(store().getState()).toEqual('MynockSpit')
  })

  test('.set should throw when passed an improper number of args', () => {
    store.create()

    expect(() => {
      store().set('foo', { payload: 'f' }, false)
    }).toThrow()
  })

  test('should throw if a path is provided but the state is not a function, array, or object', () => {
    store.create({ preloadedState: 'foo' })

    expect(() => {
      store().action('path.to.state', " f ")
    }).toThrow()
  })
})

describe("make sure some weird edge-cases work", () => {

  let warn = jest.spyOn(global.console, 'warn')
  let error = jest.spyOn(global.console, 'error')

  test("undefined and the store", () => {
    store.create({ reducer: () => undefined })
    expect(store().getState()).toEqual(undefined)

    // if the store is undefined, and you set a path on it, it should convert it to an object
    store().set('foo.bar.baz', true)
    expect(store().getState()).toEqual({ foo: { bar: { baz: true } } })

    // make sure when we set undefined, it gets set
    store().set(undefined)
    expect(store().getState()).toEqual(undefined)
  })

  test("null and the store", () => {
    store.create({ reducer: () => null })
    expect(store().getState()).toEqual(null)

    // if the store is undefined, and you set a path on it, it should convert it to an object
    store().set('foo.bar.baz', true)
    expect(store().getState()).toEqual({ foo: { bar: { baz: true } } })

    // make sure when we set undefined, it gets set
    store().set(null)
    expect(store().getState()).toEqual(null)
  })

  test("other primatives and the store", () => {
    store.create({ reducer: () => 1000 })
    expect(store().getState()).toEqual(1000)

    store().set(23)
    expect(store().getState()).toEqual(23)

    // Probably warn here too.
    store().set('', 28)
    expect(store().getState()).toEqual(28)

    // Not really sure what I want this to be? Warn, probably.
    store().set(undefined, 28)
    expect(store().getState()).toEqual(28)

    // expect(() => {
    //   store.set('foo.bar.baz', 23)
    // }).toThrow() // do I?
  })
})

// there's quite a bit of logic that makes the vanilla reducers (especially ones made with 
// `combineReducers`) work with nbpr. This test makes sure that that code is still working.
describe("store works with vanilla reducers", () => {
  const storeConfig = {
    reducer: {
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
    },
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
    store.create(_.cloneDeep(storeConfig))
    expect(store().getState()).toEqual({
      todos: [
        { text: 'go skiing', completed: false }
      ],
      tomaybes: [
        { text: "nope, nevermind" }
      ]
    })

    // make sure a vanilla reducer doesn't screw anything up
    store().dispatch({
      type: "ADD_TODO",
      text: "learn how to fly a spaceship"
    })

    expect(store().getState()).toEqual({
      todos: [
        { text: 'go skiing', completed: false },
        { text: 'learn how to fly a spaceship', completed: false },
      ],
      tomaybes: [
        { text: "nope, nevermind" }
      ]
    })

    // make sure nbpr doesn't screw anything up (and can add a new path)
    store().set('todonts', [
      { text: 'fall off a cliff', goodSoFar: true },
      { text: 'get lost in another galaxy', goodSoFar: true }
    ])

    expect(store().getState()).toEqual({
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
    store().dispatch({
      type: "ADD_TODO",
      text: "go rock climbing"
    })

    expect(store().getState()).toEqual({
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
    store.create(_.cloneDeep(storeConfig))
    expect(store().getState()).toEqual({
      todos: [
        { text: 'go skiing', completed: false }
      ],
      tomaybes: [
        { text: "nope, nevermind" }
      ]
    })

    // make sure a vanilla reducer doesn't screw anything up
    store().dispatch({
      type: "ADD_TODO",
      text: "learn how to fly a spaceship"
    })

    expect(store().getState()).toEqual({
      todos: [
        { text: 'go skiing', completed: false },
        { text: 'learn how to fly a spaceship', completed: false },
      ],
      tomaybes: [
        { text: "nope, nevermind" }
      ]
    })

    // make sure nbpr doesn't screw anything up (and can add a new path)
    store().set({
      todonts: [
        { text: 'fall off a cliff', goodSoFar: true },
        { text: 'get lost in another galaxy', goodSoFar: true }
      ]
    })

    expect(store().getState()).toEqual({
      todonts: [
        { text: 'fall off a cliff', goodSoFar: true },
        { text: 'get lost in another galaxy', goodSoFar: true }
      ]
    })

    // make sure vanilla doesn't screw up the nbpr stuff we just added
    // running a vanilla reducer will add back any previously removed stores with a value of 'null'
    store().dispatch({
      type: "ADD_TODO",
      text: "go rock climbing"
    })

    expect(store().getState()).toEqual({
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
    store.create({ preloadedState })

    const getWithoutPath = store().get()
    expect(getWithoutPath).toEqual(preloadedState)

    const getWithTodosPath = store().get('todos')
    expect(getWithTodosPath).toEqual(preloadedState.todos)

    const firstTodoText = store().get('todos.0.value', false)
    expect(firstTodoText).toEqual("finish writing unit tests")

    const tenthTodoText = store().get('todos.10.value', false)
    expect(tenthTodoText).toEqual(false)

    const noStoreValue = store().get('nonExistant')
    expect(noStoreValue).toEqual(undefined)
  })

  test('.get should throw when passed an improper number of args', () => {
    store.create()

    expect(() => {
      store().get('path.to.val', 'DEFAULT_VALUE', 'EXTRA_VALUE')
    }).toThrow()
  })
})
