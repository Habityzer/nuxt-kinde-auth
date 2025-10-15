# Debug Testing Guide

## Overview
A comprehensive debug page for testing the token refresh functionality in your local development environment.

## Setup

### 1. Enable Debug Mode

Make sure debug mode is enabled in your `nuxt.config.ts`:

```typescript
export default defineNuxtConfig({
  modules: ['@habityzer/nuxt-kinde-auth'],
  
  kindeAuth: {
    authDomain: process.env.NUXT_KINDE_AUTH_DOMAIN,
    clientId: process.env.NUXT_KINDE_CLIENT_ID,
    clientSecret: process.env.NUXT_KINDE_CLIENT_SECRET,
    redirectURL: process.env.NUXT_KINDE_REDIRECT_URL,
    
    debug: {
      enabled: true  // or: process.env.NODE_ENV !== 'production'
    }
  }
})
```

### 2. Start Your Development Server

```bash
npm run dev
# or
pnpm dev
```

### 3. Login First

Before accessing the debug page, make sure you're logged in:
- Navigate to your app
- Click login
- Complete the Kinde OAuth flow

## Accessing the Debug Page

Navigate to:
```
http://localhost:3000/__kinde-debug
```

**Note:** This page is only available when `debug.enabled` is true and will not be bundled in production.

## Debug Page Features

### 📊 Real-Time Token Status

The page shows:
- **Authentication Status** - Whether you're currently authenticated
- **Access Token Status** - Valid, Expiring Soon, or Expired
- **Token Expiry Time** - Exact timestamp and countdown
- **Refresh Token Availability** - Whether a refresh token is stored
- **User Information** - Email, name from ID token

### 🔄 Auto-Refresh

The page automatically reloads token information every 10 seconds, so you can watch the countdown and see when the token becomes "expiring soon" (< 5 minutes).

### 🧪 Test Actions

Four interactive test buttons:

#### 1. Test getToken() (Auto-Refresh)
```typescript
// What it does:
const { getToken } = useKindeAuth()
const token = await getToken()
```

- Calls the standard `getToken()` method
- **Automatically refreshes** if token is expired or expiring soon
- Shows the token preview in results
- Reloads page to show updated expiry time

**Use this to test:** Automatic refresh functionality

#### 2. Manual Refresh Token
```typescript
// What it does:
const { refreshToken } = useKindeAuth()
const success = await refreshToken()
```

- Forces a manual token refresh
- Returns true/false based on success
- Updates the token expiry time

**Use this to test:** Manual refresh control

#### 3. Test API Call with Token
```typescript
// What it does:
const { getToken } = useKindeAuth()
const token = await getToken()
const user = await $fetch('/api/kinde/user', {
  headers: { Authorization: `Bearer ${token}` }
})
```

- Gets a token (with auto-refresh)
- Makes an authenticated API call
- Shows the user data response

**Use this to test:** Using tokens in actual API calls

#### 4. Refresh Info
- Manually reloads all token information
- Useful for seeing immediate updates

## Testing Scenarios

### Scenario 1: Test Auto-Refresh (Recommended)

**Goal:** Verify that `getToken()` automatically refreshes expired tokens

**Steps:**
1. Access the debug page: `http://localhost:3000/__kinde-debug`
2. Note the current "Time Until Expiry"
3. Click "Test getToken() (Auto-Refresh)"
4. ✅ **Expected:** Token is returned successfully

**What's happening:** Even though we call it multiple times, `getToken()` handles refresh automatically if needed.

### Scenario 2: Watch Token Expire

**Goal:** See the token lifecycle in real-time

**Steps:**
1. Access the debug page after logging in
2. Note the "Time Until Expiry"
3. Wait and watch the auto-refresh updates every 10 seconds
4. When it shows "⚠️ Expiring Soon" (< 5 minutes):
   - Badge turns yellow/orange
   - "Should Refresh" becomes "Yes"
5. Click "Test getToken() (Auto-Refresh)"
6. ✅ **Expected:** Token is automatically refreshed, new expiry time shows

**Note:** Access tokens typically expire in 15-60 minutes, so you might want to test with a fresh login to see expiry sooner.

### Scenario 3: Manual Refresh

**Goal:** Test the manual refresh function

**Steps:**
1. Access the debug page
2. Click "Manual Refresh Token"
3. ✅ **Expected:** 
   - Shows success message
   - Token expiry time is updated to a new future time
   - Page reloads with new token info

### Scenario 4: Test API Call

**Goal:** Verify tokens work with actual API calls

**Steps:**
1. Access the debug page
2. Click "Test API Call with Token"
3. ✅ **Expected:**
   - Shows user data (email, name, etc.)
   - No authentication errors
   - Token is automatically refreshed if needed before the call

### Scenario 5: Simulate Token Expiry (Advanced)

**Goal:** Force test the expired token scenario

**Option A - Wait for Natural Expiry:**
1. Login and get a token
2. Wait for the token to actually expire (15-60 minutes typically)
3. Try using `getToken()` - should auto-refresh

**Option B - Modify Token Utility (Dev Only):**
Temporarily change the buffer time in `src/runtime/server/utils/token.ts`:
```typescript
// Change from 300 (5 minutes) to 3600 (60 minutes)
export function isTokenExpired(token: string, bufferSeconds: number = 3600): boolean
```

Now any token older than the expiry time will be considered "expiring soon" and trigger auto-refresh.

⚠️ **Remember to change it back after testing!**

## Debug API Endpoints

You can also test using the API endpoints directly:

### Get Comprehensive Token Info
```bash
curl http://localhost:3000/api/kinde/debug/token-info
```

Response:
```json
{
  "authenticated": true,
  "tokens": {
    "access": {
      "isExpired": false,
      "isExpiringSoon": false,
      "expiresAt": "2024-01-01T13:00:00Z",
      "timeUntilExpiry": 3245,
      "timeUntilExpiryFormatted": "54m 5s"
    },
    "refresh": {
      "exists": true
    }
  },
  "refreshStatus": {
    "canRefresh": true,
    "shouldRefresh": false,
    "reason": "Token is valid"
  }
}
```

### Manual Token Refresh
```bash
curl http://localhost:3000/api/kinde/refresh
```

### Get Current Token
```bash
curl http://localhost:3000/api/kinde/token
```

## Verification Checklist

Use this checklist to verify the token refresh feature:

- [ ] Debug page loads at `/__kinde-debug`
- [ ] Shows authentication status correctly
- [ ] Displays token expiry time
- [ ] Shows refresh token availability
- [ ] "Test getToken()" button works and returns token
- [ ] "Manual Refresh" button successfully refreshes token
- [ ] "Test API Call" button makes successful authenticated request
- [ ] Token expiry countdown updates every 10 seconds
- [ ] When token is expiring soon (< 5 min), status badge turns yellow
- [ ] Automatic refresh works when calling `getToken()` with expired token
- [ ] Manual refresh updates the expiry time to a future date
- [ ] Page shows user information from ID token

## Troubleshooting

### Debug Page Not Found (404)

**Solution:**
- Ensure `debug.enabled: true` in your config
- Restart your dev server
- Check that the module is properly installed

### "Not Authenticated" Message

**Solution:**
- You need to login first before using the debug page
- Navigate to your app and complete the login flow
- Then return to `/__kinde-debug`

### Refresh Token Not Available

**Solution:**
- This is normal if you just logged in with a fresh session
- Kinde provides refresh tokens after the initial OAuth flow
- If missing, try logging out and logging back in

### Token Not Refreshing

**Solution:**
- Check browser console for errors
- Verify refresh token exists (shown on debug page)
- Check server logs for refresh errors
- Ensure your Kinde app settings allow refresh tokens

## Understanding the Results

### Token Status Badges

- **✅ Valid** (Green) - Token is fresh, no action needed
- **⚠️ Expiring Soon** (Yellow/Orange) - Token expires in < 5 minutes, will auto-refresh on next use
- **❌ Expired** (Red) - Token is expired, will auto-refresh on next use

### Refresh Status

- **Can Refresh: ✓ Yes** - Refresh token is available
- **Can Refresh: ✗ No** - No refresh token (requires re-login)
- **Should Refresh: ⚠ Yes** - Token is expiring soon, refresh recommended
- **Should Refresh: ✓ No** - Token is still fresh

### Time Until Expiry

Shows countdown in `XXm XXs` format. When this reaches 5 minutes, the module will automatically refresh on the next `getToken()` call.

## Next Steps

After testing with the debug page:

1. **Verify in Your App:** Test token refresh in your actual application pages
2. **Check Server Logs:** Look for refresh messages: `[nuxt-kinde-auth] Token refreshed successfully`
3. **Long Session Test:** Leave your app open for an extended period and verify no unexpected logouts
4. **API Integration:** Test that your backend API calls work seamlessly with auto-refreshed tokens

## Production Note

🚨 **Important:** The debug page and debug endpoints are automatically disabled in production when `debug.enabled` is false or not set. The page will not be accessible and will not be included in your production bundle.

## Support

If you encounter issues:
1. Check the browser console for errors
2. Check server logs for token refresh messages
3. Verify your Kinde app configuration
4. Review the token expiry settings in your Kinde dashboard

Happy testing! 🚀

