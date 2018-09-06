import { addReducerIfNeeded } from '../src/add-reducer-if-needed'

describe('addReducerIfNeeded', () => {
  it("adds a NBPR reducer (first time only)", () => {
    let reducers = {}

    expect(addReducerIfNeeded('MyDynamicReducer', reducers)).toEqual(true)
    expect(reducers.MyDynamicReducer.reducerless).toBeDefined()
    expect(addReducerIfNeeded('MyDynamicReducer', reducers)).toEqual(false)
  })

  it("adds a NBPR if a vanilla reducer exists (first time only)", () => {
    let reducers = {
      VanillaTestReducer: (state) => state
    }

    expect(addReducerIfNeeded('VanillaTestReducer', reducers)).toEqual(true)
    expect(reducers.VanillaTestReducer.reducerless).toBeDefined()
    expect(addReducerIfNeeded('VanillaTestReducer', reducers)).toEqual(false)
  })

  it("replaces reducer when provided a store and adding a reducer for the first time", () => {
    let store = { 
      reducers: {
        VanillaTestReducer: (state) => state
      },
      replaceReducer: jest.fn(),
      reducerCombiner: jest.fn() 
    }

    addReducerIfNeeded('MyDynamicReducer', store.reducers, store)
    addReducerIfNeeded('MyDynamicReducer', store.reducers, store)

    expect(store.replaceReducer.mock.calls[0]).toBeDefined()
    expect(store.replaceReducer.mock.calls[1]).toBeUndefined()

    addReducerIfNeeded('VanillaTestReducer', store.reducers, store)
    addReducerIfNeeded('VanillaTestReducer', store.reducers, store)

    expect(store.replaceReducer.mock.calls[1]).toBeDefined()
    expect(store.replaceReducer.mock.calls[2]).toBeUndefined()
  })

  it("returns false if no stateKey is passed", () => {
    expect(addReducerIfNeeded()).toEqual(false)
  })
})