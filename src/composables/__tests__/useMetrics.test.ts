import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { useMetrics } from '../useMetrics';

/**
 * Test suite for operational metrics tracking (FR-025)
 * 
 * These tests verify:
 * - Request count tracked co        expect(topEndpoints[19]?.endpoint).toBe('/endpoint6');
      expect(topEndpoints[19]?.requestCount).toBe(6);
      expect(topEndpoints[19]?.endpoint).toBe('/endpoint6');
      expect(topEndpoints[19]?.requestCount).toBe(6);expect(topEndpoints[0]?.requestCount).toBe(25);
      expect(topEndpoints[19]?.endpoint).toBe('/endpoint6');
      expect(topEndpoints[19]?.requestCount).toBe(6);
    });tly
 * - Error rate calculated accurately
 * - Response time percentiles (P50, P95, P99) computed
 * - Success/failure counts per endpoint
 * - Average response time per endpoint
 * - Top 20 endpoints by volume tracked
 * - Rolling 1-hour window maintained
 * - Old metrics expired correctly
 * - Metrics reset on page reload
 * 
 * Expected: FAIL (useMetrics composable doesn't exist yet)
 */

describe('useMetrics composable', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('Metrics initialization', () => {
    it('should initialize with empty metrics state', () => {
      const { metrics } = useMetrics();

      expect(metrics.value.requestMetrics.totalRequests).toBe(0);
      expect(metrics.value.requestMetrics.successfulRequests).toBe(0);
      expect(metrics.value.requestMetrics.failedRequests).toBe(0);
      expect(metrics.value.errorMetrics.errorRate).toBe(0);
      expect(metrics.value.performanceMetrics.averageResponseTime).toBe(0);
      expect(metrics.value.performanceMetrics.p50ResponseTime).toBe(0);
      expect(metrics.value.performanceMetrics.p95ResponseTime).toBe(0);
      expect(metrics.value.performanceMetrics.p99ResponseTime).toBe(0);
    });

    it('should initialize with empty endpoint map', () => {
      const { endpointStats } = useMetrics();

      expect(endpointStats.value).toEqual({});
    });

    it('should initialize with 1-hour time window', () => {
      const { timeWindow } = useMetrics();

      expect(timeWindow.value.windowDuration).toBe(3600000); // 1 hour in milliseconds
      expect(timeWindow.value.startTime).toBeInstanceOf(Date);
      expect(timeWindow.value.endTime).toBeInstanceOf(Date);
    });
  });

  describe('Request metrics tracking', () => {
    it('should track total request count correctly', () => {
      const { metrics, recordRequest } = useMetrics();

      recordRequest('/events', 100, true);
      recordRequest('/djs', 150, true);
      recordRequest('/teachers', 200, false);

      expect(metrics.value.requestMetrics.totalRequests).toBe(3);
    });

    it('should track successful requests correctly', () => {
      const { metrics, recordRequest } = useMetrics();

      recordRequest('/events', 100, true);
      recordRequest('/djs', 150, true);
      recordRequest('/teachers', 200, false);

      expect(metrics.value.requestMetrics.successfulRequests).toBe(2);
    });

    it('should track failed requests correctly', () => {
      const { metrics, recordRequest } = useMetrics();

      recordRequest('/events', 100, true);
      recordRequest('/djs', 150, false);
      recordRequest('/teachers', 200, false);

      expect(metrics.value.requestMetrics.failedRequests).toBe(2);
    });

    it('should calculate error rate correctly', () => {
      const { metrics, recordRequest } = useMetrics();

      recordRequest('/events', 100, true);
      recordRequest('/djs', 150, false);
      recordRequest('/teachers', 200, true);
      recordRequest('/event-series', 300, true);

      // 1 failure out of 4 requests = 25% error rate
      expect(metrics.value.errorMetrics.errorRate).toBe(0.25);
    });

    it('should handle zero requests without division errors', () => {
      const { metrics } = useMetrics();

      expect(metrics.value.errorMetrics.errorRate).toBe(0);
      expect(metrics.value.performanceMetrics.averageResponseTime).toBe(0);
    });
  });

  describe('Response time percentiles', () => {
    it('should calculate P50 (median) response time correctly', () => {
      const { metrics, recordRequest } = useMetrics();

      // Record requests with various durations
      const durations = [100, 150, 200, 250, 300];
      durations.forEach((duration) => {
        recordRequest('/events', duration, true);
      });

      // Median of [100, 150, 200, 250, 300] = 200
      expect(metrics.value.performanceMetrics.p50ResponseTime).toBe(200);
    });

    it('should calculate P95 response time correctly', () => {
      const { metrics, recordRequest } = useMetrics();

      // Record 100 requests with varying durations
      for (let i = 1; i <= 100; i++) {
        recordRequest('/events', i * 10, true);
      }

      // P95 of 100 requests should be around 950ms
      expect(metrics.value.performanceMetrics.p95ResponseTime).toBeGreaterThanOrEqual(900);
      expect(metrics.value.performanceMetrics.p95ResponseTime).toBeLessThanOrEqual(1000);
    });

    it('should calculate P99 response time correctly', () => {
      const { metrics, recordRequest } = useMetrics();

      // Record 100 requests with varying durations
      for (let i = 1; i <= 100; i++) {
        recordRequest('/events', i * 10, true);
      }

      // P99 of 100 requests should be around 990ms
      expect(metrics.value.performanceMetrics.p99ResponseTime).toBeGreaterThanOrEqual(950);
      expect(metrics.value.performanceMetrics.p99ResponseTime).toBeLessThanOrEqual(1000);
    });

    it('should calculate average response time correctly', () => {
      const { metrics, recordRequest } = useMetrics();

      recordRequest('/events', 100, true);
      recordRequest('/djs', 200, true);
      recordRequest('/teachers', 300, true);

      // Average of [100, 200, 300] = 200
      expect(metrics.value.performanceMetrics.averageResponseTime).toBe(200);
    });

    it('should handle single request percentile calculation', () => {
      const { metrics, recordRequest } = useMetrics();

      recordRequest('/events', 150, true);

      expect(metrics.value.performanceMetrics.p50ResponseTime).toBe(150);
      expect(metrics.value.performanceMetrics.p95ResponseTime).toBe(150);
      expect(metrics.value.performanceMetrics.p99ResponseTime).toBe(150);
    });
  });

  describe('Per-endpoint metrics', () => {
    it('should track success count per endpoint', () => {
      const { endpointStats, recordRequest } = useMetrics();

      recordRequest('/events', 100, true);
      recordRequest('/events', 150, true);
      recordRequest('/djs', 200, true);

      expect(endpointStats.value['/events']?.successCount).toBe(2);
      expect(endpointStats.value['/djs']?.successCount).toBe(1);
    });

    it('should track failure count per endpoint', () => {
      const { endpointStats, recordRequest } = useMetrics();

      recordRequest('/events', 100, false);
      recordRequest('/events', 150, false);
      recordRequest('/djs', 200, true);

      expect(endpointStats.value['/events']?.failureCount).toBe(2);
      expect(endpointStats.value['/djs']?.failureCount).toBe(0);
    });

    it('should calculate average response time per endpoint', () => {
      const { endpointStats, recordRequest } = useMetrics();

      recordRequest('/events', 100, true);
      recordRequest('/events', 200, true);
      recordRequest('/events', 300, true);

      // Average of [100, 200, 300] = 200
      expect(endpointStats.value['/events']?.averageResponseTime).toBe(200);
    });

    it('should track request count per endpoint', () => {
      const { endpointStats, recordRequest } = useMetrics();

      recordRequest('/events', 100, true);
      recordRequest('/events', 150, true);
      recordRequest('/events', 200, false);
      recordRequest('/djs', 250, true);

      expect(endpointStats.value['/events']?.requestCount).toBe(3);
      expect(endpointStats.value['/djs']?.requestCount).toBe(1);
    });

    it('should track top 20 endpoints by volume', () => {
      const { getTopEndpoints, recordRequest } = useMetrics();

      // Create 25 different endpoints with varying request counts
      for (let i = 1; i <= 25; i++) {
        const endpoint = `/endpoint${i}`;
        // Record i requests for each endpoint (endpoint1 = 1 request, endpoint25 = 25 requests)
        for (let j = 0; j < i; j++) {
          recordRequest(endpoint, 100, true);
        }
      }

      const topEndpoints = getTopEndpoints(20);

      expect(topEndpoints).toHaveLength(20);
      // Should be sorted by request count descending
      expect(topEndpoints[0]?.endpoint).toBe('/endpoint25');
      expect(topEndpoints[0]?.requestCount).toBe(25);
      expect(topEndpoints[19]?.endpoint).toBe('/endpoint6');
      expect(topEndpoints[19]?.requestCount).toBe(6);
    });

    it('should calculate error rate per endpoint', () => {
      const { endpointStats, recordRequest } = useMetrics();

      recordRequest('/events', 100, true);
      recordRequest('/events', 150, true);
      recordRequest('/events', 200, false);
      recordRequest('/events', 250, false);

      // 2 failures out of 4 requests = 50% error rate
      expect(endpointStats.value['/events']?.errorRate).toBe(0.5);
    });
  });

  describe('Time window management', () => {
    it('should maintain 1-hour rolling window', () => {
      const { requestHistory, recordRequest } = useMetrics();

      const now = Date.now();
      vi.setSystemTime(now);

      // Record request at current time
      recordRequest('/events', 100, true);

      // Advance time by 30 minutes
      vi.setSystemTime(now + 30 * 60 * 1000);
      recordRequest('/djs', 150, true);

      // Advance time by another 40 minutes (70 minutes total)
      vi.setSystemTime(now + 70 * 60 * 1000);
      recordRequest('/teachers', 200, true);

      // First request should be expired (>1 hour old)
      expect(requestHistory.value).toHaveLength(2);
      expect(requestHistory.value[0]?.endpoint).toBe('/djs');
      expect(requestHistory.value[1]?.endpoint).toBe('/teachers');
    });

    it('should expire old metrics correctly', () => {
      const { metrics, recordRequest, pruneExpiredMetrics } = useMetrics();

      const now = Date.now();
      vi.setSystemTime(now);

      // Record 5 requests at current time
      for (let i = 0; i < 5; i++) {
        recordRequest('/events', 100, true);
      }

      expect(metrics.value.requestMetrics.totalRequests).toBe(5);

      // Advance time by 65 minutes (past 1-hour window)
      vi.setSystemTime(now + 65 * 60 * 1000);

      // Prune expired metrics
      pruneExpiredMetrics();

      // All metrics should be expired
      expect(metrics.value.requestMetrics.totalRequests).toBe(0);
    });

    it('should update window start and end times', () => {
      const { timeWindow, recordRequest } = useMetrics();

      const now = Date.now();
      vi.setSystemTime(now);

      recordRequest('/events', 100, true);

      const startTime = timeWindow.value.startTime.getTime();
      const endTime = timeWindow.value.endTime.getTime();

      expect(endTime - startTime).toBe(3600000); // 1 hour
      expect(endTime).toBeGreaterThanOrEqual(now);
    });

    it('should automatically prune on each record', () => {
      const { metrics, recordRequest } = useMetrics();

      const now = Date.now();
      vi.setSystemTime(now);

      // Record 3 requests
      recordRequest('/events', 100, true);
      recordRequest('/djs', 150, true);
      recordRequest('/teachers', 200, true);

      expect(metrics.value.requestMetrics.totalRequests).toBe(3);

      // Advance time by 65 minutes
      vi.setSystemTime(now + 65 * 60 * 1000);

      // Record a new request (should trigger auto-pruning)
      recordRequest('/orchestras', 250, true);

      // Only the new request should remain
      expect(metrics.value.requestMetrics.totalRequests).toBe(1);
    });
  });

  describe('Metrics reset', () => {
    it('should reset all metrics on demand', () => {
      const { metrics, endpointStats, recordRequest, resetMetrics } = useMetrics();

      // Record multiple requests
      recordRequest('/events', 100, true);
      recordRequest('/djs', 150, false);
      recordRequest('/teachers', 200, true);

      expect(metrics.value.requestMetrics.totalRequests).toBe(3);
      expect(Object.keys(endpointStats.value)).toHaveLength(3);

      // Reset metrics
      resetMetrics();

      expect(metrics.value.requestMetrics.totalRequests).toBe(0);
      expect(metrics.value.requestMetrics.successfulRequests).toBe(0);
      expect(metrics.value.requestMetrics.failedRequests).toBe(0);
      expect(metrics.value.errorMetrics.errorRate).toBe(0);
      expect(Object.keys(endpointStats.value)).toHaveLength(0);
    });

    it('should clear request history on reset', () => {
      const { requestHistory, recordRequest, resetMetrics } = useMetrics();

      recordRequest('/events', 100, true);
      recordRequest('/djs', 150, true);

      expect(requestHistory.value).toHaveLength(2);

      resetMetrics();

      expect(requestHistory.value).toHaveLength(0);
    });

    it('should reset time window on reset', () => {
      const { timeWindow, recordRequest, resetMetrics } = useMetrics();

      const now = Date.now();
      vi.setSystemTime(now);

      recordRequest('/events', 100, true);

      const startTimeBefore = timeWindow.value.startTime.getTime();

      // Advance time by 30 minutes
      vi.setSystemTime(now + 30 * 60 * 1000);

      resetMetrics();

      const startTimeAfter = timeWindow.value.startTime.getTime();

      // Start time should be updated to current time after reset
      expect(startTimeAfter).toBeGreaterThan(startTimeBefore);
    });
  });

  describe('Metrics export', () => {
    it('should export metrics in correct format', () => {
      const { recordRequest, exportMetrics } = useMetrics();

      recordRequest('/events', 100, true);
      recordRequest('/djs', 150, false);

      const exported = exportMetrics();

      expect(exported).toHaveProperty('requestMetrics');
      expect(exported).toHaveProperty('errorMetrics');
      expect(exported).toHaveProperty('performanceMetrics');
      expect(exported).toHaveProperty('endpointStats');
      expect(exported).toHaveProperty('timeWindow');
      expect(exported).toHaveProperty('exportedAt');
    });

    it('should include timestamp in export', () => {
      const { exportMetrics } = useMetrics();

      const now = Date.now();
      vi.setSystemTime(now);

      const exported = exportMetrics();

      expect(exported.exportedAt).toBeInstanceOf(Date);
      expect(exported.exportedAt.getTime()).toBe(now);
    });
  });
});
