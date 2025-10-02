# Tasks: TMD API Integration with Availability Handling

**Feature**: 002-app-uses-my  
**Branch**: `002-app-uses-my`  
**Input**: Design documents from `/specs/002-app-uses-my/`  
**Prerequisites**: plan.md, research.md, data-model.md, quickstart.md, contracts/

**Note**: This is a **status quo documentation feature** with enhancement tasks. Many tasks focus on verifying existing functionality and implementing clarification requirements (proactive token refresh, operational metrics, concurrent request verification).

## Execution Flow (main)
```
1. Load plan.md from feature directory ✅
   → Tech stack: TypeScript 5.x, Vue 3, Quasar 2.x, Axios, Vitest
   → Project type: Single-page web application
2. Load design documents ✅
   → data-model.md: 8 entities + 2 enhancement entities
   → contracts/: 3 YAML files (api-status, error-types, metrics)
   → quickstart.md: 6 scenarios + 5 edge cases
3. Generate tasks by category:
   → Documentation: Verify existing functionality (6 scenarios)
   → Enhancements: Token refresh, metrics, concurrent requests
   → Testing: New tests for enhancements
   → Polish: Integration, documentation updates
4. Apply task rules:
   → [P] for parallel (different files, no dependencies)
   → TDD: Tests before implementation
   → Status quo verification before enhancements
5. Numbering: T001-T035 (35 total tasks)
6. Dependencies documented below
7. Parallel execution examples included
8. Validation: All contracts covered, entities documented, scenarios testable ✅
```

## Format: `[ID] [P?] Description`
- **[P]**: Can run in parallel (different files, no dependencies)
- Include exact file paths in descriptions

## Phase 3.1: Setup & Documentation Verification

**Purpose**: Ensure development environment ready and existing functionality documented

- [ ] **T001** Review existing codebase structure and verify all implementation files present
  - Files: `src/composables/useApiStatus.ts`, `src/boot/axios.ts`, `src/services/baseService.ts`, `src/components/OfflineMessage.vue`
  - Verify: All files exist and contain expected functionality
  
- [ ] **T002** Run existing test suite and document current coverage
  - Command: `pnpm test --run --coverage`
  - Document: Current test coverage percentage and gaps
  
- [ ] **T003** [P] Execute Scenario 1 from quickstart.md: Normal Operation
  - Manual test: Verify 3-second response time for API requests
  - Document: Actual performance metrics and any deviations
  
- [ ] **T004** [P] Execute Scenario 2 from quickstart.md: Network Connection Lost
  - Manual test: DevTools offline mode, verify red banner and messaging
  - Document: Offline detection accuracy and user feedback quality
  
- [ ] **T005** [P] Execute Scenario 3 from quickstart.md: API Server Unavailable
  - Manual test: Stop API server, verify 3-failure detection and amber banner
  - Document: API unavailability detection timing and behavior

- [ ] **T006** [P] Execute Scenario 4 from quickstart.md: Slow Network Connection
  - Manual test: Throttle to Slow 3G, verify 5-second warning threshold
  - Document: Performance warning system behavior

## Phase 3.2: Enhancement Tests First (TDD) ⚠️ MUST COMPLETE BEFORE 3.3

**CRITICAL: These tests MUST be written and MUST FAIL before ANY enhancement implementation**

### Token Refresh Enhancement Tests

- [ ] **T007** [P] Create test: Proactive token refresh in `src/composables/__tests__/useTokenRefresh.test.ts`
  - Test: Token refresh triggered 5 minutes before expiration
  - Test: Refresh updates token and expiresAt timestamp
  - Expected: FAIL (useTokenRefresh composable doesn't exist yet)

- [ ] **T008** [P] Create test: Token refresh failure handling in `src/composables/__tests__/useTokenRefresh.test.ts`
  - Test: Failed refresh clears tokens and redirects to login
  - Test: Max 3 refresh attempts before requiring re-login
  - Expected: FAIL (functionality not implemented)

- [ ] **T009** [P] Create test: Token refresh prevention during active refresh in `src/composables/__tests__/useTokenRefresh.test.ts`
  - Test: Concurrent refresh attempts return same promise
  - Test: isRefreshing flag prevents duplicate refreshes
  - Expected: FAIL (no refresh state management yet)

### Operational Metrics Enhancement Tests

- [ ] **T010** [P] Create test: Metrics collection in `src/composables/__tests__/useMetrics.test.ts`
  - Test: Request count tracked correctly
  - Test: Error rate calculated accurately
  - Test: Response time percentiles (P50, P95, P99) computed
  - Expected: FAIL (useMetrics composable doesn't exist)

- [ ] **T011** [P] Create test: Per-endpoint metrics in `src/composables/__tests__/useMetrics.test.ts`
  - Test: Success/failure counts per endpoint
  - Test: Average response time per endpoint
  - Test: Top 20 endpoints by volume tracked
  - Expected: FAIL (endpoint tracking not implemented)

- [ ] **T012** [P] Create test: Metrics window management in `src/composables/__tests__/useMetrics.test.ts`
  - Test: Rolling 1-hour window maintained
  - Test: Old metrics expired correctly
  - Test: Metrics reset on page reload
  - Expected: FAIL (window management not implemented)

### Concurrent Request Verification Tests

- [ ] **T013** [P] Create test: Concurrent request handling in `tests/integration/__tests__/concurrency.test.ts`
  - Test: 5 concurrent requests complete successfully
  - Test: 20 concurrent requests complete successfully
  - Test: No timeout errors with 15 parallel requests
  - Expected: PASS or FAIL (verify existing behavior)

## Phase 3.3: Enhancement Implementation (ONLY after tests are failing)

### Token Refresh Implementation

- [ ] **T014** Create TokenState interface in `src/types/auth.ts`
  - Interface: token, refreshToken, expiresAt, issuedAt, refreshThreshold, isRefreshing, lastRefreshAttempt
  - Export type for use in composables

- [ ] **T015** Create useTokenRefresh composable in `src/composables/useTokenRefresh.ts`
  - Implement: TokenState reactive state
  - Implement: Background timer for proactive refresh
  - Implement: calculateTimeUntilRefresh() method
  - Implement: Refresh attempt limit tracking
  - Structure: Follow Composition API structure (imports, state, computed, methods)

- [ ] **T016** Implement refresh logic in `src/composables/useTokenRefresh.ts`
  - Method: refreshToken() - calls GraphQL refresh mutation
  - Method: scheduleProactiveRefresh() - sets up timer
  - Method: handleRefreshFailure() - clears tokens, redirects
  - Error handling: Max 3 attempts, exponential backoff

- [ ] **T017** Integrate token refresh with Axios interceptors in `src/boot/axios.ts`
  - Update: Request interceptor to use token from useTokenRefresh
  - Update: Response interceptor to handle 401 with reactive refresh fallback
  - Initialize: Proactive refresh timer on app mount

- [ ] **T018** Update useAuth composable in `src/composables/useAuth.ts`
  - Integrate: useTokenRefresh for token management
  - Update: login() to initialize refresh timer
  - Update: logout() to clear refresh timer
  - Ensure: Backward compatibility with existing auth flow

### Operational Metrics Implementation

- [ ] **T019** Create OperationalMetrics interface in `src/types/metrics.ts`
  - Interface: RequestMetrics, ErrorMetrics, PerformanceMetrics, EndpointStats, TimeWindow
  - Match: Contract in contracts/metrics.yaml

- [ ] **T020** Create useMetrics composable in `src/composables/useMetrics.ts`
  - State: OperationalMetrics reactive ref
  - State: requestHistory array for percentile calculation
  - State: endpointMap for per-endpoint tracking
  - Computed: Current metrics aggregated from history

- [ ] **T021** Implement metrics collection in `src/composables/useMetrics.ts`
  - Method: recordRequest(endpoint, duration, success) 
  - Method: calculatePercentiles(values, [50, 95, 99])
  - Method: pruneExpiredMetrics() - remove data outside 1-hour window
  - Method: resetMetrics() - clear on page reload

- [ ] **T022** Integrate metrics with Axios interceptors in `src/boot/axios.ts`
  - Update: Response interceptor to call useMetrics.recordRequest()
  - Track: Endpoint path, duration, success/failure
  - Handle: Both successful and failed requests

- [ ] **T023** Create metrics API endpoint/method in `src/services/metricsService.ts`
  - Method: getMetrics() - returns current OperationalMetrics
  - Method: getEndpointMetrics(endpoint) - returns stats for specific endpoint
  - Method: exportMetrics() - formats for external monitoring

- [ ] **T024** Add metrics display to DebugPage in `src/pages/DebugPage.vue`
  - Section: Display current metrics (request count, error rate, response times)
  - Section: Per-endpoint table with stats
  - Section: Time window information
  - Use: Quasar QTable for endpoint metrics display

### Concurrent Request Verification

- [ ] **T025** Document concurrent request behavior in `docs/api-integration.md`
  - Document: Current handling (browser limits, Axios behavior)
  - Document: Test results from T013 (5-20 concurrent requests)
  - Document: Any bottlenecks or improvements needed
  - Include: Code examples and performance data

## Phase 3.4: Integration & Edge Cases

- [ ] **T026** Test Edge Case 1: Authentication expiry during offline period
  - Execute: quickstart.md edge case 1 procedure
  - Verify: Proactive refresh on reconnection works
  - Verify: Failed refresh prompts re-authentication
  - Document: Results and any issues

- [ ] **T027** Test Edge Case 2: Multiple simultaneous API calls failing
  - Execute: quickstart.md edge case 2 procedure
  - Verify: Single aggregated error message
  - Verify: Retry action handles all failures
  - Document: Error aggregation behavior

- [ ] **T028** Test Edge Case 3: API returning malformed responses
  - Execute: quickstart.md edge case 3 procedure
  - Verify: Application doesn't crash
  - Verify: Generic error message shown
  - Document: Error handling robustness

- [ ] **T029** Test Edge Case 4: Browser tab restored after inactivity
  - Execute: quickstart.md edge case 4 procedure
  - Verify: API status refreshed on focus
  - Verify: Token refresh if expired
  - Document: Tab focus behavior

- [ ] **T030** Test Edge Case 5: Rate limiting (429 response)
  - Execute: quickstart.md edge case 5 procedure
  - Verify: System respects rate limits
  - Verify: User-friendly message displayed
  - Document: Rate limit handling

## Phase 3.5: Polish & Documentation

- [ ] **T031** [P] Update API documentation in `docs/api.md`
  - Add: Token refresh behavior documentation
  - Add: Operational metrics endpoint documentation
  - Add: Concurrent request handling notes
  - Update: Error handling examples

- [ ] **T032** [P] Update README.md with new capabilities
  - Section: Proactive token refresh feature
  - Section: Operational metrics tracking
  - Section: Performance characteristics (5-20 concurrent requests)
  - Include: Configuration options

- [ ] **T033** [P] Create troubleshooting guide in `docs/troubleshooting.md`
  - Section: Token refresh issues and solutions
  - Section: Metrics not tracking correctly
  - Section: Performance degradation diagnosis
  - Include: Common issues from quickstart.md

- [ ] **T034** Run full test suite and verify coverage targets
  - Command: `pnpm test --run --coverage`
  - Target: >80% coverage for new composables (useTokenRefresh, useMetrics)
  - Verify: All enhancement tests passing
  - Fix: Any failing tests or coverage gaps

- [ ] **T035** Run linting and fix any issues
  - Command: `pnpm lint --fix`
  - Verify: No ESLint errors
  - Verify: TypeScript strict mode compliance
  - Commit: All changes with proper conventional commit format

## Dependencies

### Phase Dependencies
- **T001-T006** (Setup/Verification) → No dependencies, can run early
- **T007-T013** (Tests) → **MUST complete before T014-T024** (TDD requirement)
- **T014-T018** (Token Refresh) → Blocked by T007-T009
- **T019-T024** (Metrics) → Blocked by T010-T012
- **T025** (Concurrency) → Blocked by T013
- **T026-T030** (Edge Cases) → Blocked by T014-T024 (need enhancements working)
- **T031-T035** (Polish) → Blocked by all previous phases

### File-Level Dependencies
- **T014** blocks **T015** (interface before composable)
- **T015-T016** blocks **T017** (composable before integration)
- **T017** blocks **T018** (Axios before useAuth)
- **T019** blocks **T020** (interface before composable)
- **T020-T021** blocks **T022** (composable before integration)
- **T022** blocks **T023** (integration before service)
- **T023** blocks **T024** (service before UI)

### Test Dependencies
- All enhancement implementation tasks (T014-T024) are blocked by their corresponding test tasks (T007-T012)
- Integration tests (T026-T030) blocked by implementations
- Polish tasks (T031-T035) require all functionality complete

## Parallel Execution Examples

### Documentation Verification (Parallel Group 1)
```bash
# These tasks can run simultaneously - different scenarios, independent
Task T003: "Execute Scenario 1: Normal Operation"
Task T004: "Execute Scenario 2: Network Connection Lost"
Task T005: "Execute Scenario 3: API Server Unavailable"
Task T006: "Execute Scenario 4: Slow Network Connection"
```

### Test Creation (Parallel Group 2)
```bash
# These test files are independent - can be created in parallel
Task T007-T009: "Token refresh tests in src/composables/__tests__/useTokenRefresh.test.ts"
Task T010-T012: "Metrics tests in src/composables/__tests__/useMetrics.test.ts"
Task T013: "Concurrency tests in tests/integration/__tests__/concurrency.test.ts"
```

### Documentation Updates (Parallel Group 3)
```bash
# Independent documentation files - can update simultaneously
Task T031: "Update docs/api.md"
Task T032: "Update README.md"
Task T033: "Create docs/troubleshooting.md"
```

## Task Execution Notes

### TDD Workflow
1. **STOP** after completing T001-T013 (all tests written)
2. **RUN** `pnpm test --run` - verify all new tests FAIL
3. **PROCEED** to T014-T024 only after confirming failures
4. **RUN** tests after each implementation task to see tests pass

### Manual Testing Workflow
1. Start local API server: Ensure `http://localhost:10014` accessible
2. Start dev server: `pnpm dev`
3. Open browser with DevTools
4. Execute quickstart.md scenarios systematically
5. Document results in task completion notes

### Performance Testing
- Use DevTools Network tab for timing measurements
- Use Performance tab for detailed profiling
- Test with different network conditions (Fast 3G, Slow 3G, Offline)
- Verify metrics against targets (3s normal, 5s warning, 30s timeout)

## Validation Checklist

**Design Artifacts Coverage**:
- [x] All contracts have corresponding implementation tasks
  - api-status.yaml → T014-T018 (TokenState integrated with ApiStatusState)
  - error-types.yaml → Existing implementation verified
  - metrics.yaml → T019-T024 (OperationalMetrics implementation)
- [x] All entities from data-model.md have tasks
  - ApiStatusState → Existing (verified T003-T006)
  - ApiError → Existing (verified T003-T006)
  - HALResponse → Existing (verified in research.md)
  - TokenState → T014-T018 (new enhancement)
  - OperationalMetrics → T019-T024 (new enhancement)
- [x] All quickstart scenarios have verification tasks
  - 6 acceptance scenarios → T003-T006 (sampled)
  - 5 edge cases → T026-T030
- [x] Tests come before implementation (TDD)
  - T007-T013 before T014-T024 ✅
- [x] Parallel tasks are truly independent
  - T003-T006: Different scenarios ✅
  - T007-T012: Different test files ✅
  - T031-T033: Different documentation files ✅
- [x] Each task specifies exact file path ✅
- [x] No same-file conflicts in [P] tasks ✅

## Summary

**Total Tasks**: 35 tasks across 5 phases
**Parallel Tasks**: 14 tasks marked [P]
**Sequential Tasks**: 21 tasks with dependencies
**Estimated Effort**: 
- Phase 3.1 (Setup): 4-6 hours
- Phase 3.2 (Tests): 6-8 hours
- Phase 3.3 (Implementation): 12-16 hours
- Phase 3.4 (Integration): 4-6 hours
- Phase 3.5 (Polish): 3-4 hours
- **Total**: 29-40 hours

**Key Deliverables**:
1. Proactive JWT token refresh functionality
2. Operational metrics tracking and exposure
3. Concurrent request behavior documentation
4. Comprehensive test coverage (>80%)
5. Updated documentation (API docs, README, troubleshooting)

**Success Criteria**:
- All quickstart.md scenarios pass ✅
- Token refresh works transparently ✅
- Metrics accurately tracked and exposed ✅
- Test coverage >80% on new code ✅
- ESLint passes with no errors ✅
- All constitutional principles maintained ✅
