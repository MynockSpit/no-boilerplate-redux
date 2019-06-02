// import { initializeStore } from '../dist/no-boilerplate-redux'
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
        songsByArtist: {
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
      songsByArtist: {
        'Talking Heads': {
          'Burning Down The House': 11,
          'City of Dreams': 14,
          'Stay up Late': 8
        }
      },
      artists: {}
    })
  })

  test('can increment already extant value', () => {
    store.select('songsByArtist').set(songsByArtist => {
      songsByArtist['Talking Heads']['Burning Down The House']++
      return songsByArtist
    })

    expect(store.getState()).toEqual({
      songsByArtist: {
        'Talking Heads': {
          'Burning Down The House': 12,
          'City of Dreams': 14,
          'Stay up Late': 8
        }
      },
      artists: {}
    })
  })

  test('add completely new value via path', () => {
    store.select('songsByArtist', '["Talking Heads"]["Psycho Killer"]')
      .set(psychoKillerPlays => (psychoKillerPlays || 0) + 1)

    expect(store.getState()).toEqual({
      songsByArtist: {
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

  test('can add completely new value via function', () => {
    store.select('songsByArtist', '["Talking Heads"]')
      .set(talkingHeadsSongs => {
        talkingHeadsSongs["And She Was"] = 1
        return talkingHeadsSongs
      })
    expect(store.getState()).toEqual({
      songsByArtist: {
        'Talking Heads': {
          'Burning Down The House': 12,
          'City of Dreams': 14,
          'Stay up Late': 8,
          'Psycho Killer': 1,
          'And She Was': 1
        }
      },
      artists: {}
    })
  })

  test('can increment already extant value', () => {
    store.select('artists', '["Talking Heads"].members').set([
      'David Byrne',
      'Chris Frantz',
      'Tina Weymouth',
      'Jerry Harrison'
    ])

    expect(store.getState()).toEqual({
      songsByArtist: {
        'Talking Heads': {
          'Burning Down The House': 12,
          'City of Dreams': 14,
          'Stay up Late': 8,
          'Psycho Killer': 1,
          'And She Was': 1
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
})

describe("store can be modified using `set` pattern", () => {
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
})
