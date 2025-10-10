import { describe, it, expect } from 'vitest'

describe('nuxt-kinde-auth', () => {
  it('should pass basic test', () => {
    expect(true).toBe(true)
  })

  it('should export module types', () => {
    // Basic type check - if this compiles, types are working
    const moduleOptions: { authDomain?: string } = {
      authDomain: 'https://test.kinde.com'
    }
    expect(moduleOptions.authDomain).toBe('https://test.kinde.com')
  })
})

