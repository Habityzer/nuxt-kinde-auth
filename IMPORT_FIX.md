# Server Import Fix

## Issue

The dev server was failing with a RollupError:

```
[plugin impound] Vue app aliases are not allowed in server runtime. 
[importing #build/app.config.mjs from nuxt/dist/app/config.js]
```

## Root Cause

Server-side code was importing from `'nuxt/app'`, which is a client-side alias that includes Vue app configuration. This is not allowed in Nitro/server runtime.

### Problematic Code

**In `src/runtime/server/middleware/kinde.ts`:**
```typescript
import { useRuntimeConfig } from 'nuxt/app'  // ❌ Client-side import

function getKindeClient() {
  const config = useRuntimeConfig()  // Called without event context
  // ...
}
```

**In `src/runtime/composables/useKindeAuth.ts`:**
```typescript
import { useCookie, navigateTo, useRoute } from 'nuxt/app'  // ❌ Client-side imports
```

## Solution

### 1. Server Middleware Fix

**Changed:** Remove import and pass event to `useRuntimeConfig`

```typescript
// ✅ No import needed - useRuntimeConfig is auto-imported
function getKindeClient(event: H3Event) {
  if (_kindeClient) return _kindeClient
  
  const config = useRuntimeConfig(event)  // Pass event context
  _kindeClient = createKindeServerClient(GrantType.AUTHORIZATION_CODE, {
    authDomain: config.kinde.authDomain,
    // ...
  })
  
  return _kindeClient
}
```

### 2. Composable Fix

**Changed:** Remove static imports, use dynamic imports when needed

```typescript
// ✅ No static imports from nuxt/app

const login = async () => {
  if (import.meta.client) {
    window.location.href = '/api/kinde/login'
  } else {
    // Dynamic import for server-side
    const { navigateTo } = await import('#app')
    await navigateTo('/api/kinde/login', { external: true })
  }
}
```

## Why This Works

### Auto-Imports in Nuxt

Nuxt auto-imports many utilities, so you don't need to import them manually:

- ✅ `useRuntimeConfig` - Auto-imported in server context
- ✅ `$fetch` - Auto-imported globally
- ✅ `defineEventHandler` - Auto-imported in server context
- ✅ `createError` - Auto-imported in server context

### Dynamic Imports

When you DO need client-side utilities on the server, use dynamic imports:

```typescript
if (!import.meta.client) {
  const { navigateTo } = await import('#app')
  // Use it
}
```

This way, the import only happens at runtime when actually needed, avoiding build-time issues.

## Best Practices for Nuxt Modules

### ✅ DO:
- Use auto-imported utilities without imports
- Pass `event` to `useRuntimeConfig` in server code
- Use dynamic imports for conditional server-side needs
- Keep server and client code separate

### ❌ DON'T:
- Import from `'nuxt/app'` in server code
- Import from `'#app'` in server code (unless dynamic)
- Call `useRuntimeConfig()` without event in server middleware
- Mix client and server imports

## Files Changed

1. ✅ `src/runtime/server/middleware/kinde.ts`
   - Removed `import { useRuntimeConfig } from 'nuxt/app'`
   - Added `event: H3Event` parameter to `getKindeClient`
   - Pass event to `useRuntimeConfig(event)`

2. ✅ `src/runtime/composables/useKindeAuth.ts`
   - Removed `import { useCookie, navigateTo, useRoute } from 'nuxt/app'`
   - Changed to dynamic import when needed

## Result

✅ Server builds successfully  
✅ No RollupError  
✅ Module works in both client and server contexts  
✅ Dev server starts without errors  

## Additional Notes

### useRuntimeConfig in Server Context

Always pass the event when calling `useRuntimeConfig` in server code:

```typescript
// ✅ Correct - in event handler
export default defineEventHandler((event) => {
  const config = useRuntimeConfig(event)
})

// ✅ Correct - in middleware
export default defineEventHandler((event) => {
  function someFunction(event: H3Event) {
    const config = useRuntimeConfig(event)
  }
  someFunction(event)
})

// ❌ Wrong - no event context
function standalone() {
  const config = useRuntimeConfig()  // Where's the event?
}
```

### Client vs Server Imports

| Import | Client | Server | Notes |
|--------|--------|--------|-------|
| `'vue'` | ✅ | ✅ | Universal |
| `'h3'` | ❌ | ✅ | Server only |
| `'nuxt/app'` | ✅ | ❌ | Client only |
| `'#app'` | ✅ | ⚠️ | Use dynamic imports on server |
| Auto-imports | ✅ | ✅ | Context-aware |

## Status

✅ **Import errors fixed**  
✅ **Module builds successfully**  
✅ **Dev server running**  
✅ **Ready for testing**

The module now correctly handles imports for both client and server contexts!

