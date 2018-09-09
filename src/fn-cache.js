// cache action functions
export const functions = {}

export function noOpStateFn(state) {
  return state
}

export function cacheFn(fn) {
  if (typeof fn !== 'function') {
    console.warn('WARNING: Ignoring an attempt to cache a non-function.')
    fn = noOpStateFn
  }

  let fnString = fn.toString()
  let fnHash = 0

  for (let i = 0; i < fnString.length; i++) {
    let chr = fnString.charCodeAt(i)
    fnHash = ((fnHash << 5) - fnHash) + chr;
    fnHash |= 0; // Convert to 32bit integer
  }

  // convert fnHash to a string
  fnHash = fnHash.toString()

  // cache the function
  functions[fnHash] = fn

  return fnHash
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