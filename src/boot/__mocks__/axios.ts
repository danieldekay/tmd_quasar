import { vi } from 'vitest';

// This is the mock for the named 'api' export from src/boot/axios.ts
// Simplified to focus on the methods used by BaseService.
const mockApi = {
  interceptors: {
    request: {
      use: vi.fn(),
      eject: vi.fn(),
    },
    response: {
      use: vi.fn(),
      eject: vi.fn(),
    },
  },
  get: vi.fn(),
  post: vi.fn(),
  put: vi.fn(),
  delete: vi.fn(),
  patch: vi.fn(),
  head: vi.fn(),
  options: vi.fn(),
  request: vi.fn(),
};

export const api = mockApi;

// This is the mock for the default export (boot function) from src/boot/axios.ts
const mockBoot = vi.fn(() => ({
  app: {
    config: {
      globalProperties: {},
    },
  },
}));

export default mockBoot;

// If the original module also exports the raw 'axios' instance/functions:
// export const axios = {
//   create: vi.fn(() => mockApiInstance), // If axios.create is called by boot file
//   get: vi.fn(),
//   post: vi.fn(),
//   // ... other static axios methods
// };
