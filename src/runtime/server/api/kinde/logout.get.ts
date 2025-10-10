import { defineEventHandler, sendRedirect, createError } from 'h3'
import { useRuntimeConfig } from '#imports'

export default defineEventHandler(async (event) => {
  const kinde = event.context.kinde

  if (!kinde?.client || !kinde?.sessionManager) {
    throw createError({
      statusCode: 500,
      statusMessage: 'Kinde authentication not initialized'
    })
  }

  const { client, sessionManager } = kinde
  const config = useRuntimeConfig()

  try {
    // Redirect to Kinde's logout URL
    const logoutResponse = await client.logout(sessionManager)
    const logoutUrl = String(logoutResponse)
    return sendRedirect(event, logoutUrl, 302)
  } catch (error) {
    console.error('[nuxt-kinde-auth] Error during logout:', error)
    // Even if logout fails, redirect to configured logout URL
    return sendRedirect(event, config.kinde.logoutRedirectURL || '/', 302)
  }
})

