# Changelog

All notable changes to this project will be documented in this file.

## [Unreleased] - 2025-07-04

### Fixed

- Robust error handling for Apollo token refresh: gracefully handles backend 500 errors and missing/null data, preventing app crashes and infinite refresh loops.
- Improved event and event series title rendering: all pages now correctly display HTML titles from the new API format, with fallback for legacy string titles.
- Defensive handling for backend plugin errors: frontend now shows user-friendly messages and clears tokens on refresh failure, even if backend plugin returns a 500 error.
- TypeScript and Quasar code quality: removed all remaining usages of `any` in token refresh logic, added strict type guards, and ensured all optional properties are handled safely.
- Cleaned up unused imports and variables (e.g., removed all Leaflet code and related linter errors).

### Changed

- All authentication and session expiration flows now clear cookies and redirect to login on refresh failure, with optional session-expired notification for users.
- **BREAKING**: Migrated authentication from REST API to GraphQL
  - Replaced REST endpoints with GraphQL mutations and queries
  - Updated auth service to use Apollo Client instead of axios
  - Modified GraphQL schema expectations for login, logout, token validation, and user queries
  - Updated tests to mock GraphQL operations instead of REST API calls

### Added

- Apollo Client integration for GraphQL communication
- GraphQL types and mutations for authentication (`src/services/graphql/auth.ts`)
- Apollo Client boot file with automatic token injection
- GraphQL-based authentication service with proper error handling
- Updated documentation for GraphQL authentication setup

### Technical Details

- Added `@apollo/client` and `graphql` dependencies
- Created Apollo Client configuration with auth link for token injection
- Implemented GraphQL mutations for login, logout, token refresh, and validation
- Added GraphQL query for current user information
- Updated all authentication tests to work with GraphQL mocks
- Maintained backward compatibility for user interface and store usage

## [0.0.1] - 2024-01-XX

### Added

- Initial JWT authentication system implementation
- Pinia store for user state management
- Authentication service with REST API integration
- Route guards for protected pages
- Login and unauthorized pages
- User authentication status in main layout
- Comprehensive test coverage for authentication
- Documentation for JWT setup and WordPress configuration

## [0.0.2] - 2024-06-23

### Added

- Login page now links directly to WordPress password reset and registration pages, removing internal dialogs.
- Event list displays event edition as a numeric badge preceding the event title.

### Changed

- Bumped application version to 0.0.2.
