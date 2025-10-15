<template>
  <div class="min-h-screen bg-gradient-to-br from-indigo-500 via-purple-500 to-purple-600 p-8">
    <div class="max-w-7xl mx-auto">
      <header class="text-center text-white mb-8">
        <h1 class="text-4xl font-bold mb-2">🔍 Kinde Auth Debug Panel</h1>
        <p class="text-lg opacity-90">Development Mode Only</p>
      </header>

      <div v-if="loading" class="text-center text-white py-12">
        <div class="w-12 h-12 border-4 border-white/30 border-t-white rounded-full animate-spin mx-auto mb-4"></div>
        <p>Loading token information...</p>
      </div>

      <div v-else-if="error" class="bg-white rounded-xl p-6 text-center shadow-lg">
        <h3 class="text-red-500 text-lg font-bold mb-3">❌ Error</h3>
        <p class="mb-3">{{ error }}</p>
        <button type="button" @click.prevent="loadTokenInfo" class="px-6 py-3 bg-indigo-500 text-white rounded-lg font-semibold hover:bg-indigo-600 transition">Retry</button>
      </div>

      <template v-else-if="tokenInfo">
        <!-- Configuration -->
        <section class="bg-white rounded-xl p-4 mb-4 shadow-lg">
          <h2 class="text-xl font-bold text-gray-800 mb-3 pb-2 border-b-2 border-indigo-500">Configuration</h2>
          <div class="space-y-2 text-sm">
            <div class="flex gap-2">
              <span class="font-semibold text-gray-600 min-w-[140px]">Cookie Prefix:</span>
              <code class="text-xs font-mono bg-gray-100 px-2 py-1 rounded text-indigo-600">{{ config?.cookie?.prefix || '(none)' }}</code>
            </div>
            <div class="flex gap-2">
              <span class="font-semibold text-gray-600 min-w-[140px]">Redirect URL:</span>
              <span class="text-gray-900 text-xs">{{ config?.redirectURL || 'N/A' }}</span>
            </div>
            <div class="flex gap-2">
              <span class="font-semibold text-gray-600 min-w-[140px]">Logout Redirect:</span>
              <span class="text-gray-900 text-xs">{{ config?.logoutRedirectURL || 'N/A' }}</span>
            </div>
            <div class="flex gap-2">
              <span class="font-semibold text-gray-600 min-w-[140px]">Post-Login Redirect:</span>
              <span class="text-gray-900 text-xs">{{ config?.postLoginRedirectURL || 'N/A' }}</span>
            </div>
            <div class="flex gap-2">
              <span class="font-semibold text-gray-600 min-w-[140px]">Cookie Max Age:</span>
              <span class="text-gray-900 text-xs">{{ config?.cookie?.maxAge ? `${config.cookie.maxAge}s (${Math.floor(config.cookie.maxAge / 86400)}d)` : 'N/A' }}</span>
            </div>
            <div class="flex gap-2">
              <span class="font-semibold text-gray-600 min-w-[140px]">Cookie Secure:</span>
              <span class="text-gray-900 text-xs">{{ config?.cookie?.secure ? 'Yes' : 'No' }}</span>
            </div>
          </div>
        </section>

        <!-- Authentication Status -->
        <section class="bg-white rounded-xl p-4 mb-4 shadow-lg">
          <h2 class="text-xl font-bold text-gray-800 mb-3 pb-2 border-b-2 border-indigo-500">Authentication Status</h2>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div class="flex items-center gap-2">
              <span class="font-semibold text-gray-700">Authenticated:</span>
              <span :class="['px-3 py-1 rounded-full text-sm font-semibold', tokenInfo.authenticated ? 'bg-green-500 text-white' : 'bg-red-500 text-white']">
                {{ tokenInfo.authenticated ? '✓ Yes' : '✗ No' }}
              </span>
            </div>
            <div class="flex items-center gap-2" v-if="tokenInfo.authenticated">
              <span class="font-semibold text-gray-700">Has Tokens:</span>
              <span :class="['px-3 py-1 rounded-full text-sm font-semibold', tokenInfo.hasTokens ? 'bg-green-500 text-white' : 'bg-yellow-500 text-white']">
                {{ tokenInfo.hasTokens ? '✓ Yes' : '⚠ No' }}
              </span>
            </div>
          </div>
        </section>

        <!-- Token Status -->
        <section class="bg-white rounded-xl p-4 mb-4 shadow-lg" v-if="tokenInfo.tokens">
          <h2 class="text-xl font-bold text-gray-800 mb-3 pb-2 border-b-2 border-indigo-500">Access Token Status</h2>
          <div class="space-y-2">
            <div class="flex items-center justify-between py-3 border-b border-gray-200">
              <span class="font-semibold text-gray-700">Status:</span>
              <span :class="['px-3 py-1 rounded-full text-sm font-semibold', getStatusBadgeClass(tokenInfo.tokens.access)]">
                {{ getStatusText(tokenInfo.tokens.access) }}
              </span>
            </div>
            <div class="flex items-center justify-between py-3 border-b border-gray-200" v-if="tokenInfo.tokens.access.expiresAt">
              <span class="font-semibold text-gray-700">Expires At:</span>
              <span class="text-gray-900">{{ formatDate(tokenInfo.tokens.access.expiresAt) }}</span>
            </div>
            <div class="flex items-center justify-between py-3 border-b border-gray-200" v-if="tokenInfo.tokens.access.timeUntilExpiry !== null">
              <span class="font-semibold text-gray-700">Time Until Expiry:</span>
              <span :class="['font-semibold', tokenInfo.tokens.access.isExpiringSoon ? 'text-yellow-600' : 'text-gray-900']">
                {{ tokenInfo.tokens.access.timeUntilExpiryFormatted }}
                <span v-if="tokenInfo.tokens.access.isExpiringSoon">⚠️</span>
              </span>
            </div>
            <div class="flex items-center justify-between py-3">
              <span class="font-semibold text-gray-700">Preview:</span>
              <code class="text-xs font-mono bg-gray-100 px-2 py-1 rounded text-indigo-600">{{ tokenInfo.tokens.access.preview }}</code>
            </div>
          </div>

          <div class="mt-4" v-if="tokenInfo.tokens.access.decoded">
            <h3 class="text-lg font-bold text-gray-700 mb-2">Token Details</h3>
            <div class="space-y-2">
              <div class="flex gap-2">
                <span class="font-semibold text-gray-600 min-w-[100px]">Subject:</span>
                <code class="text-xs font-mono bg-gray-100 px-2 py-1 rounded text-indigo-600">{{ tokenInfo.tokens.access.decoded.sub }}</code>
              </div>
              <div class="flex gap-2">
                <span class="font-semibold text-gray-600 min-w-[100px]">Issued At:</span>
                <span class="text-gray-900 font-medium">{{ formatDate(tokenInfo.tokens.access.decoded.iat) }}</span>
              </div>
              <div class="flex gap-2">
                <span class="font-semibold text-gray-600 min-w-[100px]">Expires At:</span>
                <span class="text-gray-900 font-medium">{{ formatDate(tokenInfo.tokens.access.decoded.exp) }}</span>
              </div>
            </div>
          </div>
        </section>

        <!-- Refresh Token Status -->
        <section class="bg-white rounded-xl p-4 mb-4 shadow-lg" v-if="tokenInfo.tokens">
          <h2 class="text-xl font-bold text-gray-800 mb-3 pb-2 border-b-2 border-indigo-500">Refresh Token</h2>
          <div class="space-y-2">
            <div class="flex items-center justify-between py-3 border-b border-gray-200">
              <span class="font-semibold text-gray-700">Available:</span>
              <span :class="['px-3 py-1 rounded-full text-sm font-semibold', tokenInfo.tokens.refresh.exists ? 'bg-green-500 text-white' : 'bg-red-500 text-white']">
                {{ tokenInfo.tokens.refresh.exists ? '✓ Yes' : '✗ No' }}
              </span>
            </div>
            <div class="flex items-center justify-between py-3" v-if="tokenInfo.tokens.refresh.exists">
              <span class="font-semibold text-gray-700">Preview:</span>
              <code class="text-xs font-mono bg-gray-100 px-2 py-1 rounded text-indigo-600">{{ tokenInfo.tokens.refresh.preview }}</code>
            </div>
          </div>
        </section>

        <!-- Refresh Status -->
        <section class="bg-white rounded-xl p-4 mb-4 shadow-lg" v-if="tokenInfo.refreshStatus">
          <h2 class="text-xl font-bold text-gray-800 mb-3 pb-2 border-b-2 border-indigo-500">Refresh Recommendation</h2>
          <div class="space-y-2">
            <div class="flex items-center justify-between py-3 border-b border-gray-200">
              <span class="font-semibold text-gray-700">Can Refresh:</span>
              <span :class="['px-3 py-1 rounded-full text-sm font-semibold', tokenInfo.refreshStatus.canRefresh ? 'bg-green-500 text-white' : 'bg-red-500 text-white']">
                {{ tokenInfo.refreshStatus.canRefresh ? '✓ Yes' : '✗ No' }}
              </span>
            </div>
            <div class="flex items-center justify-between py-3 border-b border-gray-200">
              <span class="font-semibold text-gray-700">Should Refresh:</span>
              <span :class="['px-3 py-1 rounded-full text-sm font-semibold', tokenInfo.refreshStatus.shouldRefresh ? 'bg-yellow-500 text-white' : 'bg-green-500 text-white']">
                {{ tokenInfo.refreshStatus.shouldRefresh ? '⚠ Yes' : '✓ No' }}
              </span>
            </div>
            <div class="flex items-center justify-between py-3">
              <span class="font-semibold text-gray-700">Reason:</span>
              <span class="text-gray-900">{{ tokenInfo.refreshStatus.reason }}</span>
            </div>
          </div>
        </section>

        <!-- Actions -->
        <section class="bg-white rounded-xl p-4 mb-4 shadow-lg">
          <h2 class="text-xl font-bold text-gray-800 mb-3 pb-2 border-b-2 border-indigo-500">Test Actions</h2>
          
          <div class="space-y-3">
            <div>
              <button 
                type="button"
                @click.prevent="testGetToken" 
                class="w-full px-6 py-3 bg-indigo-500 text-white rounded-lg font-semibold hover:bg-indigo-600 transition-all hover:-translate-y-0.5 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0"
                :disabled="actionLoading"
              >
                🎯 Test getToken() (Auto-Refresh)
              </button>
              <p class="mt-2 text-sm text-gray-600">
                Calls getToken() which automatically refreshes if token is expired or expiring soon
              </p>
            </div>

            <div>
              <button 
                type="button"
                @click.prevent="testManualRefresh" 
                class="w-full px-6 py-3 bg-yellow-500 text-white rounded-lg font-semibold hover:bg-yellow-600 transition-all hover:-translate-y-0.5 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0"
                :disabled="actionLoading || !tokenInfo.tokens?.refresh.exists"
              >
                🔄 Manual Refresh Token
              </button>
              <p class="mt-2 text-sm text-gray-600">
                Manually calls refreshToken() to force a refresh
              </p>
            </div>

            <div>
              <button 
                type="button"
                @click.prevent="testApiCall" 
                class="w-full px-6 py-3 bg-gray-600 text-white rounded-lg font-semibold hover:bg-gray-700 transition-all hover:-translate-y-0.5 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0"
                :disabled="actionLoading"
              >
                🚀 Test API Call with Token
              </button>
              <p class="mt-2 text-sm text-gray-600">
                Makes a test API call to /api/kinde/user with the current token
              </p>
            </div>

            <div>
              <button 
                type="button"
                @click.prevent="loadTokenInfo" 
                class="w-full px-6 py-3 bg-blue-500 text-white rounded-lg font-semibold hover:bg-blue-600 transition-all hover:-translate-y-0.5 hover:shadow-lg"
              >
                🔄 Refresh Info
              </button>
              <p class="mt-2 text-sm text-gray-600">
                Reload token information from server
              </p>
            </div>
          </div>
        </section>

        <!-- Action Results -->
        <section class="bg-white rounded-xl p-4 mb-4 shadow-lg" v-if="actionResult">
          <h2 class="text-xl font-bold text-gray-800 mb-3 pb-2 border-b-2 border-indigo-500">Action Result</h2>
          <div :class="['p-4 rounded-lg border-2', actionResult.success ? 'bg-green-50 border-green-500' : 'bg-red-50 border-red-500']">
            <h3 class="text-xl font-bold mb-2">{{ actionResult.success ? '✅ Success' : '❌ Error' }}</h3>
            <p class="mb-2"><strong>Action:</strong> {{ actionResult.action }}</p>
            <p v-if="actionResult.message" class="mb-2"><strong>Message:</strong> {{ actionResult.message }}</p>
            <div v-if="actionResult.data" class="mt-4">
              <strong>Response:</strong>
              <pre class="bg-gray-50 p-4 rounded mt-2 overflow-x-auto text-sm">{{ JSON.stringify(actionResult.data, null, 2) }}</pre>
            </div>
          </div>
        </section>

        <!-- User Info -->
        <section class="bg-white rounded-xl p-4 mb-4 shadow-lg" v-if="tokenInfo.tokens?.id.decoded">
          <h2 class="text-xl font-bold text-gray-800 mb-3 pb-2 border-b-2 border-indigo-500">User Information</h2>
          <div class="space-y-2">
            <div class="flex gap-2">
              <span class="font-semibold text-gray-600 min-w-[120px]">Email:</span>
              <span class="text-gray-900 font-medium">{{ tokenInfo.tokens.id.decoded.email }}</span>
            </div>
            <div class="flex gap-2">
              <span class="font-semibold text-gray-600 min-w-[120px]">Given Name:</span>
              <span class="text-gray-900 font-medium">{{ tokenInfo.tokens.id.decoded.given_name }}</span>
            </div>
            <div class="flex gap-2">
              <span class="font-semibold text-gray-600 min-w-[120px]">Family Name:</span>
              <span class="text-gray-900 font-medium">{{ tokenInfo.tokens.id.decoded.family_name }}</span>
            </div>
          </div>
        </section>

        <!-- Timestamp -->
        <div class="text-center text-white text-sm">
          Last Updated: {{ formatDate(tokenInfo.timestamp) }}
        </div>
      </template>

      <div v-else class="bg-white rounded-xl p-8 text-center shadow-lg">
        <p class="mb-3 text-gray-600">No token information available</p>
        <button type="button" @click.prevent="loadTokenInfo" class="px-6 py-3 bg-indigo-500 text-white rounded-lg font-semibold hover:bg-indigo-600 transition">Load Info</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'

const tokenInfo = ref<any>(null)
const loading = ref(false)
const error = ref<string | null>(null)
const actionLoading = ref(false)
const actionResult = ref<any>(null)
const config = ref<any>(null)

const loadTokenInfo = async (isAutoRefresh = false) => {
  // Don't show loading spinner for auto-refresh
  if (!isAutoRefresh) {
    loading.value = true
  }
  error.value = null
  
  try {
    const data = await $fetch('/api/kinde/debug/token-info')
    tokenInfo.value = data
    
    // Load config if not already loaded
    if (!config.value) {
      const configData = await $fetch('/api/kinde/debug/config')
      config.value = configData
    }
  } catch (e: any) {
    error.value = e.message || 'Failed to load token information'
  } finally {
    if (!isAutoRefresh) {
      loading.value = false
    }
  }
}

const testGetToken = async () => {
  // Save scroll position
  const scrollY = window.scrollY
  
  actionLoading.value = true
  actionResult.value = null
  try {
    const { getToken } = useKindeAuth()
    
    // Add small delay to ensure cookies are updated after refresh
    await new Promise(resolve => setTimeout(resolve, 100))
    
    const token = await getToken()
    
    actionResult.value = {
      success: true,
      action: 'getToken()',
      message: 'Token retrieved successfully (auto-refreshed if needed)',
      data: {
        tokenPreview: token ? `${token.substring(0, 30)}...` : null,
        tokenLength: token?.length
      }
    }
    
    // Reload token info to show updated expiry
    await loadTokenInfo(true)
    
    // Restore scroll position
    window.scrollTo(0, scrollY)
  } catch (e: any) {
    actionResult.value = {
      success: false,
      action: 'getToken()',
      message: e.message || 'Failed to get token'
    }
  } finally {
    actionLoading.value = false
  }
}

const testManualRefresh = async () => {
  // Save scroll position
  const scrollY = window.scrollY
  
  actionLoading.value = true
  actionResult.value = null
  try {
    const { refreshToken, getToken } = useKindeAuth()
    
    // Get old token and its expiry
    const oldToken = await getToken()
    const oldPreview = oldToken ? `${oldToken.substring(0, 30)}...` : null
    
    // Decode old token to get expiry
    let oldExpiry = null
    if (oldToken) {
      try {
        const parts = oldToken.split('.')
        if (parts.length === 3) {
          const payload = JSON.parse(atob(parts[1]))
          oldExpiry = payload.exp ? new Date(payload.exp * 1000).toLocaleString() : null
        }
      } catch (e) {
        // Ignore decode errors
      }
    }
    
    // Refresh
    const success = await refreshToken()
    
    // Get new token
    await new Promise(resolve => setTimeout(resolve, 100)) // Small delay
    const newToken = await getToken()
    const newPreview = newToken ? `${newToken.substring(0, 30)}...` : null
    
    // Decode new token to get expiry
    let newExpiry = null
    if (newToken) {
      try {
        const parts = newToken.split('.')
        if (parts.length === 3) {
          const payload = JSON.parse(atob(parts[1]))
          newExpiry = payload.exp ? new Date(payload.exp * 1000).toLocaleString() : null
        }
      } catch (e) {
        // Ignore decode errors
      }
    }
    
    const tokensMatch = oldToken === newToken
    
    actionResult.value = {
      success,
      action: 'refreshToken()',
      message: success ? (tokensMatch ? 'Token is already fresh - no refresh needed' : 'Token refreshed with new expiry time') : 'Refresh failed',
      data: { 
        refreshed: success,
        oldTokenPreview: oldPreview,
        newTokenPreview: newPreview,
        oldExpiry: oldExpiry,
        newExpiry: newExpiry,
        tokensMatch: tokensMatch,
        note: tokensMatch 
          ? '✅ Current token is still valid - Kinde returned the same token' 
          : '✅ Token updated with new expiry time'
      }
    }
    
    // Reload token info to show updated expiry
    if (success) {
      await loadTokenInfo(true)
    }
    
    // Restore scroll position
    window.scrollTo(0, scrollY)
  } catch (e: any) {
    actionResult.value = {
      success: false,
      action: 'refreshToken()',
      message: e.message || 'Failed to refresh token'
    }
  } finally {
    actionLoading.value = false
  }
}

const testApiCall = async () => {
  actionLoading.value = true
  actionResult.value = null
  try {
    const { getToken } = useKindeAuth()
    const token = await getToken()
    
    // Make a test API call
    const user = await $fetch('/api/kinde/user', {
      headers: {
        Authorization: `Bearer ${token}`
      }
    })
    
    actionResult.value = {
      success: true,
      action: 'API Call to /api/kinde/user',
      message: 'API call successful with current token',
      data: user
    }
  } catch (e: any) {
    actionResult.value = {
      success: false,
      action: 'API Call',
      message: e.message || 'API call failed'
    }
  } finally {
    actionLoading.value = false
  }
}

const getStatusBadgeClass = (token: any) => {
  if (token.isExpired) return 'bg-red-500 text-white'
  if (token.isExpiringSoon) return 'bg-yellow-500 text-white'
  return 'bg-green-500 text-white'
}

const getStatusText = (token: any) => {
  if (token.isExpired) return '❌ Expired'
  if (token.isExpiringSoon) return '⚠️ Expiring Soon'
  return '✅ Valid'
}

const formatDate = (dateString: string | null) => {
  if (!dateString) return 'N/A'
  return new Date(dateString).toLocaleString()
}

onMounted(() => {
  loadTokenInfo(false)
  // Auto-refresh every 10 seconds (pass true to indicate it's auto-refresh)
  setInterval(() => {
    // Save current scroll position
    const scrollY = window.scrollY
    loadTokenInfo(true).then(() => {
      // Restore scroll position after data loads
      window.scrollTo(0, scrollY)
    })
  }, 10000)
})
</script>

<style scoped>
/* Container */
.min-h-screen {
  min-height: 100vh;
}

.bg-gradient-to-br {
  background: linear-gradient(to bottom right, #6366f1, #a855f7, #9333ea);
}

.p-8 {
  padding: 2rem;
}

.max-w-7xl {
  max-width: 80rem;
}

.mx-auto {
  margin-left: auto;
  margin-right: auto;
}

/* Text */
.text-center {
  text-align: center;
}

.text-white {
  color: white;
}

.text-4xl {
  font-size: 2.25rem;
}

.text-2xl {
  font-size: 1.5rem;
}

.text-xl {
  font-size: 1.25rem;
}

.text-lg {
  font-size: 1.125rem;
}

.text-sm {
  font-size: 0.875rem;
}

.text-xs {
  font-size: 0.75rem;
}

.font-bold {
  font-weight: 700;
}

.font-semibold {
  font-weight: 600;
}

.font-medium {
  font-weight: 500;
}

.text-gray-800 {
  color: #1f2937;
}

.text-gray-900 {
  color: #111827;
}

.text-gray-700 {
  color: #374151;
}

.text-gray-600 {
  color: #4b5563;
}

.text-red-500 {
  color: #ef4444;
}

.text-yellow-600 {
  color: #ca8a04;
}

.text-indigo-600 {
  color: #4f46e5;
}

/* Spacing */
.mb-2 {
  margin-bottom: 0.5rem;
}

.mb-3 {
  margin-bottom: 0.75rem;
}

.mb-4 {
  margin-bottom: 1rem;
}

.mb-6 {
  margin-bottom: 1.5rem;
}

.mb-8 {
  margin-bottom: 2rem;
}

.mt-2 {
  margin-top: 0.5rem;
}

.mt-4 {
  margin-top: 1rem;
}

.mt-6 {
  margin-top: 1.5rem;
}

.py-3 {
  padding-top: 0.75rem;
  padding-bottom: 0.75rem;
}

.py-12 {
  padding-top: 3rem;
  padding-bottom: 3rem;
}

.px-2 {
  padding-left: 0.5rem;
  padding-right: 0.5rem;
}

.px-3 {
  padding-left: 0.75rem;
  padding-right: 0.75rem;
}

.px-6 {
  padding-left: 1.5rem;
  padding-right: 1.5rem;
}

.p-4 {
  padding: 1rem;
}

.p-6 {
  padding: 1.5rem;
}

.p-8 {
  padding: 2rem;
}

.p-12 {
  padding: 3rem;
}

.py-1 {
  padding-top: 0.25rem;
  padding-bottom: 0.25rem;
}

.pb-2 {
  padding-bottom: 0.5rem;
}

/* Cards */
.bg-white {
  background-color: white;
}

.rounded-xl {
  border-radius: 0.75rem;
}

.rounded-lg {
  border-radius: 0.5rem;
}

.rounded {
  border-radius: 0.25rem;
}

.rounded-full {
  border-radius: 9999px;
}

.shadow-lg {
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
}

/* Borders */
.border-b-2 {
  border-bottom-width: 2px;
}

.border-b {
  border-bottom-width: 1px;
}

.border-2 {
  border-width: 2px;
}

.border-indigo-500 {
  border-color: #6366f1;
}

.border-gray-200 {
  border-color: #e5e7eb;
}

.border-green-500 {
  border-color: #10b981;
}

.border-red-500 {
  border-color: #ef4444;
}

/* Backgrounds */
.bg-green-500 {
  background-color: #10b981;
}

.bg-red-500 {
  background-color: #ef4444;
}

.bg-yellow-500 {
  background-color: #f59e0b;
}

.bg-indigo-500 {
  background-color: #6366f1;
}

.bg-gray-600 {
  background-color: #4b5563;
}

.bg-blue-500 {
  background-color: #3b82f6;
}

.bg-gray-100 {
  background-color: #f3f4f6;
}

.bg-gray-50 {
  background-color: #f9fafb;
}

.bg-green-50 {
  background-color: #f0fdf4;
}

.bg-red-50 {
  background-color: #fef2f2;
}

/* Flex */
.flex {
  display: flex;
}

.items-center {
  align-items: center;
}

.justify-between {
  justify-content: space-between;
}

.gap-2 {
  gap: 0.5rem;
}

.gap-4 {
  gap: 1rem;
}

/* Grid */
.grid {
  display: grid;
}

.grid-cols-1 {
  grid-template-columns: repeat(1, minmax(0, 1fr));
}

@media (min-width: 768px) {
  .md\:grid-cols-2 {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

/* Space */
.space-y-2 > * + * {
  margin-top: 0.5rem;
}

.space-y-3 > * + * {
  margin-top: 0.75rem;
}

.space-y-6 > * + * {
  margin-top: 1.5rem;
}

/* Opacity */
.opacity-90 {
  opacity: 0.9;
}

.opacity-50 {
  opacity: 0.5;
}

/* Width */
.w-12 {
  width: 3rem;
}

.h-12 {
  height: 3rem;
}

.w-full {
  width: 100%;
}

.min-w-\[100px\] {
  min-width: 100px;
}

.min-w-\[120px\] {
  min-width: 120px;
}

/* Buttons */
button {
  border: none;
  cursor: pointer;
  transition: all 0.2s;
}

button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

button:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
}

button:disabled:hover {
  transform: none;
}

.bg-indigo-500:hover:not(:disabled) {
  background-color: #4f46e5;
}

.bg-yellow-500:hover:not(:disabled) {
  background-color: #ea580c;
}

.bg-gray-600:hover:not(:disabled) {
  background-color: #374151;
}

.bg-blue-500:hover:not(:disabled) {
  background-color: #2563eb;
}

/* Transitions */
.transition {
  transition-property: all;
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
  transition-duration: 150ms;
}

.transition-all {
  transition-property: all;
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
  transition-duration: 150ms;
}

/* Animation */
@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.animate-spin {
  animation: spin 1s linear infinite;
}

/* Spinner */
.w-12.h-12.border-4 {
  border-width: 4px;
  border-color: rgba(255, 255, 255, 0.3);
  border-top-color: white;
  border-radius: 50%;
}

/* Code */
.font-mono {
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
}

/* Overflow */
.overflow-x-auto {
  overflow-x: auto;
}

/* Cursor */
.cursor-not-allowed {
  cursor: not-allowed;
}

/* Pre */
pre {
  white-space: pre-wrap;
  word-wrap: break-word;
}

/* Result Box Text Colors */
.bg-green-50 h3,
.bg-green-50 p,
.bg-green-50 strong,
.bg-red-50 h3,
.bg-red-50 p,
.bg-red-50 strong {
  color: #1f2937;
}

.bg-green-50 pre,
.bg-red-50 pre {
  color: #1f2937;
}
</style>

