# JWT Authentication Setup for TMD Quasar App

## Overview

This document outlines the JWT authentication implementation for the Tango Marathons Directory (TMD) Quasar frontend application. The authentication system integrates with WordPress users and provides secure access to protected API endpoints.

## What's Been Implemented

### Frontend Components

#### 1. Authentication Store (`src/stores/authStore.ts`)

- **Pinia store** for managing authentication state
- **User data management** with TypeScript interfaces
- **Token storage** with localStorage/sessionStorage support
- **Remember me functionality**
- **Automatic token refresh**
- **Role-based access control**

#### 2. Authentication Service (`src/services/authService.ts`)

- **JWT token management** (login, logout, refresh, validate)
- **User profile retrieval**
- **Password reset functionality**
- **User registration** (if enabled)
- **Error handling** with proper TypeScript types

#### 3. Route Guards (`src/router/guards.ts`)

- **Authentication guards** for protected routes
- **Role-based guards** for admin/editor access
- **Redirect handling** for unauthenticated users
- **Return URL preservation**

#### 4. UI Components

- **Login Page** (`src/pages/LoginPage.vue`)
  - Username/password form
  - Remember me checkbox
  - Forgot password dialog
  - Registration dialog
  - Error handling and validation
- **Unauthorized Page** (`src/pages/UnauthorizedPage.vue`)
  - Access denied messaging
  - Navigation options

#### 5. Updated Layout (`src/layouts/MainLayout.vue`)

- **User authentication status** in header
- **User avatar and menu** for authenticated users
- **Login button** for unauthenticated users
- **User-specific navigation** in sidebar
- **Logout functionality**

#### 6. API Integration (`src/boot/axios.ts`)

- **Automatic token injection** in requests
- **401 response handling** with automatic logout
- **Token refresh** on authentication errors
- **Redirect to login** for expired tokens

## WordPress Backend Requirements

### 1. Install JWT Authentication Plugin

You need to install and configure a JWT authentication plugin for WordPress. Recommended options:

#### Option A: JWT Authentication for WP REST API

```bash
# Install via Composer (recommended)
composer require firebase/php-jwt

# Or install manually from WordPress plugin directory
# Search for "JWT Authentication for WP REST API"
```

#### Option B: Simple JWT Authentication

```bash
# Install via Composer
composer require simple-jwt-authentication-for-wp-rest-api
```

### 2. WordPress Configuration

#### Add to `wp-config.php`:

```php
// JWT Authentication Configuration
define('JWT_AUTH_SECRET_KEY', 'your-secret-key-here');
define('JWT_AUTH_CORS_ENABLE', true);
```

#### Add to `.htaccess` (Apache):

```apache
RewriteEngine on
RewriteCond %{HTTP:Authorization} ^(.*)
RewriteRule ^(.*) - [e=HTTP_AUTHORIZATION:%1]
```

#### Add to `nginx.conf` (Nginx):

```nginx
location / {
    try_files $uri $uri/ /index.php?$args;

    # JWT Authentication headers
    add_header Access-Control-Allow-Headers "Authorization, Content-Type" always;
    add_header Access-Control-Allow-Origin "*" always;
}
```

### 3. WordPress Functions.php

Add to your theme's `functions.php` or custom plugin:

```php
// Enable JWT Authentication
add_filter('jwt_auth_cors_allow_headers', function($headers) {
    $headers[] = 'Authorization';
    return $headers;
});

// Allow JWT authentication for REST API
add_filter('rest_authentication_errors', function($result) {
    if (!empty($result)) {
        return $result;
    }
    if (!is_user_logged_in()) {
        return true;
    }
    return $result;
});

// Add CORS headers
add_action('rest_api_init', function() {
    remove_filter('rest_pre_serve_request', 'rest_send_cors_headers');
    add_filter('rest_pre_serve_request', function($value) {
        header('Access-Control-Allow-Origin: *');
        header('Access-Control-Allow-Methods: POST, GET, OPTIONS, PUT, DELETE');
        header('Access-Control-Allow-Credentials: true');
        header('Access-Control-Expose-Headers: Link');
        header('Access-Control-Allow-Headers: Authorization, Content-Type');
        return $value;
    });
}, 15);
```

### 4. API Endpoints Available

After JWT plugin installation, these endpoints will be available:

- `POST /wp-json/jwt-auth/v1/token` - Login
- `POST /wp-json/jwt-auth/v1/token/validate` - Validate token
- `POST /wp-json/jwt-auth/v1/token/refresh` - Refresh token
- `POST /wp-json/jwt-auth/v1/token/revoke` - Logout
- `GET /wp-json/wp/v2/users/me` - Get current user

## Testing the Implementation

### 1. Test Authentication Flow

1. **Start the Quasar app**: `pnpm dev`
2. **Navigate to login page**: `/login`
3. **Enter WordPress credentials**
4. **Verify successful login** and redirect
5. **Check user menu** in header
6. **Test logout functionality**

### 2. Test Protected Routes

1. **Add route guards** to protected pages
2. **Test unauthorized access** redirects to login
3. **Test authenticated access** works normally
4. **Test role-based access** for admin features

### 3. Test API Integration

1. **Verify token injection** in API requests
2. **Test 401 handling** with invalid tokens
3. **Test automatic logout** on token expiry
4. **Test token refresh** functionality

## Security Considerations

### 1. Token Security

- **Use strong secret keys** for JWT signing
- **Set appropriate token expiry** (24 hours recommended)
- **Implement token refresh** before expiry
- **Secure token storage** (httpOnly cookies preferred)

### 2. CORS Configuration

- **Restrict origins** to your app domain
- **Limit allowed methods** to necessary ones
- **Secure credentials** handling
- **Validate Authorization headers**

### 3. User Management

- **Strong password requirements**
- **Account lockout** for failed attempts
- **Email verification** for new accounts
- **Role-based permissions**

## Next Steps

### Phase 1: Basic Authentication ✅

- [x] JWT authentication infrastructure
- [x] Login/logout functionality
- [x] Route protection
- [x] User state management

### Phase 2: User Features

- [ ] User profile management
- [ ] Password change functionality
- [ ] Email verification
- [ ] Account settings

### Phase 3: Social Features

- [ ] Favorites/likes system
- [ ] User preferences
- [ ] Personal dashboard
- [ ] Activity feed

### Phase 4: Advanced Features

- [ ] OAuth integration (Google, Facebook)
- [ ] Two-factor authentication
- [ ] Admin user management
- [ ] Analytics and monitoring

## Troubleshooting

### Common Issues

1. **CORS Errors**: Check WordPress CORS configuration
2. **401 Unauthorized**: Verify JWT plugin installation
3. **Token Not Found**: Check secret key configuration
4. **User Not Found**: Verify WordPress user exists

### Debug Commands

```bash
# Test JWT endpoints
curl -X POST http://localhost:10014/wp-json/jwt-auth/v1/token \
  -H "Content-Type: application/json" \
  -d '{"username":"test","password":"test"}'

# Test user endpoint
curl -X GET http://localhost:10014/wp-json/wp/v2/users/me \
  -H "Authorization: Bearer YOUR_TOKEN"
```

## Support

For issues with:

- **Frontend implementation**: Check the test files and console logs
- **WordPress configuration**: Verify plugin installation and settings
- **API endpoints**: Test with curl commands above
- **CORS issues**: Check browser network tab and server logs
