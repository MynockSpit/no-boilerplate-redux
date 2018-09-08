import { select } from '../src/select'

jest.mock('../src/add-reducer-if-needed.js', () => ({ addReducerIfNeeded: jest.fn() }));

describe("select(...).set(...)", () => {
  let fakeStore
  let boundSelect

  beforeEach(() => {
    fakeStore = {
      dispatch: jest.fn(),
      replaceReducer: jest.fn()
    }
    boundSelect = select.bind(fakeStore)
  })

  test("throws when select is not passed a stateKey", () => {
    expect(() => {
      select()
    }).toThrow()
  })

  test("dispatches an action a value and no custom config", () => {
    const resultantAction = {
      type: "SET_STOREKEY",
      payload: {
        path: undefined,
        value: 2,
        fn: undefined
      },
      meta: {
        nbpr: "StoreKey",
      }
    }

    boundSelect("StoreKey").set(2)

    expect(fakeStore.dispatch.mock.calls[0][0]).toEqual(resultantAction)
  })

  test("dispatches an action with a value and custom action name", () => {
    const resultantAction = {
      type: "SET_STOREKEY_CUSTOMACTIONNAME",
      payload: {
        path: "store.path",
        value: "Set Value",
        fn: undefined,
      },
      meta: {
        nbpr: "StoreKey"
      }
    }

    boundSelect("StoreKey", "store.path")
      .set("Set Value", "CustomActionName")

    expect(fakeStore.dispatch.mock.calls[0][0]).toEqual(resultantAction)
  })

  test("dispatches an action with a fn and custom action data", () => {
    const resultantAction = {
      type: "MY_TYPE",
      payload: {
        path: undefined,
        value: undefined,
        fn: expect.any(String)
      },
      meta: {
        nbpr: "StoreKey",
        optimist: true
      }
    }

    boundSelect("StoreKey")
      .set((state) => ++state, { type: "MY_TYPE", meta: { optimist: true } })

    expect(fakeStore.dispatch.mock.calls[0][0]).toEqual(resultantAction)
  })
})