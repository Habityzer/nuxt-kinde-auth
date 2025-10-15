import { defineEventHandler, createError } from 'h3'

/**
 * Debug endpoint to get JWT tokens and decode them
 * Returns both access token and ID token (if available) with decoded payloads
 * Only available in development mode
 */
export default defineEventHandler(async (event) => {
  const kinde = event.context.kinde

  if (!kinde?.client || !kinde?.sessionManager) {
    throw createError({
      statusCode: 500,
      statusMessage: 'Kinde authentication not initialized',
    })
  }

  const { client, sessionManager } = kinde

  try {
    const isAuthenticated = await client.isAuthenticated(sessionManager)

    if (!isAuthenticated) {
      throw createError({
        statusCode: 401,
        statusMessage: 'Not authenticated',
      })
    }

    // Helper function to decode JWT
    const decodeToken = (token: string) => {
      try {
        const parts = token.split('.')
        if (parts.length === 3) {
          const payload = parts[1]
          if (payload) {
            return JSON.parse(Buffer.from(payload, 'base64').toString())
          }
        }
      }
      catch {
        return null
      }
      return null
    }

    // Get access token
    const accessToken = await client.getToken(sessionManager)

    // Try to get ID token from session
    let idToken: string | null = null
    try {
      const token = await sessionManager.getSessionItem<string>('id_token')
      idToken = token || null
    }
    catch {
      // ID token not available, that's ok
    }

    if (!accessToken) {
      throw createError({
        statusCode: 404,
        statusMessage: 'No access token available',
      })
    }

    // Return both tokens and their decoded payloads
    return {
      accessToken: {
        raw: accessToken,
        decoded: decodeToken(accessToken),
      },
      idToken: idToken
        ? {
            raw: idToken,
            decoded: decodeToken(idToken),
          }
        : null,
    }
  }
  catch (error) {
    throw createError({
      statusCode: 401,
      statusMessage: error instanceof Error ? error.message : 'Failed to get tokens',
    })
  }
})
