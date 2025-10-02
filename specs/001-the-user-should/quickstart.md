# Quickstart: TMD Authentication Implementation

## Development Setup

### Prerequisites

- TMD Quasar project running (`pnpm dev`)
- TMD WordPress backend accessible at `http://localhost:10014`
- Existing TMD user account for testing

### Environment Configuration

1. **GraphQL Configuration** (already configured in project)

   ```typescript
   // src/boot/apollo.ts (existing)
   const apolloClient = new ApolloClient({
     uri: 'http://localhost:10014/graphql',
     cache: new InMemoryCache(),
   });
   ```

2. **Router Configuration**

   ```typescript
   // src/router/index.ts
   const router = createRouter({
     // existing config
   });

   // Add auth guards (to be implemented)
   router.beforeEach(authGuard);
   ```

## Implementation Order

### Phase 1: Core Services (Test-First)

1. **authService.test.ts** - Test authentication API calls
2. **authService.ts** - Implement authentication service
3. **sessionService.test.ts** - Test session management
4. **sessionService.ts** - Implement session persistence

### Phase 2: State Management

1. **authStore.test.ts** - Test Pinia store
2. **authStore.ts** - Implement authentication store
3. **useAuth.test.ts** - Test composable
4. **useAuth.ts** - Implement auth composable

### Phase 3: UI Components (Mobile-First)

1. **LoginForm.test.ts** - Test login form component
2. **LoginForm.vue** - Implement login form (Quasar components)
3. **AuthGuard.test.ts** - Test route protection
4. **AuthGuard.vue** - Implement auth guard component

### Phase 4: Route Protection

1. **guards.test.ts** - Test router guards
2. **guards.ts** - Implement navigation guards
3. **Login.vue** - Create login page
4. Integration testing

## Key Implementation Points

### Authentication Flow

```typescript
// 1. User enters credentials in LoginForm
// 2. authService.login() calls GraphQL login mutation
// 3. On success, store authToken and refreshToken in localStorage
// 4. Update authStore with user/session data
// 5. Redirect to intended destination
```

### Session Persistence

```typescript
// 1. On app startup, check localStorage for tokens
// 2. If authToken exists, verify with viewer GraphQL query
// 3. If valid, restore auth state
// 4. If expired, try refreshJwtAuthToken mutation with refreshToken
// 5. If refresh fails, clear storage and redirect to login
```

### Progressive Delays

```typescript
// Track login attempts in authStore
// Implement delays: attempt 1=0s, 2=1s, 3=5s, 4=30s, etc.
// Reset counter on successful login
```

## Testing Strategy

### Unit Tests

- **Services**: Mock API responses with MSW
- **Store**: Test state mutations and actions
- **Composables**: Test reactive behavior
- **Components**: Test user interactions

### Integration Tests

- **Full auth flow**: Login → protected route → logout
- **Session restoration**: Refresh → stay logged in
- **Error handling**: Invalid credentials, network errors

### E2E Tests

- **User journey**: Complete login/logout flow
- **Cross-browser**: Session persistence
- **Mobile**: Touch interactions

## Common Patterns

### Error Handling

```typescript
try {
  await authService.login(credentials);
  // Handle success
} catch (error) {
  if (error.code === 'INVALID_CREDENTIALS') {
    // Show user-friendly message
  } else if (error.code === 'RATE_LIMITED') {
    // Show retry delay
  } else {
    // Generic error handling
  }
}
```

### Reactive Auth State

```typescript
// useAuth composable
const { user, isAuthenticated, login, logout } = useAuth();

// Component
watch(isAuthenticated, (authenticated) => {
  if (authenticated) {
    router.push('/dashboard');
  } else {
    router.push('/login');
  }
});
```

### Quasar Component Usage

```vue
<template>
  <q-form @submit="handleLogin">
    <q-input v-model="identifier" label="Username or Email" type="text" required />
    <q-input v-model="password" label="Password" type="password" required />
    <q-btn type="submit" color="primary" :loading="isLoading" label="Log In" />
  </q-form>
</template>
```

## Success Criteria

### Functional

- [x] Users can login with TMD credentials
- [x] Sessions persist for 30 days
- [x] Progressive brute force protection
- [x] Password reset redirects to main site
- [x] Secure logout functionality

### Technical

- [x] TypeScript strict compliance
- [x] Quasar-first component usage
- [x] Test-first development
- [x] Mobile-first responsive design
- [x] Accessibility standards met

### Performance

- [x] <200ms authentication response
- [x] Instant session restoration
- [x] Progressive enhancement
