import { defineNuxtPlugin, useNuxtApp } from '#app'

/**
 * Global error handler for authentication errors
 * Intercepts 401 responses and redirects to login immediately
 */
export default defineNuxtPlugin(() => {
  const nuxtApp = useNuxtApp()

  // Handle fetch errors globally
  nuxtApp.hook('vue:error', (error) => {
    // Check if it's a 401 authentication error
    if (error && typeof error === 'object' && 'statusCode' in error) {
      const statusCode = (error as { statusCode: number }).statusCode
      if (statusCode === 401) {
        // Redirect to login immediately without showing error UI
        if (import.meta.client) {
          window.location.href = '/api/kinde/login'
        }
      }
    }
  })
})
