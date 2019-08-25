// Much of this config was shamelessly stolen from Redux. :D

import babel from 'rollup-plugin-babel'
import replace from 'rollup-plugin-replace'
import { terser } from 'rollup-plugin-terser'
import visualizer from 'rollup-plugin-visualizer'

import pkg from './package.json'

export default [
  // CommonJS
  {
    input: 'src/main.js',
    output: { file: 'cjs/no-boilerplate-redux.js', format: 'cjs', indent: false },
    external: [
      ...Object.keys(pkg.dependencies || {}),
      ...Object.keys(pkg.peerDependencies || {})
    ],
    plugins: [
      babel(),
      visualizer({ filename: 'stats/commonjs.html' })
    ]
  },
  
  // CommonJS Production
  {
    input: 'src/main.js',
    output: { file: 'cjs/no-boilerplate-redux.min.js', format: 'cjs', indent: false },
    external: [
      ...Object.keys(pkg.dependencies || {}),
      ...Object.keys(pkg.peerDependencies || {})
    ],
    plugins: [
      babel(),
      replace({
        'process.env.NODE_ENV': JSON.stringify('production')
      }),
      terser({
        compress: {
          pure_getters: true,
          unsafe: true,
          unsafe_comps: true,
          warnings: false
        }
      }),
      visualizer({ filename: 'stats/commonjs-prod.html' })
    ]
  },

  // ES
  {
    input: 'src/main.js',
    output: { file: 'es/no-boilerplate-redux.js', format: 'es', indent: false },
    external: [
      ...Object.keys(pkg.dependencies || {}),
      ...Object.keys(pkg.peerDependencies || {})
    ],
    plugins: [
      babel(),
      visualizer({ filename: 'stats/es.html' })
    ]
  },

  // ES Production
  {
    input: 'src/main.js',
    output: { file: 'es/no-boilerplate-redux.min.js', format: 'es', indent: false },
    external: [
      ...Object.keys(pkg.dependencies || {}),
      ...Object.keys(pkg.peerDependencies || {})
    ],
    plugins: [
      babel(),
      replace({
        'process.env.NODE_ENV': JSON.stringify('production')
      }),
      terser({
        compress: {
          pure_getters: true,
          unsafe: true,
          unsafe_comps: true,
          warnings: false
        }
      }),
      visualizer({ filename: 'stats/es.html' })
    ]
  }
]