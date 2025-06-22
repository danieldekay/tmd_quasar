# JWT Authentication Setup

This document describes the JWT authentication system implemented in the TMD Quasar frontend using GraphQL.

## Overview

The authentication system uses GraphQL mutations and queries to handle user authentication with a WordPress backend. The system includes:

- User login with username/password
- JWT token validation
- User logout
- Token refresh
- Current user information retrieval

## GraphQL Endpoints

The frontend expects the following GraphQL mutations and queries to be available on your WordPress GraphQL endpoint:

### Login Mutation

```graphql
mutation LoginUser($input: LoginInput!) {
  login(input: $input) {
    authToken
    user {
      id
      name
      email
      roles {
        nodes {
          name
          key
        }
      }
    }
  }
}
```

### Refresh Token Mutation

```graphql
mutation RefreshAuthToken($input: RefreshJwtAuthTokenInput!) {
  refreshJwtAuthToken(input: $input) {
    authToken
  }
}
```

### Get Current User Query

```graphql
query GetCurrentUser {
  viewer {
    id
    name
    email
    roles {
      nodes {
        name
        key
      }
    }
    avatar {
      url
    }
    url
    description
    slug
  }
}
```

**Note:** The WPGraphQL JWT Authentication plugin does not provide logout or token validation mutations. Logout is handled by clearing the local token, and token validation is done by attempting to fetch the current user.

## WordPress Backend Requirements

### 1. GraphQL Plugin

Install and configure a WordPress GraphQL plugin that supports JWT authentication:

- **WPGraphQL** (recommended): https://wordpress.org/plugins/wp-graphql/
- **WPGraphQL for JWT Authentication**: https://github.com/wp-graphql/wp-graphql-jwt-authentication

### 2. JWT Authentication Setup

1. Install the JWT Authentication plugin:

   ```bash
   composer require wp-graphql/wp-graphql-jwt-authentication
   ```

2. Add the following to your `wp-config.php`:

   ```php
   define('GRAPHQL_JWT_AUTH_SECRET_KEY', 'your-secret-key-here');
   define('GRAPHQL_JWT_AUTH_CORS_ENABLE', true);
   ```

3. Configure CORS headers in your `.htaccess` or server configuration:
   ```apache
   <IfModule mod_headers.c>
       Header always set Access-Control-Allow-Origin "*"
       Header always set Access-Control-Allow-Methods "POST, GET, OPTIONS, DELETE, PUT"
       Header always set Access-Control-Allow-Headers "X-Requested-With, Content-Type, Origin, Authorization, Accept, Client-Security-Token, Accept-Encoding"
   </IfModule>
   ```

### 3. Environment Configuration

Set the following environment variables in your frontend:

```env
WORDPRESS_API_URL=http://localhost:10014
```

The GraphQL endpoint will be automatically constructed as: `${WORDPRESS_API_URL}/graphql`

## Frontend Implementation

### Apollo Client Setup

The frontend uses Apollo Client for GraphQL communication. The client is configured in `src/boot/apollo.ts` with:

- Automatic token injection in request headers
- Error handling for authentication failures
- Cache management

### Authentication Service

The `AuthService` class (`src/services/authService.ts`) provides the following methods:

- `login(credentials)`: Authenticate user and return JWT token
- `logout(token)`: Invalidate JWT token
- `validateToken(token)`: Check if token is valid
- `getCurrentUser(token)`: Get current user information
- `refreshToken(refreshToken)`: Refresh JWT token

### State Management

User authentication state is managed using Pinia store (`src/stores/authStore.ts`) with:

- User information storage
- Token management
- Authentication status tracking
- Automatic token refresh

### Route Guards

Protected routes are secured using Vue Router guards that:

- Check authentication status
- Redirect unauthenticated users to login
- Handle token expiration

## Usage Examples

### Login

```typescript
import { useAuthStore } from '@/stores/authStore';

const authStore = useAuthStore();

try {
  await authStore.login({
    username: 'user@example.com',
    password: 'password123',
  });
  // User is now logged in
} catch (error) {
  console.error('Login failed:', error);
}
```

### Check Authentication Status

```typescript
const authStore = useAuthStore();

if (authStore.isAuthenticated) {
  console.log('User is logged in:', authStore.user);
} else {
  console.log('User is not authenticated');
}
```

### Logout

```typescript
const authStore = useAuthStore();
await authStore.logout();
```

## Security Considerations

1. **Token Storage**: JWT tokens are stored in localStorage. Consider using httpOnly cookies for enhanced security in production.

2. **Token Expiration**: Implement automatic token refresh before expiration.

3. **HTTPS**: Always use HTTPS in production to secure token transmission.

4. **CORS**: Configure CORS properly to prevent unauthorized access.

5. **Rate Limiting**: Implement rate limiting on authentication endpoints.

## Testing

The authentication system includes comprehensive tests in `src/services/__tests__/authService.test.ts` covering:

- Successful login scenarios
- Failed authentication attempts
- Token validation
- User information retrieval
- Logout functionality

Run tests with:

```bash
pnpm test src/services/__tests__/authService.test.ts
```

## Troubleshooting

### Common Issues

1. **CORS Errors**: Ensure your WordPress server is configured to allow requests from your frontend domain.

2. **GraphQL Endpoint Not Found**: Verify that the GraphQL plugin is properly installed and the endpoint is accessible.

3. **JWT Secret Key**: Make sure the `GRAPHQL_JWT_AUTH_SECRET_KEY` is properly set in your WordPress configuration.

4. **Token Validation Failures**: Check that the token format matches what the WordPress JWT plugin expects.

### Debug Mode

Enable debug logging by setting the environment variable:

```env
DEBUG=true
```

This will log authentication requests and responses to the browser console.

## Next Steps

1. Install and configure the WordPress GraphQL plugin
2. Set up JWT authentication on the WordPress backend
3. Test the authentication flow
4. Implement additional security measures as needed
5. Add user registration functionality if required
