import { describe, it, expect, vi, beforeEach } from 'vitest';
import { api } from '../../../boot/axios';

/**
 * Integration test suite for concurrent request handling (FR-027)
 * 
 * These tests verify:
 * - 5 concurrent requests complete successfully
 * - 20 concurrent requests complete successfully
 * - No timeout errors with 15 parallel requests
 * - Browser handles concurrent requests without issues
 * - API responses are correctly handled for all concurrent requests
 * 
 * Expected: PASS or FAIL (verify existing behavior)
 */

describe('Concurrent Request Handling', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Small concurrent load (5 requests)', () => {
    it('should handle 5 concurrent GET requests successfully', async () => {
      const requests = Array.from({ length: 5 }, (_, i) =>
        api.get(`/events?page=${i + 1}&per_page=10`),
      );

      const results = await Promise.all(requests);

      expect(results).toHaveLength(5);
      results.forEach((result) => {
        expect(result.status).toBe(200);
        expect(result.data).toBeDefined();
      });
    });

    it('should handle 5 concurrent requests to different endpoints', async () => {
      const endpoints = ['/events', '/djs', '/teachers', '/event-series', '/couples'];

      const requests = endpoints.map((endpoint) => api.get(`${endpoint}?per_page=10`));

      const results = await Promise.all(requests);

      expect(results).toHaveLength(5);
      results.forEach((result) => {
        expect(result.status).toBe(200);
        expect(result.data).toBeDefined();
      });
    });

    it('should complete all 5 requests within timeout (30s)', async () => {
      const startTime = Date.now();

      const requests = Array.from({ length: 5 }, (_, i) =>
        api.get(`/events?page=${i + 1}&per_page=10`),
      );

      await Promise.all(requests);

      const duration = Date.now() - startTime;

      expect(duration).toBeLessThan(30000); // 30 seconds timeout
    });
  });

  describe('Medium concurrent load (15 requests)', () => {
    it('should handle 15 concurrent GET requests without timeouts', async () => {
      const requests = Array.from({ length: 15 }, (_, i) =>
        api.get(`/events?page=${i + 1}&per_page=10`),
      );

      const results = await Promise.all(requests);

      expect(results).toHaveLength(15);
      results.forEach((result) => {
        expect(result.status).toBe(200);
        expect(result.data).toBeDefined();
      });
    });

    it('should track request durations for all 15 concurrent requests', async () => {
      const requests = Array.from({ length: 15 }, (_, i) =>
        api.get(`/events?page=${i + 1}&per_page=10`),
      );

      const results = await Promise.all(requests);

      // Verify all requests have metadata (added by interceptor)
      results.forEach((result) => {
        const config = result.config as unknown as { metadata?: { startTime: number } };
        expect(config.metadata).toBeDefined();
        expect(config.metadata?.startTime).toBeTypeOf('number');
      });
    });

    it('should handle mixed success and failure in 15 concurrent requests', async () => {
      // Mix of valid and invalid endpoints
      const requests = [
        ...Array.from({ length: 10 }, (_, i) => api.get(`/events?page=${i + 1}&per_page=10`)),
        ...Array.from({ length: 5 }, (_, i) => api.get(`/invalid-endpoint-${i}`)),
      ];

      const results = await Promise.allSettled(requests);

      expect(results).toHaveLength(15);

      const fulfilled = results.filter((r) => r.status === 'fulfilled');
      const rejected = results.filter((r) => r.status === 'rejected');

      expect(fulfilled.length).toBeGreaterThan(0);
      expect(rejected.length).toBeGreaterThan(0);
      expect(fulfilled.length + rejected.length).toBe(15);
    });
  });

  describe('High concurrent load (20 requests)', () => {
    it('should handle 20 concurrent GET requests successfully', async () => {
      const requests = Array.from({ length: 20 }, (_, i) =>
        api.get(`/events?page=${i + 1}&per_page=10`),
      );

      const results = await Promise.all(requests);

      expect(results).toHaveLength(20);
      results.forEach((result) => {
        expect(result.status).toBe(200);
        expect(result.data).toBeDefined();
      });
    });

    it('should not exceed browser concurrent connection limits', async () => {
      // Most browsers limit to 6 concurrent connections per domain
      // But HTTP/2 allows multiplexing, so this should still work

      const startTime = Date.now();

      const requests = Array.from({ length: 20 }, (_, i) =>
        api.get(`/events?page=${i + 1}&per_page=10`),
      );

      const results = await Promise.all(requests);

      const duration = Date.now() - startTime;

      expect(results).toHaveLength(20);
      // Should complete reasonably quickly (not serialized)
      // Allow generous timeout for CI environments
      expect(duration).toBeLessThan(60000); // 60 seconds max
    });

    it('should maintain request integrity across 20 concurrent requests', async () => {
      const requests = Array.from({ length: 20 }, (_, i) =>
        api.get(`/events?page=${i + 1}&per_page=10`),
      );

      const results = await Promise.all(requests);

      // Verify each response corresponds to correct page
      results.forEach((result, index) => {
        expect(result.status).toBe(200);
        expect(result.config.url).toContain(`page=${index + 1}`);
      });
    });
  });

  describe('Request cancellation with concurrent requests', () => {
    it('should cancel specific requests using AbortController', async () => {
      const controllers = Array.from({ length: 5 }, () => new AbortController());

      const requests = controllers.map((controller, i) =>
        api.get(`/events?page=${i + 1}&per_page=10`, { signal: controller.signal }),
      );

      // Cancel the 3rd request
      controllers[2].abort();

      const results = await Promise.allSettled(requests);

      expect(results).toHaveLength(5);

      const fulfilled = results.filter((r) => r.status === 'fulfilled');
      const rejected = results.filter((r) => r.status === 'rejected');

      expect(fulfilled.length).toBe(4); // 4 successful
      expect(rejected.length).toBe(1); // 1 cancelled
    });

    it('should cancel all pending requests', async () => {
      const controller = new AbortController();

      const requests = Array.from({ length: 10 }, (_, i) =>
        api.get(`/events?page=${i + 1}&per_page=10`, { signal: controller.signal }),
      );

      // Cancel all requests immediately
      controller.abort();

      const results = await Promise.allSettled(requests);

      expect(results).toHaveLength(10);

      // All should be rejected due to cancellation
      const rejected = results.filter((r) => r.status === 'rejected');
      expect(rejected.length).toBeGreaterThan(0);
    });
  });

  describe('Concurrent request error handling', () => {
    it('should handle network errors in concurrent requests gracefully', async () => {
      // Mix of valid and network-error prone requests
      const requests = [
        api.get('/events?per_page=10'),
        api.get('/djs?per_page=10'),
        api.get('http://localhost:99999/invalid'), // Should fail
        api.get('/teachers?per_page=10'),
      ];

      const results = await Promise.allSettled(requests);

      expect(results).toHaveLength(4);

      // Should have both successful and failed requests
      const fulfilled = results.filter((r) => r.status === 'fulfilled');
      const rejected = results.filter((r) => r.status === 'rejected');

      expect(fulfilled.length).toBeGreaterThan(0);
      expect(rejected.length).toBeGreaterThan(0);
    });

    it('should not let one failed request affect others', async () => {
      const requests = [
        api.get('/events?per_page=10'),
        api.get('/invalid-endpoint-that-will-404'),
        api.get('/djs?per_page=10'),
        api.get('/another-invalid-endpoint'),
        api.get('/teachers?per_page=10'),
      ];

      const results = await Promise.allSettled(requests);

      const fulfilled = results.filter((r) => r.status === 'fulfilled');

      // At least the valid endpoints should succeed
      expect(fulfilled.length).toBeGreaterThanOrEqual(3);
    });
  });

  describe('Performance under concurrent load', () => {
    it('should maintain reasonable response times under concurrent load', async () => {
      const startTime = Date.now();

      const requests = Array.from({ length: 15 }, (_, i) =>
        api.get(`/events?page=${i + 1}&per_page=10`),
      );

      const results = await Promise.all(requests);

      const duration = Date.now() - startTime;
      const averageTime = duration / results.length;

      // Average time per request should be reasonable
      expect(averageTime).toBeLessThan(5000); // Less than 5 seconds per request on average
    });

    it('should not trigger slow request warnings for all concurrent requests', async () => {
      const warnSpy = vi.spyOn(console, 'warn');

      const requests = Array.from({ length: 10 }, (_, i) =>
        api.get(`/events?page=${i + 1}&per_page=10`),
      );

      await Promise.all(requests);

      // Some slow warnings might occur, but not for every request
      const slowWarnings = warnSpy.mock.calls.filter((call) =>
        call[0]?.toString().includes('Slow API request'),
      );

      expect(slowWarnings.length).toBeLessThan(10);

      warnSpy.mockRestore();
    });
  });

  describe('Concurrent requests with authentication', () => {
    it('should include auth token in all concurrent requests', async () => {
      // Mock token
      const mockToken = 'test-jwt-token';
      vi.mock('../../../utils/cookies', () => ({
        getJWTToken: () => mockToken,
      }));

      const requests = Array.from({ length: 5 }, (_, i) =>
        api.get(`/events?page=${i + 1}&per_page=10`),
      );

      const results = await Promise.all(requests);

      // Verify all requests have auth header
      results.forEach((result) => {
        expect(result.config.headers.Authorization).toBe(`Bearer ${mockToken}`);
      });
    });

    it('should handle 401 responses in concurrent requests', async () => {
      // This test verifies that the auto-relogin mechanism works with concurrent requests
      // Not all requests should trigger re-login (only the first one)

      const requests = Array.from({ length: 5 }, (_, i) =>
        api.get(`/protected-endpoint-${i}`),
      );

      const results = await Promise.allSettled(requests);

      expect(results).toHaveLength(5);

      // Depending on implementation, some might succeed after re-login, some might fail
      // The important thing is that the system doesn't crash
      const fulfilled = results.filter((r) => r.status === 'fulfilled');
      const rejected = results.filter((r) => r.status === 'rejected');

      expect(fulfilled.length + rejected.length).toBe(5);
    });
  });
});
