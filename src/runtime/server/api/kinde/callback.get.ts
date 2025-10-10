import { defineEventHandler, getRequestURL, sendRedirect } from 'h3'

export default defineEventHandler(async (event) => {
  console.log('🟢 [MODULE CALLBACK] Hit /api/kinde/callback')
  
  const kinde = event.context.kinde

  if (!kinde?.client || !kinde?.sessionManager) {
    console.error('❌ [MODULE CALLBACK] Kinde authentication not initialized!')
    throw createError({
      statusCode: 500,
      statusMessage: 'Kinde authentication not initialized'
    })
  }

  const { client, sessionManager } = kinde
  const config = useRuntimeConfig()

  try {
    const callbackUrl = getRequestURL(event)
    console.log('🟢 [MODULE CALLBACK] Callback URL:', callbackUrl.href)
    console.log('🟢 [MODULE CALLBACK] Has code param:', callbackUrl.searchParams.has('code'))
    console.log('🟢 [MODULE CALLBACK] Has state param:', callbackUrl.searchParams.has('state'))

    // Handle the OAuth callback and store the tokens in the session
    console.log('🟢 [MODULE CALLBACK] Calling handleRedirectToApp()')
    await client.handleRedirectToApp(sessionManager, callbackUrl)
    console.log('✅ [MODULE CALLBACK] Successfully handled OAuth callback')

    // Get the post-login redirect URL
    const postLoginRedirectURL = await sessionManager.getSessionItem<string>('post-login-redirect-url')
    console.log('🟢 [MODULE CALLBACK] Post-login redirect URL:', postLoginRedirectURL)

    if (postLoginRedirectURL && typeof postLoginRedirectURL === 'string') {
      // Clear the stored redirect URL
      await sessionManager.removeSessionItem('post-login-redirect-url')
      console.log('🟢 [MODULE CALLBACK] Redirecting to stored URL:', postLoginRedirectURL)
      // Redirect to the original page
      return sendRedirect(event, postLoginRedirectURL, 302)
    }

    // Default redirect to configured post-login URL or homepage
    const defaultRedirect = config.kinde.postLoginRedirectURL || '/'
    console.log('🟢 [MODULE CALLBACK] Redirecting to default URL:', defaultRedirect)
    return sendRedirect(event, defaultRedirect, 302)
  } catch (error) {
    console.error('❌ [MODULE CALLBACK] Callback error:', error)
    console.error('❌ [MODULE CALLBACK] Error details:', error instanceof Error ? error.stack : error)
    throw createError({
      statusCode: 500,
      statusMessage: error instanceof Error ? error.message : 'OAuth callback failed'
    })
  }
})

