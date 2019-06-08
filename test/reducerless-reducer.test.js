import { reducerlessReducer } from '../src/reducerless-reducer'

describe('reducerlessReducer', () => {
  it("doesn't touch the state if the action doesn't have the nbpr meta", () => {
    const beginState = 1
    
    const testState = reducerlessReducer('StateKey', beginState, {  
      type: 'SET_STORE',
      payload: {
        value: 2
      }
    })

    expect(testState).toBe(beginState)
  })

  it("doesn't touch the state if the action has the wrong nbpr meta", () => {
    const beginState = 1
    
    const testState = reducerlessReducer('CorrectStateKey', beginState, {  
      type: 'SET_STORE',
      payload: {
        value: 2
      },
      meta: { nbpr: 'WrongStateKey' }
    })

    expect(testState).toBe(beginState)
  })

  it("correctly applies a pathless value set", () => {
    const beginState = 1
    const endState = 2

    const testState = reducerlessReducer('StateKey', beginState, {  
      type: 'SET_STORE_NOPATH_VALUE_SET',
      payload: {
        value: 2
      },
      meta: { nbpr: 'StateKey' }
    })

    expect(testState).toEqual(endState)
  })
  
  it("correctly applies a pathed value set", () => { 
    const beginState = { todos: { count: 1 } }
    const endState = { todos: { count: 2 } }

    const testState = reducerlessReducer('StateKey', beginState, {
      type: 'SET_STORE_PATH_VALUE_SET',
      payload: {
        path: 'todos.count',
        value: 2
      },
      meta: { nbpr: 'StateKey' }
    })

    expect(testState).toEqual(endState)
  })

  it("correctly applies a pathless function set", () => {
    const beginState = 1
    const endState = 2

    const testState = reducerlessReducer('StateKey', beginState, {  
      type: 'SET_STORE_NOPATH_FN_SET',
      payload: {
        fn: (state) => state + 1
      },
      meta: { nbpr: 'StateKey' }
    })

    expect(testState).toEqual(endState)
  })
  
  it("correctly applies a pathed function set", () => {
    const beginState = { todos: { count: 1 } }
    const endState = { todos: { count: 2 } }

    const testState = reducerlessReducer('StateKey', beginState, {
      type: 'SET_STORE_PATH_FN_SET',
      payload: {
        path: 'todos.count',
        fn: (count) => count + 1
      },
      meta: { nbpr: 'StateKey' }
    })

    expect(testState).toEqual(endState)
  })

  it("correctly handles undefined state", () => {
    const beginState = undefined
    const endState = { todos: { count: 2 } }

    const testState = reducerlessReducer('StateKey', beginState, {
      type: 'SET_STORE_UNDEFINED',
      payload: {
        path: 'todos.count',
        value: 2
      },
      meta: { nbpr: 'StateKey' }
    })

    expect(testState).toEqual(endState)
  })

  it("doesn't modify state and throws error when state isn't an object and path is provided", () => {
    const beginState = 2

    const testState = reducerlessReducer('StateKey', beginState, {
      type: 'SET_STORE_INVALID_STATE',
      payload: {
        path: 'todos.count',
        value: 2
      },
      meta: { nbpr: 'StateKey' }
    })

    expect(testState).toBe(beginState)
  })
})
