/**
 * Operational metrics type definitions (FR-025)
 *
 * Defines types for tracking API performance, errors, and usage patterns
 */

/**
 * Request metrics for tracking total, successful, and failed API calls
 */
export type RequestMetrics = {
  /** Total number of API requests made */
  totalRequests: number;

  /** Number of successful requests (2xx status) */
  successfulRequests: number;

  /** Number of failed requests (4xx, 5xx, network errors) */
  failedRequests: number;

  /** Success rate (0-100 percentage) */
  successRate: number;
};

/**
 * Error metrics for tracking error rates and types
 */
export type ErrorMetrics = {
  /** Overall error rate (0-1, where 0.25 = 25%) */
  errorRate: number;

  /** Count of network errors (offline, timeout, DNS) */
  networkErrors: number;

  /** Count of server errors (5xx) */
  serverErrors: number;

  /** Count of client errors (4xx) */
  clientErrors: number;
};

/**
 * Performance metrics for tracking response times
 */
export type PerformanceMetrics = {
  /** Average response time in milliseconds */
  averageResponseTime: number;

  /** 50th percentile (median) response time in milliseconds */
  p50ResponseTime: number;

  /** 95th percentile response time in milliseconds */
  p95ResponseTime: number;

  /** 99th percentile response time in milliseconds */
  p99ResponseTime: number;

  /** Slowest request time in milliseconds */
  maxResponseTime: number;

  /** Fastest request time in milliseconds */
  minResponseTime: number;
};

/**
 * Per-endpoint statistics
 */
export type EndpointStats = {
  /** Endpoint path */
  endpoint: string;

  /** Total requests to this endpoint */
  requestCount: number;

  /** Total requests to this endpoint (alias for compatibility) */
  totalRequests: number;

  /** Successful requests */
  successCount: number;

  /** Failed requests */
  failureCount: number;

  /** Error rate for this endpoint (0-1) */
  errorRate: number;

  /** Average response time for this endpoint */
  averageResponseTime: number;

  /** Response times for percentile calculation */
  responseTimes: number[];
};

/**
 * Time window for metrics collection
 */
export type TimeWindow = {
  /** Window duration in milliseconds (default: 1 hour) */
  windowDuration: number;

  /** Window size in minutes */
  windowSizeMinutes: number;

  /** Current number of samples in window */
  currentSampleCount: number;

  /** Window start time */
  startTime: Date;

  /** Window end time (current time) */
  endTime: Date;
};

/**
 * Individual request record for history tracking
 */
export type RequestRecord = {
  /** Endpoint path */
  endpoint: string;

  /** Request duration in milliseconds */
  duration: number;

  /** Whether request succeeded */
  success: boolean;

  /** Request timestamp */
  timestamp: Date;

  /** HTTP status code (if available) */
  statusCode?: number;

  /** Error type (if failed) */
  errorType?: 'network' | 'server' | 'client';
};

/**
 * Complete operational metrics state
 */
export type OperationalMetrics = {
  /** Request count metrics */
  requestMetrics: RequestMetrics;

  /** Error tracking metrics */
  errorMetrics: ErrorMetrics;

  /** Performance timing metrics */
  performanceMetrics: PerformanceMetrics;

  /** Time window information */
  timeWindow: TimeWindow;
};

/**
 * Exported metrics format for external monitoring
 */
export type ExportedMetrics = OperationalMetrics & {
  /** Export timestamp */
  exportedAt: Date;

  /** Per-endpoint statistics (top 20) */
  topEndpoints: EndpointStats[];
};
