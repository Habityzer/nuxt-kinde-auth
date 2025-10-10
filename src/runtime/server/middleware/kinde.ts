import { defineEventHandler, getCookie, setCookie, type H3Event, getRequestHeader } from 'h3'
import { createKindeServerClient, GrantType } from '@kinde-oss/kinde-typescript-sdk'
import { useRuntimeConfig } from 'nuxt/app'

// Lazy-load Kinde client singleton
let _kindeClient: ReturnType<typeof createKindeServerClient> | null = null

function getKindeClient() {
  if (_kindeClient) return _kindeClient

  const config = useRuntimeConfig()
  _kindeClient = createKindeServerClient(GrantType.AUTHORIZATION_CODE, {
    authDomain: config.kinde.authDomain,
    clientId: config.kinde.clientId,
    clientSecret: config.kinde.clientSecret,
    redirectURL: config.kinde.redirectURL,
    logoutRedirectURL: config.kinde.logoutRedirectURL
  })

  return _kindeClient
}

export default defineEventHandler(async (event) => {
  const sessionManager = await createSessionManager(event)
  const kindeClient = getKindeClient()

  // Attach both client and sessionManager to the event context
  event.context.kinde = {
    client: kindeClient,
    sessionManager
  }
})

async function createSessionManager(event: H3Event) {
  const keysInCookie = ['refresh_token', 'access_token', 'id_token', 'ac-state-key', 'post-login-redirect-url']
  const memorySession: Record<string, any> = {}
  const config = useRuntimeConfig(event)

  // Cache for cookies set during this request (so we can read them immediately)
  const cookieCache: Record<string, string> = {}

  return {
    async getSessionItem<T = unknown>(itemKey: string): Promise<T | undefined> {
      let value
      if (keysInCookie.includes(itemKey)) {
        // First check if we set this cookie during the current request
        if (cookieCache[itemKey] !== undefined) {
          value = cookieCache[itemKey]
        } else {
          // Otherwise read from request cookie
          value = getCookie(event, itemKey)
        }
      } else {
        value = memorySession[itemKey]
      }
      return value as T | undefined
    },
    async setSessionItem<T = unknown>(itemKey: string, itemValue: T): Promise<void> {
      const stringValue = typeof itemValue === 'string' ? itemValue : JSON.stringify(itemValue)
      if (keysInCookie.includes(itemKey)) {
        // Store in cache so it's available immediately in the same request
        cookieCache[itemKey] = stringValue

        // Use direct cookie setting instead of h3 session
        const cookieOptions = {
          httpOnly: config.kinde.cookie.httpOnly,
          secure: config.kinde.cookie.secure,
          sameSite: config.kinde.cookie.sameSite as 'lax' | 'strict' | 'none',
          path: config.kinde.cookie.path,
          maxAge: config.kinde.cookie.maxAge
        }

        setCookie(event, itemKey, stringValue, cookieOptions)
      } else {
        memorySession[itemKey] = itemValue
      }
    },
    async removeSessionItem(itemKey: string) {
      if (keysInCookie.includes(itemKey)) {
        delete cookieCache[itemKey]
        // Delete by setting empty value with expires in the past
        setCookie(event, itemKey, '', {
          path: config.kinde.cookie.path,
          httpOnly: config.kinde.cookie.httpOnly,
          secure: config.kinde.cookie.secure,
          sameSite: config.kinde.cookie.sameSite as 'lax' | 'strict' | 'none',
          expires: new Date(0)
        })
      } else {
        delete memorySession[itemKey]
      }
    },
    async destroySession() {
      for (const key in memorySession) {
        delete memorySession[key]
      }
      for (const key of keysInCookie) {
        delete cookieCache[key]
        // Delete by setting empty value with expires in the past
        setCookie(event, key, '', {
          path: config.kinde.cookie.path,
          httpOnly: config.kinde.cookie.httpOnly,
          secure: config.kinde.cookie.secure,
          sameSite: config.kinde.cookie.sameSite as 'lax' | 'strict' | 'none',
          expires: new Date(0)
        })
      }
    }
  }
}

