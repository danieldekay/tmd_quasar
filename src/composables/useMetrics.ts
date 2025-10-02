import { ref, computed } from 'vue';
import type {
  OperationalMetrics,
  RequestMetrics,
  ErrorMetrics,
  PerformanceMetrics,
  TimeWindow,
  RequestRecord,
  EndpointStats,
  ExportedMetrics,
} from '../types/metrics';

/**
 * Composable for operational metrics tracking (FR-025)
 * 
 * Tracks API performance, error rates, and usage patterns with:
 * - Request count (total, success, failure)
 * - Error rate calculation
 * - Response time percentiles (P50, P95, P99)
 * - Per-endpoint statistics
 * - Rolling 1-hour time window
 * 
 * @example
 * ```typescript
 * const { metrics, recordRequest } = useMetrics();
 * 
 * // Record a successful request
 * recordRequest('/events', 150, true);
 * 
 * // Record a failed request
 * recordRequest('/djs', 500, false, 500, 'server');
 * 
 * // Get current metrics
 * console.log(metrics.value.performanceMetrics.p95ResponseTime);
 * ```
 */

// Constants
const WINDOW_DURATION_MS = 60 * 60 * 1000; // 1 hour
const MAX_HISTORY_SIZE = 10000; // Prevent memory issues

// Global state for metrics
const requestHistory = ref<RequestRecord[]>([]);
const endpointMap = ref<Record<string, EndpointStats>>({});

/**
 * Calculate percentile from sorted array of numbers
 * 
 * @param sortedValues - Array of numbers sorted in ascending order
 * @param percentile - Percentile to calculate (0-100)
 * @returns Percentile value
 */
const calculatePercentile = (sortedValues: number[], percentile: number): number => {
  if (sortedValues.length === 0) return 0;
  if (sortedValues.length === 1) return sortedValues[0] ?? 0;

  const index = (percentile / 100) * (sortedValues.length - 1);
  const lower = Math.floor(index);
  const upper = Math.ceil(index);
  const weight = index - lower;

  const lowerValue = sortedValues[lower] ?? 0;
  const upperValue = sortedValues[upper] ?? 0;

  return lowerValue * (1 - weight) + upperValue * weight;
};

/**
 * Calculate average from array of numbers
 * 
 * @param values - Array of numbers
 * @returns Average value
 */
const calculateAverage = (values: number[]): number => {
  if (values.length === 0) return 0;
  return values.reduce((sum, val) => sum + val, 0) / values.length;
};

/**
 * Composable hook for metrics tracking
 */
export const useMetrics = () => {
  /**
   * Prune expired metrics outside the 1-hour window
   */
  const pruneExpiredMetrics = (): void => {
    const now = Date.now();
    const cutoffTime = now - WINDOW_DURATION_MS;

    // Filter out expired requests
    requestHistory.value = requestHistory.value.filter(
      (record) => record.timestamp.getTime() >= cutoffTime,
    );

    // Rebuild endpoint map from remaining history
    rebuildEndpointMap();
  };

  /**
   * Rebuild endpoint map from current request history
   */
  const rebuildEndpointMap = (): void => {
    const newMap: Record<string, EndpointStats> = {};

    requestHistory.value.forEach((record) => {
      if (!newMap[record.endpoint]) {
        newMap[record.endpoint] = {
          endpoint: record.endpoint,
          requestCount: 0,
          totalRequests: 0, // Alias for compatibility
          successCount: 0,
          failureCount: 0,
          errorRate: 0,
          averageResponseTime: 0,
          responseTimes: [],
        };
      }

      const stats = newMap[record.endpoint];
      if (stats) {
        stats.requestCount++;
        stats.totalRequests++; // Keep in sync
        stats.responseTimes.push(record.duration);

        if (record.success) {
          stats.successCount++;
        } else {
          stats.failureCount++;
        }
      }
    });

    // Calculate derived metrics for each endpoint
    Object.values(newMap).forEach((stats) => {
      stats.errorRate = stats.requestCount > 0 ? stats.failureCount / stats.requestCount : 0;
      stats.averageResponseTime = calculateAverage(stats.responseTimes);
    });

    endpointMap.value = newMap;
  };

  /**
   * Record a new API request
   * 
   * @param endpoint - API endpoint path
   * @param duration - Request duration in milliseconds
   * @param success - Whether request succeeded
   * @param statusCode - HTTP status code (optional)
   * @param errorType - Error type if failed (optional)
   */
  const recordRequest = (
    endpoint: string,
    duration: number,
    success: boolean,
    statusCode?: number,
    errorType?: 'network' | 'server' | 'client',
  ): void => {
    // Auto-prune before adding new record
    pruneExpiredMetrics();

    // Add to history
    const record: RequestRecord = {
      endpoint,
      duration,
      success,
      timestamp: new Date(),
      ...(statusCode !== undefined && { statusCode }),
      ...(errorType !== undefined && { errorType }),
    };

    requestHistory.value.push(record);

    // Prevent memory issues
    if (requestHistory.value.length > MAX_HISTORY_SIZE) {
      requestHistory.value = requestHistory.value.slice(-MAX_HISTORY_SIZE);
    }

    // Update endpoint stats
    updateEndpointStats(record);
  };

  /**
   * Update endpoint statistics for a new request
   * 
   * @param record - Request record to process
   */
  const updateEndpointStats = (record: RequestRecord): void => {
    if (!endpointMap.value[record.endpoint]) {
      endpointMap.value[record.endpoint] = {
        endpoint: record.endpoint,
        requestCount: 0,
        totalRequests: 0, // Alias for compatibility
        successCount: 0,
        failureCount: 0,
        errorRate: 0,
        averageResponseTime: 0,
        responseTimes: [],
      };
    }

    const stats = endpointMap.value[record.endpoint];
    if (stats) {
      stats.requestCount++;
      stats.totalRequests++; // Keep in sync
      stats.responseTimes.push(record.duration);

      if (record.success) {
        stats.successCount++;
      } else {
        stats.failureCount++;
      }

      // Recalculate derived metrics
      stats.errorRate = stats.failureCount / stats.requestCount;
      stats.averageResponseTime = calculateAverage(stats.responseTimes);
    }
  };

  /**
   * Get top N endpoints by request volume
   * 
   * @param limit - Maximum number of endpoints to return
   * @returns Array of endpoint stats sorted by request count
   */
  const getTopEndpoints = (limit = 20): EndpointStats[] => {
    return Object.values(endpointMap.value)
      .sort((a, b) => b.requestCount - a.requestCount)
      .slice(0, limit);
  };

  /**
   * Reset all metrics
   */
  const resetMetrics = (): void => {
    requestHistory.value = [];
    endpointMap.value = {};
  };

  /**
   * Export metrics for external monitoring
   * 
   * @returns Exported metrics with timestamp
   */
  const exportMetrics = (): ExportedMetrics => {
    return {
      ...metrics.value,
      exportedAt: new Date(),
      topEndpoints: getTopEndpoints(20),
    };
  };

  // Computed metrics
  const requestMetrics = computed<RequestMetrics>(() => {
    const successful = requestHistory.value.filter((r) => r.success).length;
    const failed = requestHistory.value.filter((r) => !r.success).length;
    const total = requestHistory.value.length;
    const successRate = total > 0 ? (successful / total) * 100 : 0;

    return {
      totalRequests: total,
      successfulRequests: successful,
      failedRequests: failed,
      successRate,
    };
  });

  const errorMetrics = computed<ErrorMetrics>(() => {
    const total = requestHistory.value.length;
    const networkErrors = requestHistory.value.filter((r) => r.errorType === 'network').length;
    const serverErrors = requestHistory.value.filter((r) => r.errorType === 'server').length;
    const clientErrors = requestHistory.value.filter((r) => r.errorType === 'client').length;

    return {
      errorRate: total > 0 ? requestMetrics.value.failedRequests / total : 0,
      networkErrors,
      serverErrors,
      clientErrors,
    };
  });

  const performanceMetrics = computed<PerformanceMetrics>(() => {
    const durations = requestHistory.value.map((r) => r.duration);

    if (durations.length === 0) {
      return {
        averageResponseTime: 0,
        p50ResponseTime: 0,
        p95ResponseTime: 0,
        p99ResponseTime: 0,
        maxResponseTime: 0,
        minResponseTime: 0,
      };
    }

    const sortedDurations = [...durations].sort((a, b) => a - b);

    return {
      averageResponseTime: calculateAverage(durations),
      p50ResponseTime: calculatePercentile(sortedDurations, 50),
      p95ResponseTime: calculatePercentile(sortedDurations, 95),
      p99ResponseTime: calculatePercentile(sortedDurations, 99),
      maxResponseTime: Math.max(...durations),
      minResponseTime: Math.min(...durations),
    };
  });

  const timeWindow = computed<TimeWindow>(() => {
    const now = new Date();
    const startTime = new Date(now.getTime() - WINDOW_DURATION_MS);

    return {
      windowDuration: WINDOW_DURATION_MS,
      windowSizeMinutes: WINDOW_DURATION_MS / (60 * 1000),
      currentSampleCount: requestHistory.value.length,
      startTime,
      endTime: now,
    };
  });

  const metrics = computed<OperationalMetrics>(() => ({
    requestMetrics: requestMetrics.value,
    errorMetrics: errorMetrics.value,
    performanceMetrics: performanceMetrics.value,
    timeWindow: timeWindow.value,
  }));

  const endpointStats = computed(() => endpointMap.value);

  return {
    // State
    requestHistory,
    endpointStats,

    // Computed
    metrics,
    requestMetrics,
    errorMetrics,
    performanceMetrics,
    timeWindow,

    // Methods
    recordRequest,
    pruneExpiredMetrics,
    getTopEndpoints,
    resetMetrics,
    exportMetrics,
  };
};
