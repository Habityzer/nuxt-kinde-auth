import { computed, ref, readonly } from 'vue'
import { navigateTo, useRuntimeConfig } from '#app'
import type { KindeUser } from '../types/index'

// Singleton state - shared across all useKindeAuth() calls
const user = ref<KindeUser | null>(null)
const isLoading = ref(false)
const isAuthenticated = ref(false)

export const useKindeAuth = () => {
  // Get user display name
  const userDisplayName = computed(() => {
    if (user.value?.given_name && user.value?.family_name) {
      return `${user.value.given_name} ${user.value.family_name}`
    }
    if (user.value?.given_name) return user.value.given_name
    if (user.value?.email) return user.value.email
    return 'User'
  })

  // Get user email
  const userEmail = computed(() => {
    return user.value?.email || null
  })

  // Get user picture URL
  const userPicture = computed(() => {
    return user.value?.picture || null
  })

  // Login - redirect to Kinde OAuth
  const login = async () => {
    // Use full page redirect to /api/kinde/login
    if (import.meta.client) {
      window.location.href = '/api/kinde/login'
    }
    else {
      // Server-side: use navigateTo (available globally)
      await navigateTo('/api/kinde/login', { external: true })
    }
  }

  // Check if user is authenticated by checking for auth cookies
  const checkAuth = (): boolean => {
    if (import.meta.client) {
      // Get the cookie prefix from runtime config
      const config = useRuntimeConfig()
      const cookiePrefix = config.public.kindeAuth?.cookie?.prefix || ''

      // Check for cookies with the configured prefix
      const cookies = document.cookie.split(';').map(c => c.trim())
      const idTokenCookieName = `${cookiePrefix}id_token`
      const accessTokenCookieName = `${cookiePrefix}access_token`

      const hasIdToken = cookies.some(c => c.startsWith(`${idTokenCookieName}=`) && c.split('=')[1])
      const hasAccessToken = cookies.some(c => c.startsWith(`${accessTokenCookieName}=`) && c.split('=')[1])
      const authenticated = hasIdToken || hasAccessToken

      isAuthenticated.value = authenticated
      return authenticated
    }
    return false
  }

  // Fetch user profile from Kinde tokens
  const fetchUser = async (): Promise<KindeUser | null> => {
    // Prevent multiple simultaneous calls
    if (isLoading.value) {
      return user.value
    }

    // If we already have a valid user, return it
    if (user.value) {
      return user.value
    }

    try {
      isLoading.value = true

      // Call the server to get user info from Kinde token
      const response = await $fetch<KindeUser>('/api/kinde/user', {
        method: 'GET',
        retry: 0,
        onResponseError({ response }) {
          if (response.status === 401) {
            // Silently handle - this is expected when not authenticated
            isAuthenticated.value = false
          }
        },
      })

      user.value = response
      isAuthenticated.value = true
      return response
    }
    catch (error) {
      // Silently handle 401 errors (expected when not authenticated)
      if (error && typeof error === 'object' && 'statusCode' in error && error.statusCode === 401) {
        // Silent - this is expected behavior
      }
      else {
        // Only log non-auth errors
        console.error('[nuxt-kinde-auth] Failed to fetch user:', error)
      }
      user.value = null
      isAuthenticated.value = false
      return null
    }
    finally {
      isLoading.value = false
    }
  }

  // Get access token from server
  // Automatically refreshes expired tokens
  const getToken = async (): Promise<string | null> => {
    try {
      const response = await $fetch<{ token: string }>('/api/kinde/token', {
        method: 'GET',
        credentials: 'include', // Ensure cookies are sent
        headers: {
          'Cache-Control': 'no-cache',
        },
      })
      return response.token
    }
    catch (error) {
      console.error('[nuxt-kinde-auth] Failed to get token:', error)
      return null
    }
  }

  // Manually refresh tokens
  const refreshToken = async (): Promise<boolean> => {
    try {
      const response = await $fetch<{ success: boolean, accessToken?: string }>('/api/kinde/refresh', {
        method: 'GET',
        credentials: 'include', // Ensure cookies are sent and received
      })
      return response.success
    }
    catch (error) {
      console.error('[nuxt-kinde-auth] Failed to refresh token:', error)
      // If refresh fails, clear auth state
      user.value = null
      isAuthenticated.value = false
      return false
    }
  }

  // Logout - clear session and redirect to Kinde logout
  const logout = () => {
    // Clear local state immediately
    user.value = null
    isAuthenticated.value = false

    if (import.meta.client) {
      // Get the cookie prefix from runtime config
      const config = useRuntimeConfig()
      const cookiePrefix = config.public.kindeAuth?.cookie?.prefix || ''

      // Clear all Kinde-related cookies (with prefix)
      const cookiesToClear = [
        'access_token',
        'refresh_token',
        'id_token',
        'user-id',
        'has-authenticated',
        'post-login-redirect-url',
        'ac-state-key',
      ]

      cookiesToClear.forEach((cookieName) => {
        const fullCookieName = `${cookiePrefix}${cookieName}`
        document.cookie = `${fullCookieName}=; path=/; max-age=0`
        document.cookie = `${fullCookieName}=; path=/api; max-age=0`
      })

      // Redirect to logout endpoint
      window.location.href = '/api/kinde/logout'
    }
  }

  return {
    // Core auth state
    isAuthenticated: readonly(isAuthenticated),
    user: readonly(user),
    isLoading: readonly(isLoading),

    // User info
    userDisplayName: readonly(userDisplayName),
    userEmail: readonly(userEmail),
    userPicture: readonly(userPicture),

    // Authentication methods
    login,
    logout,
    checkAuth,
    fetchUser,
    getToken,
    refreshToken,
  }
}
