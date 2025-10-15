import { defineEventHandler } from 'h3'
import { decodeJWT, getTokenExpiry, isTokenExpired } from '../../../utils/token'

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig(event)
  const { client, sessionManager } = event.context.kinde

  try {
    // Get authentication status
    const isAuthenticated = await client.isAuthenticated(sessionManager)
    
    // Get user if authenticated
    let user = null
    if (isAuthenticated) {
      try {
        user = await client.getUserProfile(sessionManager)
      } catch (e) {
        // User not available
      }
    }

    // Get token info
    let tokenInfo = {
      hasToken: false,
      isExpired: null,
      expiresAt: null,
      timeUntilExpiry: null
    }
    
    if (isAuthenticated) {
      try {
        const token = await client.getToken(sessionManager)
        if (token) {
          tokenInfo.hasToken = true
          const expiry = getTokenExpiry(token)
          if (expiry) {
            tokenInfo.expiresAt = new Date(expiry * 1000).toLocaleString()
            tokenInfo.timeUntilExpiry = expiry - Math.floor(Date.now() / 1000)
            tokenInfo.isExpired = isTokenExpired(token)
          }
        }
      } catch (e) {
        // Token not available
      }
    }

    return {
      isAuthenticated,
      user,
      tokenInfo,
      config: {
        domain: config.kinde.authDomain,
        redirectUrl: config.kinde.redirectUrl,
        logoutRedirectUrl: config.kinde.logoutRedirectUrl,
        postLoginRedirectUrl: config.kinde.postLoginRedirectUrl,
        cookie: {
          prefix: config.kinde.cookie.prefix,
          maxAge: config.kinde.cookie.maxAge,
          secure: config.kinde.cookie.secure
        },
        debugUrl: config.kinde.debug?.enabled ? '/__kinde-debug' : null
      }
    }
  } catch (error: any) {
    return {
      isAuthenticated: false,
      user: null,
      tokenInfo: {
        hasToken: false,
        isExpired: null,
        expiresAt: null,
        timeUntilExpiry: null
      },
      config: {
        domain: config.kinde.authDomain,
        redirectUrl: config.kinde.redirectUrl,
        logoutRedirectUrl: config.kinde.logoutRedirectUrl,
        postLoginRedirectUrl: config.kinde.postLoginRedirectUrl,
        cookie: {
          prefix: config.kinde.cookie.prefix,
          maxAge: config.kinde.cookie.maxAge,
          secure: config.kinde.cookie.secure
        },
        debugUrl: config.kinde.debug?.enabled ? '/__kinde-debug' : null
      }
    }
  }
})

