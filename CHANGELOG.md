# Changelog

All notable changes to this project will be documented in this file.

## [Unreleased]

### Changed

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
