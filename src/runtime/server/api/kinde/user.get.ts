import { defineEventHandler, createError } from 'h3'

/**
 * Get current user information from Kinde
 */
export default defineEventHandler(async (event) => {
  const kinde = event.context.kinde

  if (!kinde?.client || !kinde?.sessionManager) {
    throw createError({
      statusCode: 500,
      statusMessage: 'Kinde authentication not initialized'
    })
  }

  const { client, sessionManager } = kinde

  try {
    const isAuthenticated = await client.isAuthenticated(sessionManager)

    if (!isAuthenticated) {
      throw createError({
        statusCode: 401,
        statusMessage: 'Not authenticated'
      })
    }

    // Get user profile from Kinde
    const user = await client.getUser(sessionManager)

    if (!user) {
      throw createError({
        statusCode: 404,
        statusMessage: 'User not found'
      })
    }

    return user
  } catch (error) {
    if (error && typeof error === 'object' && 'statusCode' in error) {
      throw error
    }
    throw createError({
      statusCode: 401,
      statusMessage: error instanceof Error ? error.message : 'Failed to get user'
    })
  }
})

