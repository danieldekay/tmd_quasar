# Authentication API Contract

## GraphQL Mutation: login

**Endpoint**: `/graphql` (WPGraphQL with JWT Authentication plugin)

### Request

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

**Variables**:

```typescript
{
  input: {
    clientMutationId: 'tmd-frontend';
    username: string; // username or email
    password: string;
  }
}
```

**Validation**:

- `username` required, non-empty string, max 100 characters
- `password` required, non-empty string, max 255 characters
- `clientMutationId` required for mutation tracking

### Success Response (200)

```typescript
{
  data: {
    login: {
      authToken: string; // JWT token (use in Authorization: Bearer header)
      refreshToken: string; // Refresh token for extending session
      user: {
        id: string; // Base64 encoded GraphQL ID
        databaseId: number; // Numeric WordPress user ID
        name: string; // Display name
        email: string;
        roles: {
          nodes: Array<{
            name: string;
          }>;
        }
      }
    }
  }
}
```

### Error Responses

#### Invalid Credentials

```typescript
{
  errors: [
    {
      message: "The username or password you entered is incorrect";
      extensions: {
        category: "user";
      };
    }
  ];
}
```

#### GraphQL Errors

```typescript
{
  errors: [
    {
      message: string;
      extensions: {
        category: string; // "user", "internal", "validation"
      };
    }
  ];
}
```

## GraphQL Mutation: refreshJwtAuthToken

**Endpoint**: `/graphql`

### Request

```graphql
mutation RefreshAuthToken($input: RefreshJwtAuthTokenInput!) {
  refreshJwtAuthToken(input: $input) {
    authToken
  }
}
```

**Variables**:

```typescript
{
  input: {
    clientMutationId: 'tmd-frontend';
    jwtRefreshToken: string; // The refresh token from login
  }
}
```

### Success Response (200)

```typescript
{
  data: {
    refreshJwtAuthToken: {
      authToken: string; // New JWT token
    }
  }
}
```

### Error Response

```typescript
{
  errors: [
    {
      message: "Invalid refresh token";
      extensions: {
        category: "user";
      };
    }
  ];
}
```

## GraphQL Query: viewer (Token Verification)

**Endpoint**: `/graphql`

### Request

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

**Headers**:

- `Authorization: Bearer {authToken}` (required)

### Success Response (200)

```typescript
{
  data: {
    viewer: {
      id: string; // Base64 encoded GraphQL ID
      databaseId: number; // Numeric WordPress user ID
      name: string;
      email: string;
      roles: {
        nodes: Array<{
          name: string;
        }>;
      }
    }
  }
}
```

### Error Response (Unauthenticated)

```typescript
{
  data: {
    viewer: null;
  };
  errors: [
    {
      message: "Internal server error";
      extensions: {
        category: "internal";
      };
    }
  ];
}
```

}

````

## Password Reset (Redirect to Main TMD Site)

**Frontend Implementation**: Direct redirect to main TMD WordPress site for password reset.

### Reset URL

```typescript
const RESET_PASSWORD_URL = 'https://tangomarathons.com/wp-login.php?action=lostpassword';
````

**Rationale**: Password reset is handled by main TMD WordPress site, not via API. Frontend should redirect users to the WordPress password reset page.

### Implementation

```typescript
// In component or service
function redirectToPasswordReset() {
  window.location.href = 'https://tangomarathons.com/wp-login.php?action=lostpassword';
}
```

## Authentication Flow Summary

1. **Login**: Use `login` GraphQL mutation with username/password
2. **Store Tokens**: Save `authToken` and `refreshToken` to localStorage
3. **Authenticated Requests**: Include `Authorization: Bearer {authToken}` header
4. **Token Refresh**: Use `refreshJwtAuthToken` mutation with `refreshToken` when authToken expires
5. **Verify User**: Use `viewer` GraphQL query to check authentication status
6. **Logout**: Clear tokens from localStorage (client-side only, no server call needed)
7. **Password Reset**: Redirect to `https://tangomarathons.com/wp-login.php?action=lostpassword`

## Token Lifecycle

- **authToken**: Short-lived (typically 5 minutes), use for API requests
- **refreshToken**: Long-lived (30 days), use to get new authToken
- **Session Duration**: 30 days via refreshToken, matches specification requirement

## Security Notes

- All GraphQL requests to `/graphql` endpoint
- Tokens stored in localStorage (not cookies) for headless architecture
- JWT tokens are self-contained and stateless
- Backend validates tokens on each request
- Progressive delay protection implemented client-side (1s, 5s, 30s delays)
