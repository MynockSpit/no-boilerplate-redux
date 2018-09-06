import { reducerFactory } from '../src/reducer-factory'

jest.mock('../src/reducerless-reducer.js', () => ({ reducerlessReducer: jest.fn() }));
import { reducerlessReducer } from '../src/reducerless-reducer'

describe('reducerFactory', () => {
  it('returns a function that has been tagged with the `reducerless` property', () => {
    let reducerRouter = reducerFactory()

    expect(reducerRouter).toEqual(expect.any(Function))
    expect(reducerRouter.reducerless).toEqual(true)
  })
})

describe('reducerRouter', () => {
  it('passes the action to the normalReducer if the action isn\'t nbpr', () => {
    let normalReducer = jest.fn()
    let reducerRouter = reducerFactory(normalReducer)

    reducerRouter(null, {})

    expect(normalReducer).toHaveBeenCalled()
  })

  it('passes the action to the reducerless reducer if the action is nbpr', () => {
    let normalReducer = jest.fn()
    let reducerRouter = reducerFactory(normalReducer)

    reducerRouter(null, { meta: { nbpr: true } })

    expect(reducerlessReducer).toHaveBeenCalled()
  })

  it ('passes the action to the reducerless reducer if there\s no normalReducer', () => {
    let reducerRouter = reducerFactory()

    reducerRouter(null, {})

    expect(reducerlessReducer).toHaveBeenCalled()
  })
})