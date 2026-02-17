/* eslint-disable @typescript-eslint/no-explicit-any */
export interface KindeUser {
  id: string
  email?: string | null
  given_name?: string | null
  family_name?: string | null
  picture?: string | null
  [key: string]: unknown
}

declare module '#app' {
  interface NuxtApp {
    $kindeAuth: ReturnType<typeof useKindeAuth>
  }
}

interface SessionManager {
  getSessionItem<T = unknown>(_key: string): Promise<T | undefined>
  setSessionItem<T = unknown>(_key: string, _value: T): Promise<void>
  removeSessionItem(_key: string): Promise<void>
  destroySession(): Promise<void>
}

interface KindeClient {
  createOrg: (_sessionManager: SessionManager, _options?: any) => Promise<any>
  getBooleanFlag: (_sessionManager: SessionManager, _code: string, _defaultValue?: boolean) => Promise<boolean>
  getClaim: (_sessionManager: SessionManager, _claim: string) => Promise<any>
  getClaimValue: (_sessionManager: SessionManager, _claim: string) => Promise<any>
  getFlag: (_sessionManager: SessionManager, _code: string, _defaultValue?: any) => Promise<any>
  getIntegerFlag: (_sessionManager: SessionManager, _code: string, _defaultValue?: number) => Promise<number>
  getOrganization: (_sessionManager: SessionManager) => Promise<any>
  getPermission: (_sessionManager: SessionManager, _permission: string) => Promise<any>
  getPermissions: (_sessionManager: SessionManager) => Promise<any>
  getStringFlag: (_sessionManager: SessionManager, _code: string, _defaultValue?: string) => Promise<string>
  getToken: (_sessionManager: SessionManager) => Promise<string>
  getUser: (_sessionManager: SessionManager) => Promise<KindeUser>
  getUserOrganizations: (_sessionManager: SessionManager) => Promise<any>
  getUserProfile: (_sessionManager: SessionManager) => Promise<any>
  handleRedirectToApp: (_sessionManager: SessionManager, _url: URL) => Promise<void>
  isAuthenticated: (_sessionManager: SessionManager) => Promise<boolean>
  login: (_sessionManager: SessionManager, _options?: any) => Promise<URL>
  logout: (_sessionManager: SessionManager) => Promise<URL>
  refreshTokens: (_sessionManager: SessionManager) => Promise<void>
  register: (_sessionManager: SessionManager, _options?: any) => Promise<URL>
}

declare module 'h3' {
  interface H3EventContext {
    kinde?: {
      client: any // Kinde SDK client type
      sessionManager: SessionManager
    }
  }
}

export type { KindeUser, SessionManager, KindeClient }
