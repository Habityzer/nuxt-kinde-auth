/**
 * Get access token from Kinde
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

    const token = await client.getToken(sessionManager)

    if (!token) {
      throw createError({
        statusCode: 404,
        statusMessage: 'No access token available'
      })
    }

    return { token }
  } catch (error) {
    if (error && typeof error === 'object' && 'statusCode' in error) {
      throw error
    }
    throw createError({
      statusCode: 401,
      statusMessage: error instanceof Error ? error.message : 'Failed to get token'
    })
  }
})

