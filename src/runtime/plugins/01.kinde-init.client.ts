import { defineNuxtPlugin } from '#app'
import { useKindeAuth } from '../composables/useKindeAuth'

export default defineNuxtPlugin({
  name: 'kinde-auth-init',
  async setup(_nuxtApp) {
    // Skip auth initialization in test environment
    if (typeof process !== 'undefined' && process.env?.NODE_ENV === 'test') {
      return
    }

    // Only run on client side
    if (import.meta.client) {
      // Try to check auth status on app initialization
      const { checkAuth, fetchUser } = useKindeAuth()

      // Check if we have auth cookies
      const hasAuthCookies = checkAuth()

      if (hasAuthCookies) {
        try {
          // Fetch user profile from Kinde
          await fetchUser()
        }
        catch (error) {
          // Silently fail - middleware and error handlers will handle redirects
          console.debug('[nuxt-kinde-auth] Failed to fetch user on init:', error)
        }
      }
    }
  },
})
