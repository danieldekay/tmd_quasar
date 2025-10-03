<!--
Sync Impact Report:
- Version change: 1.0.1 → 1.1.0 → 1.1.1 (PATCH: Biome v2 type inference configuration)
- Amendment: Added Biome v2 type inference capability to Principle VI (2025-10-03)
- Modified principles:
  - Principle II: TypeScript Strict Compliance - Added real-time dev server checking (v1.1.0)
  - Principle VI: Biome-First Code Quality - Added type inference domains and Vue support (v1.1.1)
- Added sections:
  - Auto-Fix Workflow Standards (v1.1.0)
  - Enhanced Type Checking Requirements (v1.1.0)
  - Package Manager Version Enforcement - pnpm@10.18.0 (v1.1.0)
  - Biome v2 Type Inference Configuration - project + vue domains (v1.1.1)
- Configuration changes:
  - biome.json: Added "project": "recommended" domain for type inference
  - biome.json: Added "vue": "recommended" domain for Vue 3 support
- Templates requiring updates:
  - ✅ plan-template.md: Add Biome check to Constitution Check section
  - ✅ tasks-template.md: Add Biome auto-fix tasks, type-check tasks
  - ⚠ spec-template.md: Review for quality gate mentions
- Follow-up TODOs: None
- Documentation updated:
  - BIOME_SETUP.md: Added comprehensive Biome v2 type inference section
  - .github/copilot-instructions.md: Already mentions Biome as primary tool
-->

# TMD Quasar Constitution

## Core Principles

### I. Quasar-First Development

All features MUST leverage Quasar's built-in components and utilities before creating custom solutions. Custom components are permitted only when Quasar lacks equivalent functionality. All UI MUST use `q-` prefixed components (QBtn, QCard, QTable, etc.) and follow Quasar's responsive utilities and theming system.

Rationale: Ensures consistency, reduces maintenance burden, and leverages battle-tested components with proper accessibility and performance optimizations.

### II. TypeScript Strict Compliance with Real-Time Checking (NON-NEGOTIABLE)

- All code MUST be written in TypeScript with strict mode enabled
- `any` type is prohibited; proper typing is mandatory
- Prefer `type` over `interface` for consistency
- Enums are prohibited; use const objects instead
- All async operations MUST use `void` operator or proper error handling
- Undefined values MUST be handled explicitly with null coalescing or checks
- **Real-time type checking MUST be enabled in dev server** (`vite-plugin-checker` with `server: true`)
- Type checking MUST pass before commits: `pnpm type-check` returns exit code 0
- TypeScript errors MUST be visible in browser during development

Rationale: Type safety prevents runtime errors, improves code maintainability, and enables better developer tooling. Real-time dev server checking provides immediate feedback and prevents type errors from entering the codebase. The enhanced workflow catches issues before they reach CI/CD.

### III. Composition API Structure

All Vue components MUST use `<script setup lang="ts">` syntax with this exact structure order:

1. Imports (Vue, composables, utilities)
2. Props and emits with TypeScript interfaces
3. Composables
4. Reactive state
5. Computed properties
6. Methods
7. Lifecycle hooks

Rationale: Consistent structure improves code readability, maintainability, and enables easier onboarding for new developers.

### IV. Test-First Development

- All new functionality MUST have tests written before implementation
- Tests MUST be placed in `__tests__` folders following Quasar conventions
  - Services: `src/services/__tests__/`
  - Stores: `src/stores/__tests__/`
  - Composables: `src/composables/__tests__/`
  - Components: `src/components/*/__tests__/`
  - Integration: `tests/integration/__tests__/`
- Use Vitest for all testing with "Start Simple, Build Up" philosophy
- Import validation tests MUST be written first
- Tests MUST verify behavior, not implementation details
- Run tests with `pnpm test --run` for CI compatibility

Rationale: Prevents regressions, ensures code quality, and provides confidence during refactoring and feature additions. The `__tests__` folder convention is a Quasar framework standard that improves test discoverability and organization.

### V. Mobile-First & Accessibility

All features MUST implement mobile-first responsive design with proper accessibility standards:

- Touch-optimized interactions for mobile devices
- ARIA labels for dynamic content and interactions
- Keyboard navigation support for all functionality
- Semantic HTML structure in templates
- Loading and error states for all async operations
- Color contrast meeting WCAG 2.1 AA standards

Rationale: Ensures the application serves all users effectively across devices and abilities, meeting modern web standards.

### VI. Biome-First Code Quality & Auto-Fix

- **Biome MUST be the primary tool** for code formatting and linting (20-100x faster than ESLint/Prettier)
- All code MUST pass `pnpm check:biome` before commits
- Biome auto-fixes MUST be applied: import sorting, formatting, common lint issues
- **Biome v2 type inference MUST be enabled** (`"project": "recommended"` domain in `biome.json`)
  - Provides ~75% type error coverage without TypeScript compiler overhead
  - Detects floating promises, type mismatches, and unsafe operations
  - Complements but does NOT replace `vue-tsc` for comprehensive type validation
- **Vue domain MUST be enabled** (`"vue": "recommended"` domain for Vue 3 specific rules)
- ESLint/Prettier remain available for Vue-specific rules but Biome takes precedence
- VS Code Biome extension SHOULD be installed for format-on-save
- Configuration in `biome.json` with these non-negotiable settings:
  - 2-space indentation
  - 100-character line width
  - Single quotes for JavaScript/TypeScript
  - Trailing commas everywhere
  - Unix (LF) line endings
  - Import organization enabled
  - `useConst` enforced (prefer const over let)
  - `useImportType` enforced (TypeScript type imports)
  - `noExplicitAny` as warning (error in production code, warning in tests)
  - Project domain enabled for type inference
  - Vue domain enabled for Vue 3 support

Rationale: Biome provides instant feedback (100ms vs 5-10s), eliminates configuration complexity (single `biome.json` vs multiple config files), and automatically fixes most issues. Biome v2's type inference catches ~75% of type errors during fast checks, reducing reliance on slow full type checking for rapid iteration. The speed improvement enables pre-commit checks without frustrating developers. Auto-fix capabilities reduce manual formatting work and maintain consistency across the codebase.

## Quality Standards

### Auto-Fix Workflow Standards

- **Before every commit**:
  1. `pnpm check:biome` - Auto-fix formatting, imports, and lint issues
  2. `pnpm type-check` - Validate TypeScript types
  3. `pnpm test:run` - Run all tests
- **VS Code integration** (recommended):
  - Install Biome extension (`biomejs.biome`)
  - Enable format-on-save in `.vscode/settings.json`
  - Use VS Code tasks for quality checks: `Cmd+Shift+B` → "Quality: Pre-Commit (Biome)"
- **CI/CD validation**:
  - `pnpm ci:biome` - Check without auto-fix (fails on issues)
  - `pnpm type-check` - Type validation
  - `pnpm test:run` - Test suite

### Code Quality Requirements

- Biome compliance is mandatory; `pnpm check:biome` MUST pass before commits
- Type checking compliance is mandatory; `pnpm type-check` MUST pass before commits
- ESLint may be used for Vue-specific rules: `pnpm lint` SHOULD pass but Biome takes precedence
- No floating promises (`@typescript-eslint/no-floating-promises` enforced)
- Consistent naming: camelCase with auxiliary verbs (`isLoading`, `hasError`)
- Template syntax for declarative rendering over imperative code
- Modularization preferred over code duplication
- Unused imports MUST be removed (Biome auto-fixes this)
- Import statements MUST be alphabetically sorted (Biome auto-fixes this)

### Performance Standards

- Request debouncing and cancellation for API calls
- Lazy loading for routes and heavy components
- Efficient data loading with proper caching strategies
- Server-side pagination with metadata handling
- Cookie-based persistence for user preferences (30-day expiry)

### API Integration Standards

- WordPress REST API integration following headless CMS patterns
- Local development: `/wp-json/tmd/v3` endpoints
- Production: Mixed v2/v3 endpoints based on content type
- Proper error handling with user-friendly messages
- Authentication via JWT tokens where required

## Development Workflow

### Package Manager

- **pnpm version 10.18.0 MUST be used** (enforced via `corepack use pnpm@10.18.0`)
- Use `pnpm` exclusively for all package operations
- Never use `npm` or `yarn` commands
- Lock file (`pnpm-lock.yaml`) MUST be committed
- Dependencies MUST be installed via `pnpm install`

### Git Workflow

- Use git-flow methodology with feature branches
- Descriptive commit messages following conventional commit format
- Code reviews mandatory before merging
- Never automatically check in code without review
- Pre-commit quality gates:
  1. Biome auto-fix: `pnpm check:biome`
  2. Type validation: `pnpm type-check`
  3. Test suite: `pnpm test:run`

### Build and Deployment

- Development: `pnpm dev` with file watching and real-time type checking
- Production builds: `pnpm build` with optimization
- Auto-fix and validate: `pnpm check:biome && pnpm type-check`
- Testing: `pnpm test --run` for CI environments
- Pre-commit workflow: Use VS Code task "Quality: Pre-Commit (Biome)" or run commands manually

### Quality Command Reference

| Command                 | Purpose                     | When to Use           |
| ----------------------- | --------------------------- | --------------------- |
| `pnpm check:biome`      | Format + lint with auto-fix | Before every commit   |
| `pnpm ci:biome`         | Check without auto-fix      | CI/CD pipelines       |
| `pnpm type-check`       | TypeScript validation       | Before commits, CI/CD |
| `pnpm type-check:watch` | Continuous type checking    | During development    |
| `pnpm lint`             | ESLint (Vue-specific)       | Secondary validation  |
| `pnpm format:biome`     | Format only                 | Quick formatting      |
| `pnpm lint:biome`       | Lint only                   | Focused linting       |

### Documentation Maintenance

- Update CHANGELOG.md for significant changes using semantic versioning
- Maintain DESIGN.md for architectural decisions
- Update README.md for major changes only
- Keep TODO.md for mid to long-term tasks
- Update QUALITY_IMPROVEMENTS.md for tooling and workflow enhancements

## Governance

This constitution supersedes all other development practices and guidelines. All pull requests and code reviews MUST verify compliance with these principles. Any deviation requires explicit justification and documentation.

Amendment process requires:

1. Documented rationale for change
2. Impact assessment on existing codebase
3. Migration plan for affected code
4. Version bump following semantic versioning
5. Update to Sync Impact Report (HTML comment at top of this file)

Use `.github/copilot-instructions.md` for detailed runtime development guidance and implementation specifics.

**Version**: 1.1.0 | **Ratified**: 2025-10-01 | **Last Amended**: 2025-10-03
