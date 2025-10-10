import { defineEventHandler, getRequestURL, sendRedirect, createError } from 'h3'
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
    const callbackUrl = getRequestURL(event)

    // Handle the OAuth callback and store the tokens in the session
    await client.handleRedirectToApp(sessionManager, callbackUrl)

    // Get the post-login redirect URL
    const postLoginRedirectURL = await sessionManager.getSessionItem<string>('post-login-redirect-url')

    if (postLoginRedirectURL && typeof postLoginRedirectURL === 'string') {
      // Clear the stored redirect URL
      await sessionManager.removeSessionItem('post-login-redirect-url')
      // Redirect to the original page
      return sendRedirect(event, postLoginRedirectURL, 302)
    }

    // Default redirect to configured post-login URL or homepage
    const defaultRedirect = config.kinde.postLoginRedirectURL || '/'
    return sendRedirect(event, defaultRedirect, 302)
  } catch (error) {
    throw createError({
      statusCode: 500,
      statusMessage: error instanceof Error ? error.message : 'OAuth callback failed'
    })
  }
})

