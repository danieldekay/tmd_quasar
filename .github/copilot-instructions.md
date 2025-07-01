# GitHub Copilot Instructions for TMD Quasar Project

## Project Overview

You are working on the **TMD (Tango Marathons) Quasar Frontend**, a Vue 3 + TypeScript application built with the Quasar framework. This is a frontend for a headless WordPress site (tangomarathons.com) that uses custom post types and fields.

### Key Technologies
- **Framework**: Quasar (Vue 3 + TypeScript)
- **Package Manager**: pnpm
- **Testing**: Vitest for unit and component testing
- **API**: GraphQL with Apollo Client, REST endpoints
- **Styling**: Quasar components, SCSS
- **State Management**: Pinia
- **Build Tool**: Vite

## Quasar Framework Best Practices

### Component Development
- **Always use Quasar's built-in components** when available before creating custom solutions
- Use `q-` prefixed components (QBtn, QCard, QTable, etc.)
- Leverage Quasar's responsive utilities and breakpoint system
- Use Quasar's color palette and theming system

### Page Creation Workflow
When creating new pages:
1. Create the Vue component in `src/pages/`
2. Add the route to `src/router/routes.ts`
3. Update navigation components if needed
4. Run linter after changes: `pnpm lint`

### Layout and Navigation
- Use Quasar's layout system (QLayout, QHeader, QDrawer, QPageContainer)
- Follow existing navigation patterns in the project
- Implement responsive design with mobile-first approach

## Vue 3 + TypeScript Standards

### Composition API Structure
Always use `<script setup lang="ts">` syntax with this structure:

```typescript
<script setup lang="ts">
// 1. Imports
import { ref, computed, onMounted } from 'vue'
import { useEventFilters } from '@/composables/useEventFilters'

// 2. Props and emits
interface Props {
  eventId?: number
}

const props = withDefaults(defineProps<Props>(), {
  eventId: undefined
})

const emit = defineEmits<{
  eventSelected: [event: EventResponse]
}>()

// 3. Composables
const { filters, applyFilters } = useEventFilters()

// 4. Reactive state
const loading = ref(false)
const error = ref<string | null>(null)

// 5. Computed properties
const formattedDate = computed(() => {
  // formatting logic
})

// 6. Methods
const loadEvent = async () => {
  // async logic with proper error handling
}

// 7. Lifecycle hooks
onMounted(() => {
  void loadEvent()
})
</script>
```

### TypeScript Strict Compliance
- **Use TypeScript for all code; prefer `type` over `interface`**
- **Avoid enums; use const objects instead**
- **Always handle undefined values** when dealing with optional properties
- Use null coalescing operators (`??`, `||`) or explicit checks
- **Never use `any` type** - always provide proper typing
- **Handle async operations properly** with void or await

```typescript
// ✅ Good: Proper type mapping
const getContentType = (type: string): ContentType => {
  const contentTypeMap: Record<string, ContentType> = {
    event: 'tmd_event',
    teacher: 'tmd_teacher',
  };
  return contentTypeMap[type] || 'tmd_event';
};

// ❌ Avoid: Type assertions
return `tmd_${type}` as ContentType;
```

### Template Best Practices
```vue
<template>
  <!-- Use semantic HTML -->
  <article class="event-card">
    <!-- Loading states -->
    <div v-if="loading" class="loading-skeleton">
      <q-skeleton type="rect" />
    </div>
    
    <!-- Error states -->
    <div v-else-if="error" class="error-message">
      <q-banner type="negative">
        {{ error }}
      </q-banner>
    </div>
    
    <!-- Content -->
    <div v-else class="event-content">
      <!-- Accessible interactions -->
      <q-btn
        @click="handleEventSelect"
        :aria-label="`View details for ${event.title}`"
      >
        {{ event.title }}
      </q-btn>
    </div>
  </article>
</template>
```

## Testing Guidelines

### Testing Philosophy
**Start Simple, Build Up**: Begin with basic tests that don't require extensive mocking, then progressively add complexity.

### Testing Framework
- Use **Vitest** for all testing
- Tests are colocated: `service.ts` → `service.test.ts`
- Run tests with: `pnpm test --run` (no watch mode for CI)

### Critical Testing Rules

#### 1. Import Validation First
```typescript
describe('Module Import Validation', () => {
  it('should import without errors', () => {
    expect(() => require('../serviceToTest')).not.toThrow();
  });
});
```

#### 2. Simple Mock Strategy
```typescript
// ✅ Good: Mock entire modules
vi.mock('../services/complexService', () => ({
  complexService: {
    method1: vi.fn(),
    method2: vi.fn(),
  },
}));

// ❌ Avoid: Complex boot file mocking
vi.mock('boot/axios', () => ({
  /* complex setup that can fail */
}));
```

#### 3. Test Public API Behavior
```typescript
// ✅ Good: Test outputs
it('should return correctly formatted data', () => {
  const result = service.getData();
  expect(result).toMatchObject({
    id: expect.any(Number),
    title: expect.any(String),
  });
});

// ❌ Avoid: Testing implementation details
expect(internalHelper).toHaveBeenCalledWith(specificArgs);
```

#### 4. Flexible Mock Assertions
```typescript
// ✅ Good: Flexible matching
expect(mockFn).toHaveBeenCalledWith(
  expect.objectContaining({
    headers: expect.objectContaining({
      authorization: expect.stringMatching(/Bearer .+/i),
    }),
  }),
);
```

#### 5. Minimal Test Structure
```typescript
describe('ServiceName', () => {
  // Start here
  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should have required methods', () => {
    expect(typeof service.method).toBe('function');
  });

  // Then add behavior tests
  it('should handle valid input', () => {
    const result = service.method('valid-input');
    expect(result).toBeDefined();
  });
});
```

## Code Style and Quality

### Naming Conventions
- **Directories**: lowercase with dashes (`components/auth-wizard`)
- **Components**: PascalCase (`AuthWizard.vue`)
- **Composables**: camelCase (`useAuthState.ts`)
- **Variables**: camelCase with auxiliary verbs (`isLoading`, `hasError`)

### File Structure
Organize files in this order:
1. Exported component
2. Composables
3. Helpers
4. Static content
5. Types

### ESLint Compliance
- Run `pnpm lint` frequently to check for errors
- Follow the strict ESLint configuration in `eslint.config.js`
- Key rules enforced:
  - `@typescript-eslint/no-floating-promises`: 'error'
  - `@typescript-eslint/strict-boolean-expressions`: 'error'
  - `vue/component-definition-name-casing`: ['error', 'PascalCase']
  - `vue/prop-name-casing`: ['error', 'camelCase']
  - `prefer-const`: 'error'

### Syntax Preferences
- Use arrow functions for methods and computed properties
- Avoid unnecessary curly braces in conditionals
- Use template syntax for declarative rendering
- Prefer iteration and modularization over code duplication

## API and Data Management

### GraphQL with Apollo Client
- Use Apollo Client for GraphQL operations
- Implement proper error handling for API calls
- Use typed GraphQL queries and mutations

### REST API Integration
- Primary API: TMD/V3 endpoints
- Local development API: `http://localhost:10014`
- Use proper authentication with JWT tokens
- Test API endpoints with curl before making assumptions

### State Management
- Use Pinia for global state management
- Keep component state local when possible
- Use composables for shared reactive logic

## Development Workflow

### Git Workflow
- Use git-flow methodology
- Start and close new features properly
- Don't automatically check in code - do code reviews first
- Write descriptive commit messages following conventional commit format

### Package Management
- Use `pnpm` exclusively
- Install dependencies with `pnpm install`
- Run scripts with `pnpm <script-name>`

### Development Commands
- `pnpm lint` - Run ESLint
- `pnpm test --run` - Run tests without watch mode
- `pnpm test` - Run tests in watch mode (development only)
- `pnpm dev` - Start development server

### Performance and Optimization
- Implement lazy loading for routes and components
- Use Suspense for asynchronous components
- Optimize images: use WebP format, include size data
- Leverage Quasar's built-in performance optimizations

## Project-Specific Guidelines

### Documentation Maintenance
- **DESIGN.md**: Contains overall project architecture
- **TODO.md**: Contains mid- to long-term tasks
- **CHANGELOG.md**: Maintain using git history
- **README.md**: Updated less frequently for major changes

### API Integration
- Local dev environment available at `http://localhost:10014`
- Test with credentials from `credentials.local.json`
- Use GraphQL for JWT token retrieval
- Primarily use TMD/V3 endpoints

### Error Handling
- Always implement proper error states in UI
- Use Quasar's notification system for user feedback
- Handle network errors gracefully
- Provide meaningful error messages to users

## Code Quality Checklist

Before submitting code:
- [ ] Run `pnpm lint` and fix all errors
- [ ] Write tests for new functionality
- [ ] Ensure TypeScript types are correct
- [ ] Use Quasar components when available
- [ ] Follow naming conventions
- [ ] Implement proper error handling
- [ ] Add loading states for async operations
- [ ] Test on different screen sizes
- [ ] Update documentation if needed

## Anti-Patterns to Avoid

### TypeScript
- Don't use `any` type
- Don't ignore TypeScript errors
- Don't use type assertions unnecessarily
- Don't mix interfaces and types inconsistently

### Vue/Quasar
- Don't use Options API (use Composition API only)
- Don't create custom components when Quasar has equivalent
- Don't ignore responsive design principles
- Don't skip error and loading states

### Testing
- Don't test implementation details
- Don't write overly complex mocks
- Don't ignore failing tests
- Don't test without proper TypeScript typing

### General
- Don't commit without linting
- Don't delete large portions of existing code unless outdated
- Don't work on multiple features simultaneously
- Don't skip code reviews