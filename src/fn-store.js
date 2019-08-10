// cache action functions
export const cache = {}

export function storeFn(fn) {
  // a simple way of getting a random 8-digit number
  let eightDigitNumber = ('' + Math.random()).replace('0.', '').slice(0, 8)
  let fnBody = `// fn: ${+new Date()}-${eightDigitNumber}\n` + fn
  cache[fnBody] = fn
  return fnBody
}

// get the function
export function getFn(fnOrHash) {
  let fn = cache[fnOrHash]

  // get getting that value out resulted in a function, use it
  if (typeof fn === 'function')
    return fn
}