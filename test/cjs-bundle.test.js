import { store, makeReducer, makeStore } from '../cjs/no-boilerplate-redux'
import { buildTests } from './test-suite'

buildTests('cjs/no-boilerplate-redux', false, store, makeReducer, makeStore)
