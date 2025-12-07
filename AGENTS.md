# AGENTS.md - TMD Quasar

Instructions for AI agents working on the TMD Quasar Vue.js frontend.

## Project Overview

TMD Quasar is a Vue 3 + TypeScript frontend application built with Quasar Framework. It operates as a headless WordPress frontend for The Tango Marathon Directory, consuming data via REST API and GraphQL.

## Quick Reference

- **Framework**: Vue 3 + TypeScript + Quasar
- **Package Manager**: pnpm (required, never use npm/yarn)
- **Build Tool**: Vite
- **Testing**: Vitest
- **API**: REST (TMD v3) + GraphQL with Apollo Client

## Critical Rules

- **Always use pnpm** - never npm or yarn
- **Always use `<script setup lang="ts">`** - no Options API
- **Never use `any` type** - always provide proper typing
- **Use `type` over `interface`** - for consistency
- **Avoid enums** - use const objects instead
- **Handle all Promises** - use `void` or `await`, never floating
- **Use Quasar components first** - before creating custom solutions
- **Run `pnpm check:biome`** before commits

## File Structure

```text
tmd_quasar/
├── src/
│   ├── components/      # Reusable Vue components
│   │   └── __tests__/  # Component tests
│   ├── composables/    # Vue 3 composables
│   │   └── __tests__/  # Composable tests
│   ├── services/       # API services
│   │   └── __tests__/  # Service tests
│   ├── stores/         # Pinia stores
│   │   └── __tests__/  # Store tests
│   ├── pages/          # Route components
│   ├── layouts/        # Page layouts
│   └── router/         # Vue Router config
├── tests/              # Integration tests
├── docs/               # Documentation
└── api-tests/          # API test scripts
```

## Development Commands

```bash
# Primary commands
pnpm dev              # Start dev server with type checking
pnpm build            # Production build
pnpm check:biome      # Format + lint with auto-fix (run before commits)
pnpm type-check       # TypeScript validation
pnpm test:run         # Run tests once
pnpm lint             # ESLint (secondary to Biome)
```

## Code Patterns

### Component Structure

```typescript
<script setup lang="ts">
// 1. Imports
import { ref, computed, onMounted } from 'vue';
import { useEventFilters } from '@/composables/useEventFilters';

// 2. Props and emits
type Props = {
  eventId?: number;
};

const props = withDefaults(defineProps<Props>(), {
  eventId: undefined,
});

const emit = defineEmits<{
  eventSelected: [event: EventResponse];
}>();

// 3. Composables
const { filters, applyFilters } = useEventFilters();

// 4. Reactive state
const loading = ref(false);
const error = ref<string | null>(null);

// 5. Computed properties
const formattedDate = computed(() => {
  // formatting logic
});

// 6. Methods
const loadEvent = async () => {
  // async logic with proper error handling
};

// 7. Lifecycle hooks
onMounted(() => {
  void loadEvent();
});
</script>
```

### TypeScript Patterns

```typescript
// ✅ Good: Use type, not interface
type EventData = {
  id: number;
  title: string;
};

// ✅ Good: Use const objects, not enums
const EventStatus = {
  DRAFT: 'draft',
  PUBLISHED: 'published',
} as const;
type EventStatus = typeof EventStatus[keyof typeof EventStatus];

// ✅ Good: Handle promises properly
onMounted(() => {
  void loadData(); // Use void for fire-and-forget
});

// ❌ Bad: Floating promise
onMounted(() => {
  loadData(); // ESLint error: no-floating-promises
});
```

### API Integration

```typescript
// Use Apollo Client for GraphQL
import { apolloClient } from 'boot/apollo';

// Use proper error handling
try {
  const { data } = await apolloClient.query({
    query: GET_EVENTS,
    variables: { limit: 10 },
  });
} catch (error) {
  console.error('Failed to fetch events:', error);
}
```

## Testing Patterns

### Test File Location

Tests MUST be in `__tests__` folders:

- `src/services/__tests__/eventService.test.ts`
- `src/components/__tests__/EventCard.test.ts`

### Basic Test Structure

```typescript
import { describe, it, expect, vi } from 'vitest';

describe('ServiceName', () => {
  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should handle valid input', () => {
    const result = service.method('valid-input');
    expect(result).toBeDefined();
  });
});
```

### Mock Strategy

```typescript
// ✅ Good: Mock entire modules
vi.mock('../services/complexService', () => ({
  complexService: {
    method1: vi.fn(),
    method2: vi.fn(),
  },
}));
```

## API Endpoints

### Local Development

- Events, DJs, Teachers: `/wp-json/tmd/v3/`
- GraphQL: `/graphql`
- Base URL: `http://localhost:10014`

### Production

- Events: `/wp-json/tmd/v2`
- DJs, Teachers, Series: `/wp-json/tmd/v3`

## Quasar Components

Always prefer Quasar components:

```typescript
// ✅ Good: Use Quasar
import { QBtn, QCard, QTable } from 'quasar';

// ❌ Bad: Custom button when QBtn works
const CustomButton = () => { ... };
```

## Naming Conventions

- **Directories**: lowercase with dashes (`components/auth-wizard`)
- **Components**: PascalCase (`AuthWizard.vue`)
- **Composables**: camelCase with `use` prefix (`useAuthState.ts`)
- **Types**: PascalCase (`EventResponse`)
- **Constants**: SCREAMING_SNAKE_CASE (`API_BASE_URL`)
- **Variables**: camelCase with auxiliary verbs (`isLoading`, `hasError`)

## Quality Checklist

Before committing:

- [ ] `pnpm check:biome` passes
- [ ] `pnpm type-check` passes
- [ ] `pnpm test:run` passes
- [ ] No `any` types used
- [ ] All promises handled
- [ ] Loading/error states implemented
- [ ] Quasar components used where available

## Authentication

- JWT tokens stored in localStorage
- 30-day session persistence
- Use Apollo Client for GraphQL auth
- Redirect to main TMD site for password reset

## Do NOT

- Use npm or yarn (pnpm only)
- Use Options API (Composition API only)
- Use `any` type
- Leave floating promises
- Create custom components when Quasar has equivalent
- Skip error/loading states
- Commit without running `pnpm check:biome`
