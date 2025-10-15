import { resolve } from 'node:path'
import { defineNuxtModule } from '@nuxt/kit'
import { startSubprocess } from '@nuxt/devtools-kit'

export default defineNuxtConfig({

  modules: [
    /**
     * Kinde Auth Module
     */
    '../src/module',
    /**
     * Start a sub Nuxt Server for developing the client
     *
     * The terminal output can be found in the Terminals tab of the devtools.
     */
    defineNuxtModule({
      setup(_, nuxt) {
        if (!nuxt.options.dev) {
          return
        }

        const _process = startSubprocess(
          {
            command: 'npx',
            args: ['nuxi', 'dev', '--port', '3300'],
            cwd: resolve(__dirname, '../client'),
          },
          {
            id: 'kinde-auth:client',
            name: 'Kinde Auth Client Dev',
          },
        )
      },
    }),
  ],
  devtools: {
    enabled: true,
  },

  compatibilityDate: '2024-08-21',

  kindeAuth: {
    authDomain: process.env.NUXT_KINDE_AUTH_DOMAIN || 'https://test.kinde.com',
    clientId: process.env.NUXT_KINDE_CLIENT_ID || 'test-client-id',
    clientSecret: process.env.NUXT_KINDE_CLIENT_SECRET || 'test-client-secret',
    redirectURL: process.env.NUXT_KINDE_REDIRECT_URL || 'http://localhost:3000/api/kinde/callback',
    logoutRedirectURL: '/',
    postLoginRedirectURL: '/dashboard',
    cookie: {
      prefix: 'test_',
    },
    debug: {
      enabled: true,
    },
    devtools: true,
  },
})
