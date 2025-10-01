# Implementation Plan: TMD User Authentication & Session Management

**Branch**: `001-the-user-should` | **Date**: 2025-10-01 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/001-the-user-should/spec.md`

## Execution Flow (/plan command scope)

```
1. Load feature spec from Input path
   → If not found: ERROR "No feature spec at {path}"
2. Fill Technical Context (scan for NEEDS CLARIFICATION)
   → Detect Project Type from file system structure or context (web=frontend+backend, mobile=app+api)
   → Set Structure Decision based on project type
3. Fill the Constitution Check section based on the content of the constitution document.
4. Evaluate Constitution Check section below
   → If violations exist: Document in Complexity Tracking
   → If no justification possible: ERROR "Simplify approach first"
   → Update Progress Tracking: Initial Constitution Check
5. Execute Phase 0 → research.md
   → If NEEDS CLARIFICATION remain: ERROR "Resolve unknowns"
6. Execute Phase 1 → contracts, data-model.md, quickstart.md, agent-specific template file (e.g., `CLAUDE.md` for Claude Code, `.github/copilot-instructions.md` for GitHub Copilot, `GEMINI.md` for Gemini CLI, `QWEN.md` for Qwen Code or `AGENTS.md` for opencode).
7. Re-evaluate Constitution Check section
   → If new violations: Refactor design, return to Phase 1
   → Update Progress Tracking: Post-Design Constitution Check
8. Plan Phase 2 → Describe task generation approach (DO NOT create tasks.md)
9. STOP - Ready for /tasks command
```

**IMPORTANT**: The /plan command STOPS at step 7. Phases 2-4 are executed by other commands:

- Phase 2: /tasks command creates tasks.md
- Phase 3-4: Implementation execution (manual or via tools)

## Summary

Implement user authentication system for TMD Quasar frontend using existing TMD credentials with 30-day persistent sessions. Features include login/logout functionality, session management, progressive brute force protection, and password reset redirection to main TMD site. No new user registration or multi-factor authentication required for this phase.

## Technical Context

**Language/Version**: TypeScript 5.x with Vue 3 Composition API  
**Primary Dependencies**: Quasar Framework, Pinia (state management), Vue Router, Vitest (testing)  
**Storage**: Browser localStorage/cookies for session tokens, WordPress TMD database for user credentials  
**Testing**: Vitest for unit and component testing with colocated test files  
**Target Platform**: Modern web browsers (mobile-first responsive design)
**Project Type**: Single-page application (frontend only - Quasar Vue.js)  
**Performance Goals**: <200ms authentication response, persistent 30-day sessions  
**Constraints**: Must use existing TMD user database, no new user registration, redirect password reset to main TMD site  
**Scale/Scope**: Existing TMD user base authentication, single sign-on style session management

## Constitution Check

_GATE: Must pass before Phase 0 research. Re-check after Phase 1 design._

### I. Quasar-First Development

- [x] **PASS**: Authentication UI will use QForm, QInput, QBtn, QCard components
- [x] **PASS**: No custom components needed - Quasar provides all required UI elements
- [x] **PASS**: Will follow Quasar's responsive utilities and theming system
- [x] **POST-DESIGN CONFIRMED**: LoginForm.vue and components use only Quasar components

### II. TypeScript Strict Compliance (NON-NEGOTIABLE)

- [x] **PASS**: All code will be TypeScript with strict mode
- [x] **PASS**: No `any` types - proper interfaces for User, Session, AuthState
- [x] **PASS**: Will use `type` over `interface` for consistency
- [x] **PASS**: No enums - use const objects for auth states
- [x] **PASS**: Async operations will use `void` operator or proper error handling
- [x] **POST-DESIGN CONFIRMED**: data-model.md uses `type` definitions, strict typing

### III. Composition API Structure

- [x] **PASS**: All components will use `<script setup lang="ts">` syntax
- [x] **PASS**: Will follow required structure order (imports, props, composables, state, computed, methods, lifecycle)
- [x] **POST-DESIGN CONFIRMED**: quickstart.md demonstrates correct component structure

### IV. Test-First Development

- [x] **PASS**: Tests will be written before implementation (TDD)
- [x] **PASS**: Colocated tests: `authService.ts` → `authService.test.ts`
- [x] **PASS**: Will use Vitest with "Start Simple, Build Up" philosophy
- [x] **PASS**: Import validation tests first, then behavior tests
- [x] **POST-DESIGN CONFIRMED**: quickstart.md specifies TDD implementation order

### V. Mobile-First & Accessibility

- [x] **PASS**: Mobile-first responsive design for login forms
- [x] **PASS**: ARIA labels for authentication states and error messages
- [x] **PASS**: Keyboard navigation for all login/logout interactions
- [x] **PASS**: Loading and error states for all authentication operations
- [x] **POST-DESIGN CONFIRMED**: quickstart.md includes mobile-first Quasar examples

**Constitution Status**: ✅ **ALL CHECKS PASS** - Design fully compliant

## Project Structure

### Documentation (this feature)

```
specs/[###-feature]/
├── plan.md              # This file (/plan command output)
├── research.md          # Phase 0 output (/plan command)
├── data-model.md        # Phase 1 output (/plan command)
├── quickstart.md        # Phase 1 output (/plan command)
├── contracts/           # Phase 1 output (/plan command)
└── tasks.md             # Phase 2 output (/tasks command - NOT created by /plan)
```

### Source Code (repository root)

```
src/
├── components/
│   ├── auth/
│   │   ├── LoginForm.vue
│   │   ├── AuthGuard.vue
│   │   └── SessionIndicator.vue
├── composables/
│   ├── useAuth.ts
│   └── useSession.ts
├── services/
│   ├── authService.ts
│   ├── sessionService.ts
│   └── types.ts
├── stores/
│   └── authStore.ts
├── pages/
│   ├── Login.vue
│   └── Dashboard.vue (protected example)
└── router/
    ├── index.ts
    └── guards.ts

tests/
├── unit/
│   ├── services/
│   ├── composables/
│   └── components/
├── integration/
│   ├── auth-flow.test.ts
│   └── session-management.test.ts
└── e2e/
    └── login-logout.test.ts
```

**Structure Decision**: Single-page application (Quasar Vue.js frontend) with authentication features integrated into existing project structure. Uses Vue 3 Composition API, Pinia for state management, and follows TMD Quasar architectural patterns.

## Phase 0: Outline & Research

1. **Extract unknowns from Technical Context** above:

   - For each NEEDS CLARIFICATION → research task
   - For each dependency → best practices task
   - For each integration → patterns task

2. **Generate and dispatch research agents**:

   ```
   For each unknown in Technical Context:
     Task: "Research {unknown} for {feature context}"
   For each technology choice:
     Task: "Find best practices for {tech} in {domain}"
   ```

3. **Consolidate findings** in `research.md` using format:
   - Decision: [what was chosen]
   - Rationale: [why chosen]
   - Alternatives considered: [what else evaluated]

**Output**: research.md with all NEEDS CLARIFICATION resolved

## Phase 1: Design & Contracts

_Prerequisites: research.md complete_

1. **Extract entities from feature spec** → `data-model.md`:

   - Entity name, fields, relationships
   - Validation rules from requirements
   - State transitions if applicable

2. **Generate API contracts** from functional requirements:

   - For each user action → endpoint
   - Use standard REST/GraphQL patterns
   - Output OpenAPI/GraphQL schema to `/contracts/`

3. **Generate contract tests** from contracts:

   - One test file per endpoint
   - Assert request/response schemas
   - Tests must fail (no implementation yet)

4. **Extract test scenarios** from user stories:

   - Each story → integration test scenario
   - Quickstart test = story validation steps

5. **Update agent file incrementally** (O(1) operation):
   - Run `.specify/scripts/bash/update-agent-context.sh copilot`
     **IMPORTANT**: Execute it exactly as specified above. Do not add or remove any arguments.
   - If exists: Add only NEW tech from current plan
   - Preserve manual additions between markers
   - Update recent changes (keep last 3)
   - Keep under 150 lines for token efficiency
   - Output to repository root

**Output**: data-model.md, /contracts/\*, failing tests, quickstart.md, agent-specific file

## Phase 2: Task Planning Approach

_This section describes what the /tasks command will do - DO NOT execute during /plan_

**Task Generation Strategy**:

- Load `.specify/templates/tasks-template.md` as base
- Generate tasks from Phase 1 design docs (contracts, data model, quickstart)
- Each contract → contract test task [P]
- Each entity → model creation task [P]
- Each user story → integration test task
- Implementation tasks to make tests pass

**Ordering Strategy**:

- TDD order: Tests before implementation
- Dependency order: Models before services before UI
- Mark [P] for parallel execution (independent files)

**Estimated Output**: 25-30 numbered, ordered tasks in tasks.md

**IMPORTANT**: This phase is executed by the /tasks command, NOT by /plan

## Phase 3+: Future Implementation

_These phases are beyond the scope of the /plan command_

**Phase 3**: Task execution (/tasks command creates tasks.md)  
**Phase 4**: Implementation (execute tasks.md following constitutional principles)  
**Phase 5**: Validation (run tests, execute quickstart.md, performance validation)

## Complexity Tracking

_Fill ONLY if Constitution Check has violations that must be justified_

| Violation | Why Needed                     | Simpler Alternative Rejected Because |
| --------- | ------------------------------ | ------------------------------------ |
| None      | All constitution checks passed | No violations to justify             |

## Progress Tracking

- [x] **Initial Constitution Check** (Step 4): All gates passed
- [x] **Phase 0 Complete** (Step 5): research.md created with all decisions documented
- [x] **Phase 1 Complete** (Step 6): data-model.md, contracts/, quickstart.md, .github/copilot-instructions.md updated
- [x] **Post-Design Constitution Check** (Step 7): All gates remain passed
- [x] **Phase 2 Planning** (Step 8): Task generation approach documented

## Execution Status: ✅ COMPLETE

**Ready for**: `/tasks` command to generate implementation tasks
**Branch**: `001-the-user-should`
**Generated Artifacts**:

- `research.md` - Technical decisions and rationale
- `data-model.md` - TypeScript types and validation rules
- `contracts/auth-api.md` - REST API specifications
- `quickstart.md` - Implementation guide and success criteria
- `.github/copilot-instructions.md` - Updated with authentication patterns

**Next Command**: `/tasks` to generate numbered implementation tasks following TDD approach

## Progress Tracking

_This checklist is updated during execution flow_

**Phase Status**:

- [ ] Phase 0: Research complete (/plan command)
- [ ] Phase 1: Design complete (/plan command)
- [ ] Phase 2: Task planning complete (/plan command - describe approach only)
- [ ] Phase 3: Tasks generated (/tasks command)
- [ ] Phase 4: Implementation complete
- [ ] Phase 5: Validation passed

**Gate Status**:

- [ ] Initial Constitution Check: PASS
- [ ] Post-Design Constitution Check: PASS
- [ ] All NEEDS CLARIFICATION resolved
- [ ] Complexity deviations documented

---

_Based on Constitution v2.1.1 - See `/memory/constitution.md`_
