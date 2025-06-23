import { vi, beforeEach, afterEach } from 'vitest';
import { config } from '@vue/test-utils';
import timezone_mock from 'timezone-mock';

// List of timezones: https://en.wikipedia.org/wiki/List_of_tz_database_time_zones
timezone_mock.register('UTC');

// Set a consistent date for all tests
vi.useFakeTimers();
vi.setSystemTime(new Date('2024-01-15T12:00:00.000Z'));

// Global test configuration
config.global.plugins = [];

// Mock window.matchMedia for components that use responsive features
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(), // deprecated
    removeListener: vi.fn(), // deprecated
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

// Mock IntersectionObserver
global.IntersectionObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}));

// Mock ResizeObserver
global.ResizeObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}));

// Mock fetch globally
global.fetch = vi.fn();

// Setup console methods to be less noisy in tests
beforeEach(() => {
  vi.clearAllMocks();
});

afterEach(() => {
  // Reset timers after each test if they were manipulated inside a test
  vi.useRealTimers();
  vi.useFakeTimers();
  vi.setSystemTime(new Date('2024-01-15T12:00:00.000Z'));
});
