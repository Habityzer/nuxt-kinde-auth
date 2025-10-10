import { defineEventHandler, sendRedirect } from 'h3'

export default defineEventHandler(async (event) => {
  console.log('🟢 [MODULE LOGIN] Hit /api/kinde/login')
  
  const kinde = event.context.kinde
  console.log('🟢 [MODULE LOGIN] Kinde context exists:', !!kinde)
  console.log('🟢 [MODULE LOGIN] Has client:', !!kinde?.client)
  console.log('🟢 [MODULE LOGIN] Has sessionManager:', !!kinde?.sessionManager)

  if (!kinde?.client || !kinde?.sessionManager) {
    console.error('❌ [MODULE LOGIN] Kinde authentication not initialized!')
    throw createError({
      statusCode: 500,
      statusMessage: 'Kinde authentication not initialized'
    })
  }

  const { client, sessionManager } = kinde

  // Store the current URL as post-login redirect
  const referer = event.headers.get('referer')
  console.log('🟢 [MODULE LOGIN] Referer:', referer)
  if (referer) {
    const url = new URL(referer)
    const redirectPath = url.pathname + url.search
    console.log('🟢 [MODULE LOGIN] Storing post-login redirect:', redirectPath)
    await sessionManager.setSessionItem('post-login-redirect-url', redirectPath)
  }

  // Call login with sessionManager
  console.log('🟢 [MODULE LOGIN] Calling Kinde client.login()')
  const loginResponse = await client.login(sessionManager)

  // Kinde SDK returns a URL object, convert it to string
  const loginUrl = String(loginResponse)
  console.log('🟢 [MODULE LOGIN] Got Kinde OAuth URL:', loginUrl)

  // Redirect to Kinde's login page
  console.log('🟢 [MODULE LOGIN] Redirecting to Kinde')
  return sendRedirect(event, loginUrl, 302)
})

