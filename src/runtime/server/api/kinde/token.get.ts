import { defineEventHandler, createError } from 'h3'
import { isTokenExpired } from '../../utils/token'

/**
 * Get access token from Kinde
 * Automatically refreshes the token if expired or about to expire
 */
export default defineEventHandler(async (event) => {
  const kinde = event.context.kinde

  if (!kinde?.client || !kinde?.sessionManager) {
    throw createError({
      statusCode: 500,
      statusMessage: 'Kinde authentication not initialized'
    })
  }

  const { client, sessionManager } = kinde

  try {
    const isAuthenticated = await client.isAuthenticated(sessionManager)

    if (!isAuthenticated) {
      throw createError({
        statusCode: 401,
        statusMessage: 'Not authenticated'
      })
    }

    let token = await client.getToken(sessionManager)

    if (!token) {
      throw createError({
        statusCode: 404,
        statusMessage: 'No access token available'
      })
    }

    // Check if token is expired or about to expire (within 5 minutes)
    if (isTokenExpired(token, 300)) {
      console.log('[nuxt-kinde-auth] Access token expired or expiring soon, refreshing...')
      
      try {
        // Refresh the tokens
        await client.refreshTokens(sessionManager)
        
        // Get the new token
        token = await client.getToken(sessionManager)
        
        if (!token) {
          throw createError({
            statusCode: 500,
            statusMessage: 'Failed to get token after refresh'
          })
        }
        
        console.log('[nuxt-kinde-auth] Token refreshed successfully')
      } catch (refreshError) {
        console.error('[nuxt-kinde-auth] Token refresh failed:', refreshError)
        // If refresh fails, clear session
        await sessionManager.destroySession()
        throw createError({
          statusCode: 401,
          statusMessage: 'Token expired and refresh failed. Please log in again.'
        })
      }
    }

    return { token }
  } catch (error) {
    if (error && typeof error === 'object' && 'statusCode' in error) {
      throw error
    }
    throw createError({
      statusCode: 401,
      statusMessage: error instanceof Error ? error.message : 'Failed to get token'
    })
  }
})

