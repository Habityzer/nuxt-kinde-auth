import { resolve } from 'pathe'

export default defineNuxtConfig({

  modules: [
    '@nuxt/devtools-ui-kit',
  ],
  ssr: false,

  devtools: {
    enabled: false,
  },

  app: {
    baseURL: '/__kinde-auth',
  },

  compatibilityDate: '2025-01-15',

  nitro: {
    output: {
      publicDir: resolve(__dirname, '../dist/client'),
    },
  },
})
