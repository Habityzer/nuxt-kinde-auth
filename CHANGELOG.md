## [1.0.5](https://github.com/Habityzer/nuxt-kinde-auth/compare/v1.0.4...v1.0.5) (2025-10-10)


### Bug Fixes

* **kinde:** add createError import to API routes for improved error handling ([997582d](https://github.com/Habityzer/nuxt-kinde-auth/commit/997582d23089d825f2ece8c12ed7dcdc35769810))

## [1.0.4](https://github.com/Habityzer/nuxt-kinde-auth/compare/v1.0.3...v1.0.4) (2025-10-10)


### Bug Fixes

* **kinde:** enhance post-login redirect logic to exclude public routes ([1a2417e](https://github.com/Habityzer/nuxt-kinde-auth/commit/1a2417ea1886b4873170b572b01f57da82721f28))

## [1.0.3](https://github.com/Habityzer/nuxt-kinde-auth/compare/v1.0.2...v1.0.3) (2025-10-10)


### Bug Fixes

* **kinde:** remove debug logging from API routes and middleware for cleaner code ([0523a82](https://github.com/Habityzer/nuxt-kinde-auth/commit/0523a82edc209ef3a52dfe62349e1825273cb2da))

## [1.0.1](https://github.com/Habityzer/nuxt-kinde-auth/compare/v1.0.0...v1.0.1) (2025-10-10)


### Bug Fixes

* **useKindeAuth:** improve cookie authentication checks and error handling ([01b38db](https://github.com/Habityzer/nuxt-kinde-auth/commit/01b38db63b9826bb399af408873e5603d0f00192))

# 1.0.0 (2025-10-10)


### Bug Fixes

* Address session management issues in nuxt-kinde-auth module, improving stability and user experience. Update dependencies and refine error handling for better performance. ([36864b9](https://github.com/Habityzer/nuxt-kinde-auth/commit/36864b9105dd7705401c877385c6d35aebee66ce))

# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- Initial release
- Kinde authentication module for Nuxt 4
- Server-side authentication with OAuth 2.0 Authorization Code flow
- Client-side composables for authentication state management
- Configurable middleware for route protection
- Support for public routes configuration
- Cookie-based session management
- Debug endpoints for token inspection
- TypeScript support with full type safety
- Comprehensive type checking

### Features
- `useKindeAuth()` composable for client-side authentication
- Server API routes for login, logout, callback, user info, and token management
- Global middleware for automatic route protection
- Configurable cookie options (httpOnly, secure, sameSite, path, maxAge)
- Post-login redirect URL persistence
- User profile fetching and caching
- Authentication state management with Vue refs

### Developer Experience
- Full TypeScript support
- Type-safe API with IntelliSense
- Debug mode with token inspection endpoint
- Console logging for development
- Automatic type declarations for Nuxt auto-imports
