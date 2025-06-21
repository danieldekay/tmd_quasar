/**
 * V3 Meta Filter Builder
 * Specialized utility for building V3 API meta_filters with type safety
 */

import type { V3MetaFilters, V3EventParams } from './v3ApiTypes';
import { EVENT_FEATURES } from './eventConstants';

/**
 * Meta filter builder class for V3 API
 */
export class V3MetaFilterBuilder {
  private filters: V3MetaFilters = {};

  /**
   * Add location filters
   */
  location(country?: string, city?: string): this {
    if (country) this.filters.country = country;
    if (city) this.filters.city = city;
    return this;
  }

  /**
   * Add feature filters with type safety
   */
  features(features: Partial<Record<keyof typeof EVENT_FEATURES, boolean>>): this {
    Object.entries(features).forEach(([key, value]) => {
      if (value !== undefined) {
        const featureKey = EVENT_FEATURES[key as keyof typeof EVENT_FEATURES];
        if (featureKey) {
          this.setFeatureFilter(featureKey, value);
        }
      }
    });
    return this;
  }

  /**
   * Add individual feature filter
   */
  feature(featureKey: keyof typeof EVENT_FEATURES, enabled = true): this {
    const key = EVENT_FEATURES[featureKey];
    if (key) {
      this.setFeatureFilter(key, enabled);
    }
    return this;
  }

  /**
   * Private helper to set feature filters safely
   */
  private setFeatureFilter(key: string, enabled: boolean): void {
    const validFeatureKeys = [
      'have_milongas',
      'have_tickets',
      'have_food',
      'have_sleep',
      'have_registration',
      'invitation_only',
      'have_live_music',
      'have_lessons',
      'have_show',
    ];

    if (validFeatureKeys.includes(key)) {
      (this.filters as Record<string, '0' | '1'>)[key] = enabled ? '1' : '0';
    }
  }

  /**
   * Add date range filters
   */
  dateRange(from?: string, to?: string): this {
    if (from) this.filters.start_date_from = from;
    if (to) this.filters.start_date_to = to;
    return this;
  }

  /**
   * Add registration date filters
   */
  registrationDateRange(from?: string, to?: string): this {
    if (from) this.filters.registration_start_date_from = from;
    if (to) this.filters.registration_start_date_to = to;
    return this;
  }

  /**
   * Add price range filters
   */
  priceRange(min?: string | number, max?: string | number, currency?: string): this {
    if (min !== undefined) this.filters.price_min = String(min);
    if (max !== undefined) this.filters.price_max = String(max);
    if (currency) this.filters.currency = currency;
    return this;
  }

  /**
   * Add milongas filter
   */
  withMilongas(enabled = true): this {
    return this.feature('HAVE_MILONGAS', enabled);
  }

  /**
   * Add food filter
   */
  withFood(enabled = true): this {
    return this.feature('HAVE_FOOD', enabled);
  }

  /**
   * Add accommodation filter
   */
  withAccommodation(enabled = true): this {
    return this.feature('HAVE_SLEEP', enabled);
  }

  /**
   * Add registration required filter
   */
  requiresRegistration(enabled = true): this {
    return this.feature('HAVE_REGISTRATION', enabled);
  }

  /**
   * Add invitation only filter
   */
  invitationOnly(enabled = true): this {
    return this.feature('INVITATION_ONLY', enabled);
  }

  /**
   * Add live music filter
   */
  withLiveMusic(enabled = true): this {
    return this.feature('HAVE_LIVE_MUSIC', enabled);
  }

  /**
   * Reset all filters
   */
  reset(): this {
    this.filters = {};
    return this;
  }

  /**
   * Build the final filters object
   */
  build(): V3MetaFilters | undefined {
    return Object.keys(this.filters).length > 0 ? { ...this.filters } : undefined;
  }

  /**
   * Get filters as JSON string for API
   */
  toJSON(): string | undefined {
    const filters = this.build();
    return filters ? JSON.stringify(filters) : undefined;
  }

  /**
   * Check if any filters are set
   */
  hasFilters(): boolean {
    return Object.keys(this.filters).length > 0;
  }

  /**
   * Get filter count
   */
  getFilterCount(): number {
    return Object.keys(this.filters).length;
  }

  /**
   * Clone the current builder
   */
  clone(): V3MetaFilterBuilder {
    const cloned = new V3MetaFilterBuilder();
    cloned.filters = { ...this.filters };
    return cloned;
  }
}

/**
 * Build meta filters from V3EventParams
 */
export const buildMetaFiltersFromParams = (params: V3EventParams): V3MetaFilters | undefined => {
  const builder = new V3MetaFilterBuilder();

  // Direct meta_filters from params
  if (params.meta_filters) {
    Object.assign(builder['filters'], params.meta_filters);
  }

  // Legacy boolean filters converted to V3 API format
  if (params.have_milongas !== undefined) {
    builder.feature('HAVE_MILONGAS', params.have_milongas);
  }
  if (params.have_food !== undefined) {
    builder.feature('HAVE_FOOD', params.have_food);
  }
  if (params.have_sleep !== undefined) {
    builder.feature('HAVE_SLEEP', params.have_sleep);
  }
  if (params.have_registration !== undefined) {
    builder.feature('HAVE_REGISTRATION', params.have_registration);
  }
  if (params.invitation_only !== undefined) {
    builder.feature('INVITATION_ONLY', params.invitation_only);
  }

  // Location filters
  builder.location(params.country, params.city);

  // Date range filters
  builder.dateRange(params.start_date_from, params.start_date_to);
  builder.registrationDateRange(
    params.registration_start_date_from,
    params.registration_start_date_to,
  );

  return builder.build();
};

/**
 * Create a new meta filter builder
 */
export const createMetaFilterBuilder = (): V3MetaFilterBuilder => {
  return new V3MetaFilterBuilder();
};

/**
 * Common filter presets
 */
export const META_FILTER_PRESETS = {
  /**
   * Events with full accommodation (food + sleep)
   */
  FULL_ACCOMMODATION: createMetaFilterBuilder().withFood().withAccommodation().build(),

  /**
   * Events with milongas only
   */
  MILONGAS_ONLY: createMetaFilterBuilder().withMilongas().build(),

  /**
   * Invitation-only events
   */
  INVITATION_ONLY: createMetaFilterBuilder().invitationOnly().build(),

  /**
   * Events with live music
   */
  LIVE_MUSIC: createMetaFilterBuilder().withLiveMusic().build(),

  /**
   * Events requiring registration
   */
  REGISTRATION_REQUIRED: createMetaFilterBuilder().requiresRegistration().build(),

  /**
   * Free events
   */
  FREE_EVENTS: createMetaFilterBuilder().priceRange(0, 0).build(),

  /**
   * Upcoming events (from today)
   */
  UPCOMING: (() => {
    const today = new Date().toISOString().split('T')[0];
    return createMetaFilterBuilder().dateRange(today).build();
  })(),

  /**
   * This month's events
   */
  THIS_MONTH: (() => {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0)
      .toISOString()
      .split('T')[0];
    return createMetaFilterBuilder().dateRange(startOfMonth, endOfMonth).build();
  })(),
} as const;
