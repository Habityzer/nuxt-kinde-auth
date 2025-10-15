<script setup lang="ts">
const { isAuthenticated, user, login, logout, loading } = useKindeAuth()
</script>

<template>
  <div class="min-h-screen bg-gray-50 dark:bg-gray-900 py-12 px-4">
    <div class="max-w-4xl mx-auto">
      <div class="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
        <h1 class="text-3xl font-bold mb-2 text-gray-900 dark:text-white">
          @habityzer/nuxt-kinde-auth
        </h1>
        <p class="text-gray-600 dark:text-gray-400 mb-8">
          Playground for testing the Kinde authentication module
        </p>

        <!-- Loading State -->
        <div
          v-if="loading"
          class="flex items-center gap-3 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg"
        >
          <div class="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600" />
          <span class="text-blue-700 dark:text-blue-400">Loading...</span>
        </div>

        <!-- Not Authenticated -->
        <div
          v-else-if="!isAuthenticated"
          class="space-y-6"
        >
          <div class="p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
            <p class="text-yellow-800 dark:text-yellow-400">
              You are not authenticated. Please log in to continue.
            </p>
          </div>

          <button
            class="w-full sm:w-auto px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
            @click="login"
          >
            Log In with Kinde
          </button>
        </div>

        <!-- Authenticated -->
        <div
          v-else
          class="space-y-6"
        >
          <div class="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
            <p class="text-green-800 dark:text-green-400 font-medium">
              ✓ Successfully authenticated!
            </p>
          </div>

          <!-- User Info -->
          <div class="border dark:border-gray-700 rounded-lg p-6 space-y-4">
            <h2 class="text-xl font-semibold text-gray-900 dark:text-white">
              User Information
            </h2>
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label class="text-sm text-gray-500 dark:text-gray-400">Email</label>
                <p class="font-medium text-gray-900 dark:text-white">
                  {{ user?.email || 'N/A' }}
                </p>
              </div>
              <div>
                <label class="text-sm text-gray-500 dark:text-gray-400">Name</label>
                <p class="font-medium text-gray-900 dark:text-white">
                  {{ user?.given_name }} {{ user?.family_name }}
                </p>
              </div>
              <div class="sm:col-span-2">
                <label class="text-sm text-gray-500 dark:text-gray-400">User ID</label>
                <p class="font-mono text-sm text-gray-900 dark:text-white">
                  {{ user?.id }}
                </p>
              </div>
            </div>
          </div>

          <!-- Actions -->
          <div class="flex gap-3">
            <button
              class="px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg transition-colors"
              @click="logout"
            >
              Log Out
            </button>
          </div>
        </div>

        <!-- DevTools Instructions -->
        <div class="mt-8 p-4 bg-gray-100 dark:bg-gray-700 rounded-lg">
          <h3 class="font-semibold text-gray-900 dark:text-white mb-2">
            🛠️ DevTools Integration
          </h3>
          <p class="text-sm text-gray-600 dark:text-gray-300 mb-2">
            Press <kbd class="px-2 py-1 bg-white dark:bg-gray-800 rounded border">Shift + Option + D</kbd>
            to open Nuxt DevTools and see the <strong>Kinde Auth</strong> tab!
          </p>
          <p class="text-xs text-gray-500 dark:text-gray-400">
            The DevTools tab shows authentication status, token info, configuration, and allows testing.
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
kbd {
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
}
</style>
