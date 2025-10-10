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
    const redirectPath = url.pathname + url.search
    await sessionManager.setSessionItem('post-login-redirect-url', redirectPath)
  }

  // Call login with sessionManager and redirect to Kinde's login page
  const loginResponse = await client.login(sessionManager)
  const loginUrl = String(loginResponse)
  
  return sendRedirect(event, loginUrl, 302)
})

