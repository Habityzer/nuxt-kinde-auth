# @habityzer/nuxt-kinde-auth

> Kinde authentication module for Nuxt 4

A plug-and-play authentication module for Nuxt 4 that integrates [Kinde](https://kinde.com/) OAuth authentication with minimal setup.

## Features

✅ **Easy Setup** - Add authentication to your Nuxt 4 app in minutes  
✅ **OAuth 2.0** - Secure authentication flow via Kinde  
✅ **Session Management** - Cookie-based sessions with configurable options  
✅ **Route Protection** - Optional global middleware to protect routes  
✅ **TypeScript** - Full TypeScript support with type definitions  
✅ **Server-Side Ready** - SSR-compatible authentication  
✅ **Debug Tools** - Built-in debug endpoints for development

## Installation

```bash
# Using pnpm (recommended)
pnpm add @habityzer/nuxt-kinde-auth

# Using npm
npm install @habityzer/nuxt-kinde-auth

# Using yarn
yarn add @habityzer/nuxt-kinde-auth
```

## Quick Start

### 1. Add Module to Nuxt Config

```typescript
// nuxt.config.ts
export default defineNuxtConfig({
  modules: ['@habityzer/nuxt-kinde-auth'],
  
  kindeAuth: {
    authDomain: process.env.NUXT_KINDE_AUTH_DOMAIN,
    clientId: process.env.NUXT_KINDE_CLIENT_ID,
    clientSecret: process.env.NUXT_KINDE_CLIENT_SECRET,
    redirectURL: process.env.NUXT_KINDE_REDIRECT_URL,
    logoutRedirectURL: '/',
    postLoginRedirectURL: '/dashboard'
  }
})
```

### 2. Set Environment Variables

```bash
# .env
NUXT_KINDE_AUTH_DOMAIN=https://yourapp.kinde.com
NUXT_KINDE_CLIENT_ID=your_client_id
NUXT_KINDE_CLIENT_SECRET=your_client_secret
NUXT_KINDE_REDIRECT_URL=http://localhost:3000/api/kinde/callback
NUXT_KINDE_LOGOUT_REDIRECT_URL=http://localhost:3000
```

### 3. Use the Composable

```vue
<script setup lang="ts">
const { isAuthenticated, user, login, logout } = useKindeAuth()
</script>

<template>
  <div>
    <button v-if="!isAuthenticated" @click="login">
      Log in
    </button>
    
    <div v-else>
      <p>Welcome, {{ user?.given_name }}!</p>
      <button @click="logout">Log out</button>
    </div>
  </div>
</template>
```

## Configuration

### Full Configuration Options

```typescript
export default defineNuxtConfig({
  kindeAuth: {
    // Required: Kinde domain
    authDomain: 'https://yourapp.kinde.com',
    
    // Required: Client credentials
    clientId: 'your_client_id',
    clientSecret: 'your_client_secret',
    
    // OAuth URLs
    redirectURL: '/api/kinde/callback',
    logoutRedirectURL: '/',
    postLoginRedirectURL: '/dashboard',
    
    // Cookie configuration
    cookie: {
      prefix: 'myapp_',    // Optional: Prefix for cookie names
      httpOnly: false,     // Allow client-side access for logout
      secure: true,        // HTTPS only in production
      sameSite: 'lax',     // CSRF protection
      path: '/',           // Cookie path
      maxAge: 604800       // 7 days in seconds
    },
    
    // Middleware configuration
    middleware: {
      enabled: true,                    // Enable route protection
      global: true,                     // Protect all routes by default
      publicRoutes: ['/', '/about']     // Routes that don't require auth
    },
    
    // Debug configuration
    debug: {
      enabled: false  // Enable debug endpoints in development only
    }
  }
})
```

### Cookie Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `prefix` | `string` | `''` | Cookie name prefix to prevent conflicts between projects |
| `httpOnly` | `boolean` | `false` | HttpOnly flag for cookies |
| `secure` | `boolean` | `true` (prod) | Secure flag for cookies |
| `sameSite` | `'lax' \| 'strict' \| 'none'` | `'lax'` | SameSite attribute |
| `path` | `string` | `'/'` | Cookie path |
| `maxAge` | `number` | `604800` | Max age in seconds (7 days) |

**Note:** The `prefix` option is useful when running multiple projects on localhost:3000. For example, setting `prefix: 'project1_'` will create cookies like `project1_access_token` instead of just `access_token`, preventing conflicts between different projects.

### Middleware Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `enabled` | `boolean` | `true` | Enable global middleware |
| `global` | `boolean` | `true` | Make middleware global |
| `publicRoutes` | `string[]` | `['/']` | Public routes (no auth required) |

## Composable API

### `useKindeAuth()`

The main composable for authentication functionality.

#### Returns

```typescript
{
  // State
  isAuthenticated: Ref<boolean>
  user: Ref<KindeUser | null>
  isLoading: Ref<boolean>
  
  // Computed
  userDisplayName: Ref<string>
  userEmail: Ref<string | null>
  userPicture: Ref<string | null>
  
  // Methods
  login: () => Promise<void>
  logout: () => void
  checkAuth: () => boolean
  fetchUser: () => Promise<KindeUser | null>
  getToken: () => Promise<string | null>
  refreshToken: () => Promise<boolean>
}
```

#### User Type

```typescript
interface KindeUser {
  id: string
  email?: string
  given_name?: string
  family_name?: string
  picture?: string
  [key: string]: unknown
}
```

## API Endpoints

The module automatically registers these endpoints:

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/kinde/login` | GET | Initiate OAuth login |
| `/api/kinde/logout` | GET | Logout and clear session |
| `/api/kinde/callback` | GET | OAuth callback handler |
| `/api/kinde/user` | GET | Get current user info |
| `/api/kinde/token` | GET | Get access token (auto-refreshes if expired) |
| `/api/kinde/refresh` | GET | Manually refresh access token |
| `/api/kinde/debug/token` | GET | Debug endpoint (dev only) |

## Server-Side Usage

Access Kinde context in server routes:

```typescript
// server/api/example.ts
export default defineEventHandler(async (event) => {
  const kindeClient = event.context.kinde
  
  // Check authentication
  const isAuthenticated = await kindeClient.isAuthenticated()
  
  if (!isAuthenticated) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Unauthorized'
    })
  }
  
  // Get user
  const user = await kindeClient.getUser()
  
  // Get token
  const token = await kindeClient.getToken()
  
  // Get permissions
  const permissions = await kindeClient.getPermissions()
  
  // Get feature flags
  const hasFeature = await kindeClient.getBooleanFlag('new_feature', false)
  
  return { user, permissions, hasFeature }
})
```

## Route Protection

### Using Built-in Middleware

The module provides optional global middleware for route protection:

```typescript
// nuxt.config.ts
export default defineNuxtConfig({
  kindeAuth: {
    middleware: {
      enabled: true,
      global: true,
      publicRoutes: [
        '/',
        '/about',
        '/blog'
      ]
    }
  }
})
```

### Custom Middleware

You can also create custom middleware:

```typescript
// middleware/auth.ts
export default defineNuxtRouteMiddleware((to) => {
  const { isAuthenticated, checkAuth } = useKindeAuth()
  
  checkAuth()
  
  if (!isAuthenticated.value && to.path.startsWith('/dashboard')) {
    return navigateTo('/api/kinde/login', { external: true })
  }
})
```

## Advanced Usage

### Cookie Prefix for Multiple Projects

When developing multiple Nuxt projects locally, they typically run on the same domain (`localhost:3000`), which can cause cookie conflicts. Use the `cookie.prefix` option to isolate sessions:

```typescript
// Project 1: Habityzer
export default defineNuxtConfig({
  kindeAuth: {
    cookie: {
      prefix: 'habityzer_'
    }
  }
})

// Project 2: Dashboard
export default defineNuxtConfig({
  kindeAuth: {
    cookie: {
      prefix: 'dashboard_'
    }
  }
})
```

This creates separate cookies for each project:
- Project 1: `habityzer_access_token`, `habityzer_refresh_token`, etc.
- Project 2: `dashboard_access_token`, `dashboard_refresh_token`, etc.

### Extending the Module

You can wrap `useKindeAuth` with your own composable to add custom functionality:

```typescript
// composables/useAuth.ts
export const useAuth = () => {
  const kindeAuth = useKindeAuth()
  
  // Fetch additional user data from your API
  const fetchUserProfile = async () => {
    const response = await $fetch('/api/user/profile')
    return response
  }
  
  return {
    ...kindeAuth,
    fetchUserProfile
  }
}
```

### Token Management & Auto-Refresh

The module automatically manages token refresh using the stored refresh token. When you call `getToken()`, it checks if the access token is expired or about to expire (within 5 minutes) and automatically refreshes it:

```typescript
const { getToken, refreshToken } = useKindeAuth()

// Automatic refresh - the module handles expired tokens
const token = await getToken() // Refreshes automatically if needed

// Use token in API calls
const data = await $fetch('/api/protected-resource', {
  headers: {
    Authorization: `Bearer ${token}`
  }
})

// Manual refresh (optional)
const success = await refreshToken()
if (success) {
  console.log('Token refreshed successfully')
}
```

**How it works:**
1. Access tokens are checked for expiry before being returned
2. If expired or expiring soon (< 5 minutes), the refresh token is used automatically
3. New tokens are saved to cookies seamlessly
4. If refresh fails (expired refresh token), the user is logged out

### Proxy Pattern for Backend API

Create a proxy to forward requests with Kinde tokens:

```typescript
// server/api/backend/[...path].ts
export default defineEventHandler(async (event) => {
  const kindeClient = event.context.kinde
  const token = await kindeClient.getToken()
  
  const path = event.context.params?.path || ''
  const config = useRuntimeConfig()
  
  return $fetch(`${config.backendUrl}/${path}`, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  })
})
```

## Debug Mode

Enable debug endpoints and debug page in development:

```typescript
// nuxt.config.ts
export default defineNuxtConfig({
  kindeAuth: {
    debug: {
      enabled: process.env.NODE_ENV !== 'production'
    }
  }
})
```

### 🛠️ Nuxt DevTools Integration

The module automatically adds a **"Kinde Auth"** tab to your Nuxt DevTools in development mode!

**To use it:**

1. Open your Nuxt app in development mode
2. Click the **Nuxt icon** (usually bottom-right corner, or press `Shift + Alt/Option + D`)
3. Click the **"Kinde Auth"** tab in the DevTools sidebar

The DevTools tab displays:

- ✅ **Authentication Status** - Live status indicator  
- ✅ **Current User Info** - See authenticated user details
- ✅ **Token Status** - Real-time token expiry countdown with auto-refresh
- ✅ **Configuration** - All your Kinde settings (cookie prefix, redirects, etc.)
- ✅ **Interactive Testing** - Test token refresh, API calls, and more

**No configuration needed!** The tab appears automatically when `debug.enabled` is `true`.

### 🔍 Debug Page

When debug mode is enabled, the debug URL will be logged to your browser console on app startup.

**Access the interactive debug page at:**

```
http://localhost:3000/__kinde-debug
```

**Quick Access:** Bookmark this URL or check your browser console for the debug link!

The debug page provides:
- ✅ **Configuration Display** - View all your Kinde settings (cookie prefix, redirects, etc.)
- ✅ **Real-time Token Status** - Expiry countdown and status indicators
- ✅ **Interactive Token Refresh** - Test manual and automatic refresh
- ✅ **API Call Testing** - Verify tokens work with your endpoints
- ✅ **Token Inspection** - Decode and view token contents
- ✅ **Auto-refresh** - Updates every 10 seconds
- ✅ **User Information** - Display current user details

**Perfect for testing:**
- Token expiry and refresh functionality
- API calls with authentication
- Token lifecycle management
- Troubleshooting auth issues
- Verifying configuration settings

### Debug API Endpoints

#### Token Information
```
GET /api/kinde/debug/token-info
```

Returns comprehensive token status:
```json
{
  "authenticated": true,
  "tokens": {
    "access": {
      "isExpired": false,
      "isExpiringSoon": true,
      "expiresAt": "2024-01-01T12:00:00Z",
      "timeUntilExpiry": 245,
      "timeUntilExpiryFormatted": "4m 5s"
    },
    "refresh": {
      "exists": true
    }
  },
  "refreshStatus": {
    "canRefresh": true,
    "shouldRefresh": true,
    "reason": "Token expires in less than 5 minutes"
  }
}
```

#### Raw Tokens
```
GET /api/kinde/debug/token
```

Returns decoded tokens:
```json
{
  "accessToken": {
    "raw": "eyJ...",
    "decoded": { ... }
  },
  "idToken": {
    "raw": "eyJ...",
    "decoded": { ... }
  }
}
```

## TypeScript Support

The module includes full TypeScript support:

```typescript
import type { KindeUser } from '@habityzer/nuxt-kinde-auth'

const user: KindeUser = {
  id: '123',
  email: 'user@example.com',
  given_name: 'John',
  family_name: 'Doe'
}
```

## Migration Guide

### From Custom Kinde Integration

If you have an existing Kinde integration:

1. **Install the module**
   ```bash
   pnpm add @habityzer/nuxt-kinde-auth
   ```

2. **Update nuxt.config.ts**
   - Add module to `modules` array
   - Move Kinde config to `kindeAuth` key
   - Remove manual runtime config

3. **Remove old files**
   - Delete `server/middleware/kinde.ts`
   - Delete `server/api/login.get.ts`
   - Delete `server/api/logout.get.ts`
   - Delete `server/api/callback.get.ts`

4. **Update imports**
   - Replace custom `useAuth` with `useKindeAuth`
   - Update API endpoint URLs (`/api/login` → `/api/kinde/login`)

5. **Test thoroughly**
   - Verify login/logout works
   - Check route protection
   - Test server-side auth

## Troubleshooting

### "Kinde authentication not initialized"

**Cause:** Module not loaded or configuration missing.

**Solution:** 
- Ensure `@habityzer/nuxt-kinde-auth` is in your `modules` array
- Verify `authDomain`, `clientId`, and `clientSecret` are set
- Restart dev server

### Session Not Persisting

**Cause:** Cookie configuration issues.

**Solution:**
- Check `cookie.secure` setting (should be `false` for localhost)
- Verify `cookie.sameSite` is set to `'lax'`
- Clear browser cookies and try again

### Redirect Loop on Login

**Cause:** Middleware configuration conflict.

**Solution:**
- Ensure `/api/kinde/callback` is in `publicRoutes`
- Check that middleware is not blocking auth endpoints
- Disable module middleware if using custom middleware

### Token Refresh Issues

**Cause:** Refresh token expired or invalid.

**Solution:**
- Refresh tokens have a longer lifespan but do expire eventually
- If refresh fails, users must re-authenticate
- Check Kinde dashboard for token expiry settings
- The module automatically handles this by clearing session and requiring login

## Requirements

- Nuxt 4.x
- Node.js >= 18
- Kinde account and application

## License

MIT

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## Support

For issues and questions:
- [GitHub Issues](https://github.com/Habityzer/nuxt-kinde-auth/issues)
- [Kinde Documentation](https://kinde.com/docs/)

---

Made with ❤️ for the Nuxt community

