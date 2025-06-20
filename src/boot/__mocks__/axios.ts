import { vi } from 'vitest';

// This is the mock for the named 'api' export from src/boot/axios.ts
// Simplified to focus on the methods used by BaseService.
const mockApiInstance = {
  get: vi.fn(),
  post: vi.fn(),
  put: vi.fn(),
  delete: vi.fn(),
  // If the real 'api' instance has interceptors directly on it (and they are used)
  // they might need to be mocked here too.
  // interceptors: {
  //   request: { use: vi.fn(), eject: vi.fn() },
  //   response: { use: vi.fn(), eject: vi.fn() },
  // },
};

export const api = mockApiInstance;

// This is the mock for the default export (boot function) from src/boot/axios.ts
const mockBoot = vi.fn();
export default mockBoot;

// If the original module also exports the raw 'axios' instance/functions:
// export const axios = {
//   create: vi.fn(() => mockApiInstance), // If axios.create is called by boot file
//   get: vi.fn(),
//   post: vi.fn(),
//   // ... other static axios methods
// };
