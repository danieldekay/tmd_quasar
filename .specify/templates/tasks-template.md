# Tasks: [FEATURE NAME]

**Input**: Design documents from `/specs/[###-feature-name]/`
**Prerequisites**: plan.md (required), research.md, data-model.md, contracts/

## Execution Flow (main)

```
1. Load plan.md from feature directory
   → If not found: ERROR "No implementation plan found"
   → Extract: tech stack, libraries, structure
2. Load optional design documents:
   → data-model.md: Extract entities → model tasks
   → contracts/: Each file → contract test task
   → research.md: Extract decisions → setup tasks
3. Generate tasks by category:
   → Setup: project init, dependencies, linting
   → Tests: contract tests, integration tests
   → Core: models, services, CLI commands
   → Integration: DB, middleware, logging
   → Polish: unit tests, performance, docs
4. Apply task rules:
   → Different files = mark [P] for parallel
   → Same file = sequential (no [P])
   → Tests before implementation (TDD)
5. Number tasks sequentially (T001, T002...)
6. Generate dependency graph
7. Create parallel execution examples
8. Validate task completeness:
   → All contracts have tests?
   → All entities have models?
   → All endpoints implemented?
9. Return: SUCCESS (tasks ready for execution)
```

## Format: `[ID] [P?] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- Include exact file paths in descriptions

## Path Conventions

- **Single project**: `src/`, `tests/` at repository root
- **Web app**: `backend/src/`, `frontend/src/`
- **Mobile**: `api/src/`, `ios/src/` or `android/src/`
- Paths shown below assume single project - adjust based on plan.md structure

## Phase 3.1: Setup

- [ ] T001 Create project structure per implementation plan
- [ ] T002 Initialize [language] project with [framework] dependencies
- [ ] T003 [P] Configure Biome for formatting and linting (biome.json)
- [ ] T004 [P] Configure TypeScript strict mode and type checking
- [ ] T005 [P] Set up VS Code tasks for quality checks
- [ ] T006 [P] Add pre-commit quality scripts to package.json

## Phase 3.2: Tests First (TDD) ⚠️ MUST COMPLETE BEFORE 3.3

**CRITICAL: These tests MUST be written and MUST FAIL before ANY implementation**

- [ ] T007 Run `pnpm check:biome` to ensure setup passes
- [ ] T008 Run `pnpm type-check` to validate TypeScript configuration
- [ ] T009 [P] Contract test POST /api/users in tests/contract/**tests**/test_users_post.py
- [ ] T010 [P] Contract test GET /api/users/{id} in tests/contract/**tests**/test_users_get.py
- [ ] T011 [P] Integration test user registration in tests/integration/**tests**/test_registration.py
- [ ] T012 [P] Integration test auth flow in tests/integration/**tests**/test_auth.py

## Phase 3.3: Core Implementation (ONLY after tests are failing)

- [ ] T013 [P] User model in src/models/user.py
- [ ] T014 [P] UserService CRUD in src/services/user_service.py
- [ ] T015 [P] CLI --create-user in src/cli/user_commands.py
- [ ] T016 POST /api/users endpoint
- [ ] T017 GET /api/users/{id} endpoint
- [ ] T018 Input validation
- [ ] T019 Error handling and logging
- [ ] T020 Run `pnpm check:biome` to auto-fix formatting and imports
- [ ] T021 Run `pnpm type-check` to validate TypeScript

## Phase 3.4: Integration

- [ ] T022 Connect UserService to DB
- [ ] T023 Auth middleware
- [ ] T024 Request/response logging
- [ ] T025 CORS and security headers
- [ ] T026 Run `pnpm check:biome` to auto-fix formatting

## Phase 3.5: Polish

- [ ] T027 [P] Unit tests for validation in tests/unit/**tests**/test_validation.py
- [ ] T028 Performance tests (<200ms)
- [ ] T029 [P] Update docs/api.md
- [ ] T030 Remove duplication
- [ ] T031 Run manual-testing.md
- [ ] T032 Final quality check: `pnpm check:biome && pnpm type-check && pnpm test:run`
- [ ] T033 Verify VS Code Biome extension works with format-on-save

## Dependencies

- Tests (T007-T012) before implementation (T013-T021)
- Quality checks (T020, T021, T026, T032) after code changes
- Final validation (T032) before completion
- T008 blocks T009, T015
- T016 blocks T018
- Implementation before polish (T019-T023)

## Parallel Example

```
# Launch T004-T007 together:
Task: "Contract test POST /api/users in tests/contract/test_users_post.py"
Task: "Contract test GET /api/users/{id} in tests/contract/test_users_get.py"
Task: "Integration test registration in tests/integration/test_registration.py"
Task: "Integration test auth in tests/integration/test_auth.py"
```

## Notes

- [P] tasks = different files, no dependencies
- Verify tests fail before implementing
- Commit after each task
- Avoid: vague tasks, same file conflicts

## Task Generation Rules

_Applied during main() execution_

1. **From Contracts**:
   - Each contract file → contract test task [P]
   - Each endpoint → implementation task
2. **From Data Model**:
   - Each entity → model creation task [P]
   - Relationships → service layer tasks
3. **From User Stories**:

   - Each story → integration test [P]
   - Quickstart scenarios → validation tasks

4. **Ordering**:
   - Setup → Tests → Models → Services → Endpoints → Polish
   - Dependencies block parallel execution

## Validation Checklist

_GATE: Checked by main() before returning_

- [ ] All contracts have corresponding tests
- [ ] All entities have model tasks
- [ ] All tests come before implementation
- [ ] Parallel tasks truly independent
- [ ] Each task specifies exact file path
- [ ] No task modifies same file as another [P] task
