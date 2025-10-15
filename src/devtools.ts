import { existsSync } from 'node:fs'
import type { Nuxt } from 'nuxt/schema'
import type { Resolver } from '@nuxt/kit'

const DEVTOOLS_UI_ROUTE = '/__kinde-auth'

export function setupDevToolsUI(nuxt: Nuxt, resolver: Resolver) {
  const clientPath = resolver.resolve('../dist/client')

  // Serve the built DevTools UI
  if (existsSync(clientPath)) {
    nuxt.hook('vite:serverCreated', async (server) => {
      const sirv = await import('sirv').then(r => r.default || r)
      server.middlewares.use(
        DEVTOOLS_UI_ROUTE,
        sirv(clientPath, { dev: true, single: true }),
      )
    })
  }
  else {
    console.warn('[nuxt-kinde-auth] DevTools client not found. Run `pnpm client:build` to build it.')
  }

  // Register DevTools tab
  nuxt.hook('devtools:customTabs', (tabs) => {
    tabs.push({
      name: 'kinde-auth',
      title: 'Kinde Auth',
      icon: 'carbon:user-identification',
      view: {
        type: 'iframe',
        src: DEVTOOLS_UI_ROUTE,
      },
    })
  })
}
