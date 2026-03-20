import { defineNuxtPlugin, useRuntimeConfig } from '#app'

export default defineNuxtPlugin(() => {
  // Skip in test environment to avoid noisy test output
  if (import.meta.env.MODE === 'test' || import.meta.env.VITEST) {
    return
  }

  const config = useRuntimeConfig()

  // Only log in development when debug is enabled
  if (config.public.kindeAuth?.debug?.enabled) {
    console.log(
      '%c🔍 Kinde Auth Debug',
      'background: #6366f1; color: white; padding: 4px 8px; border-radius: 4px; font-weight: bold;',
      '\n\n'
      + '💡 View real-time token status, test refresh, and more!\n',
    )
  }
})
