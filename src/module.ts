import { defineNuxtModule, addServerHandler, addPlugin, addImports, createResolver, addServerImportsDir } from '@nuxt/kit'
import { defu } from 'defu'
import type { ModuleOptions } from './types'

export default defineNuxtModule<ModuleOptions>({
  meta: {
    name: 'nuxt-kinde-auth',
    configKey: 'kindeAuth',
    compatibility: {
      nuxt: '>=4.0.0'
    }
  },
  defaults: {
    redirectURL: '/api/kinde/callback',
    logoutRedirectURL: '/',
    postLoginRedirectURL: '/',
    cookie: {
      httpOnly: false,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7 // 7 days
    },
    middleware: {
      enabled: true,
      global: true,
      publicRoutes: ['/']
    },
    debug: {
      enabled: process.env.NODE_ENV !== 'production'
    }
  },
  setup(options, nuxt) {
    const resolver = createResolver(import.meta.url)

    // Validate required options
    if (!options.authDomain) {
      throw new Error('[nuxt-kinde-auth] authDomain is required. Please set it in your nuxt.config.ts')
    }
    if (!options.clientId) {
      throw new Error('[nuxt-kinde-auth] clientId is required. Please set it in your nuxt.config.ts')
    }
    if (!options.clientSecret) {
      throw new Error('[nuxt-kinde-auth] clientSecret is required. Please set it in your nuxt.config.ts')
    }

    // Add runtime config
    nuxt.options.runtimeConfig.kinde = defu(nuxt.options.runtimeConfig.kinde, {
      authDomain: options.authDomain,
      clientId: options.clientId,
      clientSecret: options.clientSecret,
      redirectURL: options.redirectURL,
      logoutRedirectURL: options.logoutRedirectURL,
      postLoginRedirectURL: options.postLoginRedirectURL,
      cookie: options.cookie
    })

    nuxt.options.runtimeConfig.public.kindeAuth = defu(nuxt.options.runtimeConfig.public.kindeAuth, {
      middleware: options.middleware || undefined,
      debug: options.debug || undefined
    }) as any

    // Add server middleware (runs first with 00. prefix)
    addServerHandler({
      handler: resolver.resolve('./runtime/server/middleware/kinde'),
      middleware: true
    })

    // Add API routes
    addServerHandler({
      route: '/api/kinde/login',
      handler: resolver.resolve('./runtime/server/api/kinde/login.get')
    })

    addServerHandler({
      route: '/api/kinde/logout',
      handler: resolver.resolve('./runtime/server/api/kinde/logout.get')
    })

    addServerHandler({
      route: '/api/kinde/callback',
      handler: resolver.resolve('./runtime/server/api/kinde/callback.get')
    })

    addServerHandler({
      route: '/api/kinde/user',
      handler: resolver.resolve('./runtime/server/api/kinde/user.get')
    })

    addServerHandler({
      route: '/api/kinde/token',
      handler: resolver.resolve('./runtime/server/api/kinde/token.get')
    })

    // Add debug endpoint (only if enabled)
    if (options.debug?.enabled) {
      addServerHandler({
        route: '/api/kinde/debug/token',
        handler: resolver.resolve('./runtime/server/api/debug/token.get')
      })
    }

    // Add composables
    addImports({
      name: 'useKindeAuth',
      as: 'useKindeAuth',
      from: resolver.resolve('./runtime/composables/useKindeAuth')
    })

    // Add plugins
    addPlugin({
      src: resolver.resolve('./runtime/plugins/01.kinde-init.client'),
      mode: 'client'
    })

    addPlugin({
      src: resolver.resolve('./runtime/plugins/02.kinde-error.client'),
      mode: 'client'
    })

    // Add route middleware (only if enabled)
    if (options.middleware?.enabled) {
      addServerHandler({
        handler: resolver.resolve('./runtime/middleware/kinde-auth.global'),
        middleware: true
      })
    }

    // Add server imports
    addServerImportsDir(resolver.resolve('./runtime/server/utils'))

    // Add type declarations
    nuxt.hook('prepare:types', ({ references }) => {
      references.push({ path: resolver.resolve('./runtime/types/index.d.ts') })
    })
  }
})

declare module '@nuxt/schema' {
  interface RuntimeConfig {
    kinde: {
      authDomain: string
      clientId: string
      clientSecret: string
      redirectURL: string
      logoutRedirectURL: string
      postLoginRedirectURL: string
      cookie: {
        httpOnly: boolean
        secure: boolean
        sameSite: 'lax' | 'strict' | 'none'
        path: string
        maxAge: number
      }
    }
  }
  interface PublicRuntimeConfig {
    kindeAuth?: {
      middleware?: {
        enabled?: boolean
        global?: boolean
        publicRoutes?: string[]
      }
      debug?: {
        enabled?: boolean
      }
    }
  }
}

