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

