import { store, makeReducer, makeStore } from '../cjs/no-boilerplate-redux.min'
import { buildTests } from './test-suite'

buildTests('cjs/no-boilerplate-redux.min', true, store, makeReducer, makeStore)
