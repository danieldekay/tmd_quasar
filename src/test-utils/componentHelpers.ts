/**
 * Test Utilities - Component Testing Helpers
 *
 * Utilities for mounting and testing Vue components with Quasar.
 * Provides consistent setup for router, Quasar plugins, and common test patterns.
 *
 * Usage:
 *   const wrapper = mountWithQuasar(MyComponent, {
 *     props: { eventId: 123 },
 *     mockRouter: true,
 *   });
 */

import { mount, type VueWrapper, type MountingOptions } from '@vue/test-utils';
import { Quasar, QLayout, QPageContainer, Notify } from 'quasar';
import { createMemoryHistory, createRouter, type Router } from 'vue-router';
import type { Component } from 'vue';
import { h } from 'vue';

/**
 * Create a mock router for testing
 */
export function createMockRouter(routes?: Array<{ path: string; component: Component }>): Router {
  const defaultRoutes = [
    { path: '/', name: 'Home', component: { template: '<div>Home</div>' } },
    { path: '/events', name: 'Events', component: { template: '<div>Events</div>' } },
    {
      path: '/events/:id',
      name: 'EventDetails',
      component: { template: '<div>Event Detail</div>' },
    },
    { path: '/djs', name: 'DJs', component: { template: '<div>DJs</div>' } },
    { path: '/djs/:id', name: 'DJDetails', component: { template: '<div>DJ Detail</div>' } },
    { path: '/teachers', name: 'Teachers', component: { template: '<div>Teachers</div>' } },
    {
      path: '/teachers/:id',
      name: 'TeacherDetails',
      component: { template: '<div>Teacher Detail</div>' },
    },
    { path: '/couples', name: 'Couples', component: { template: '<div>Couples</div>' } },
    {
      path: '/couples/:id',
      name: 'CoupleDetails',
      component: { template: '<div>Couple Detail</div>' },
    },
    {
      path: '/event-series',
      name: 'EventSeries',
      component: { template: '<div>Event Series</div>' },
    },
    {
      path: '/event-series/:id',
      name: 'EventSeriesDetails',
      component: { template: '<div>Event Series Detail</div>' },
    },
  ];

  return createRouter({
    history: createMemoryHistory(),
    routes: routes ?? defaultRoutes,
  });
}

/**
 * Mount a component with Quasar and optional router
 *
 * This is a simplified wrapper that handles the complex TypeScript types.
 * Use this instead of mount() directly for Quasar components.
 *
 * For components using QPage, automatically wraps in QLayout + QPageContainer.
 *
 * @param component - Vue component to mount
 * @param options - Standard mounting options
 * @param router - Optional router instance (creates default if true)
 * @param wrapInLayout - Whether to wrap component in QLayout (auto-detected for QPage components)
 * @returns VueWrapper instance
 */
export function mountWithQuasar(
  component: Component,
  options: MountingOptions<unknown> = {},
  router?: Router | boolean,
  wrapInLayout = false,
): VueWrapper {
  const plugins: unknown[] = [
    [
      Quasar,
      {
        plugins: {
          Notify,
        },
      },
    ],
  ];

  // Add router if provided
  if (router !== undefined && router !== false) {
    const routerInstance = typeof router === 'object' ? router : createMockRouter();
    plugins.push(routerInstance);
  }

  // If component needs QLayout wrapper (uses QPage)
  if (wrapInLayout) {
    const LayoutWrapper = {
      components: { QLayout, QPageContainer },
      setup() {
        return () =>
          h(QLayout, { view: 'hHh lpR fFf' }, () => [
            h(QPageContainer, {}, () => [h(component, options.props ?? {})]),
          ]);
      },
    };

    return mount(LayoutWrapper, {
      ...options,
      global: {
        ...options.global,
        // @ts-expect-error - Plugin type compatibility for test environment
        plugins: [...(options.global?.plugins ?? []), ...plugins],
      },
    });
  }

  return mount(component, {
    ...options,
    global: {
      ...options.global,
      // @ts-expect-error - Plugin type compatibility for test environment
      plugins: [...(options.global?.plugins ?? []), ...plugins],
    },
  });
}

/**
 * Wait for all promises and Vue updates to complete
 */
export async function flushAll(): Promise<void> {
  // Import flushPromises from @vue/test-utils
  const { flushPromises } = await import('@vue/test-utils');
  await flushPromises();
  await new Promise((resolve) => setTimeout(resolve, 0));
}

/**
 * Find a component by test-id attribute
 */
export function findByTestId(wrapper: VueWrapper, testId: string) {
  return wrapper.find(`[data-testid="${testId}"]`);
}

/**
 * Check if element exists by test-id
 */
export function existsByTestId(wrapper: VueWrapper, testId: string): boolean {
  return findByTestId(wrapper, testId).exists();
}

/**
 * Get text content by test-id
 */
export function getTextByTestId(wrapper: VueWrapper, testId: string): string {
  return findByTestId(wrapper, testId).text();
}

/**
 * Trigger click by test-id
 */
export async function clickByTestId(wrapper: VueWrapper, testId: string): Promise<void> {
  await findByTestId(wrapper, testId).trigger('click');
}

/**
 * Assert table has expected number of rows
 */
export function assertTableRowCount(wrapper: VueWrapper, expectedCount: number): void {
  const rows = wrapper.findAll('tbody tr');
  if (rows.length !== expectedCount) {
    throw new Error(`Expected ${expectedCount} rows, found ${rows.length}`);
  }
}

/**
 * Assert table column headers
 */
export function assertTableHeaders(wrapper: VueWrapper, expectedHeaders: string[]): void {
  const headers = wrapper.findAll('thead th').map((th) => th.text());
  const headersMatch = expectedHeaders.every((header) => headers.includes(header));

  if (!headersMatch) {
    throw new Error(
      `Table headers don't match. Expected: ${expectedHeaders.join(', ')}, Found: ${headers.join(', ')}`,
    );
  }
}

/**
 * Get QTable props from wrapper
 */
export function getQTableProps(wrapper: VueWrapper) {
  const table = wrapper.findComponent({ name: 'QTable' });
  if (!table.exists()) {
    throw new Error('QTable component not found');
  }
  return table.props();
}

/**
 * Get QTable columns from wrapper
 */
export function getQTableColumns(wrapper: VueWrapper): Array<{ name: string; label: string }> {
  const props = getQTableProps(wrapper);
  return props.columns as Array<{ name: string; label: string }>;
}

/**
 * Get QTable rows from wrapper
 */
export function getQTableRows<T = Record<string, unknown>>(wrapper: VueWrapper): T[] {
  const props = getQTableProps(wrapper);
  return props.rows as T[];
}

/**
 * Check if QTable is in loading state
 */
export function isQTableLoading(wrapper: VueWrapper): boolean {
  const props = getQTableProps(wrapper);
  return Boolean(props.loading);
}

/**
 * Simulate QTable row click
 */
export async function clickQTableRow(wrapper: VueWrapper, rowIndex: number): Promise<void> {
  const props = getQTableProps(wrapper);
  const rows = props.rows as Array<Record<string, unknown>>;

  if (rowIndex >= rows.length) {
    throw new Error(`Row index ${rowIndex} out of bounds (table has ${rows.length} rows)`);
  }

  const onRowClick = props.onRowClick;
  if (typeof onRowClick === 'function') {
    await onRowClick(new Event('click'), rows[rowIndex]);
  }
}

/**
 * Get QTable pagination settings
 */
export function getQTablePagination(wrapper: VueWrapper) {
  const props = getQTableProps(wrapper);
  return props.pagination as {
    sortBy?: string;
    descending?: boolean;
    page?: number;
    rowsPerPage?: number;
  };
}
