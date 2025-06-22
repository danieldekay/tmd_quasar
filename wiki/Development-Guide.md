# Development Guide

This guide provides detailed information for developers working on the TMD Quasar Frontend project.

## Development Workflow

### Prerequisites

Ensure you have completed the [Getting Started](Getting-Started) setup before proceeding with development.

### Daily Development Process

1. **Start Development Server**
   ```bash
   pnpm dev
   ```

2. **Run Type Checking** (in separate terminal)
   ```bash
   pnpm typecheck --watch
   ```

3. **Run Linting** (before committing)
   ```bash
   pnpm lint
   ```

4. **Format Code** (if needed)
   ```bash
   pnpm format
   ```

## Project Structure Deep Dive

### Component Organization

```
src/components/
├── events/
│   ├── EventCard.vue          # Event display card
│   ├── EventList.vue          # Event listing with pagination
│   ├── EventFilters.vue       # Advanced filtering component
│   └── EventDetails.vue       # Detailed event view
├── djs/
│   ├── DJCard.vue            # DJ profile card
│   ├── DJProfile.vue         # Full DJ profile page
│   ├── DJActivityTimeline.vue # Activity history timeline
│   └── DJStatistics.vue      # Performance statistics
└── common/
    ├── LoadingSpinner.vue     # Loading state component
    ├── ErrorMessage.vue       # Error display component
    ├── SkeletonLoader.vue     # Skeleton loading screens
    └── PaginationControls.vue # Pagination component
```

### Composables (Business Logic)

```
src/composables/
├── useFormatters.ts          # Date/location/text formatting utilities
├── useEventFilters.ts        # Event filtering state management
├── useApiService.ts          # API service abstractions
├── usePagination.ts          # Pagination logic
├── useErrorHandling.ts       # Error state management
└── useTheme.ts              # Dark/light mode management
```

### Services (API Layer)

```
src/services/
├── BaseService.ts            # HAL-compliant base service
├── eventListService.ts       # Event listing and filtering
├── djService.ts             # DJ profiles and relationships
├── teacherService.ts        # Teacher profiles
├── eventDetailsService.ts   # Single event details
├── eventSeriesService.ts    # Event series management
└── types.ts                 # Service type definitions
```

## Code Style Guidelines

### TypeScript Standards

#### Strict Mode Configuration

```typescript
// tsconfig.json
{
  "compilerOptions": {
    "strict": true,
    "noImplicitAny": true,
    "strictNullChecks": true,
    "strictFunctionTypes": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true
  }
}
```

#### Type Definitions

Always define explicit types for:

```typescript
// API responses
interface EventResponse {
  id: number;
  title: string;
  meta: {
    event_start_date: string;
    event_country: string;
    event_city: string;
  };
}

// Component props
interface EventCardProps {
  event: EventResponse;
  showDetails?: boolean;
}

// Composable return types
interface UseEventFiltersReturn {
  filters: Ref<EventFilters>;
  applyFilters: (newFilters: Partial<EventFilters>) => void;
  clearFilters: () => void;
}
```

### Vue.js Best Practices

#### Composition API Structure

```typescript
// Component structure template
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

#### Template Best Practices

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

### ESLint Configuration

#### Key Rules

```javascript
// eslint.config.js
export default [
  {
    rules: {
      // TypeScript specific
      '@typescript-eslint/no-floating-promises': 'error',
      '@typescript-eslint/strict-boolean-expressions': 'error',
      '@typescript-eslint/prefer-nullish-coalescing': 'error',
      
      // Vue specific
      'vue/component-definition-name-casing': ['error', 'PascalCase'],
      'vue/prop-name-casing': ['error', 'camelCase'],
      'vue/component-name-in-template-casing': ['error', 'kebab-case'],
      
      // General quality
      'no-console': 'warn',
      'no-debugger': 'error',
      'prefer-const': 'error'
    }
  }
]
```

## API Integration Patterns

### Service Usage

#### Basic Service Usage

```typescript
// In a component
import { eventListService } from '@/services/eventListService'

const loadEvents = async () => {
  try {
    loading.value = true
    const response = await eventListService.getEvents({
      search: searchQuery.value,
      country: selectedCountry.value,
      per_page: 20
    })
    
    events.value = response.data
    pagination.value = response.pagination
  } catch (error) {
    console.error('Failed to load events:', error)
    errorMessage.value = 'Failed to load events. Please try again.'
  } finally {
    loading.value = false
  }
}
```

#### Error Handling Pattern

```typescript
// Composable for error handling
export function useErrorHandling() {
  const error = ref<string | null>(null)
  
  const handleError = (err: unknown, fallbackMessage = 'An error occurred') => {
    if (err instanceof Error) {
      error.value = err.message
    } else if (typeof err === 'string') {
      error.value = err
    } else {
      error.value = fallbackMessage
    }
    
    // Log to console for debugging
    console.error('Error occurred:', err)
  }
  
  const clearError = () => {
    error.value = null
  }
  
  return {
    error: readonly(error),
    handleError,
    clearError
  }
}
```

### State Management Patterns

#### Composable State Management

```typescript
// useEventFilters.ts
export function useEventFilters() {
  // Persistent state via cookies
  const filters = ref<EventFilters>({
    search: '',
    country: '',
    dateAfter: null,
    dateBefore: null,
    showPastEvents: false
  })
  
  // Load from cookies on initialization
  const loadFiltersFromCookies = () => {
    const savedFilters = Cookies.get('tmd_event_filters')
    if (savedFilters) {
      try {
        Object.assign(filters.value, JSON.parse(savedFilters))
      } catch (error) {
        console.warn('Failed to parse saved filters:', error)
      }
    }
  }
  
  // Save to cookies on change
  const saveFiltersToCookies = () => {
    Cookies.set('tmd_event_filters', JSON.stringify(filters.value), {
      expires: 30,
      sameSite: 'strict'
    })
  }
  
  // Watch for changes and save
  watch(filters, saveFiltersToCookies, { deep: true })
  
  // Apply new filters
  const applyFilters = (newFilters: Partial<EventFilters>) => {
    Object.assign(filters.value, newFilters)
  }
  
  // Initialize
  onMounted(loadFiltersFromCookies)
  
  return {
    filters: readonly(filters),
    applyFilters,
    clearFilters: () => {
      filters.value = getDefaultFilters()
    }
  }
}
```

## Testing Guidelines

### Component Testing

```typescript
// EventCard.test.ts
import { mount } from '@vue/test-utils'
import EventCard from '@/components/events/EventCard.vue'

describe('EventCard', () => {
  it('displays event information correctly', () => {
    const mockEvent = {
      id: 1,
      title: 'Test Marathon',
      meta: {
        event_start_date: '2024-06-15',
        event_country: 'Germany',
        event_city: 'Berlin'
      }
    }
    
    const wrapper = mount(EventCard, {
      props: { event: mockEvent }
    })
    
    expect(wrapper.text()).toContain('Test Marathon')
    expect(wrapper.text()).toContain('Berlin')
    expect(wrapper.text()).toContain('Germany')
  })
})
```

### Service Testing

```typescript
// eventListService.test.ts
import { eventListService } from '@/services/eventListService'
import { mockApiResponse } from '@/test/mocks'

describe('EventListService', () => {
  it('handles API responses correctly', async () => {
    // Mock API call
    vi.spyOn(eventListService, 'makeRequest')
      .mockResolvedValue(mockApiResponse)
    
    const result = await eventListService.getEvents({
      search: 'marathon'
    })
    
    expect(result.data).toHaveLength(10)
    expect(result.pagination.total).toBe(100)
  })
})
```

## Performance Guidelines

### Component Performance

#### Lazy Loading

```typescript
// Router configuration
const routes = [
  {
    path: '/events',
    component: () => import('@/pages/EventsPage.vue')
  },
  {
    path: '/djs',
    component: () => import('@/pages/DJsPage.vue')
  }
]
```

#### Computed Property Optimization

```typescript
// Expensive computations should be cached
const expensiveComputation = computed(() => {
  // Use shallowRef for better performance with large objects
  return processLargeDataSet(largeDataSet.value)
})

// Use readonly for exposed state
const { data } = useDataFetching()
return {
  data: readonly(data)
}
```

### API Performance

#### Request Debouncing

```typescript
// Search input debouncing
const debouncedSearch = debounce((query: string) => {
  void searchEvents(query)
}, 300)

watch(searchQuery, (newQuery) => {
  debouncedSearch(newQuery)
})
```

#### Selective Loading

```typescript
// Only load required meta fields
const events = await eventListService.getEvents({
  meta_fields: ['event_start_date', 'event_country', 'event_city'],
  per_page: 20
})
```

## Build and Deployment

### Development Build

```bash
# Development with hot reload
pnpm dev

# Build for production
pnpm build

# Preview production build
pnpm preview
```

### Production Considerations

#### Environment Variables

```env
# Production environment
VITE_WP_API_URL=https://www.tangomarathons.com/wp-json/tmd/v2
VITE_APP_TITLE=Tango Marathons
VITE_APP_DESCRIPTION=Discover tango marathons worldwide
```

#### Build Optimization

```typescript
// quasar.config.ts
export default configure((ctx) => {
  return {
    build: {
      minify: true,
      target: {
        browser: ['es2019', 'edge88', 'firefox78', 'chrome87', 'safari13.1']
      },
      vueRouterMode: 'history',
      
      extendViteConf(viteConf) {
        viteConf.build = {
          ...viteConf.build,
          rollupOptions: {
            output: {
              manualChunks: {
                vendor: ['vue', 'vue-router', 'quasar'],
                api: ['axios']
              }
            }
          }
        }
      }
    }
  }
})
```

## Common Development Tasks

### Adding a New Component

1. **Create component file**
   ```bash
   # Create component
   touch src/components/events/NewEventComponent.vue
   ```

2. **Define component structure**
   ```vue
   <template>
     <!-- Component template -->
   </template>
   
   <script setup lang="ts">
   // Component logic
   </script>
   
   <style scoped>
   /* Component styles */
   </style>
   ```

3. **Add to exports** (if reusable)
   ```typescript
   // src/components/index.ts
   export { default as NewEventComponent } from './events/NewEventComponent.vue'
   ```

### Adding a New Service

1. **Create service file**
   ```bash
   touch src/services/newService.ts
   ```

2. **Extend BaseService**
   ```typescript
   import { BaseService } from './BaseService'
   
   export class NewService extends BaseService {
     constructor() {
       super('new-endpoint')
     }
     
     async getItems(params = {}) {
       return this.makeRequest('GET', '', { params })
     }
   }
   
   export const newService = new NewService()
   ```

### Adding a New Page

1. **Create page component**
   ```bash
   touch src/pages/NewPage.vue
   ```

2. **Add route**
   ```typescript
   // src/router/routes.ts
   {
     path: '/new-page',
     component: () => import('pages/NewPage.vue')
   }
   ```

## Troubleshooting Development Issues

For common development issues and solutions, see our [Troubleshooting](Troubleshooting) guide.

---

**Related Documentation:**
- [API Documentation](API-Documentation) - API integration details
- [Architecture & Design](Architecture-&-Design) - Technical architecture overview
- [Contributing](Contributing) - Contribution process and guidelines