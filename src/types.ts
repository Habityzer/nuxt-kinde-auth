export interface ModuleOptions {
  /**
   * Kinde authentication domain
   * @example 'https://yourapp.kinde.com'
   */
  authDomain?: string

  /**
   * Kinde client ID
   */
  clientId?: string

  /**
   * Kinde client secret (server-only)
   */
  clientSecret?: string

  /**
   * OAuth redirect URL (callback URL)
   * @default '/api/kinde/callback'
   */
  redirectURL?: string

  /**
   * URL to redirect to after logout
   * @default '/'
   */
  logoutRedirectURL?: string

  /**
   * URL to redirect to after successful login
   * @default '/'
   */
  postLoginRedirectURL?: string

  /**
   * Cookie configuration
   */
  cookie?: {
    /**
     * HttpOnly flag for cookies
     * @default false (allows client-side logout)
     */
    httpOnly?: boolean

    /**
     * Secure flag for cookies
     * @default true in production, false in development
     */
    secure?: boolean

    /**
     * SameSite cookie attribute
     * @default 'lax'
     */
    sameSite?: 'lax' | 'strict' | 'none'

    /**
     * Cookie path
     * @default '/'
     */
    path?: string

    /**
     * Cookie max age in seconds
     * @default 604800 (7 days)
     */
    maxAge?: number
  }

  /**
   * Middleware configuration
   */
  middleware?: {
    /**
     * Enable global route protection middleware
     * @default true
     */
    enabled?: boolean

    /**
     * Make middleware global (protect all routes by default)
     * @default true
     */
    global?: boolean

    /**
     * Public routes that don't require authentication
     * @default ['/']
     */
    publicRoutes?: string[]
  }

  /**
   * Debug configuration
   */
  debug?: {
    /**
     * Enable debug endpoints
     * @default true in development, false in production
     */
    enabled?: boolean
  }
}

export interface KindeUser {
  id: string
  email?: string
  given_name?: string
  family_name?: string
  picture?: string
  [key: string]: unknown
}

