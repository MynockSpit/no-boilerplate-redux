import { functions, cacheFn, getFn, noOpStateFn } from '../src/fn-cache'

describe('cacheFn', () => {
  const myCoolFunction = () => console.log(`I'm a badass function!`)
  const myCoolFunctionHash = "-774605802"
  functions[myCoolFunctionHash] = myCoolFunction
  const noOpStateFnHash = "1009504556"

  it("cacheFn correctly returns the hash", () => {
    expect(cacheFn(myCoolFunction)).toEqual(myCoolFunctionHash)
  })

  it("returns the noOpStateFnHash if passed a non-function", () => {
    expect(cacheFn([])).toBe(noOpStateFnHash)
  })
})

describe("getFn", () => {
  const myCoolFunction = () => console.log(`I'm a badass function!`)
  const myCoolFunctionHash = "-774605802"
  functions[myCoolFunctionHash] = myCoolFunction
  
  it("gets the fn back from the hash", () => {
    expect(getFn(myCoolFunctionHash)).toBe(myCoolFunction)
  })

  it("returns the input function if passed a function", () => {
    const someFunction = () => console.log(`I'm some function.`)
    expect(getFn(someFunction)).toBe(someFunction)
  })

  it("returns a dummy function if passed nothing", () => {
    expect(getFn()).toBe(noOpStateFn)
  })
})

describe("noOpStateFn", () => {
  it("returns the input without modifications", () => {
    let inputState = { todos: [ { id: 0, value: "write tests" } ] }
    let inputStateString = JSON.stringify(inputState)
    let outputState = noOpStateFn(inputState)
    let outputStateString = JSON.stringify(outputState)

    expect(inputState).toBe(outputState)
    expect(inputStateString).toEqual(outputStateString)
  })
})