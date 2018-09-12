// cache action functions
export const functions = {}

export function noOpStateFn(state) {
  return state
}

export function storeFn(fn) {
  if (typeof fn !== 'function') {
    console.warn('WARNING: Ignoring an attempt to cache a non-function.')
    fn = noOpStateFn
  }

  let fnBody = `// fn: ${+new Date()}-${generateRandomNumber(8)}\n` + fn.toString()

  functions[fnBody] = fn

  return fnBody
}

export function generateRandomNumber (length) {
  return parseInt(
    new Array(length)
      .fill('')
      .map(() => Math.floor(Math.random() * 10))
      .join('')
    )
}

// get the function
export function getFn(fnOrHash) {
  if (typeof fnOrHash === 'function') {
    return fnOrHash
  } else if (typeof fnOrHash === 'string') {
    return functions[fnOrHash]
  } else {
    return noOpStateFn
  }
}