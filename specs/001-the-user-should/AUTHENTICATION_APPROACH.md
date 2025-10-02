# TMD Authentication Approach

## Decision: Use Existing WPGraphQL Authentication

**Date**: 2025-10-01  
**Status**: Adopted

### Summary

TMD Quasar will use the **existing WPGraphQL with JWT Authentication** plugin infrastructure rather than creating new REST API v3 endpoints. This approach leverages proven, working authentication already implemented in both frontend and backend.

### Rationale

1. **Already Implemented**: The backend (tmd_core) already has WPGraphQL with JWT Authentication plugin installed and configured
2. **Frontend Integration Exists**: src/services/authService.ts already implements GraphQL authentication
3. **No Backend Development Needed**: Avoids creating duplicate authentication endpoints in tmd_core
4. **Industry Standard**: WPGraphQL + JWT is a well-documented WordPress headless pattern
5. **Token Refresh Support**: Built-in refreshJwtAuthToken mutation for 30-day sessions

### Architecture

```
┌─────────────────┐                    ┌──────────────────┐
│  TMD Quasar     │                    │   TMD Core       │
│  (Frontend)     │                    │   (WordPress)    │
├─────────────────┤                    ├──────────────────┤
│                 │                    │                  │
│ LoginForm.vue   │◄──GraphQL─────────►│  /graphql        │
│                 │   mutations        │  (WPGraphQL)     │
│ authService.ts  │                    │                  │
│ authStore.ts    │                    │ JWT Auth Plugin  │
│ sessionService  │                    │                  │
│                 │                    │                  │
│ localStorage:   │                    │ Validates:       │
│ - authToken     │                    │ - JWT tokens     │
│ - refreshToken  │                    │ - User accounts  │
│ - user data     │                    │ - Permissions    │
└─────────────────┘                    └──────────────────┘
```

### API Endpoints

#### Login

```graphql
mutation LoginUser($input: LoginInput!) {
  login(input: $input) {
    authToken
    refreshToken
    user {
      id
      databaseId
      name
      email
      roles {
        nodes {
          name
        }
      }
    }
  }
}
```

#### Token Refresh

```graphql
mutation RefreshAuthToken($input: RefreshJwtAuthTokenInput!) {
  refreshJwtAuthToken(input: $input) {
    authToken
  }
}
```

#### Verification

```graphql
query GetCurrentUser {
  viewer {
    id
    databaseId
    name
    email
    roles {
      nodes {
        name
      }
    }
  }
}
```

### Implementation Status

#### ✅ Already Implemented

- GraphQL authentication mutations/queries (backend)
- authService.ts with login/refresh/verify (frontend)
- Apollo Client configuration for GraphQL
- JWT token storage in localStorage
- Token refresh mechanism

#### 🔄 Needs Improvement

- Session persistence service (sessionService.ts)
- Progressive brute force protection
- Auth state management in Pinia store
- useAuth composable for reactive state
- LoginForm component with Quasar
- Router guards for protected routes
- Session expiration handling
- Error handling and user feedback

#### 📝 To Be Added

- Comprehensive test coverage
- Integration tests for auth flow
- Component tests for UI
- E2E tests for complete user journeys
- Documentation updates

### Migration from Original Plan

**Original Plan**: Create REST endpoints at `/wp-json/tmd/v3/auth/*`  
**New Approach**: Use existing GraphQL at `/graphql`

**Changes Required**:

- ✅ Update contracts/auth-api.md to document GraphQL mutations
- ✅ Update research.md to reflect GraphQL decision
- ✅ Update copilot-instructions.md with GraphQL patterns
- ✅ Update tasks.md to reference GraphQL instead of REST
- ✅ Update quickstart.md with GraphQL examples
- ⏳ Update test files to test GraphQL integration
- ⏳ Enhance existing authService instead of rewriting

### Security Considerations

1. **Token Storage**: localStorage (acceptable for SPA, tokens are short-lived)
2. **Token Lifetime**: authToken ~5min, refreshToken 30 days
3. **HTTPS Required**: Production must use HTTPS
4. **CORS Configuration**: Backend properly configured for frontend domain
5. **Progressive Delays**: Client-side delays (1s, 5s, 30s) for failed attempts
6. **Backend Rate Limiting**: Handled by WPGraphQL JWT Authentication plugin

### Testing Strategy

- **Unit Tests**: Mock Apollo Client responses
- **Integration Tests**: Test full auth flow with mock GraphQL server
- **E2E Tests**: Test against real development backend
- **Contract Tests**: Validate GraphQL schema and responses

### References

- **Backend**: `tmd_core/src/API/V3/Traits/JWTAuthenticationTrait.php`
- **Frontend**: `tmd_quasar/src/services/authService.ts`
- **GraphQL Mutations**: `tmd_quasar/src/services/graphql/auth.ts`
- **Apollo Setup**: `tmd_quasar/src/boot/apollo.ts`

### Decision Log

- **2025-10-01**: Discovered existing WPGraphQL authentication during implementation
- **2025-10-01**: Decided to enhance existing solution rather than create new REST endpoints
- **2025-10-01**: Updated all specification documents to reflect GraphQL approach
- **2025-10-01**: Confirmed with user to maintain and improve existing GraphQL auth
