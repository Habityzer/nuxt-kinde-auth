// Type declarations for Nuxt auto-imports
import type { 
  defineNuxtPlugin as _defineNuxtPlugin,
  defineNuxtRouteMiddleware as _defineNuxtRouteMiddleware,
  useRuntimeConfig as _useRuntimeConfig,
  useNuxtApp as _useNuxtApp,
  useCookie as _useCookie,
  navigateTo as _navigateTo
} from 'nuxt/app'

import type { 
  defineEventHandler as _defineEventHandler,
  createError as _createError,
  H3Event
} from 'h3'

// Extend event context for Kinde
declare module 'h3' {
  interface H3EventContext {
    kinde?: any
  }
}

// Nuxt composables and utilities
declare global {
  const defineNuxtPlugin: typeof _defineNuxtPlugin
  const defineNuxtRouteMiddleware: typeof _defineNuxtRouteMiddleware
  const useRuntimeConfig: typeof _useRuntimeConfig
  const useNuxtApp: typeof _useNuxtApp
  const useCookie: typeof _useCookie
  const navigateTo: typeof _navigateTo
  const defineEventHandler: typeof _defineEventHandler
  const createError: typeof _createError
  const useKindeAuth: () => ReturnType<typeof import('./runtime/composables/useKindeAuth').useKindeAuth>
  
  namespace NodeJS {
    interface ProcessEnv {
      NODE_ENV?: 'development' | 'production' | 'test'
    }
  }
}

export {}

