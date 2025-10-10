import { defineNuxtRouteMiddleware, navigateTo, useCookie, useRuntimeConfig } from '#app'
import { useKindeAuth } from '../composables/useKindeAuth'

/**
 * Global auth middleware - checks authentication on route navigation
 * Redirects to login if accessing protected routes without authentication
 */
export default defineNuxtRouteMiddleware(async (to) => {
  const config = useRuntimeConfig()
  const publicRoutes = config.public.kindeAuth?.middleware?.publicRoutes || ['/']

  // Add auth callback route as public
  const allPublicRoutes = [...publicRoutes, '/api/kinde/callback']

  // Check if the route is public or a child of public routes
  const isPublicRoute = allPublicRoutes.some(route =>
    to.path === route || to.path.startsWith(`${route}/`)
  )

  // If it's a public route, allow access
  if (isPublicRoute) {
    return
  }

  // For protected routes, check authentication
  if (import.meta.server) {
    // Server-side: Check for auth cookies using Nuxt's useCookie
    const idToken = useCookie('id_token')
    const accessToken = useCookie('access_token')

    // Allow access if any valid auth token exists
    if (!idToken.value && !accessToken.value) {
      // Redirect to login API endpoint (external, not a Vue route)
      return navigateTo('/api/kinde/login', { external: true })
    }
  } else {
    // Client-side: Use the auth composable
    const { isAuthenticated, checkAuth } = useKindeAuth()

    // Check auth status
    checkAuth()

    if (!isAuthenticated.value) {
      // Use window.location for client-side redirect to API endpoint
      if (import.meta.client) {
        window.location.href = '/api/kinde/login'
      }
      return
    }
  }
})

