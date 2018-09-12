import { storeFn, getFn } from '../src/fn-store'

describe('storeFn and getFn', () => {

  it ('caching and getting returns the original function', () => {
    const myCoolFunction = () => console.log(`I'm a badass function!`)
    const myCoolFunctionHash = storeFn(myCoolFunction)
    const myCoolFunctionAgain = getFn(myCoolFunctionHash)
    
    expect(myCoolFunctionHash).toEqual(expect.any(String))
    expect(myCoolFunctionAgain).toBe(myCoolFunction)
  })

  it('caching and getting a non-function value returns a no-op function', () => {
    const notAFunction = [1,2,3,4]
    const noOpStateFunctionHash = storeFn(notAFunction)
    const noOpStateFunction = getFn(noOpStateFunctionHash)
    const passThroughState = { Should: 'Be', Passed: 'Through' }
    
    expect(noOpStateFunctionHash).toEqual(expect.any(String))
    expect(noOpStateFunction(passThroughState)).toBe(passThroughState)
  })
})