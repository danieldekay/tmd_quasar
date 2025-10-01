# Data Model: TMD Authentication & Session Management

## Core Entities

### User

**Purpose**: Represents an authenticated TMD user  
**Source**: WordPress TMD database via REST API

```typescript
type User = {
  id: number;
  username: string;
  email: string;
  displayName: string;
  roles: readonly string[];
  avatar?: string;
  lastLogin?: string; // ISO date string
  isActive: boolean;
};
```

**Validation Rules**:

- `id` must be positive integer
- `username` must be non-empty string, max 60 characters
- `email` must be valid email format
- `displayName` must be non-empty string, max 100 characters
- `roles` must contain at least one role from TMD role system
- `lastLogin` must be valid ISO date string or undefined
- `isActive` must be boolean (controls account status)

### Session

**Purpose**: Represents an active user session with JWT token  
**Source**: Client-side creation, server-side validation

```typescript
type Session = {
  token: string;
  userId: number;
  expiresAt: string; // ISO date string
  createdAt: string; // ISO date string
  deviceInfo?: {
    userAgent: string;
    platform: string;
  };
  isValid: boolean;
};
```

**Validation Rules**:

- `token` must be valid JWT string
- `userId` must match existing user ID
- `expiresAt` must be future date, max 30 days from creation
- `createdAt` must be valid ISO date string
- `deviceInfo` is optional but if present, must have non-empty strings
- `isValid` computed based on token validity and expiration

### AuthState

**Purpose**: Represents current authentication status in application  
**Source**: Client-side Pinia store

```typescript
type AuthState = {
  user: User | null;
  session: Session | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  loginAttempts: number;
  lastLoginAttempt?: string; // ISO date string
};
```

**State Transitions**:

- `ANONYMOUS` → `LOADING` (login initiated)
- `LOADING` → `AUTHENTICATED` (login success)
- `LOADING` → `ANONYMOUS` (login failure)
- `AUTHENTICATED` → `LOADING` (logout initiated)
- `AUTHENTICATED` → `ANONYMOUS` (session expired or logout complete)

**Validation Rules**:

- `user` and `session` must both be null or both be objects (consistent state)
- `isAuthenticated` must be true only when user and session are present and session is valid
- `isLoading` must be false when user is authenticated or error is present
- `error` must be null when isAuthenticated is true
- `loginAttempts` must be non-negative integer, resets on successful login
- `lastLoginAttempt` used for progressive delay calculation

## Relationships

- **User ↔ Session**: One-to-one (current session)
- **AuthState ↔ User**: One-to-one (current user)
- **AuthState ↔ Session**: One-to-one (current session)

## Storage Strategy

### localStorage Keys

- `tmd_auth_token`: JWT token string
- `tmd_user_data`: Serialized User object
- `tmd_session_data`: Serialized Session object

### Data Persistence

- All auth data persists across browser sessions
- Session validation on app startup
- Automatic cleanup on logout or expiration
- Progressive login attempt tracking in memory only (security)
