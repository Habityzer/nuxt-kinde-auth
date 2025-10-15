import { defineEventHandler } from 'h3'
import { useRuntimeConfig } from '#imports'

/**
 * Debug endpoint to get module configuration
 * Returns configuration settings (without sensitive data)
 */
export default defineEventHandler((event) => {
  const config = useRuntimeConfig(event)

  return {
    redirectURL: config.kinde.redirectURL,
    logoutRedirectURL: config.kinde.logoutRedirectURL,
    postLoginRedirectURL: config.kinde.postLoginRedirectURL,
    cookie: {
      prefix: config.kinde.cookie.prefix,
      httpOnly: config.kinde.cookie.httpOnly,
      secure: config.kinde.cookie.secure,
      sameSite: config.kinde.cookie.sameSite,
      path: config.kinde.cookie.path,
      maxAge: config.kinde.cookie.maxAge,
    },
  }
})
