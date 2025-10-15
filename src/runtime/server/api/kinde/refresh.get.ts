import { defineEventHandler, createError } from 'h3'

/**
 * Refresh access token using refresh token
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
    // Check if we have a refresh token
    const refreshToken = await sessionManager.getSessionItem<string>('refresh_token')
    
    if (!refreshToken) {
      throw createError({
        statusCode: 401,
        statusMessage: 'No refresh token available'
      })
    }

    // Refresh tokens using Kinde SDK
    // commitToSession = true (default) will automatically save new tokens to session
    const tokenResponse = await client.refreshTokens(sessionManager)

    return {
      success: true,
      accessToken: tokenResponse.access_token,
      expiresIn: tokenResponse.expires_in,
      message: 'Tokens refreshed successfully'
    }
  } catch (error) {
    console.error('[nuxt-kinde-auth] Token refresh failed:', error)
    
    // If refresh fails, the refresh token might be expired/invalid
    // Clear session and require re-authentication
    await sessionManager.destroySession()
    
    throw createError({
      statusCode: 401,
      statusMessage: error instanceof Error ? error.message : 'Token refresh failed'
    })
  }
})

