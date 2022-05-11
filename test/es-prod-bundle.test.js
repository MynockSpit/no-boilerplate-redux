import { store, makeReducer, makeStore } from '../es/no-boilerplate-redux.min'
import { buildTests } from './test-suite'

buildTests('es/no-boilerplate-redux.min', true, store, makeReducer, makeStore)
