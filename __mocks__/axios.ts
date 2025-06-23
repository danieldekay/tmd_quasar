// Manual mock for the 'axios' npm package used by Vitest tests
// Located at __mocks__/axios.ts so that `vi.mock('axios')` picks it up automatically

import { vi } from 'vitest';

// Create a reusable mock axios instance with the fields our code relies on
const mockAxiosInstance = {
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

// Use `any` to avoid TypeScript complaints about missing properties on the function object
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const axiosMock: any = vi.fn(() => Promise.resolve({ data: {} }));

// Attach the mock instance and helpers
Object.assign(axiosMock, mockAxiosInstance);

// axios.create should return the mock instance
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore -- we are deliberately extending the function object
axiosMock.create = vi.fn(() => axiosMock);

export default axiosMock;

// Also export all HTTP verb helpers (named exports) so that named imports work
export const { get, post, put, delete: del, patch, head, options, request } = mockAxiosInstance;

// Provide create as a named export too
// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
export const create = axiosMock.create;
