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

  // Store the current URL as post-login redirect, but only if it's not a public page
  const referer = event.headers.get('referer')
  if (referer) {
    const url = new URL(referer)
    const redirectPath = url.pathname + url.search
    
    // Only store referer if it's not the homepage or another public route
    // This allows the configured postLoginRedirectURL to take effect when logging in from public pages
    const publicRoutes = ['/', '/auth/callback', '/blog', '/help', '/legal']
    const isPublicRoute = publicRoutes.some(route => 
      redirectPath === route || redirectPath.startsWith(`${route}/`) || redirectPath.startsWith(`${route}?`)
    )
    
    if (!isPublicRoute) {
      // Store the protected page URL so user is redirected back after login
      await sessionManager.setSessionItem('post-login-redirect-url', redirectPath)
    }
  }

  // Call login with sessionManager and redirect to Kinde's login page
  const loginResponse = await client.login(sessionManager)
  const loginUrl = String(loginResponse)
  
  return sendRedirect(event, loginUrl, 302)
})

