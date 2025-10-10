import { defineBuildConfig } from 'unbuild'

export default defineBuildConfig({
  entries: ['src/module'],
  externals: [
    '@nuxt/kit',
    '@nuxt/schema',
    'nuxt',
    'vue',
    'defu',
    '@kinde-oss/kinde-typescript-sdk'
  ],
  declaration: true,
  rollup: {
    emitCJS: true,
    inlineDependencies: true
  }
})

