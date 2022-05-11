import { store, makeReducer, makeStore } from '../src/main'
import { buildTests } from './test-suite'

buildTests('Source works', false, store, makeReducer, makeStore)
