# Implementation Plan: Enhanced Event Display

**Branch**: `004-event-display` | **Date**: 2025-10-03 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/004-event-display/spec.md`

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

This feature enhances the event detail display page (EventDetails.vue) to provide an attractive, mobile-friendly presentation of tango marathon event information. Key improvements include: prominent featured images with category-specific fallbacks, human-readable date formatting ("18-22 Sep 2025"), interactive OpenStreetMap integration in the venue tab (zoom level 11), and clear category/edition pills in the hero section. The implementation focuses on mobile-first responsive design, lazy loading for performance, and graceful handling of missing data while maintaining WCAG 2.1 AA accessibility standards.

**Technical Approach**: Enhance existing EventDetails.vue component using Quasar components (QImg, QTabs, QChip), implement date formatting utilities, integrate Leaflet for OpenStreetMap display with lazy loading, create category-specific default image system, and add comprehensive tests following TDD principles.

## Technical Context

**Language/Version**: TypeScript 5.x (strict mode), Vue 3 Composition API  
**Primary Dependencies**: Quasar 2.x, Leaflet.js (OpenStreetMap), date-fns (date formatting)  
**Storage**: WordPress REST API (TMD v3 endpoints), client-side caching via composables  
**Testing**: Vitest for unit/integration tests, component testing with @vue/test-utils  
**Target Platform**: Modern browsers (mobile-first: iOS Safari 14+, Chrome Android 90+, desktop: Chrome/Firefox/Safari latest)
**Project Type**: Single web application (Vue 3 + Quasar frontend)  
**Performance Goals**: <2s image load on 3G, <1s map init, Lighthouse mobile score 80+, <200ms date formatting  
**Constraints**: Mobile-first (320px+ width), WCAG 2.1 AA accessibility, lazy loading required, 30-day browser support  
**Scale/Scope**: Single EventDetails.vue page enhancement, ~5 new utility functions, ~10 test files, category-specific image system

## Constitution Check

_GATE: Must pass before Phase 0 research. Re-check after Phase 1 design._

### I. Quasar-First Development

- [x] Feature uses Quasar built-in components where applicable (QImg, QTabs, QChip, QCard, QIcon)
- [x] No custom components created when Quasar equivalent exists
- [x] Uses q-prefixed components and Quasar utilities (breakpoints, lazy loading)

### II. TypeScript Strict Compliance with Real-Time Checking

- [x] All code written in TypeScript with strict mode
- [x] No `any` types used (proper typing enforced for event data, map config, date utils)
- [x] Types over interfaces, no enums (const objects for category mappings)
- [x] Async operations use void operator or proper error handling (map loading, image loading)
- [x] Undefined values handled explicitly (fallback images, missing coordinates)
- [x] Real-time type checking enabled in dev server (vite-plugin-checker)
- [x] `pnpm type-check` passes before implementation

### III. Composition API Structure

- [x] All Vue components use `<script setup lang="ts">` syntax (EventDetails.vue enhancement)
- [x] Correct structure order: imports → props/emits → composables → state → computed → methods → lifecycle

### IV. Test-First Development

- [x] Tests written before implementation (TDD approach)
- [x] Tests placed in `__tests__` folders per Quasar conventions
- [x] Vitest used for all testing
- [x] Import validation tests written first (utils, composables)
- [x] Tests verify behavior, not implementation details (date format output, image fallback logic)

### V. Mobile-First & Accessibility

- [x] Mobile-first responsive design (320px+ support, vertical stacking)
- [x] Touch-optimized interactions (44px touch targets, swipe gestures)
- [x] ARIA labels for dynamic content (map, pills, images)
- [x] Keyboard navigation support (map, tabs)
- [x] Loading and error states for async operations (map init, image loading)
- [x] WCAG 2.1 AA color contrast compliance (category pills, text overlays)

### VI. Biome-First Code Quality & Auto-Fix

- [x] Biome configured as primary formatting/linting tool
- [x] `pnpm check:biome` passes before commits
- [x] Auto-fixes applied: import sorting, formatting, common lint issues
- [x] `biome.json` configuration follows constitutional requirements:
  - [x] 2-space indentation
  - [x] 100-character line width
  - [x] Single quotes
  - [x] Trailing commas everywhere
  - [x] Unix (LF) line endings
  - [x] Import organization enabled
  - [x] `useConst` enforced
  - [x] `useImportType` enforced

### Quality Standards

- [x] Auto-fix workflow: `pnpm check:biome` → `pnpm type-check` → `pnpm test:run`
- [x] Package manager: pnpm@10.18.0 used exclusively
- [x] Pre-commit quality gates implemented
- [x] VS Code Biome extension recommended in `.vscode/extensions.json`

### Complexity Violations (if any)

_Document any constitutional deviations with justification_

No constitutional violations. All requirements can be met using:

- Existing Quasar components (no custom UI components needed)
- Standard TypeScript patterns (no complex abstractions)
- Single-file enhancements to EventDetails.vue (no new architecture)
- Leaflet.js for maps (widely-used, well-documented library)

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
├── pages/
│   └── EventDetails.vue                    # Enhanced event detail page
├── composables/
│   ├── useEventDisplay.ts                  # Event display logic (dates, images, pills)
│   ├── useMapIntegration.ts                # Leaflet map integration
│   └── __tests__/
│       ├── useEventDisplay.test.ts
│       └── useMapIntegration.test.ts
├── utils/
│   ├── dateFormatters.ts                   # Date formatting utilities
│   ├── categoryImages.ts                   # Category-specific default images
│   └── __tests__/
│       ├── dateFormatters.test.ts
│       └── categoryImages.test.ts
├── components/
│   └── event/
│       ├── EventHeroSection.vue            # Hero with featured image, pills
│       ├── EventVenueMap.vue               # Map component (lazy loaded)
│       └── __tests__/
│           ├── EventHeroSection.test.ts
│           └── EventVenueMap.test.ts
├── types/
│   └── event.ts                            # Event, Venue, Category types
└── assets/
    └── images/
        └── category-defaults/              # Default images per category
            ├── marathon.webp
            ├── festival.webp
            └── encuentro.webp

tests/
└── integration/
    └── __tests__/
        └── event-display.test.ts           # End-to-end display scenarios
```

**Structure Decision**: Single web application (Quasar/Vue 3 frontend). This is a frontend-only enhancement with no backend changes required. All improvements are within the existing tmd_quasar repository structure, enhancing the EventDetails.vue page with new composables, utilities, and potentially extracted components for better maintainability.

## Phase 0: Outline & Research

✅ **COMPLETE** - See `research.md`

**Key Decisions Made**:

1. **OpenStreetMap Library**: Leaflet.js (42KB, excellent TS support, mobile-friendly)
2. **Date Formatting**: date-fns (tree-shakeable, ~4KB, TypeScript-first)
3. **Category Images**: Static WebP mappings in `/src/assets/images/category-defaults/`
4. **Lazy Loading**: Vue 3 `Suspense` + `defineAsyncComponent` for map
5. **Image Handling**: Quasar QImg with responsive sizing and lazy loading
6. **Geocoding**: OpenStreetMap Nominatim API with sessionStorage caching

**Dependencies Added**:

- leaflet ^1.9.4
- @types/leaflet ^1.9.8
- date-fns ^3.0.0 (if not already present)
- vitest-axe ^0.1.0 (accessibility testing)

**Performance Impact**: +136KB total (acceptable for feature scope)

---

## Phase 1: Design & Contracts

✅ **COMPLETE** - See `data-model.md`, `contracts/`, and `quickstart.md`

**Artifacts Generated**:

1. **data-model.md**: Entity definitions, computed properties, type definitions

   - Event, Venue, Category entities (presentation layer only)
   - Computed properties: formattedDateRange, editionDisplay, categoryPillData, heroImageSrc
   - Map configuration logic with geocoding fallback

2. **Contracts**:

   - `date-formatters.contract.md`: formatEventDateRange, formatOrdinal, formatEdition
   - `category-images.contract.md`: CATEGORY_CONFIG, getCategoryConfig, getCategoryDefaultImage
   - `use-event-display.contract.md`: Vue composable for hero section logic
   - `use-map-integration.contract.md`: Vue composable for Leaflet map management

3. **quickstart.md**: User story validation guide
   - 6 user stories with manual validation steps
   - 4 edge case scenarios
   - Performance and accessibility validation
   - Pre-deployment checklist

**Contract Tests** (to be written in Phase 2):

- All contracts include detailed test specifications
- TDD approach: Tests written before implementation
- 100% coverage target for utility functions
- 90%+ coverage target for composables

**Design Validation**:

- ✅ No new database entities (presentation layer only)
- ✅ All transformations are pure functions or computed properties
- ✅ Follows Quasar-First principle (QImg, QChip, QTabs, etc.)
- ✅ TypeScript strict mode compatible
- ✅ Mobile-first responsive design
- ✅ WCAG 2.1 AA accessibility compliance

## Phase 2: Task Planning Approach

_This section describes what the /tasks command will do - DO NOT execute during /plan_

**Task Generation Strategy**:

The `/tasks` command will load `.specify/templates/tasks-template.md` and generate a sequential, TDD-ordered task list based on Phase 1 artifacts.

**Task Categories**:

1. **Setup Tasks** (1-3):

   - Install dependencies (leaflet, @types/leaflet, date-fns, vitest-axe)
   - Create directory structure for new files
   - Add category default images to `/src/assets/images/category-defaults/`

2. **Utility Implementation** (4-10) - [P] parallel where independent:

   - [P] Write test: `dateFormatters.test.ts` (formatEventDateRange, formatOrdinal, formatEdition)
   - [P] Implement: `dateFormatters.ts` (make tests pass)
   - [P] Write test: `categoryImages.test.ts` (CATEGORY_CONFIG, getCategoryConfig, getCategoryDefaultImage)
   - [P] Implement: `categoryImages.ts` (make tests pass)

3. **Composable Implementation** (11-18):

   - Write test: `useEventDisplay.test.ts` (depends on utils)
   - Implement: `useEventDisplay.ts` (make tests pass)
   - Write test: `useMapIntegration.test.ts` (depends on utils)
   - Implement: `useMapIntegration.ts` (make tests pass, mock Leaflet)

4. **Component Extraction** (19-26) - Optional for maintainability:

   - [P] Write test: `EventHeroSection.test.ts` (if extracting hero as component)
   - [P] Implement: `EventHeroSection.vue` (uses useEventDisplay)
   - Write test: `EventVenueMap.test.ts` (lazy loaded component)
   - Implement: `EventVenueMap.vue` (uses useMapIntegration)

5. **EventDetails.vue Enhancement** (27-30):

   - Update EventDetails.vue imports (composables, utils, components)
   - Integrate useEventDisplay in template (hero section)
   - Integrate EventVenueMap in venue tab (lazy loaded with Suspense)
   - Update SCSS styles (hero gradient, responsive pills, map container)

6. **Integration Testing** (31-33):

   - Write integration test: `event-display.test.ts` (user stories 1-6)
   - Run integration test, verify all scenarios pass
   - Accessibility testing with vitest-axe

7. **Visual & Manual QA** (34-37):

   - Test on mobile devices (320px, 390px, 414px widths)
   - Test keyboard navigation and screen readers
   - Run Lighthouse performance audit (target 80+)
   - Validate against quickstart.md checklist

8. **Documentation & Cleanup** (38-40):
   - Update component documentation (JSDoc comments)
   - Run `pnpm check:biome` and fix any issues
   - Run `pnpm type-check` and resolve any type errors

**Ordering Strategy**:

1. **Test-Driven Development (TDD)**: Tests before implementation for every module
2. **Dependency Order**:
   - Utilities first (no dependencies)
   - Composables second (depend on utilities)
   - Components third (depend on composables)
   - Integration last (depends on all above)
3. **Parallel Execution [P]**: Independent test/implementation pairs can run in parallel
4. **Validation Gates**: Cannot proceed to next category until tests pass

**Estimated Task Count**: 35-40 numbered, ordered tasks

**Task Template** (example):

```markdown
## Task 4: Write Date Formatters Unit Tests [P]

**File**: `src/utils/__tests__/dateFormatters.test.ts`
**Type**: Test (TDD - before implementation)
**Status**: ⬜ Not Started

**Description**:
Write comprehensive unit tests for date formatting utilities following the contract in `contracts/date-formatters.contract.md`.

**Acceptance Criteria**:

- [ ] Test suite for formatEventDateRange (valid ranges, single day, year boundary, errors)
- [ ] Test suite for formatOrdinal (1-30, special cases 11-13, large numbers, errors)
- [ ] Test suite for formatEdition (number, string, undefined, invalid)
- [ ] All tests initially fail (no implementation exists yet)
- [ ] Tests follow Vitest conventions
- [ ] Tests placed in `src/utils/__tests__/`

**Dependencies**: None (can run in parallel with other test tasks)

**Estimated Time**: 30 minutes
```

**IMPORTANT**: The `/tasks` command will generate the full `tasks.md` file. The `/plan` command STOPS here.

---

## Phase 3+: Future Implementation

_These phases are beyond the scope of the /plan command_

**Phase 3**: Task execution - `/tasks` command creates tasks.md with 35-40 numbered tasks

**Phase 4**: Implementation - Execute tasks.md sequentially following TDD principles:

- Write failing tests
- Implement to make tests pass
- Refactor while keeping tests green
- Validate with `pnpm test:run`, `pnpm type-check`, `pnpm check:biome`

**Phase 5**: Validation - Execute quickstart.md validation:

- Manual user story validation (6 stories)
- Edge case testing (4 scenarios)
- Performance validation (Lighthouse 80+)
- Accessibility validation (keyboard, screen reader, contrast)
- Regression testing (existing features unchanged)

## Complexity Tracking

_Fill ONLY if Constitution Check has violations that must be justified_

| Violation                  | Why Needed         | Simpler Alternative Rejected Because |
| -------------------------- | ------------------ | ------------------------------------ |
| [e.g., 4th project]        | [current need]     | [why 3 projects insufficient]        |
| [e.g., Repository pattern] | [specific problem] | [why direct DB access insufficient]  |

## Progress Tracking

_This checklist is updated during execution flow_

**Phase Status**:

- [x] Phase 0: Research complete (/plan command) - See research.md
- [x] Phase 1: Design complete (/plan command) - See data-model.md, contracts/, quickstart.md
- [x] Phase 2: Task planning complete (/plan command - approach described above)
- [ ] Phase 3: Tasks generated (/tasks command) - Next step: Run `/tasks`
- [ ] Phase 4: Implementation complete
- [ ] Phase 5: Validation passed

**Gate Status**:

- [x] Initial Constitution Check: PASS (no violations)
- [x] Post-Design Constitution Check: PASS (all requirements met with Quasar components)
- [x] All NEEDS CLARIFICATION resolved (no unknowns in Technical Context)
- [x] Complexity deviations documented (none - simple enhancement approach)

**Artifacts Generated**:

- [x] research.md (Phase 0)
- [x] data-model.md (Phase 1)
- [x] contracts/date-formatters.contract.md (Phase 1)
- [x] contracts/category-images.contract.md (Phase 1)
- [x] contracts/use-event-display.contract.md (Phase 1)
- [x] contracts/use-map-integration.contract.md (Phase 1)
- [x] quickstart.md (Phase 1)
- [ ] tasks.md (Phase 2 - created by /tasks command)

---

**PLAN COMPLETE** ✅

**Next Command**: `/tasks` - Generate detailed implementation task list

---

_Based on Constitution v1.1.1 - See `.specify/memory/constitution.md`_
