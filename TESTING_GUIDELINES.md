# Testing Guidelines for TMD App

This document outlines best practices and strategies for testing the TMD App, which uses Quasar and Vitest.

## Introduction

Testing is crucial for ensuring code quality, maintainability, and preventing regressions. This project utilizes [Vitest](https://vitest.dev/) for unit/component testing within a Vite-powered environment, and also for API compliance testing in a Node.js environment.

## Core Recommendation: Quasar Testing App Extension

For effective testing of Quasar components and features, it is **strongly recommended** to install and use the official Quasar testing App Extension (AE) for Vitest:

```bash
quasar ext add @quasar/testing-unit-vitest
```

This App Extension provides:
- Proper Quasar integration with Vitest.
- Necessary Vite configurations tailored for Quasar.
- Helper utilities that simplify testing Quasar-specific features.
- A more stable and reliable testing environment for Quasar components.

Using this AE should be the first step before writing complex component or service tests that interact deeply with Quasar.

## Vitest Configuration

- The `@quasar/testing-unit-vitest` AE will typically scaffold or update your `vitest.config.ts` file with appropriate settings for testing Vue components within a Quasar environment.
- For specialized testing needs, like API tests running in a Node.js environment, separate Vitest configurations can be used (e.g., `vitest.config.api.ts`). This allows for different environments and include patterns:
  ```typescript
  // Example: vitest.config.api.ts
  import { defineConfig } from 'vitest/config';

  export default defineConfig({
    test: {
      globals: true,
      environment: 'node', // Node.js environment for API tests
      include: ['api-tests/**/*.spec.ts'], // Specific pattern for API tests
    },
  });
  ```

## Key Helper: `installQuasarPlugin`

The `@quasar/quasar-app-extension-testing-unit-vitest` AE provides a powerful helper, `installQuasarPlugin`, for use in your test setup.

- **Purpose:** It correctly initializes the Quasar plugin with necessary context, making Quasar components and plugins available to your tests in a way that mimics the runtime environment.
- **Basic Usage:**
  ```typescript
  // In your test file (e.g., *.spec.ts)
  import { installQuasarPlugin } from '@quasar/quasar-app-extension-testing-unit-vitest';
  installQuasarPlugin(); // Call before mounting components that use Quasar features
  ```
- **Mocking Quasar Plugins:** It can be used to provide mocks for Quasar plugins (Dialog, Notify, BottomSheet, etc.) or other features registered via boot files (like `$axios` or `$api` if your boot file registers them on `$q`).
  ```typescript
  import { installQuasarPlugin } from '@quasar/quasar-app-extension-testing-unit-vitest';
  import { Dialog, Notify } from 'quasar'; // Import actual plugins if you need their interface

  installQuasarPlugin({
    plugins: {
      Dialog, // Uses the real Dialog plugin
      Notify: vi.fn(), // Mocks the Notify plugin
      // Example for a custom boot file plugin:
      // YourBootFilePluginName: vi.fn() (if it's a function)
      // or provide a mock object for $q.yourPlugin
    }
  });
  ```
This helper is essential for testing components that use `$q` or rely on Quasar plugins.

## Component Testing

Component tests verify the behavior and rendering of individual Vue components.

- **Tooling:** Use `@vue/test-utils` (`mount`, `shallowMount`).
- **Handling Child Quasar Components:**
    - **Prefer `mount` with `installQuasarPlugin`:** When the `@quasar/testing-unit-vitest` AE is installed and `installQuasarPlugin()` is used in test setup, Quasar components should generally render correctly. This provides tests that are closer to the component's runtime behavior.
    - **Stubbing as an Alternative:** If full mounting becomes too complex due to deep dependencies, or if you need to isolate your component strictly, stub child Quasar components using `global.stubs` in the `mount` options.
        - Simple existence stub: `QBtn: true`
        - Stub that renders default slot: `QItemLabel: { template: '<div><slot /></div>' }`
        - Stub that accepts props: `QIcon: { template: '<i :class="name"></i>', props: ['name'] }`
    - **Guidance:** Stub only what is necessary to isolate the component under test and simplify the test setup. Over-stubbing can make tests less representative of actual usage.
- **What to Test:**
    - Rendering based on props.
    - Emitted events (`wrapper.emitted()`).
    - Slot content rendering.
    - Computed properties and internal state changes if they affect the view or emitted events.

## Composable Testing

Composables (functions from `src/composables/`) are typically plain TypeScript/JavaScript functions and are usually straightforward to test.

- **Direct Testing:** Import and test their exported functions directly.
- **Mocking Dependencies:** If a composable has external dependencies (e.g., browser APIs like `document.cookie`, other services, or Quasar features not available in a plain Node environment for testing), mock these using Vitest's capabilities:
    - `vi.spyOn(document, 'cookie', 'get').mockReturnValue(...)`
    - `vi.fn()` for function mocks.
    - `vi.mock('path/to/module', () => ({ ...mockedImplementation }))` for module mocking.

## Service Testing (Services in `src/services/`)

Testing services, especially those that might depend on Quasar boot files (like `src/boot/axios.ts`), can be challenging without the proper test environment setup.

- **The Challenge:** Previous attempts to test `EventListService` (which extends `BaseService`, which uses `api` from `src/boot/axios.ts`) faced issues with mocking the `api` instance, leading to real network calls.
- **Recommended Approach (with Quasar Testing AE):**
    1.  **Ensure `@quasar/testing-unit-vitest` AE is installed.** This AE aims to provide a more integrated test environment.
    2.  **Boot File Dependencies:**
        - If a service depends on something provided by a boot file via `$q` (e.g., `$q.axios`), use `installQuasarPlugin` in your service test setup to provide a mock for that `$q` property.
        - If a service *directly imports* from a boot file (e.g., `import { api } from 'src/boot/axios'`), the testing environment set up by the AE *should* make standard Vitest module mocking (`vi.mock('src/boot/axios', ...)` or a manual mock like `src/boot/__mocks__/axios.ts`) more reliable. This was problematic before and needs verification after the AE is properly set up.
    3.  **Isolate the Service:** Mock any direct external dependencies of the service itself.

## API Testing (Node.js Environment)

For testing the API endpoints directly (as done in the `api-tests/` directory):

- **Separate Vitest Configuration:** Use a dedicated Vitest configuration file (e.g., `vitest.config.api.ts`) that specifies `environment: 'node'`.
- **HTTP Client:** Use `axios` or a similar HTTP client to make direct calls to the API endpoints.
- **Focus:** Test API contracts, HAL links, request/response schemas, status codes, and error handling.
- **Environment:** These tests typically run against a live (local or staging) API server.

## General Testing Tips

- **Isolation:** Keep unit tests focused on a single unit (component, function, composable). Mock dependencies to achieve isolation.
- **Functionality vs. Implementation:** Test what the unit *does*, not *how* it does it internally. This makes tests more resilient to refactoring.
- **Readability:** Write clear and descriptive test names (`it('should ... when ...')`).
- **Official Documentation:**
    - Quasar Testing: [https://testing.quasar.dev](https://testing.quasar.dev)
    - Vitest: [https://vitest.dev](https://vitest.dev)
    - Vue Test Utils: [https://test-utils.vuejs.org](https://test-utils.vuejs.org)
- **TypeScript:** Leverage TypeScript for type safety in your tests, test data, and mocks.

By following these guidelines, particularly the use of the Quasar testing App Extension, we aim to create a more robust and maintainable testing setup for the TMD App.
```

**Step 3: Save the File.**
The content above will be saved into `TESTING_GUIDELINES.md` in the project root.
