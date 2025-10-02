# Implementation Plan: Content Tables & Detail Views

**Branch**: `003-content-is-shown` | **Date**: 2025-10-02 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/003-content-is-shown/spec.md`

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

**Primary Requirement**: Implement comprehensive table views with full-featured interactions (sorting, pagination, filtering) for all TMD content types (Events, DJs, Teachers, Teacher Couples, Event Series), with clickable rows that navigate to detailed view pages displaying all available data.

**Technical Approach**: Leverage existing Quasar QTable implementations and composables (`useGenericList`, `useTablePagination`) to create consistent table views. Utilize existing detail page patterns (EventDetails.vue, DJDetails.vue, etc.) as templates. Focus on standardizing table column definitions for remaining content types (DJs, Teachers, Couples, Event Series) to match the confirmed Events table structure. All views require authentication per specification.

## Technical Context

**Language/Version**: TypeScript 5.x with strict mode enabled (Vue 3 Composition API)
**Primary Dependencies**: Quasar Framework 2.x, Vue 3, Vue Router, Pinia (state management)
**Storage**: WordPress REST API (TMD v3 endpoints) - no local storage required
**Testing**: Vitest for unit/component tests, following "Start Simple, Build Up" philosophy
**Target Platform**: Web (mobile-first responsive design)
**Project Type**: web (frontend SPA)
**Performance Goals**: Server-side pagination with <500ms API response time, smooth table sorting/filtering
**Constraints**:

- All views require authentication (JWT tokens)
- ISO date format (YYYY-MM-DD) mandatory
- No images/media in tables or detail views
- Quasar QTable component must be used (constitutional requirement)
  **Scale/Scope**:
- 5 content types (Events: 2989, DJs: 1149, Teachers: 158, Couples: 66, Event Series: 72)
- Tables support 10-100 items per page with server-side pagination
- Full-featured tables with sorting, filtering, and search

**User-Provided Context**: Evaluate existing code when planning - leverage existing table implementations (EventList.vue, DJsPage.vue, TeachersPage.vue, CouplesPage.vue, EventSeriesPage.vue) and detail pages (EventDetails.vue, DJDetails.vue, TeacherDetails.vue, CoupleDetails.vue, EventSeriesDetails.vue)

## Constitution Check

_GATE: Must pass before Phase 0 research. Re-check after Phase 1 design._

### Principle I: Quasar-First Development

- ✅ **PASS**: Design uses QTable, QCard, QBtn, QChip, QSelect, QInput components
- ✅ **PASS**: Leveraging existing table implementations that already use Quasar components
- ✅ **PASS**: No custom table components needed - using Quasar's built-in features

### Principle II: TypeScript Strict Compliance

- ✅ **PASS**: All code will use TypeScript with strict mode
- ✅ **PASS**: Existing codebase patterns already follow strict typing
- ✅ **PASS**: No `any` types permitted, proper handling of undefined values
- ✅ **PASS**: Use `type` over `interface`, no enums (use const objects)

### Principle III: Composition API Structure

- ✅ **PASS**: All components use `<script setup lang="ts">` syntax
- ✅ **PASS**: Existing pages follow correct structure order (imports, props, composables, state, computed, methods, lifecycle)
- ✅ **PASS**: Design will maintain consistent structure

### Principle IV: Test-First Development

- ✅ **PASS**: Tests will be in `__tests__` folders per Quasar conventions
- ✅ **PASS**: Test locations:
  - `src/pages/__tests__/` for page components
  - `src/components/__tests__/` for shared components
  - `src/composables/__tests__/` for composables
- ✅ **PASS**: Tests will verify behavior, not implementation
- ✅ **PASS**: Will run with `pnpm test --run`

### Principle V: Mobile-First & Accessibility

- ✅ **PASS**: Existing table implementations are mobile-responsive
- ✅ **PASS**: QTable supports touch interactions natively
- ✅ **PASS**: Loading states and error handling already implemented
- ✅ **PASS**: ARIA labels present in existing components
- ✅ **PASS**: Keyboard navigation supported by Quasar components

**GATE RESULT**: ✅ ALL CHECKS PASSED - Proceed to Phase 0

## Project Structure

### Documentation (this feature)

```
specs/003-content-is-shown/
├── spec.md              # Feature specification (complete with clarifications)
├── plan.md              # This file (/plan command output)
├── research.md          # Phase 0 output (/plan command)
├── data-model.md        # Phase 1 output (/plan command)
├── quickstart.md        # Phase 1 output (/plan command)
├── contracts/           # Phase 1 output (/plan command)
│   ├── table-columns.json      # Column definitions for all content types
│   └── error-messages.json     # Standardized error message contracts
└── tasks.md             # Phase 2 output (/tasks command - NOT created by /plan)
```

### Source Code (existing structure - web application)

```
src/
├── pages/                      # Vue page components
│   ├── EventList.vue          # ✅ EXISTS - Events table (template for others)
│   ├── EventDetails.vue       # ✅ EXISTS - Event detail page
│   ├── DJsPage.vue            # ✅ EXISTS - DJs table
│   ├── DJDetails.vue          # ✅ EXISTS - DJ detail page
│   ├── TeachersPage.vue       # ✅ EXISTS - Teachers table
│   ├── TeacherDetails.vue     # ✅ EXISTS - Teacher detail page
│   ├── CouplesPage.vue        # ✅ EXISTS - Couples table
│   ├── CoupleDetails.vue      # ✅ EXISTS - Couple detail page
│   ├── EventSeriesPage.vue    # ✅ EXISTS - Event Series table
│   ├── EventSeriesDetails.vue # ✅ EXISTS - Event Series detail page
│   └── __tests__/             # Page component tests
│
├── components/                 # Reusable Vue components
│   ├── TableNavbar.vue        # ✅ EXISTS - Table toolbar with pagination
│   ├── BaseListPage.vue       # ✅ EXISTS - Base list page layout
│   ├── DJCard.vue             # ✅ EXISTS - DJ display card
│   ├── InteractionButtons.vue # ✅ EXISTS - Like/bookmark buttons
│   └── __tests__/             # Component tests
│
├── composables/               # Vue composables (hooks)
│   ├── useGenericList.ts     # ✅ EXISTS - Generic list management
│   ├── useTablePagination.ts # ✅ EXISTS - Pagination logic
│   ├── useFormatters.ts      # ✅ EXISTS - Date/text formatters
│   ├── useCountries.ts       # ✅ EXISTS - Country data
│   ├── useInteractions.ts    # ✅ EXISTS - User interactions
│   └── __tests__/            # Composable tests
│
├── services/                  # API services
│   ├── eventService.ts       # ✅ EXISTS - Events API
│   ├── eventDetailsService.ts # ✅ EXISTS - Event details API
│   ├── djService.ts          # ✅ EXISTS - DJs API
│   ├── teacherService.ts     # ✅ EXISTS - Teachers API
│   ├── coupleService.ts      # ✅ EXISTS - Couples API
│   ├── eventSeriesService.ts # ✅ EXISTS - Event Series API
│   ├── types.ts              # ✅ EXISTS - TypeScript types
│   └── __tests__/            # Service tests
│
├── router/
│   └── routes.ts             # ✅ EXISTS - All routes already defined
│
└── css/                       # SCSS styles
    ├── components/
    │   ├── _tables.scss      # ✅ EXISTS - Table styling
    │   └── _cards.scss       # ✅ EXISTS - Card styling
    └── pages/
        ├── _event-list.scss  # ✅ EXISTS - Event list styling
        └── _djs-page.scss    # ✅ EXISTS - DJ page styling

tests/
└── integration/__tests__/    # Integration tests
```

**Structure Decision**: Web application (frontend SPA). All required components, services, and routes ALREADY EXIST. This feature is primarily about **standardizing and documenting** existing implementations rather than creating new code. The main work is:

1. Define missing table column specifications
2. Ensure consistency across all 5 content types
3. Add comprehensive tests for existing functionality
4. Document the unified patterns

## Phase 0: Outline & Research

**Status**: ✅ COMPLETE

### Research Findings Summary

See [research.md](./research.md) for comprehensive analysis.

**Key Discoveries**:

1. ✅ All required table pages already exist and are functional
2. ✅ All required detail pages already exist and are functional
3. ✅ Composables (`useGenericList`, `useTablePagination`) fully implement requirements
4. ✅ All API services complete and HAL-compliant
5. ✅ Authentication fully implemented with JWT tokens
6. ✅ Error handling meets detailed error message requirements
7. ⚠️ Column definitions need standardization (only Events confirmed)
8. ⚠️ Date formatting requires ISO format change
9. ⚠️ Image displays must be conditionally disabled
10. ⚠️ Comprehensive tests needed for existing functionality

**Technical Decisions Made**:

- **Date Formatting**: Create `formatDateISO()` utility for table/detail ISO dates
- **Image Display**: Use feature flag to conditionally disable images
- **Column Definitions**: Document recommended columns for DJs, Teachers, Couples, Event Series
- **Testing Strategy**: Focus on testing existing implementations rather than new code

**No Blockers**: All NEEDS CLARIFICATION resolved through code analysis and specification

**Output**: research.md with detailed analysis of existing implementations

## Phase 1: Design & Contracts

**Status**: ✅ COMPLETE

_Prerequisites: research.md complete_

**Completed Deliverables**:

1. ✅ **data-model.md**: Complete data structures for all 5 content types

   - Entity definitions with field specifications
   - Table vs detail field mappings
   - Validation rules from FR-017 to FR-018
   - HAL response structure documentation
   - Computed property definitions

2. ✅ **contracts/table-columns.json**: Column definitions for all tables

   - Events: 7 columns (title, date, city, country, organizer, type, id)
   - DJs: 6 columns (name, city, country, active, id, actions)
   - Teachers: 6 columns (name, city, country, active, id, role)
   - Couples: 6 columns (name, teachers, city, country, active, id)
   - Event Series: 6 columns (title, organizer, location, type, active, id)
   - Column metadata: sortable flags, computed field logic, fallback fields

3. ✅ **contracts/error-messages.json**: Standardized error messages

   - Network errors: timeout, offline, connection refused, DNS errors
   - HTTP errors: 400, 401, 403, 404, 429, 500, 502, 503, 504
   - Data errors: empty table, invalid data, partial data, corrupted data
   - Table-specific: load failure, sort failure, filter failure, pagination failure
   - Detail-specific: load failure, embedded data failure, tab load failure
   - User actions: retry, refresh, back, login, clearFilters, wait
   - Quasar notification settings

4. ✅ **quickstart.md**: User flow validation steps

   - 5 complete user flows (one per content type)
   - Error flow testing scenarios
   - Performance validation steps
   - Accessibility testing procedures
   - Mobile testing scenarios
   - Success criteria checklist

5. ✅ **Agent context updated**: `.github/copilot-instructions.md`
   - Ran `.specify/scripts/bash/update-agent-context.sh copilot`
   - Added TypeScript 5.x strict mode context
   - Added Quasar Framework 2.x context
   - Added WordPress REST API (TMD v3) context

**Output**: All Phase 1 artifacts complete and validated

## Phase 2: Task Planning Approach

_This section describes what the /tasks command will do - DO NOT execute during /plan_

### Task Generation Strategy

The /tasks command will load `.specify/templates/tasks-template.md` and generate tasks.md following this approach:

**Source Documents for Task Generation**:

1. **data-model.md**: Entity definitions → model/type creation tasks
2. **contracts/table-columns.json**: Column specs → table standardization tasks
3. **contracts/error-messages.json**: Error handling → error component tasks
4. **quickstart.md**: User flows → integration test tasks
5. **research.md**: Existing code analysis → refactoring/enhancement tasks

**Task Categories (TDD Order)**:

1. **Contract Test Tasks** (Foundational - tests fail initially):
   - Task: Create error message composable tests (`useErrorMessages.test.ts`)
   - Task: Create ISO date formatter tests (`formatDateISO.test.ts`)
   - Task: Create table column configuration tests (validate table-columns.json schema)
2. **Model & Type Tasks** (Data structures):

   - Task: Update service types for strict null handling
   - Task: Add ISO date formatter utility to `useFormatters.ts`
   - Task: Create error message type definitions from contracts

3. **Component Test Tasks** (Per content type):

   - Task: EventList.vue - test column definitions match contract
   - Task: DJsPage.vue - test column definitions match contract
   - Task: TeachersPage.vue - test column definitions match contract
   - Task: CouplesPage.vue - test column definitions match contract
   - Task: EventSeriesPage.vue - test column definitions match contract
   - Task: Test detail pages display all fields per data-model.md

4. **Implementation Tasks** (Make tests pass):

   - Task: Standardize EventList.vue columns to match table-columns.json
   - Task: Standardize DJsPage.vue columns to match table-columns.json
   - Task: Standardize TeachersPage.vue columns to match table-columns.json
   - Task: Standardize CouplesPage.vue columns to match table-columns.json
   - Task: Standardize EventSeriesPage.vue columns to match table-columns.json
   - Task: Implement ISO date formatting in all table/detail views
   - Task: Disable image display in tables (feature flag or remove)
   - Task: Implement error message composable from error-messages.json
   - Task: Update all error handlers to use standardized messages

5. **Integration Test Tasks** (From quickstart.md):

   - Task: Events table → detail navigation test
   - Task: DJs table → detail navigation test
   - Task: Teachers table → detail navigation test
   - Task: Couples table → detail navigation test
   - Task: Event Series table → detail navigation test
   - Task: Network error handling integration test
   - Task: 401/404 error handling integration test

6. **Accessibility & Performance Tasks**:
   - Task: Keyboard navigation test for all tables
   - Task: Screen reader compatibility test
   - Task: Mobile responsive test for all tables
   - Task: Performance test (large table load time < 2s)

### Ordering Strategy

**Execution Order Principles**:

1. **Tests Before Implementation** (TDD): Write failing tests first, then make them pass
2. **Dependency Order**: Utilities → composables → components → integration
3. **Parallel-Safe Tasks**: Mark tasks [P] if they modify independent files
4. **Content Type Consistency**: Group all work for one content type together

**Specific Ordering**:

```
Phase A: Foundation (can run in parallel)
  [P] Task 1: ISO date formatter tests + implementation
  [P] Task 2: Error message types + composable
  [P] Task 3: Table column JSON schema validation

Phase B: Table Standardization (sequential per content type, parallel across types)
  [P] Task 4: Events table tests + column standardization
  [P] Task 5: DJs table tests + column standardization
  [P] Task 6: Teachers table tests + column standardization
  [P] Task 7: Couples table tests + column standardization
  [P] Task 8: Event Series table tests + column standardization

Phase C: Detail Pages (sequential per content type, parallel across types)
  [P] Task 9: Events detail tests + ISO dates + no images
  [P] Task 10: DJs detail tests + ISO dates + no images
  [P] Task 11: Teachers detail tests + ISO dates + no images
  [P] Task 12: Couples detail tests + ISO dates + no images
  [P] Task 13: Event Series detail tests + ISO dates + no images

Phase D: Error Handling (sequential - shared error handler)
  Task 14: Update all table error handlers to use error-messages.json
  Task 15: Update all detail error handlers to use error-messages.json

Phase E: Integration & Validation (sequential)
  Task 16-20: Integration tests per content type (table → detail flow)
  Task 21: Network/HTTP error integration tests
  Task 22: Accessibility tests (keyboard, screen reader)
  Task 23: Mobile responsive tests
  Task 24: Performance validation tests
  Task 25: Execute quickstart.md validation flows
```

### Estimated Task Count

**Total: ~25-30 tasks**

- Foundation: 3 tasks
- Table standardization: 5 tasks (1 per content type)
- Detail pages: 5 tasks (1 per content type)
- Error handling: 2 tasks
- Integration tests: 5-6 tasks
- Accessibility/performance: 4 tasks
- Validation: 1 task

**Parallelization Potential**: ~15-18 tasks marked [P] for parallel execution (60-70% of tasks)

### Task File Structure

Each task in tasks.md will follow this format:

```markdown
### Task N: [Brief Title]

**File(s)**: `src/path/to/file.ts`, `src/path/__tests__/file.test.ts`
**Type**: [Test|Implementation|Refactor|Documentation]
**Depends on**: Task X (if applicable)
**Parallel**: [P] (if independent)

**Objective**: One-sentence description of what this task accomplishes

**Acceptance Criteria**:

- [ ] Criterion 1 (testable)
- [ ] Criterion 2 (testable)
- [ ] Tests pass: `pnpm test path/to/test`

**Implementation Notes**:

- Reference to contract/spec section
- Key technical decisions
- Edge cases to handle
```

**IMPORTANT**: This planning section describes the approach only. The /tasks command will execute this strategy to generate the actual tasks.md file with numbered, ordered tasks following the structure above.

---

**Next Command**: Run `/tasks` to generate tasks.md following this approach

## Phase 3+: Future Implementation

_These phases are beyond the scope of the /plan command_

**Phase 3**: Task execution (/tasks command creates tasks.md)  
**Phase 4**: Implementation (execute tasks.md following constitutional principles)  
**Phase 5**: Validation (run tests, execute quickstart.md, performance validation)

## Complexity Tracking

_Fill ONLY if Constitution Check has violations that must be justified_

| Violation                  | Why Needed         | Simpler Alternative Rejected Because |
| -------------------------- | ------------------ | ------------------------------------ |
| [e.g., 4th project]        | [current need]     | [why 3 projects insufficient]        |
| [e.g., Repository pattern] | [specific problem] | [why direct DB access insufficient]  |

## Progress Tracking

_This checklist is updated during execution flow_

**Phase Status**:

- [x] Phase 0: Research complete (/plan command) - ✅ research.md created
- [x] Phase 1: Design complete (/plan command) - ✅ All artifacts created
- [x] Phase 2: Task planning complete (/plan command) - ✅ Approach described
- [x] Phase 3: Tasks generated (/tasks command) - ✅ tasks.md created (42 tasks)
- [ ] Phase 4: Implementation complete
- [ ] Phase 5: Validation passed

**Gate Status**:

- [x] Initial Constitution Check: PASS (all 5 principles)
- [x] Post-Design Constitution Check: PASS (no new violations)
- [x] All NEEDS CLARIFICATION resolved (5 clarifications answered)
- [x] Complexity deviations documented (none - no violations)

**Artifact Completion**:

- [x] spec.md with clarifications (Session 2025-10-02)
- [x] research.md (15KB comprehensive analysis)
- [x] data-model.md (11KB entity definitions)
- [x] contracts/table-columns.json (5 content types)
- [x] contracts/error-messages.json (comprehensive error catalog)
- [x] quickstart.md (user flow validation)
- [x] .github/copilot-instructions.md updated
- [x] tasks.md (42 tasks, 60% parallelizable)

---

**Plan Status**: ✅ COMPLETE | **Tasks Status**: ✅ READY FOR EXECUTION  
**Next Phase**: Begin implementation with T001 (validate structure) → Phase 3.2 (tests first)  
_Based on Constitution v2.1.1 - See `/memory/constitution.md`_
