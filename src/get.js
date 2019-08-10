export function get() {
  if (arguments.length > 0)
    throw new Error(`store.get() expects no arguments, but received ${arguments.length}: ${arguments}`)

  let store = this
  return store.getState()
}