import { defineEventHandler, createError } from 'h3'
import { decodeJWT, isTokenExpired, getTokenExpiry } from '../../utils/token'

/**
 * Enhanced debug endpoint for token refresh testing
 * Shows token status, expiry times, and refresh token availability
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
      return {
        authenticated: false,
        message: 'Not authenticated',
      }
    }

    // Get all tokens
    const accessToken = await sessionManager.getSessionItem<string>('access_token')
    const refreshToken = await sessionManager.getSessionItem<string>('refresh_token')
    const idToken = await sessionManager.getSessionItem<string>('id_token')

    if (!accessToken) {
      return {
        authenticated: true,
        hasTokens: false,
        message: 'Authenticated but no access token found',
      }
    }

    // Decode tokens and get expiry info
    const accessDecoded = decodeJWT(accessToken)
    const accessExpiry = getTokenExpiry(accessToken)
    const accessIsExpired = isTokenExpired(accessToken, 0) // Check if actually expired
    const accessIsExpiringSoon = isTokenExpired(accessToken, 300) // 5 min buffer

    const idDecoded = idToken ? decodeJWT(idToken) : null
    const idExpiry = idToken ? getTokenExpiry(idToken) : null

    // Calculate time until expiry
    const now = Date.now()
    const accessTimeUntilExpiry = accessExpiry ? Math.floor((accessExpiry * 1000 - now) / 1000) : null

    // Format time in a human-readable way
    const formatTime = (seconds: number): string => {
      if (seconds <= 0) return 'Expired'

      const days = Math.floor(seconds / 86400)
      const hours = Math.floor((seconds % 86400) / 3600)
      const minutes = Math.floor((seconds % 3600) / 60)
      const secs = seconds % 60

      const parts = []
      if (days > 0) parts.push(`${days}d`)
      if (hours > 0) parts.push(`${hours}h`)
      if (minutes > 0) parts.push(`${minutes}m`)
      if (secs > 0 && days === 0) parts.push(`${secs}s`) // Only show seconds if less than a day

      return parts.join(' ') || '0s'
    }

    return {
      authenticated: true,
      hasTokens: true,
      tokens: {
        access: {
          exists: !!accessToken,
          preview: accessToken ? `${accessToken.substring(0, 20)}...` : null,
          isExpired: accessIsExpired,
          isExpiringSoon: accessIsExpiringSoon,
          expiresAt: accessExpiry ? new Date(accessExpiry * 1000).toISOString() : null,
          timeUntilExpiry: accessTimeUntilExpiry,
          timeUntilExpiryFormatted: accessTimeUntilExpiry
            ? formatTime(accessTimeUntilExpiry)
            : null,
          decoded: {
            iat: accessDecoded?.iat ? new Date(accessDecoded.iat * 1000).toISOString() : null,
            exp: accessDecoded?.exp ? new Date(accessDecoded.exp * 1000).toISOString() : null,
            sub: accessDecoded?.sub,
            aud: accessDecoded?.aud,
          },
        },
        refresh: {
          exists: !!refreshToken,
          preview: refreshToken ? `${refreshToken.substring(0, 20)}...` : null,
        },
        id: {
          exists: !!idToken,
          preview: idToken ? `${idToken.substring(0, 20)}...` : null,
          expiresAt: idExpiry ? new Date(idExpiry * 1000).toISOString() : null,
          decoded: idDecoded
            ? {
                email: idDecoded.email,
                given_name: idDecoded.given_name,
                family_name: idDecoded.family_name,
              }
            : null,
        },
      },
      refreshStatus: {
        canRefresh: !!refreshToken,
        shouldRefresh: accessIsExpiringSoon,
        reason: accessIsExpired
          ? 'Token is expired'
          : accessIsExpiringSoon
            ? 'Token expires in less than 5 minutes'
            : 'Token is valid',
      },
      timestamp: new Date().toISOString(),
    }
  }
  catch (error) {
    throw createError({
      statusCode: 500,
      statusMessage: error instanceof Error ? error.message : 'Failed to get token info',
    })
  }
})
