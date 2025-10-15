# Cookie Prefix Feature

## Overview
Added a `cookie.prefix` configuration option to prevent cookie conflicts when running multiple Nuxt projects on the same localhost port (e.g., `localhost:3000`).

## Changes Made

### 1. Type Definition (`src/types.ts`)
- Added `prefix?: string` to the `cookie` configuration options
- Added JSDoc documentation with example usage

### 2. Module Configuration (`src/module.ts`)
- Added `prefix: ''` to the default cookie options
- Updated runtime config type declarations to include the prefix field

### 3. Server Middleware (`src/runtime/server/middleware/kinde.ts`)
- Added `cookiePrefix` variable that reads from config
- Created `getPrefixedName()` helper function to apply prefix to cookie names
- Updated all cookie operations to use the prefixed names:
  - `getSessionItem()` - reads prefixed cookies
  - `setSessionItem()` - sets prefixed cookies
  - `removeSessionItem()` - removes prefixed cookies
  - `destroySession()` - destroys prefixed cookies

### 4. Documentation (`README.md`)
- Added `prefix` to the Cookie Options table
- Added example in the Full Configuration Options section
- Created new "Multiple Projects on Localhost" section explaining the use case

## Usage

### Basic Setup
```typescript
// nuxt.config.ts
export default defineNuxtConfig({
  modules: ['@habityzer/nuxt-kinde-auth'],
  
  kindeAuth: {
    authDomain: process.env.NUXT_KINDE_AUTH_DOMAIN,
    clientId: process.env.NUXT_KINDE_CLIENT_ID,
    clientSecret: process.env.NUXT_KINDE_CLIENT_SECRET,
    redirectURL: process.env.NUXT_KINDE_REDIRECT_URL,
    cookie: {
      prefix: 'myapp_'  // Add this line
    }
  }
})
```

### Multiple Projects Example

**Project 1:**
```typescript
kindeAuth: {
  cookie: {
    prefix: 'habityzer_'
  }
}
```
Creates cookies: `habityzer_access_token`, `habityzer_refresh_token`, `habityzer_id_token`, etc.

**Project 2:**
```typescript
kindeAuth: {
  cookie: {
    prefix: 'dashboard_'
  }
}
```
Creates cookies: `dashboard_access_token`, `dashboard_refresh_token`, `dashboard_id_token`, etc.

## Cookie Names Affected
The prefix is applied to these cookie names:
- `access_token`
- `refresh_token`
- `id_token`
- `ac-state-key`
- `post-login-redirect-url`

## Default Behavior
- If no prefix is specified, cookies are created without a prefix (backward compatible)
- Empty string `''` is the default value

## Build Verification
✅ Module builds successfully with no errors
✅ TypeScript compilation passes
✅ All linter checks pass
✅ Cookie prefix functionality is present in compiled code

## Testing Recommendations
1. Clear browser cookies before testing
2. Set different prefixes in multiple projects
3. Verify each project maintains separate authentication sessions
4. Check that switching between projects doesn't cause logout

