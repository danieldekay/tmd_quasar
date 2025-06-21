/**
 * V3 API Enhanced Types
 * Type definitions specifically for V3 HAL-compliant API interactions
 */

import type { BaseParams } from './baseService';
import type { EventCategory, EventFeature, EventSortOption, SortOrder } from './eventConstants';

/**
 * V3 API Meta filters interface with proper typing
 */
export interface V3MetaFilters {
  // Location filters
  country?: string;
  city?: string;

  // Feature filters (V3 API uses "0"|"1" strings)
  have_milongas?: '0' | '1';
  have_tickets?: '0' | '1';
  have_food?: '0' | '1';
  have_sleep?: '0' | '1';
  have_registration?: '0' | '1';
  invitation_only?: '0' | '1';
  have_live_music?: '0' | '1';
  have_lessons?: '0' | '1';
  have_show?: '0' | '1';

  // Price filters
  price_min?: string;
  price_max?: string;
  currency?: string;

  // Date filters
  start_date_from?: string;
  start_date_to?: string;
  registration_start_date_from?: string;
  registration_start_date_to?: string;
  end_date_from?: string;
  end_date_to?: string;
}

/**
 * Enhanced parameters for V3 API event operations
 */
export interface V3EventParams extends BaseParams {
  // Category filtering
  category?: EventCategory;

  // Advanced meta filtering
  meta_filters?: V3MetaFilters;

  // Date range filtering (legacy support)
  start_date_from?: string;
  start_date_to?: string;
  registration_start_date_from?: string;
  registration_start_date_to?: string;

  // Sorting options
  orderby?: EventSortOption;
  order?: SortOrder;

  // Feature filtering (legacy boolean support)
  have_milongas?: boolean;
  have_food?: boolean;
  have_sleep?: boolean;
  have_registration?: boolean;
  invitation_only?: boolean;

  // Location filtering
  country?: string;
  city?: string;

  // Embed options for performance
  include_djs?: boolean;
  include_teachers?: boolean;
  include_event_series?: boolean;
  include_taxonomies?: boolean;

  // Meta field selection for performance
  meta_fields?: string;
  essential_only?: boolean;
  with_venue?: boolean;
  with_contact?: boolean;
  with_description?: boolean;
}

/**
 * Pagination response wrapper for V3 API
 */
export interface V3PaginatedResponse<T> {
  data: T[];
  totalCount: number;
  totalPages: number;
  currentPage: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
  perPage: number;
}

/**
 * V3 API Feature Analysis
 */
export interface V3FeatureAnalysis {
  // Available features
  availableFeatures: EventFeature[];
  unavailableFeatures: EventFeature[];

  // Feature counts
  totalFeatures: number;
  availableCount: number;

  // Specific feature checks
  hasAccommodation: boolean;
  hasFoodOptions: boolean;
  hasRegistration: boolean;
  isInvitationOnly: boolean;
  hasEntertainment: boolean;

  // Scoring
  featureScore: number; // 0-1 score based on available features
  accommodationScore: number; // Combined score for sleep + food
}

/**
 * V3 API Location Information
 */
export interface V3LocationInfo {
  city: string;
  country: string;
  venueName: string;
  street: string;
  hasCoordinates: boolean;
  coordinates: { lat: number; lon: number } | null;
  displayLocation: string;
}

/**
 * V3 API Price Information
 */
export interface V3PriceInfo {
  price: string;
  currency: string;
  isFree: boolean;
  hasPricing: boolean;
  displayPrice: string;
}

/**
 * V3 API Registration Information
 */
export interface V3RegistrationInfo {
  isRequired: boolean;
  isInvitationOnly: boolean;
  registrationDate?: string;
  hasRegistrationPeriod: boolean;
  isRegistrationOpen: boolean;
  isRegistrationUpcoming: boolean;
  isRegistrationClosed: boolean;
  registrationStatus: 'open' | 'upcoming' | 'closed' | 'not_required';
  daysUntilRegistration?: number;
  daysUntilRegistrationEnds?: number;
}

/**
 * V3 API Contact Information
 */
export interface V3ContactInfo {
  email: string;
  phone: string;
  website: string;
  facebook: string;
  instagram: string;
  registrationLink: string;
  hasContact: boolean;
  hasSocialMedia: boolean;
  hasRegistrationLink: boolean;
}

/**
 * Event transformation options for V3 API
 */
export interface V3TransformOptions {
  includeAnalysis?: boolean;
  includePricing?: boolean;
  includeLocation?: boolean;
  includeRegistration?: boolean;
  includeContact?: boolean;
  includeFeatureDisplay?: boolean;
}

/**
 * V3 API Service Configuration
 */
export interface V3ServiceConfig {
  endpoint: string;
  defaultParams: Partial<V3EventParams>;
  metaFields: string;
  enableTaxonomies: boolean;
  enableEmbedding: boolean;
  cacheEnabled?: boolean;
  cacheTTL?: number;
}

/**
 * Event search criteria for V3 API
 */
export interface V3EventSearchCriteria {
  query?: string;
  category?: EventCategory;
  country?: string;
  city?: string;
  features?: Partial<Record<EventFeature, boolean>>;
  dateRange?: {
    from: string;
    to: string;
  };
  priceRange?: {
    min?: number;
    max?: number;
    currency?: string;
  };
  registrationWindow?: {
    from?: string;
    to?: string;
  };
  sortBy?: EventSortOption;
  sortOrder?: SortOrder;
}

/**
 * Bulk operation parameters for V3 API
 */
export interface V3BulkOperationParams {
  ids: number[];
  operation: 'update' | 'delete' | 'export';
  params?: Partial<V3EventParams>;
  batchSize?: number;
}

/**
 * V3 API Error Response
 */
export interface V3ApiError {
  code: string;
  message: string;
  data?: {
    status: number;
    details?: Record<string, unknown>;
  };
}

/**
 * V3 API Cache Configuration
 */
export interface V3CacheConfig {
  enabled: boolean;
  ttl: number; // Time to live in seconds
  keyPrefix: string;
  maxSize?: number;
}

/**
 * V3 API Performance Metrics
 */
export interface V3PerformanceMetrics {
  requestCount: number;
  averageResponseTime: number;
  cacheHitRate?: number;
  errorRate: number;
  lastRequestTime: Date;
}
