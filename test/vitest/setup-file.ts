// This file will be run before each test file
import { vi, beforeEach } from 'vitest';
import { ref } from 'vue';
import { setActivePinia, createPinia } from 'pinia';

// Create a fresh Pinia instance before each test
beforeEach(() => {
  setActivePinia(createPinia());
});

// Mock vue-router for integration tests
vi.mock('vue-router', async () => {
  const actual = await vi.importActual<typeof import('vue-router')>('vue-router');
  return {
    ...actual,
    useRoute: () => ({
      params: ref({ id: '123' }),
      query: ref({}),
      path: ref('/events/123'),
      name: ref('EventDetails'),
    }),
    useRouter: () => ({
      push: vi.fn(),
      replace: vi.fn(),
      go: vi.fn(),
      back: vi.fn(),
      forward: vi.fn(),
    }),
  };
});
