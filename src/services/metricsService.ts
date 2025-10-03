import { useMetrics } from '../composables/useMetrics';
import type { EndpointStats, ExportedMetrics } from '../types/metrics';

/**
 * Metrics Service
 *
 * Provides API for retrieving and exporting operational metrics.
 * Used by DebugPage and external monitoring tools.
 */

/**
 * Get current operational metrics
 *
 * @returns Current metrics snapshot
 */
export const getMetrics = (): ExportedMetrics => {
  const { exportMetrics } = useMetrics();
  return exportMetrics();
};

/**
 * Get statistics for a specific endpoint
 *
 * @param endpoint - Endpoint path to get stats for
 * @returns Endpoint statistics or undefined if not found
 */
export const getEndpointMetrics = (endpoint: string): EndpointStats | undefined => {
  const { endpointStats } = useMetrics();
  return endpointStats.value[endpoint];
};

/**
 * Get top N endpoints by request volume
 *
 * @param limit - Maximum number of endpoints to return (default: 20)
 * @returns Array of endpoint stats sorted by request count
 */
export const getTopEndpoints = (limit = 20): EndpointStats[] => {
  const { getTopEndpoints } = useMetrics();
  return getTopEndpoints(limit);
};

/**
 * Reset all metrics
 *
 * Clears all collected metrics and history.
 * Useful for testing or when starting a new monitoring session.
 */
export const resetMetrics = (): void => {
  const { resetMetrics } = useMetrics();
  resetMetrics();
};

/**
 * Export metrics in JSON format for external monitoring
 *
 * @returns JSON string of exported metrics
 */
export const exportMetricsJSON = (): string => {
  const metrics = getMetrics();
  return JSON.stringify(metrics, null, 2);
};

/**
 * Get metrics summary for display
 *
 * @returns Formatted metrics summary object
 */
export const getMetricsSummary = () => {
  const metrics = getMetrics();

  return {
    // Request summary
    totalRequests: metrics.requestMetrics.totalRequests,
    successRate:
      metrics.requestMetrics.totalRequests > 0
        ? `${(
            (metrics.requestMetrics.successfulRequests / metrics.requestMetrics.totalRequests) * 100
          ).toFixed(1)}%`
        : '0%',
    errorRate: `${(metrics.errorMetrics.errorRate * 100).toFixed(1)}%`,

    // Performance summary
    avgResponseTime: `${Math.round(metrics.performanceMetrics.averageResponseTime)}ms`,
    p50ResponseTime: `${Math.round(metrics.performanceMetrics.p50ResponseTime)}ms`,
    p95ResponseTime: `${Math.round(metrics.performanceMetrics.p95ResponseTime)}ms`,
    p99ResponseTime: `${Math.round(metrics.performanceMetrics.p99ResponseTime)}ms`,

    // Error breakdown
    networkErrors: metrics.errorMetrics.networkErrors,
    serverErrors: metrics.errorMetrics.serverErrors,
    clientErrors: metrics.errorMetrics.clientErrors,

    // Time window
    windowDuration: '1 hour',
    startTime: metrics.timeWindow.startTime.toLocaleString(),
    endTime: metrics.timeWindow.endTime.toLocaleString(),

    // Top endpoints
    topEndpoints: metrics.topEndpoints.slice(0, 5).map((endpoint) => ({
      endpoint: endpoint.endpoint,
      requests: endpoint.requestCount,
      avgTime: `${Math.round(endpoint.averageResponseTime)}ms`,
      errorRate: `${(endpoint.errorRate * 100).toFixed(1)}%`,
    })),
  };
};

// Export the service as default
export default {
  getMetrics,
  getEndpointMetrics,
  getTopEndpoints,
  resetMetrics,
  exportMetricsJSON,
  getMetricsSummary,
};
