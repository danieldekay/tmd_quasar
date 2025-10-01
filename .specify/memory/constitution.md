<!--
Sync Impact Report:
- Version change: 1.0.0 → 1.0.1
- Amendment: Test location clarification (PATCH version bump)
- Modified principles: Principle IV - Test-First Development (test location specification)
- Added guidance: Tests MUST be placed in __tests__ folders per Quasar conventions
- Templates requiring updates: ✅ tasks-template.md will reference __tests__ pattern
- Follow-up TODOs: None
-->

# TMD Quasar Constitution

## Core Principles

### I. Quasar-First Development

All features MUST leverage Quasar's built-in components and utilities before creating custom solutions. Custom components are permitted only when Quasar lacks equivalent functionality. All UI MUST use `q-` prefixed components (QBtn, QCard, QTable, etc.) and follow Quasar's responsive utilities and theming system.

Rationale: Ensures consistency, reduces maintenance burden, and leverages battle-tested components with proper accessibility and performance optimizations.

### II. TypeScript Strict Compliance (NON-NEGOTIABLE)

- All code MUST be written in TypeScript with strict mode enabled
- `any` type is prohibited; proper typing is mandatory
- Prefer `type` over `interface` for consistency
- Enums are prohibited; use const objects instead
- All async operations MUST use `void` operator or proper error handling
- Undefined values MUST be handled explicitly with null coalescing or checks

Rationale: Type safety prevents runtime errors, improves code maintainability, and enables better developer tooling and refactoring capabilities.

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

## Quality Standards

### Code Quality Requirements

- ESLint compliance is mandatory; `pnpm lint` MUST pass before commits
- No floating promises (`@typescript-eslint/no-floating-promises` enforced)
- Consistent naming: camelCase with auxiliary verbs (`isLoading`, `hasError`)
- Template syntax for declarative rendering over imperative code
- Modularization preferred over code duplication

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

### Git Workflow

- Use git-flow methodology with feature branches
- Descriptive commit messages following conventional commit format
- Code reviews mandatory before merging
- Never automatically check in code without review

### Build and Deployment

- Use `pnpm` exclusively for package management
- Development: `pnpm dev` with file watching
- Production builds: `pnpm build` with optimization
- Linting: `pnpm lint` before commits
- Testing: `pnpm test --run` for CI environments

### Documentation Maintenance

- Update CHANGELOG.md for significant changes using semantic versioning
- Maintain DESIGN.md for architectural decisions
- Update README.md for major changes only
- Keep TODO.md for mid to long-term tasks

## Governance

This constitution supersedes all other development practices and guidelines. All pull requests and code reviews MUST verify compliance with these principles. Any deviation requires explicit justification and documentation.

Amendment process requires:

1. Documented rationale for change
2. Impact assessment on existing codebase
3. Migration plan for affected code
4. Version bump following semantic versioning

Use `.github/copilot-instructions.md` for detailed runtime development guidance and implementation specifics.

**Version**: 1.0.1 | **Ratified**: 2025-10-01 | **Last Amended**: 2025-10-01
