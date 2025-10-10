import { defineEventHandler, sendRedirect } from 'h3'

export default defineEventHandler(async (event) => {
  const kinde = event.context.kinde

  if (!kinde?.client || !kinde?.sessionManager) {
    throw createError({
      statusCode: 500,
      statusMessage: 'Kinde authentication not initialized'
    })
  }

  const { client, sessionManager } = kinde

  // Store the current URL as post-login redirect
  const referer = event.headers.get('referer')
  if (referer) {
    const url = new URL(referer)
    await sessionManager.setSessionItem('post-login-redirect-url', url.pathname + url.search)
  }

  // Call login with sessionManager
  const loginResponse = await client.login(sessionManager)

  // Kinde SDK returns a URL object, convert it to string
  const loginUrl = String(loginResponse)

  // Redirect to Kinde's login page
  return sendRedirect(event, loginUrl, 302)
})

