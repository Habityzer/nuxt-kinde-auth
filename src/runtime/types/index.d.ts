import type { KindeUser } from '../../types'

declare module '#app' {
  interface NuxtApp {
    $kindeAuth: ReturnType<typeof useKindeAuth>
  }
}

declare module 'h3' {
  interface H3EventContext {
    kinde?: {
      sessionManager: {
        getSessionItem(key: string): Promise<string | undefined>
        setSessionItem(key: string, value: string): Promise<void>
        removeSessionItem(key: string): Promise<void>
        destroySession(): Promise<void>
      }
      createOrg: (options?: any) => Promise<any>
      getBooleanFlag: (code: string, defaultValue?: boolean) => Promise<boolean>
      getClaim: (claim: string) => Promise<any>
      getClaimValue: (claim: string) => Promise<any>
      getFlag: (code: string, defaultValue?: any) => Promise<any>
      getIntegerFlag: (code: string, defaultValue?: number) => Promise<number>
      getOrganization: () => Promise<any>
      getPermission: (permission: string) => Promise<any>
      getPermissions: () => Promise<any>
      getStringFlag: (code: string, defaultValue?: string) => Promise<string>
      getToken: () => Promise<string>
      getUser: () => Promise<KindeUser>
      getUserOrganizations: () => Promise<any>
      getUserProfile: () => Promise<any>
      handleRedirectToApp: (url: URL) => Promise<void>
      isAuthenticated: () => Promise<boolean>
      login: (options?: any) => Promise<URL>
      logout: () => Promise<URL>
      refreshTokens: () => Promise<void>
      register: (options?: any) => Promise<URL>
    }
  }
}

export type { KindeUser }

