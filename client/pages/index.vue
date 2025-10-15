<script setup lang="ts">
import { useDevtoolsClient } from '@nuxt/devtools-kit/iframe-client'
import { ref, onMounted, computed } from 'vue'

interface TokenInfo {
  authenticated: boolean
  hasTokens: boolean
  user?: Record<string, unknown>
  tokens?: {
    access: {
      isExpired: boolean
      isExpiringSoon: boolean
      timeUntilExpiry: number | null
      timeUntilExpiryFormatted: string | null
    }
  }
}

interface Config {
  cookie?: {
    prefix?: string
    maxAge?: number
    secure?: boolean
  }
  redirectURL?: string
  logoutRedirectURL?: string
}

interface ActionResult {
  success: boolean
  action: string
  message: string
  data?: Record<string, unknown>
}

const client = useDevtoolsClient()
const tokenInfo = ref<TokenInfo | null>(null)
const config = ref<Config | null>(null)
const loading = ref(false)
const error = ref<string | null>(null)
const actionLoading = ref(false)
const actionResult = ref<ActionResult | null>(null)

const loadTokenInfo = async () => {
  if (!client.value) return
  loading.value = true
  error.value = null
  try {
    // Use absolute paths to ensure proper resolution from iframe
    const baseUrl = window.parent.location.origin
    const [tokenData, configData] = await Promise.all([
      $fetch(`${baseUrl}/api/kinde/debug/token-info`, {
        credentials: 'include',
        headers: {
          'Cache-Control': 'no-cache',
        },
      }),
      $fetch(`${baseUrl}/api/kinde/debug/config`, {
        credentials: 'include',
        headers: {
          'Cache-Control': 'no-cache',
        },
      }),
    ])
    tokenInfo.value = tokenData
    config.value = configData
  }
  catch (e: unknown) {
    console.error('[Kinde Auth] Failed to load:', e)
    error.value = e instanceof Error ? e.message : 'Failed to load authentication data'
  }
  finally {
    loading.value = false
  }
}

const testGetToken = async () => {
  actionLoading.value = true
  actionResult.value = null
  try {
    const baseUrl = window.parent.location.origin
    const response = await $fetch<{ token: string }>(`${baseUrl}/api/kinde/token`, {
      credentials: 'include',
      headers: {
        'Cache-Control': 'no-cache',
      },
    })
    await loadTokenInfo()
    const token = response?.token
    actionResult.value = {
      success: !!token,
      action: 'Get Token',
      message: token ? 'Token retrieved successfully' : 'No token available',
      data: token
        ? {
            tokenPreview: token.substring(0, 50) + '...',
            tokenLength: token.length,
            fullToken: token,
          }
        : null,
    }
  }
  catch (e: unknown) {
    actionResult.value = {
      success: false,
      action: 'Get Token',
      message: e instanceof Error ? e.message : 'Failed to retrieve token',
    }
  }
  finally {
    actionLoading.value = false
  }
}

const testManualRefresh = async () => {
  actionLoading.value = true
  actionResult.value = null
  try {
    const baseUrl = window.parent.location.origin
    const response = await $fetch<{ success: boolean, message?: string, [key: string]: unknown }>(`${baseUrl}/api/kinde/refresh`, {
      credentials: 'include',
      headers: {
        'Cache-Control': 'no-cache',
      },
    })
    await loadTokenInfo()
    const isSuccess = response?.success === true
    actionResult.value = {
      success: isSuccess,
      action: 'Refresh Token',
      message: response?.message || (isSuccess ? 'Token refreshed successfully' : 'Refresh failed'),
      data: response,
    }
  }
  catch (e: unknown) {
    actionResult.value = {
      success: false,
      action: 'Refresh Token',
      message: e instanceof Error ? e.message : 'Failed to refresh token',
    }
  }
  finally {
    actionLoading.value = false
  }
}

const testApiCall = async () => {
  actionLoading.value = true
  actionResult.value = null
  try {
    const baseUrl = window.parent.location.origin
    const user = await $fetch(`${baseUrl}/api/kinde/user`, {
      credentials: 'include',
      headers: {
        'Cache-Control': 'no-cache',
      },
    })
    actionResult.value = {
      success: true,
      action: 'API Call',
      message: 'User data retrieved successfully',
      data: user,
    }
  }
  catch (e: unknown) {
    actionResult.value = {
      success: false,
      action: 'API Call',
      message: e instanceof Error ? e.message : 'Failed to make API call',
    }
  }
  finally {
    actionLoading.value = false
  }
}

const statusBadge = computed(() => {
  if (!tokenInfo.value) return { color: 'gray', text: 'Unknown', icon: 'carbon-help' }
  if (!tokenInfo.value.authenticated) return { color: 'red', text: 'Not Authenticated', icon: 'carbon-locked' }
  if (!tokenInfo.value.hasTokens) return { color: 'yellow', text: 'Missing Tokens', icon: 'carbon-warning' }
  const access = tokenInfo.value.tokens?.access
  if (access?.isExpired) return { color: 'red', text: 'Expired', icon: 'carbon-close' }
  if (access?.isExpiringSoon) return { color: 'yellow', text: 'Expiring Soon', icon: 'carbon-time' }
  return { color: 'green', text: 'Authenticated', icon: 'carbon-checkmark-filled' }
})

onMounted(() => {
  loadTokenInfo()
  setInterval(loadTokenInfo, 30000)
})
</script>

<template>
  <div class="h-screen overflow-auto n-bg-base">
    <div class="p-4 max-w-6xl mx-auto">
      <!-- Header -->
      <div class="flex items-center justify-between mb-4 pb-3 border-b n-border-base">
        <div>
          <h1 class="text-xl font-bold flex items-center gap-2">
            <div class="i-carbon-user-identification text-primary" />
            Kinde Authentication
          </h1>
          <p class="text-xs opacity-60 mt-1">
            Monitor authentication status and test integration
          </p>
        </div>
        <div>
          <NTip
            v-if="client"
            n="green"
            icon="carbon-checkmark"
            class="text-xs"
          >
            Connected to DevTools
          </NTip>
        </div>
      </div>

      <!-- Loading -->
      <div
        v-if="loading"
        class="flex items-center justify-center gap-2 py-12"
      >
        <div class="i-carbon-circle-dash animate-spin text-xl" />
        <span class="text-sm opacity-75">Loading authentication data...</span>
      </div>

      <!-- Error -->
      <NCard
        v-else-if="error"
        class="mb-4 p-4"
      >
        <NTip
          n="red"
          icon="carbon-warning-alt"
        >
          <strong>Error:</strong> {{ error }}
        </NTip>
        <NButton
          class="mt-3"
          icon="carbon-renew"
          n="solid-green"
          @click="loadTokenInfo"
        >
          Retry
        </NButton>
      </NCard>

      <!-- Main Content -->
      <template v-else-if="tokenInfo">
        <!-- Status Overview -->
        <div class="grid grid-cols-2 gap-3 mb-4">
          <!-- Auth Status Card -->
          <NCard class="flex items-center justify-between p-4">
            <div class="flex items-center gap-3">
              <div :class="['text-2xl', 'i-' + statusBadge.icon, 'text-' + statusBadge.color]" />
              <div>
                <div class="text-xs opacity-60 mb-0.5">
                  Authentication Status
                </div>
                <div class="font-semibold">
                  {{ statusBadge.text }}
                </div>
              </div>
            </div>
            <NBadge
              :n="statusBadge.color"
              class="ml-2"
            >
              {{ tokenInfo.authenticated ? 'Active' : 'Inactive' }}
            </NBadge>
          </NCard>

          <!-- Token Expiry Card -->
          <NCard
            v-if="tokenInfo.tokens?.access"
            class="p-4"
          >
            <div class="flex items-center gap-3">
              <div
                class="i-carbon-time text-2xl"
                :class="tokenInfo.tokens.access.isExpiringSoon ? 'text-yellow' : 'text-primary'"
              />
              <div class="flex-1">
                <div class="text-xs opacity-60 mb-0.5">
                  Token Expiry
                </div>
                <div class="font-mono text-sm font-semibold">
                  {{ tokenInfo.tokens.access.timeUntilExpiryFormatted || 'N/A' }}
                </div>
                <div
                  class="text-xs mt-1"
                  :class="tokenInfo.tokens.access.isExpiringSoon ? 'text-yellow' : 'text-green'"
                >
                  {{ tokenInfo.tokens.access.isExpiringSoon ? '⚠️ Consider refreshing' : '✓ Token is fresh' }}
                </div>
              </div>
            </div>
          </NCard>

          <!-- No Token Card -->
          <NCard
            v-else
            class="p-4"
          >
            <div class="flex items-center gap-3">
              <div class="i-carbon-information text-2xl opacity-50" />
              <div>
                <div class="text-xs opacity-60 mb-0.5">
                  Token Status
                </div>
                <div class="text-sm opacity-75">
                  No active tokens
                </div>
              </div>
            </div>
          </NCard>
        </div>

        <!-- User Info (if authenticated) -->
        <NCard
          v-if="tokenInfo.user"
          class="mb-4 p-4"
        >
          <div class="flex items-center gap-2 mb-3 pb-3 border-b n-border-base">
            <div class="i-carbon-user text-base text-primary" />
            <span class="font-semibold">User Information</span>
          </div>
          <div class="grid grid-cols-3 gap-4 text-sm">
            <div>
              <div class="text-xs opacity-50 mb-1.5">
                Email
              </div>
              <div class="font-medium">
                {{ tokenInfo.user.email || 'N/A' }}
              </div>
            </div>
            <div>
              <div class="text-xs opacity-50 mb-1.5">
                Name
              </div>
              <div class="font-medium">
                {{ tokenInfo.user.given_name }} {{ tokenInfo.user.family_name }}
              </div>
            </div>
            <div>
              <div class="text-xs opacity-50 mb-1.5">
                User ID
              </div>
              <div
                class="font-mono text-xs truncate"
                :title="tokenInfo.user.id"
              >
                {{ tokenInfo.user.id }}
              </div>
            </div>
          </div>
        </NCard>

        <!-- Configuration -->
        <NCard class="mb-4 p-4">
          <div class="flex items-center gap-2 mb-3 pb-3 border-b n-border-base">
            <div class="i-carbon-settings text-base text-primary" />
            <span class="font-semibold">Configuration</span>
          </div>
          <div class="space-y-2 text-sm">
            <div class="flex items-center justify-between py-2 border-b n-border-base">
              <span class="opacity-60">Cookie Prefix</span>
              <code class="text-xs px-2 py-1 rounded n-bg-active font-mono">{{ config?.cookie?.prefix || '(none)' }}</code>
            </div>
            <div class="flex items-center justify-between py-2 border-b n-border-base">
              <span class="opacity-60">Cookie Max Age</span>
              <span class="font-medium">{{ config?.cookie?.maxAge ? `${Math.floor(config.cookie.maxAge / 86400)} days` : 'N/A' }}</span>
            </div>
            <div class="flex items-center justify-between py-2 border-b n-border-base">
              <span class="opacity-60">Secure Cookie</span>
              <NBadge
                :n="config?.cookie?.secure ? 'green' : 'gray'"
                class="text-xs"
              >
                {{ config?.cookie?.secure ? 'Yes' : 'No' }}
              </NBadge>
            </div>
            <div class="flex items-center justify-between py-2 border-b n-border-base">
              <span class="opacity-60">Redirect URL</span>
              <code class="text-xs px-2 py-1 rounded n-bg-active font-mono truncate max-w-md">{{ config?.redirectURL || 'N/A' }}</code>
            </div>
            <div class="flex items-center justify-between py-2">
              <span class="opacity-60">Logout Redirect</span>
              <code class="text-xs px-2 py-1 rounded n-bg-active font-mono truncate max-w-md">{{ config?.logoutRedirectURL || 'N/A' }}</code>
            </div>
          </div>
        </NCard>

        <!-- Test Actions -->
        <NCard class="p-4">
          <div class="flex items-center gap-2 mb-3 pb-3 border-b n-border-base">
            <div class="i-carbon-code text-base text-primary" />
            <span class="font-semibold">Test Actions</span>
          </div>

          <div class="flex items-center gap-2 mb-3">
            <NButton
              :disabled="actionLoading"
              n="solid-sm"
              @click="testGetToken"
            >
              <div class="i-carbon-token mr-1" />
              Get Token
            </NButton>
            <NButton
              :disabled="actionLoading"
              n="green-solid-sm"
              @click="testManualRefresh"
            >
              <div class="i-carbon-renew mr-1" />
              Refresh Token
            </NButton>
            <NButton
              :disabled="actionLoading"
              n="blue-solid-sm"
              @click="testApiCall"
            >
              <div class="i-carbon-api mr-1" />
              Test API
            </NButton>
          </div>

          <!-- Action Result -->
          <div
            v-if="actionResult"
            class="mt-3"
          >
            <NTip
              :n="actionResult.success ? 'green' : 'red'"
              :icon="actionResult.success ? 'carbon-checkmark-filled' : 'carbon-warning-alt'"
            >
              <div>
                <strong class="text-sm">{{ actionResult.action }}</strong>
                <p class="text-xs opacity-75 mt-0.5">
                  {{ actionResult.message }}
                </p>
              </div>
            </NTip>
            <pre
              v-if="actionResult?.data"
              class="text-xs mt-2 p-2 rounded n-bg-active overflow-auto max-h-32"
            >{{ JSON.stringify(actionResult.data, null, 2) }}</pre>
          </div>
        </NCard>

        <!-- Footer -->
        <div class="mt-4 pt-3 border-t n-border-base text-center">
          <p class="text-xs opacity-40">
            @habityzer/nuxt-kinde-auth • v1.1.0
          </p>
        </div>
      </template>
    </div>
  </div>
</template>
