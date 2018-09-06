import { initializeStore } from '../src/initialize-store'


describe('initializeStore', () => {
  it('produces a new basic store', () => {
    let store = initializeStore()

    // standard store props
    expect(store).toHaveProperty('dispatch')
    expect(store).toHaveProperty('subscribe')
    expect(store).toHaveProperty('getState')
    expect(store).toHaveProperty('replaceReducer')

    // our store props
    expect(store).toHaveProperty('select')
  })

  it('produces a new store with a default state', () => {
    let store = initializeStore({
      preloadedState: {
        todos: [
          { id: 0, value: "write tests"}
        ]
      }
    })

    // standard store props
    expect(store).toHaveProperty('dispatch')
    expect(store).toHaveProperty('subscribe')
    expect(store).toHaveProperty('getState')
    expect(store).toHaveProperty('replaceReducer')

    // our store props
    expect(store).toHaveProperty('select')

    // expect preloaded state to become a reducer
    expect(store.reducers).toHaveProperty('todos')
  })
})