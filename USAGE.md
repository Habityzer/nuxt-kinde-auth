# Usage Guide - Standalone Installation

This guide explains how to use `nuxt-kinde-auth` as an independent module in any Nuxt 4 project.

## Prerequisites

- Node.js >= 18.0.0
- Nuxt 4.x project
- [Kinde account](https://kinde.com/) (free tier available)

## Installation

### 1. Install the Package

```bash
# Using pnpm (recommended)
pnpm add nuxt-kinde-auth

# Using npm
npm install nuxt-kinde-auth

# Using yarn
yarn add nuxt-kinde-auth
```

### 2. Create Kinde Application

1. Go to [Kinde Console](https://app.kinde.com/)
2. Create a new application (or use existing)
3. Note your:
   - Domain (e.g., `https://yourapp.kinde.com`)
   - Client ID
   - Client Secret
4. Add callback URL: `http://localhost:3000/api/kinde/callback`
5. Add logout redirect: `http://localhost:3000`

### 3. Configure Environment Variables

Create `.env` file in your project root:

```bash
# .env
NUXT_KINDE_AUTH_DOMAIN=https://yourapp.kinde.com
NUXT_KINDE_CLIENT_ID=your_client_id_here
NUXT_KINDE_CLIENT_SECRET=your_client_secret_here
NUXT_KINDE_REDIRECT_URL=http://localhost:3000/api/kinde/callback
```

### 4. Add Module to Nuxt Config

```typescript
// nuxt.config.ts
export default defineNuxtConfig({
  modules: [
    'nuxt-kinde-auth'
  ],
  
  kindeAuth: {
    authDomain: process.env.NUXT_KINDE_AUTH_DOMAIN!,
    clientId: process.env.NUXT_KINDE_CLIENT_ID!,
    clientSecret: process.env.NUXT_KINDE_CLIENT_SECRET!,
    redirectURL: process.env.NUXT_KINDE_REDIRECT_URL!,
    logoutRedirectURL: '/',
    postLoginRedirectURL: '/dashboard',
    
    // Optional: Configure route protection
    middleware: {
      enabled: true,
      global: true,
      publicRoutes: ['/', '/about', '/contact']
    }
  }
})
```

## Basic Usage

### Authentication in Components

```vue
<!-- pages/index.vue -->
<script setup lang="ts">
const { 
  isAuthenticated, 
  user, 
  userDisplayName,
  userEmail,
  login, 
  logout,
  isLoading 
} = useKindeAuth()
</script>

<template>
  <div>
    <div v-if="isLoading">
      Loading...
    </div>
    
    <div v-else-if="!isAuthenticated">
      <h1>Welcome!</h1>
      <button @click="login">Sign In</button>
    </div>
    
    <div v-else>
      <h1>Hello, {{ userDisplayName }}!</h1>
      <p>Email: {{ userEmail }}</p>
      <button @click="logout">Sign Out</button>
    </div>
  </div>
</template>
```

### Protected Routes

#### Using Global Middleware (Recommended)

Configure in `nuxt.config.ts`:

```typescript
kindeAuth: {
  middleware: {
    enabled: true,
    global: true,
    publicRoutes: [
      '/',
      '/about',
      '/blog',
      '/blog/**',  // All blog pages
    ]
  }
}
```

#### Using Custom Middleware

Create middleware file:

```typescript
// middleware/auth.ts
export default defineNuxtRouteMiddleware((to) => {
  const { isAuthenticated, checkAuth } = useKindeAuth()
  
  // Check if user has valid session
  checkAuth()
  
  // Redirect to login if not authenticated
  if (!isAuthenticated.value) {
    return navigateTo('/api/kinde/login', { external: true })
  }
})
```

Use in pages:

```vue
<script setup lang="ts">
definePageMeta({
  middleware: 'auth'
})
</script>
```

### Server-Side Authentication

```typescript
// server/api/protected.ts
export default defineEventHandler(async (event) => {
  const kinde = event.context.kinde
  
  if (!kinde?.client || !kinde?.sessionManager) {
    throw createError({
      statusCode: 500,
      statusMessage: 'Kinde not initialized'
    })
  }
  
  const { client, sessionManager } = kinde
  
  // Check authentication
  const isAuth = await client.isAuthenticated(sessionManager)
  if (!isAuth) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Unauthorized'
    })
  }
  
  // Get user data
  const user = await client.getUser(sessionManager)
  
  // Get access token
  const token = await client.getToken(sessionManager)
  
  // Get permissions
  const permissions = await client.getPermissions(sessionManager)
  
  // Check feature flags
  const hasFeature = await client.getBooleanFlag(
    sessionManager,
    'new_feature',
    false
  )
  
  return {
    user,
    permissions,
    hasFeature
  }
})
```

## Real-World Examples

### Dashboard with User Profile

```vue
<!-- pages/dashboard.vue -->
<script setup lang="ts">
definePageMeta({
  middleware: 'auth'
})

const { 
  user,
  userDisplayName,
  userEmail,
  userPicture,
  getToken
} = useKindeAuth()

// Fetch user-specific data
const { data: profile } = await useFetch('/api/user/profile', {
  headers: {
    Authorization: `Bearer ${await getToken()}`
  }
})
</script>

<template>
  <div class="dashboard">
    <header>
      <img 
        v-if="userPicture" 
        :src="userPicture" 
        :alt="userDisplayName"
      />
      <div>
        <h1>{{ userDisplayName }}</h1>
        <p>{{ userEmail }}</p>
      </div>
    </header>
    
    <main>
      <h2>Your Profile</h2>
      <pre>{{ profile }}</pre>
    </main>
  </div>
</template>
```

### API with Bearer Token

```typescript
// composables/useApi.ts
export const useApi = () => {
  const { getToken } = useKindeAuth()
  
  const apiFetch = async <T>(url: string, options = {}): Promise<T> => {
    const token = await getToken()
    
    return $fetch<T>(url, {
      ...options,
      headers: {
        ...options.headers,
        Authorization: token ? `Bearer ${token}` : ''
      }
    })
  }
  
  return { apiFetch }
}
```

Usage:

```vue
<script setup lang="ts">
const { apiFetch } = useApi()

const { data } = await useAsyncData('posts', () => 
  apiFetch('/api/posts')
)
</script>
```

### Backend API Proxy

```typescript
// server/api/backend/[...path].ts
export default defineEventHandler(async (event) => {
  const kinde = event.context.kinde
  
  if (!kinde?.client || !kinde?.sessionManager) {
    throw createError({ statusCode: 401 })
  }
  
  const { client, sessionManager } = kinde
  
  // Get token for backend auth
  const token = await client.getToken(sessionManager)
  
  // Get path from params
  const path = event.context.params?.path || ''
  
  // Forward to backend
  const config = useRuntimeConfig()
  return $fetch(`${config.backendApiUrl}/${path}`, {
    method: event.method,
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: event.method !== 'GET' ? await readBody(event) : undefined
  })
})
```

Configure backend URL:

```typescript
// nuxt.config.ts
export default defineNuxtConfig({
  runtimeConfig: {
    backendApiUrl: process.env.BACKEND_API_URL || 'https://api.example.com'
  }
})
```

## Production Deployment

### Environment Variables

Set these in your production environment:

```bash
NUXT_KINDE_AUTH_DOMAIN=https://yourapp.kinde.com
NUXT_KINDE_CLIENT_ID=prod_client_id
NUXT_KINDE_CLIENT_SECRET=prod_client_secret
NUXT_KINDE_REDIRECT_URL=https://yourapp.com/api/kinde/callback
```

### Kinde Configuration

1. Add production callback URLs in Kinde console:
   - `https://yourapp.com/api/kinde/callback`
2. Add production logout redirect:
   - `https://yourapp.com`
3. Update allowed origins if needed

### Cookie Configuration

```typescript
// nuxt.config.ts
export default defineNuxtConfig({
  kindeAuth: {
    cookie: {
      secure: process.env.NODE_ENV === 'production', // HTTPS only in prod
      sameSite: 'lax',
      httpOnly: false // Allow client-side logout
    }
  }
})
```

## Testing

### Disable Auth in Tests

```typescript
// nuxt.config.ts
export default defineNuxtConfig({
  kindeAuth: {
    middleware: {
      enabled: process.env.NODE_ENV !== 'test'
    }
  }
})
```

### Mock Authentication

```typescript
// tests/mocks/auth.ts
export const mockKindeAuth = () => ({
  isAuthenticated: ref(true),
  user: ref({
    id: 'test-user',
    email: 'test@example.com',
    given_name: 'Test',
    family_name: 'User'
  }),
  isLoading: ref(false),
  userDisplayName: computed(() => 'Test User'),
  userEmail: computed(() => 'test@example.com'),
  userPicture: computed(() => null),
  login: vi.fn(),
  logout: vi.fn(),
  checkAuth: vi.fn(() => true),
  fetchUser: vi.fn(),
  getToken: vi.fn(() => Promise.resolve('mock-token'))
})
```

## Troubleshooting

### Module not found

```bash
# Clear node_modules and reinstall
rm -rf node_modules pnpm-lock.yaml
pnpm install
```

### TypeScript errors

```bash
# Regenerate Nuxt types
pnpm run dev:prepare
```

### Login redirects not working

1. Check callback URL matches exactly in Kinde console
2. Verify `redirectURL` in config matches callback URL
3. Ensure `/api/kinde/callback` is in `publicRoutes`

### Cookies not persisting

1. Set `cookie.secure` to `false` for localhost
2. Check `cookie.sameSite` is `'lax'`
3. Clear all cookies and try again

## Support

- 📖 [Full Documentation](https://github.com/Habityzer/nuxt-kinde-auth)
- 🐛 [Report Issues](https://github.com/Habityzer/nuxt-kinde-auth/issues)
- 💬 [Kinde Docs](https://kinde.com/docs/)

## License

MIT License - see [LICENSE](./LICENSE) file for details

