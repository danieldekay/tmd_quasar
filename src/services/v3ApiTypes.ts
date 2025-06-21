/**
 * V3 API Enhanced Types
 * Type definitions specifically for V3 HAL-compliant API interactions
 */

import type { BaseParams } from './baseService';
import type { EventCategory, EventFeature, EventSortOption, SortOrder } from './eventConstants';

/**
 * Base V3 Entity interface for all V3 API entities
 */
export interface BaseV3Entity {
  id: number;
  title: string;
  slug: string;
  date: string;
  date_gmt: string;
  modified: string;
  modified_gmt: string;
  status: string;
  link: string;
  city?: string;
  country?: string;
  _links?: Record<string, unknown>;
}

/**
 * Base V3 Parameters interface extending BaseParams
 */
export interface BaseV3Params extends BaseParams {
  meta_fields?: string;
  _embed?: boolean;
}

/**
 * V3 API Event interface
 */
export interface EventV3 extends BaseV3Entity {
  start_date: string;
  end_date: string;
  registration_start_date: string;
  edition: string;
  event_name?: string;
  event_category?: string;
  featured_image?: string;
  // Add other event-specific fields as needed
}

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

// Teacher V3 API Types
export interface TeacherV3 extends BaseV3Entity {
  // Core fields
  first_name?: string;
  last_name?: string;
  role?: 'leader' | 'follower' | 'both' | 'double-role';
  gender?: 'man' | 'woman' | 'other';

  // Contact & social
  website?: string;
  email?: string;
  facebook_profile?: string;
  instagram?: string;

  // Bio & experience
  bio_short?: string;
  teaching_since?: string;
  dancing_since?: string;
  specializations?: string[];

  // Embedded relationships
  _embedded?: {
    events?: EventV3[];
    couples?: Array<{
      id: number;
      title: string;
      slug: string;
      link: string;
    }>;
    author?: unknown[];
  };
}

export interface TeacherParams extends BaseV3Params {
  role?: 'leader' | 'follower' | 'both' | 'double-role';
  gender?: 'man' | 'woman' | 'other';
  country?: string;
  city?: string;
  teaching_since?: string;
  dancing_since?: string;
  specializations?: string[];
}

// DJ V3 API Types
export interface DJV3 extends BaseV3Entity {
  // Core DJ fields
  abstract?: string;
  gender?: string;
  tmd_dj_about_the_dj?: string;
  tmd_dj_name?: string;
  tmd_dj_city?: string;
  tmd_dj_country?: string;
  tmd_dj_e_mail?: string;
  tmd_dj_webpage?: string;

  // Activity fields
  tmd_dj_activity_encuentros?: string;
  tmd_dj_activity_encuentros_since?: string;
  tmd_dj_activity_festivals?: string;
  tmd_dj_activity_festivals_since?: string;
  tmd_dj_activity_marathons?: string;
  tmd_dj_activity_marathons_since?: string;
  tmd_dj_activity_milongas?: string;
  tmd_dj_activity_milongas_since?: string;
  tmd_dj_activity_milongas_travel?: string;
  tmd_dj_activity_milongas_travel_since?: string;

  // Social media
  tmd_dj_link_to_facebook?: string;
  tmd_dj_link_to_facebook_page?: string;

  // Embedded relationships
  _embedded?: {
    events?: EventV3[];
    author?: unknown[];
  };
}

export interface DJParams extends BaseV3Params {
  country?: string;
  city?: string;
  activity_type?: 'encuentros' | 'festivals' | 'marathons' | 'milongas' | 'milongas_travel';
  has_events?: boolean;
}

// Couple V3 API Types
export interface CoupleV3 extends BaseV3Entity {
  // Core couple fields
  __relate_leader?: string;
  __relate_follower?: string;
  partnership_started?: string;
  partnership_style?: string;

  // Bio & teaching
  bio_couple?: string;
  teaching_philosophy?: string;
  specializations_couple?: string[];
  workshops_offered?: string;
  achievements?: string;

  // Contact & social
  website?: string;
  facebook_page?: string;

  // Experience
  started_dancing?: string;
  couples_to_events_to?: string[];

  // Embedded relationships
  _embedded?: {
    events?: EventV3[];
    teachers?: Array<{
      id: number;
      title: string;
      slug: string;
      link: string;
      href: string;
      city?: string;
      country?: string;
      role: 'leader' | 'follower' | 'both' | 'double-role';
    }>;
    leader?: TeacherV3[];
    follower?: TeacherV3[];
    author?: unknown[];
  };

  // Links to related entities
  _links?: {
    self?: Array<{ href: string }>;
    collection?: Array<{ href: string }>;
    author?: Array<{ href: string; embeddable: boolean }>;
    leader?: {
      href: string;
      title: string;
      type: string;
      role: string;
      embeddable: boolean;
    };
    follower?: {
      href: string;
      title: string;
      type: string;
      role: string;
      embeddable: boolean;
    };
    events?: Array<{
      href: string;
      title: string;
      type: string;
      embeddable: boolean;
    }>;
  };
}

export interface CoupleParams extends BaseV3Params {
  leader_id?: number;
  follower_id?: number;
  country?: string;
  city?: string;
  partnership_style?: string;
  specializations?: string[];
}

// Event Series V3 API Types
export interface EventSeriesV3 extends BaseV3Entity {
  // Core event series fields
  start_date?: string;
  registration_start_date?: string;
  description?: string;
  logo?: string;

  // Embedded relationships
  _embedded?: {
    events?: EventV3[];
    author?: Array<{
      id: number;
      name: string;
      url?: string;
      description?: string;
      avatar_urls: {
        '24': string;
        '48': string;
        '96': string;
      };
    }>;
    'wp:featuredmedia'?: Array<{
      id: number;
      source_url: string;
      alt_text?: string;
      title?: {
        rendered: string;
      };
    }>;
    'wp:term'?: Array<
      Array<{
        id: number;
        name: string;
        slug: string;
        taxonomy: string;
      }>
    >;
  };
}

export interface EventSeriesParams extends BaseV3Params {
  country?: string;
  city?: string;
  has_upcoming_events?: boolean;
  start_date_from?: string;
  start_date_to?: string;
}
