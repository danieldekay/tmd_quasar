# Tasks: TMD User Authentication & Session Management

**Input**: Design do### UI Components

- [x] T027 LoginForm component with Quasar components in src/components/auth/LoginForm.vue
- [x] T028 AuthGuard component for route protection in src/components/auth/AuthGuard.vue
- [x] T029 SessionIndicator component for auth status in src/components/auth/SessionIndicator.vue

### Route Protection

- [x] T030 Navigation guards with auth checks in src/router/guards.ts
- [x] T031 Login page component in src/pages/Login.vue
- [x] T032 Update router configuration in src/router/index.tsm `/specs/001-the-user-should/`
      **Prerequisites**: plan.md ✅, research.md ✅, data-model.md ✅, contracts/ ✅, quickstart.md ✅

## Format: `[ID] [P?] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- Include exact file paths in descriptions

## Phase 3.1: Setup

- [x] T001 Create authentication directory structure in src/
- [x] T002 Install authentication dependencies (if any additional needed)
- [x] T003 [P] Configure TypeScript types in src/services/types.ts

## Phase 3.2: Tests First (TDD) ⚠️ MUST COMPLETE BEFORE 3.3

**CRITICAL: These tests MUST be written and MUST FAIL before ANY implementation**

### Contract Tests (GraphQL Mutations & Queries)

- [x] T004 [P] Contract test login GraphQL mutation in src/services/**tests**/authService.test.ts
- [x] T005 [P] Contract test refreshJwtAuthToken mutation in src/services/**tests**/authService.test.ts
- [x] T006 [P] Contract test viewer query (verify) in src/services/**tests**/authService.test.ts
- [x] T007 [P] Contract test password reset URL redirect in src/services/**tests**/authService.test.ts

### Data Model Tests

- [x] T008 [P] User type validation tests in src/services/types.test.ts
- [x] T009 [P] Session type validation tests in src/services/types.test.ts
- [x] T010 [P] AuthState type validation tests in src/services/types.test.ts

### Service Layer Tests

- [x] T011 [P] Session management tests in src/services/sessionService.test.ts
- [x] T012 [P] Authentication store tests in src/stores/authStore.test.ts

### Composable Tests

- [x] T013 [P] useAuth composable tests in src/composables/**tests**/useAuth.test.ts
- [x] T014 [P] useSession composable tests in src/composables/**tests**/useSession.test.ts

### Component Tests

- [x] T015 [P] LoginForm component tests in src/components/auth/**tests**/LoginForm.test.ts
- [x] T016 [P] AuthGuard component tests in src/components/auth/**tests**/AuthGuard.test.ts
- [x] T017 [P] SessionIndicator component tests in src/components/auth/**tests**/SessionIndicator.test.ts

### Integration Tests

- [x] T018 [P] Complete auth flow integration test in tests/integration/**tests**/auth-flow.test.ts
- [x] T019 [P] Session management integration test in tests/integration/**tests**/session-management.test.ts
- [x] T020 [P] Router guards integration test in tests/integration/**tests**/router-guards.test.ts

## Phase 3.3: Core Implementation (ONLY after tests are failing)

### Type Definitions

- [x] T021 User, Session, AuthState types in src/services/types.ts

### Service Layer

- [x] T022 Improve authService with GraphQL mutations in src/services/authService.ts (already exists, using GraphQL)
- [x] T023 Session persistence service in src/services/sessionService.ts

### State Management

- [x] T024 Refactor authStore to use sessionService in src/stores/authStore.ts

### Composables

- [x] T025 useAuth composable with reactive auth state in src/composables/useAuth.ts
- [x] T026 useSession composable with session management in src/composables/useSession.ts

### UI Components (Mobile-First)

- [ ] T027 LoginForm component with Quasar components in src/components/auth/LoginForm.vue
- [ ] T028 AuthGuard component for route protection in src/components/auth/AuthGuard.vue
- [ ] T029 SessionIndicator component for auth status in src/components/auth/SessionIndicator.vue

### Route Protection

- [ ] T030 Navigation guards with auth checks in src/router/guards.ts
- [ ] T031 Login page component in src/pages/Login.vue
- [ ] T032 Update router configuration in src/router/index.ts

## Phase 3.4: Integration

- [x] T033 Progressive brute force protection in authService
- [x] T034 Session restoration on app startup
- [x] T035 Password reset URL redirection
- [x] T036 Error handling and user feedback
- [x] T037 ARIA labels and accessibility features

## Phase 3.5: Polish

- [x] T038 [P] Performance optimization (<200ms auth response)
- [x] T039 [P] E2E login/logout test in tests/e2e/login-logout.test.ts
- [x] T040 [P] Update README.md with authentication documentation
- [x] T041 [P] Code cleanup and remove duplications
- [x] T042 Manual testing with real TMD backend
- [x] T043 Security audit of token handling

## Dependencies

- Setup (T001-T003) before everything
- All tests (T004-T020) before any implementation (T021-T037)
- Types (T021) before services (T022-T023) and store (T024)
- Services before composables (T025-T026)
- Store and composables before components (T027-T029)
- Components before pages and router (T030-T032)
- Core implementation before integration (T033-T037)
- Integration before polish (T038-T043)

## Parallel Execution Examples

### Phase 3.2: All Tests in Parallel

````bash
```bash
# Contract tests (GraphQL mutations/queries)
Task: "Contract test login GraphQL mutation in src/services/__tests__/authService.test.ts"
Task: "Contract test refreshJwtAuthToken mutation in src/services/__tests__/authService.test.ts"
Task: "Contract test viewer query (verify) in src/services/__tests__/authService.test.ts"
Task: "Contract test password reset URL redirect in src/services/__tests__/authService.test.ts"

# Data model tests (different test files)
Task: "User type validation tests in src/services/types.test.ts"
Task: "Session type validation tests in src/services/types.test.ts"
Task: "AuthState type validation tests in src/services/types.test.ts"

# Service and component tests (all different files)
Task: "Session management tests in src/services/sessionService.test.ts"
Task: "Authentication store tests in src/stores/authStore.test.ts"
Task: "useAuth composable tests in src/composables/useAuth.test.ts"
Task: "LoginForm component tests in src/components/auth/LoginForm.test.ts"
````

### Phase 3.3: Components in Parallel

```bash
# Independent component implementations
Task: "LoginForm component with Quasar components in src/components/auth/LoginForm.vue"
Task: "AuthGuard component for route protection in src/components/auth/AuthGuard.vue"
Task: "SessionIndicator component for auth status in src/components/auth/SessionIndicator.vue"
```

### Phase 3.5: Polish Tasks in Parallel

```bash
# Independent polish tasks
Task: "Performance optimization (<200ms auth response)"
Task: "E2E login/logout test in tests/e2e/login-logout.test.ts"
Task: "Update README.md with authentication documentation"
Task: "Code cleanup and remove duplications"
```

## Validation Checklist ✅

- [x] All contracts (login, logout, verify, reset-password-url) have corresponding tests
- [x] All entities (User, Session, AuthState) have model tasks
- [x] All tests (T004-T020) come before implementation (T021-T037)
- [x] Parallel tasks target different files and are truly independent
- [x] Each task specifies exact file path
- [x] No task modifies same file as another [P] task
- [x] TDD approach: failing tests before implementation
- [x] Constitutional compliance: Quasar-first, TypeScript strict, mobile-first accessibility

## Success Criteria

Upon completion of all tasks:

- Users can login with TMD credentials and stay logged in for 30 days
- Progressive brute force protection prevents attacks
- Password reset redirects to main TMD site
- All authentication follows TMD Quasar constitutional principles
- Mobile-first responsive design with full accessibility
- <200ms authentication performance target met
