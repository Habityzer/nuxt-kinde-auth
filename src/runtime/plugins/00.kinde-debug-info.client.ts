import { defineNuxtPlugin, useRuntimeConfig } from '#app'

export default defineNuxtPlugin(() => {
  const config = useRuntimeConfig()

  // Only log in development when debug is enabled
  if (config.public.kindeAuth?.debug?.enabled) {
    console.log(
      '%c🔍 Kinde Auth Debug',
      'background: #6366f1; color: white; padding: 4px 8px; border-radius: 4px; font-weight: bold;',
      '\n\n'
      + '🔧 API Endpoints:\n'
      + '   • /api/kinde/debug/token-info\n'
      + '   • /api/kinde/debug/config\n'
      + '   • /api/kinde/debug/token\n\n'
      + '💡 View real-time token status, test refresh, and more!\n',
    )
  }
})
