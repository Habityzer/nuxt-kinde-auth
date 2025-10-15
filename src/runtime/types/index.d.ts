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
  getSessionItem<T = unknown>(key: string): Promise<T | undefined>
  setSessionItem<T = unknown>(key: string, value: T): Promise<void>
  removeSessionItem(key: string): Promise<void>
  destroySession(): Promise<void>
}

interface KindeClient {
  createOrg: (sessionManager: SessionManager, options?: any) => Promise<any>
  getBooleanFlag: (sessionManager: SessionManager, code: string, defaultValue?: boolean) => Promise<boolean>
  getClaim: (sessionManager: SessionManager, claim: string) => Promise<any>
  getClaimValue: (sessionManager: SessionManager, claim: string) => Promise<any>
  getFlag: (sessionManager: SessionManager, code: string, defaultValue?: any) => Promise<any>
  getIntegerFlag: (sessionManager: SessionManager, code: string, defaultValue?: number) => Promise<number>
  getOrganization: (sessionManager: SessionManager) => Promise<any>
  getPermission: (sessionManager: SessionManager, permission: string) => Promise<any>
  getPermissions: (sessionManager: SessionManager) => Promise<any>
  getStringFlag: (sessionManager: SessionManager, code: string, defaultValue?: string) => Promise<string>
  getToken: (sessionManager: SessionManager) => Promise<string>
  getUser: (sessionManager: SessionManager) => Promise<KindeUser>
  getUserOrganizations: (sessionManager: SessionManager) => Promise<any>
  getUserProfile: (sessionManager: SessionManager) => Promise<any>
  handleRedirectToApp: (sessionManager: SessionManager, url: URL) => Promise<void>
  isAuthenticated: (sessionManager: SessionManager) => Promise<boolean>
  login: (sessionManager: SessionManager, options?: any) => Promise<URL>
  logout: (sessionManager: SessionManager) => Promise<URL>
  refreshTokens: (sessionManager: SessionManager) => Promise<void>
  register: (sessionManager: SessionManager, options?: any) => Promise<URL>
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
