import { reducerlessReducer } from '../src/reducerless-reducer'

describe('reducerlessReducer', () => {
  it("doesn't touch the state if the action doesn't have the nbpr meta", () => {
    const beginState = 1
    
    const testState = reducerlessReducer(beginState, {  
      type: 'SET_STORE',
      payload: {
        value: 2
      }
    })

    expect(testState).toBe(beginState)
  })

  it("correctly applies a pathless value set", () => {
    const beginState = 1
    const endState = 2

    const testState = reducerlessReducer(beginState, {  
      type: 'SET_STORE',
      payload: {
        value: 2
      },
      meta: { nbpr: true }
    })

    expect(testState).toEqual(endState)
  })
  
  it("correctly applies a pathed value set", () => { 
    const beginState = { todos: { count: 1 } }
    const endState = { todos: { count: 2 } }

    const testState = reducerlessReducer(beginState, {
      type: 'SET_STORE',
      payload: {
        path: 'todos.count',
        value: 2
      },
      meta: { nbpr: true }
    })

    expect(testState).toEqual(endState)
  })

  it("correctly applies a pathless function set", () => {
    const beginState = 1
    const endState = 2

    const testState = reducerlessReducer(beginState, {  
      type: 'SET_STORE',
      payload: {
        fn: (state) => state + 1
      },
      meta: { nbpr: true }
    })

    expect(testState).toEqual(endState)
  })
  
  it("correctly applies a pathed function set", () => {
    const beginState = { todos: { count: 1 } }
    const endState = { todos: { count: 2 } }

    const testState = reducerlessReducer(beginState, {
      type: 'SET_STORE',
      payload: {
        path: 'todos.count',
        fn: (count) => count + 1
      },
      meta: { nbpr: true }
    })

    expect(testState).toEqual(endState)
  })

  it("interprets undefined state as an object", () => {
    const beginState = undefined
    const endState = { todos: { count: 2 } }

    const testState = reducerlessReducer(beginState, {
      type: 'SET_STORE',
      payload: {
        path: 'todos.count',
        value: 2
      },
      meta: { nbpr: true }
    })

    expect(testState).toEqual(endState)
  })

  it("doesn't modify state and throws error when state isn't an object and path is provided", () => {
    const beginState = 2

    const testState = reducerlessReducer(beginState, {
      type: 'SET_STORE',
      payload: {
        path: 'todos.count',
        value: 2
      },
      meta: { nbpr: true }
    })

    expect(testState).toBe(beginState)
  })
})
