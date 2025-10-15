# Token Refresh Feature

## Overview
Implemented **automatic token refresh** functionality using the refresh tokens that were already being stored by the module. The Kinde SDK provides a `refreshTokens()` method that was previously unused - now it's fully integrated!

## Problem Solved
Previously, when access tokens expired (typically after 15-60 minutes), users would be logged out and need to re-authenticate. Now, the module automatically uses the refresh token to get a new access token, providing a seamless user experience.

## Changes Made

### 1. Token Utility (`src/runtime/server/utils/token.ts`) - NEW
Created utility functions for JWT token management:
- `decodeJWT()` - Decodes JWT tokens to read payload
- `isTokenExpired()` - Checks if token is expired or about to expire
- `getTokenExpiry()` - Gets token expiration timestamp

**Key Feature:** Includes a configurable buffer time (default: 5 minutes) to refresh tokens before they actually expire.

### 2. Refresh Endpoint (`src/runtime/server/api/kinde/refresh.get.ts`) - NEW
Created a dedicated endpoint for manual token refresh:
- Validates refresh token exists
- Calls Kinde SDK's `refreshTokens()` method
- Automatically saves new tokens to session cookies
- Handles refresh failures by clearing session

**Endpoint:** `GET /api/kinde/refresh`

### 3. Token Endpoint (`src/runtime/server/api/kinde/token.get.ts`) - UPDATED
Enhanced with automatic refresh capability:
- Checks if access token is expired or expiring soon
- Automatically refreshes tokens when needed
- Returns fresh token transparently
- Falls back to login if refresh fails

**Magic:** Users calling `getToken()` never see expired tokens!

### 4. Composable (`src/runtime/composables/useKindeAuth.ts`) - UPDATED
Added new `refreshToken()` method:
- Manually trigger token refresh
- Returns `true` on success, `false` on failure
- Clears auth state if refresh fails
- Updated return type to include new method

### 5. Module Registration (`src/module.ts`) - UPDATED
Registered the new refresh endpoint in the module setup.

### 6. Documentation (`README.md`) - UPDATED
Added comprehensive documentation:
- Updated composable API documentation
- Added refresh endpoint to API endpoints table
- Created "Token Management & Auto-Refresh" section with examples
- Added troubleshooting section for token refresh issues

## How It Works

### Automatic Refresh Flow
```
1. User calls getToken()
2. Module checks token expiry
3. If expired/expiring soon (< 5 min):
   a. Call Kinde SDK refreshTokens()
   b. Save new tokens to cookies
   c. Return fresh access token
4. If not expired:
   a. Return existing access token
```

### Manual Refresh
```typescript
const { refreshToken } = useKindeAuth()
const success = await refreshToken()
```

### Token Lifecycle
```
Access Token:  15-60 minutes (short-lived)
Refresh Token: Days/weeks (long-lived)

When access expires → Use refresh to get new access
When refresh expires → User must re-authenticate
```

## Usage Examples

### Basic Usage (Automatic)
```typescript
const { getToken } = useKindeAuth()

// Token is automatically refreshed if needed
const token = await getToken()

// Use in API calls
const data = await $fetch('/api/protected', {
  headers: { Authorization: `Bearer ${token}` }
})
```

### Manual Refresh
```typescript
const { refreshToken } = useKindeAuth()

// Manually refresh tokens
const success = await refreshToken()
if (success) {
  console.log('✅ Tokens refreshed')
} else {
  console.log('❌ Refresh failed, please login')
}
```

### Server-Side API
```typescript
// server/api/example.ts
export default defineEventHandler(async (event) => {
  const { client, sessionManager } = event.context.kinde
  
  // Get token (auto-refreshes)
  const token = await client.getToken(sessionManager)
  
  // Or manually refresh
  await client.refreshTokens(sessionManager)
})
```

## Benefits

### For Users
- ✅ No more unexpected logouts
- ✅ Seamless experience during long sessions
- ✅ Transparent token management

### For Developers
- ✅ No manual refresh logic needed
- ✅ Automatic handling of token expiry
- ✅ Optional manual control when needed
- ✅ Clean error handling

### Security
- ✅ Tokens are refreshed before expiry (5-minute buffer)
- ✅ Failed refreshes trigger re-authentication
- ✅ Refresh tokens stored securely in HTTP-only cookies
- ✅ Short-lived access tokens limit exposure

## Configuration

The feature works out-of-the-box with default settings:
- **Buffer Time:** 5 minutes before expiry
- **Auto-refresh:** Enabled in `getToken()`
- **Cookie Storage:** Uses existing cookie configuration

No additional configuration needed!

## API Endpoints

### New Endpoints
- `GET /api/kinde/refresh` - Manual token refresh

### Updated Endpoints
- `GET /api/kinde/token` - Now auto-refreshes expired tokens

## Testing

### Manual Test Flow
1. Login to your app
2. Wait for access token to expire (or modify buffer time to 59 minutes for testing)
3. Call `getToken()` - should automatically refresh
4. Check console for refresh logs: `[nuxt-kinde-auth] Token refreshed successfully`

### Test Manual Refresh
```typescript
const { refreshToken } = useKindeAuth()
await refreshToken() // Should return true
```

### Test Expired Refresh Token
1. Manually delete refresh_token cookie
2. Call `getToken()` - should redirect to login
3. Or call `refreshToken()` - should return false

## Backward Compatibility

✅ **Fully backward compatible**
- Existing code continues to work
- `getToken()` behavior enhanced but API unchanged
- New `refreshToken()` method is optional
- No breaking changes to existing functionality

## Build Verification

✅ Module builds successfully  
✅ All TypeScript types compile  
✅ No linter errors  
✅ New endpoints registered  
✅ Token utilities exported  

Build output shows new files:
- `dist/runtime/server/utils/token.js`
- `dist/runtime/server/api/kinde/refresh.get.js`
- Updated `dist/runtime/composables/useKindeAuth.js`

## Error Handling

### Refresh Token Expired
- Session is cleared
- User redirected to login
- Clean error message: "Token expired and refresh failed. Please log in again."

### Refresh Token Missing
- Returns 401 Unauthorized
- Error: "No refresh token available"

### Network Errors
- Caught and logged
- Returns `null` or `false`
- User must retry or re-authenticate

## Logs

The module provides helpful console logs:
```
[nuxt-kinde-auth] Access token expired or expiring soon, refreshing...
[nuxt-kinde-auth] Token refreshed successfully
[nuxt-kinde-auth] Token refresh failed: <error>
```

## Future Enhancements

Possible future improvements:
- [ ] Configurable refresh buffer time
- [ ] Refresh token rotation
- [ ] Token refresh queue (prevent multiple simultaneous refreshes)
- [ ] Client-side token expiry monitoring
- [ ] Proactive background refresh

## Summary

This feature transforms the module from a basic auth solution to a **production-ready authentication system** with automatic session management. Users can now stay logged in for extended periods without interruption, while developers get a simple, reliable API for token management.

**The best part?** It's completely automatic - developers don't need to do anything different!

