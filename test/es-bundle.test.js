import { store, makeReducer, makeStore } from '../es/no-boilerplate-redux'
import { buildTests } from './test-suite'

buildTests('es/no-boilerplate-redux', false, store, makeReducer, makeStore)
