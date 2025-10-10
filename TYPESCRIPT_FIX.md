# TypeScript Type Definitions Fix

## Issue

TypeScript was throwing errors because the type definitions didn't match the new implementation:

```
Property 'client' does not exist on type '{ sessionManager: ...; ... }'
```

## Root Cause

The type definitions in `src/runtime/types/index.d.ts` still defined the old structure with bound methods:

```typescript
// OLD (incorrect)
kinde?: {
  sessionManager: SessionManager
  createOrg: (options?: any) => Promise<any>
  getBooleanFlag: (code: string, defaultValue?: boolean) => Promise<boolean>
  // ... etc (bound methods)
}
```

But the actual implementation was changed to:

```typescript
// NEW (actual implementation)
kinde?: {
  client: KindeClient
  sessionManager: SessionManager
}
```

## Solution

Updated `src/runtime/types/index.d.ts` to match the new implementation:

### New Type Structure

```typescript
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
  // ... etc (all methods take sessionManager as first param)
  getToken: (sessionManager: SessionManager) => Promise<string>
  getUser: (sessionManager: SessionManager) => Promise<KindeUser>
  isAuthenticated: (sessionManager: SessionManager) => Promise<boolean>
  login: (sessionManager: SessionManager, options?: any) => Promise<URL>
  logout: (sessionManager: SessionManager) => Promise<URL>
}

declare module 'h3' {
  interface H3EventContext {
    kinde?: {
      client: KindeClient
      sessionManager: SessionManager
    }
  }
}
```

## Steps Taken

1. ✅ Updated type definitions in `src/runtime/types/index.d.ts`
2. ✅ Rebuilt module with `pnpm dev:prepare`
3. ✅ Cleared Nuxt cache and restarted dev server
4. ✅ All TypeScript errors resolved

## Benefits of New Structure

### Type Safety
- ✅ Full type inference for `client` and `sessionManager`
- ✅ IDE autocomplete works correctly
- ✅ Compile-time type checking

### Better API
- ✅ Explicit separation of client and session manager
- ✅ Easier to test (can mock each separately)
- ✅ More flexible (can pass sessionManager to helper functions)

### Usage Example

```typescript
// In any server endpoint
export default defineEventHandler(async (event) => {
  const kinde = event.context.kinde
  
  if (!kinde?.client || !kinde?.sessionManager) {
    throw createError({
      statusCode: 500,
      statusMessage: 'Kinde authentication not initialized'
    })
  }
  
  const { client, sessionManager } = kinde
  
  // Type-safe calls with full autocomplete
  const isAuth = await client.isAuthenticated(sessionManager)
  const user = await client.getUser(sessionManager)
  const token = await client.getToken(sessionManager)
  
  return { isAuth, user, token }
})
```

## Status

✅ **All TypeScript errors resolved**  
✅ **Module types match implementation**  
✅ **Dev server running without type errors**  
✅ **Full type safety and autocomplete working**

The module is now ready for testing!

