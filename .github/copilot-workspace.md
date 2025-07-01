# Quasar Specific Copilot Rules

## Quasar Component Usage

When suggesting solutions, prioritize Quasar's built-in components:

### Layout Components
- `QLayout` - Main layout wrapper
- `QHeader` - Header sections  
- `QDrawer` - Navigation drawers
- `QPageContainer` - Page content wrapper
- `QPage` - Individual page wrapper

### Form Components
- `QForm` - Form wrapper with validation
- `QInput` - Text inputs with built-in validation
- `QSelect` - Dropdown selections
- `QCheckbox` - Checkboxes
- `QRadio` - Radio buttons
- `QBtn` - Buttons with loading states
- `QFile` - File uploads

### Display Components
- `QCard` - Card layouts
- `QTable` - Data tables with sorting/pagination
- `QList` - Lists and menus
- `QBanner` - Alert banners
- `QSkeleton` - Loading skeletons
- `QSpinner` - Loading spinners

### Navigation
- `QTabs` - Tab navigation
- `QBreadcrumbs` - Breadcrumb navigation
- `QPagination` - Page navigation

## Quasar-Specific Patterns

### Responsive Design
```vue
<template>
  <!-- Use Quasar's responsive classes -->
  <div class="row q-col-gutter-md">
    <div class="col-12 col-md-6 col-lg-4">
      <q-card>
        <!-- Content -->
      </q-card>
    </div>
  </div>
</template>
```

### Theming and Colors
```vue
<template>
  <!-- Use Quasar's color palette -->
  <q-btn color="primary" text-color="white">
    Primary Button
  </q-btn>
  
  <q-card class="bg-secondary text-white">
    <!-- Use theme colors -->
  </q-card>
</template>
```

### Form Validation
```vue
<template>
  <q-form @submit="onSubmit" class="q-gutter-md">
    <q-input
      v-model="email"
      label="Email"
      type="email"
      :rules="[
        val => !!val || 'Email is required',
        val => isValidEmail(val) || 'Please enter a valid email'
      ]"
    />
    
    <q-btn 
      type="submit" 
      color="primary" 
      :loading="isSubmitting"
    >
      Submit
    </q-btn>
  </q-form>
</template>
```

### Loading States
```vue
<template>
  <!-- Skeleton loading -->
  <q-card v-if="loading">
    <q-card-section>
      <q-skeleton type="rect" height="200px" />
      <q-skeleton type="text" class="q-mt-md" />
      <q-skeleton type="text" width="60%" />
    </q-card-section>
  </q-card>
  
  <!-- Button loading -->
  <q-btn 
    :loading="isProcessing"
    @click="processAction"
  >
    Process
    <template v-slot:loading>
      <q-spinner-hourglass class="on-left" />
      Processing...
    </template>
  </q-btn>
</template>
```

## TMD Project Specific Patterns

### Event Components
```vue
<template>
  <!-- Use consistent event card structure -->
  <q-card class="event-card">
    <q-card-section>
      <div class="event-title">{{ event.title }}</div>
      <div class="event-subtitle">{{ event.subtitle }}</div>
    </q-card-section>
    
    <q-card-section class="q-pt-none">
      <div class="row items-center q-gutter-sm">
        <q-icon name="event" size="sm" />
        <span class="text-body2">{{ formatDate(event.date) }}</span>
      </div>
      
      <div class="row items-center q-gutter-sm">
        <q-icon name="location_on" size="sm" />
        <span class="text-body2">{{ event.city }}, {{ event.country }}</span>
      </div>
    </q-card-section>
  </q-card>
</template>
```

### API Error Handling
```typescript
// Use consistent error handling patterns
const handleApiError = (error: Error) => {
  $q.notify({
    type: 'negative',
    message: 'Something went wrong',
    caption: error.message,
    timeout: 5000,
  })
}

// In components
const { notify } = useQuasar()

const loadData = async () => {
  try {
    loading.value = true
    const data = await api.getData()
    // Handle success
  } catch (error) {
    notify({
      type: 'negative',
      message: 'Failed to load data',
      caption: error instanceof Error ? error.message : 'Unknown error'
    })
  } finally {
    loading.value = false
  }
}
```

### Table Patterns
```vue
<template>
  <q-table
    :rows="events"
    :columns="columns"
    :loading="loading"
    :pagination="pagination"
    @request="onRequest"
    row-key="id"
  >
    <template v-slot:body-cell-actions="props">
      <q-td :props="props">
        <q-btn
          size="sm"
          color="primary"
          round
          dense
          icon="edit"
          @click="editEvent(props.row)"
        />
      </q-td>
    </template>
  </q-table>
</template>
```

## Quick Reference Commands

When working with this project, suggest these commands:

```bash
# Development
pnpm dev           # Start dev server
pnpm build         # Build for production
pnpm preview       # Preview production build

# Quality
pnpm lint          # Run ESLint
pnpm lint:fix      # Fix lint errors
pnpm test          # Run tests (watch mode)
pnpm test --run    # Run tests (single run)

# Quasar specific
quasar dev         # Alternative dev command
quasar build       # Alternative build command
quasar info        # Show Quasar info
```

## Common Issues and Solutions

### TypeScript Strict Mode
```typescript
// Always handle optional properties
const user = data?.user
const name = user?.name ?? 'Unknown'

// Use type guards for complex objects
const isValidEvent = (obj: unknown): obj is Event => {
  return typeof obj === 'object' && 
         obj !== null && 
         'id' in obj && 
         'title' in obj
}
```

### Quasar Global Properties
```typescript
// In components, access Quasar through composable
import { useQuasar } from 'quasar'

const $q = useQuasar()

// Use for notifications, dialogs, loading
$q.notify('Success!')
$q.loading.show()
$q.dialog({ title: 'Confirm', message: 'Are you sure?' })
```