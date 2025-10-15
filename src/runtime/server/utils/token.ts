/**
 * Decode a JWT token without verifying signature
 * Used for checking token expiry
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function decodeJWT(token: string): { exp?: number, iat?: number, [key: string]: any } | null {
  try {
    const parts = token.split('.')
    if (parts.length !== 3) {
      return null
    }

    const payload = parts[1]
    const decoded = JSON.parse(Buffer.from(payload, 'base64').toString('utf8'))
    return decoded
  }
  catch (error) {
    console.error('[nuxt-kinde-auth] Failed to decode JWT:', error)
    return null
  }
}

/**
 * Check if a JWT token is expired or about to expire
 * @param token - JWT token to check
 * @param bufferSeconds - Number of seconds before expiry to consider token as expired (default: 300 = 5 minutes)
 * @returns true if token is expired or about to expire
 */
export function isTokenExpired(token: string, bufferSeconds: number = 300): boolean {
  const decoded = decodeJWT(token)

  if (!decoded || !decoded.exp) {
    return true // Consider invalid tokens as expired
  }

  const expiryTime = decoded.exp * 1000 // Convert to milliseconds
  const now = Date.now()
  const bufferTime = bufferSeconds * 1000

  return (expiryTime - now) < bufferTime
}

/**
 * Get token expiry time in seconds
 */
export function getTokenExpiry(token: string): number | null {
  const decoded = decodeJWT(token)
  return decoded?.exp || null
}
