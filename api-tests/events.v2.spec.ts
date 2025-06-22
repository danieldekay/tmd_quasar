import { describe, it, expect, beforeAll } from 'vitest';
import axios, { type AxiosResponse } from 'axios';
import { API_BASE_URL_V2, DEFAULT_REQUEST_TIMEOUT } from './config';

const EVENTS_ENDPOINT_V2 = `${API_BASE_URL_V2}events`;

describe('API v2: Events Endpoint (/events)', () => {
  let response: AxiosResponse | null = null;
  let errorResponse: any = null;

  beforeAll(async () => {
    try {
      response = await axios.get(EVENTS_ENDPOINT_V2, { timeout: DEFAULT_REQUEST_TIMEOUT });
    } catch (error) {
      errorResponse = error;
      console.warn(`API v2 /events: Could not connect to the API at ${EVENTS_ENDPOINT_V2}. Tests will likely fail or be skipped. Error: ${error.message}`);
    }
  });

  it('should fetch a list of events and return status 200', () => {
    if (errorResponse) {
      expect(errorResponse.message).toBeNull(); // This will fail and show the error
    }
    expect(response).toBeDefined();
    expect(response?.status).toBe(200);
  });

  it('should have HAL _links.self in the response', () => {
    if (!response?.data) throw new Error('No response data from API for HAL _links.self test (v2)');
    expect(response.data._links).toBeDefined();
    expect(response.data._links.self).toBeDefined();
    expect(typeof response.data._links.self.href).toBe('string');
    expect(response.data._links.self.href).toContain(EVENTS_ENDPOINT_V2);
  });

  // Assuming 'events' is the key for the embedded collection. This might need adjustment for v2.
  // It's possible v2 does not use _embedded in the same way or might return a flat array.
  // The docs/api.md mentioned v2 was for "Events Only" and had different sub-routes.
  // For a generic /events call, it might still be HAL.
  const getEmbeddedEventsV2 = (responseData: any): any[] | undefined => {
    // WordPress often returns a flat array for non-post-type endpoints or older versions
    if (Array.isArray(responseData)) return responseData;
    return responseData?._embedded?.events || responseData?._embedded?.['tmd_event'] || responseData?._embedded?.['wp:post_type'];
  }

  it('should have _embedded items or be an array of events', () => {
    if (!response?.data) throw new Error('No response data from API for _embedded items test (v2)');

    const eventData = getEmbeddedEventsV2(response.data);
    expect(eventData).toBeDefined();
    expect(Array.isArray(eventData)).toBe(true);
  });

  it('individual events in the collection should have a self link or an ID', () => {
    if (!response?.data) throw new Error('No response data from API for individual event _links.self test (v2)');
    const eventData = getEmbeddedEventsV2(response.data);

    if (!eventData || eventData.length === 0) {
      console.warn('API v2 /events: No events found to test individual items. Skipping detailed check.');
      return;
    }

    const itemsToTest = eventData.slice(0, Math.min(eventData.length, 3));
    itemsToTest.forEach((item: any, index: number) => {
      if (item._links?.self?.href) { // HAL style
        expect(typeof item._links.self.href, `Event at index ${index} _links.self.href is not a string`).toBe('string');
        expect(item._links.self.href).toContain(`${EVENTS_ENDPOINT_V2}/${item.id}`);
      } else if (item.id && item.link) { // Common non-HAL WordPress structure
         expect(item.id).toBeDefined();
         expect(typeof item.link).toBe('string');
      } else {
        // Fallback, just expect an ID
        expect(item.id, `Event at index ${index} missing id`).toBeDefined();
      }
    });
  });

  it('should contain _links.next if multiple pages exist (or not be present)', () => {
    if (!response?.data || Array.isArray(response.data) || !response.data._links) {
      console.warn('API v2 /events: Skipping HAL _links.next/prev test as response is not a HAL collection or has no _links.');
      return;
    }
    const { next, prev } = response.data._links;
    const totalPages = parseInt(response.headers?.['x-wp-totalpages'] || '0', 10);
    const currentPage = parseInt(response.config?.params?.page || '1', 10);

    if (next) {
      expect(Array.isArray(next)).toBe(true);
      expect(next.length).toBeGreaterThanOrEqual(1);
      expect(next[0].href).toEqual(expect.any(String));
      expect(totalPages > currentPage).toBe(true);
    }
    if (prev) {
      expect(Array.isArray(prev)).toBe(true);
      expect(prev.length).toBeGreaterThanOrEqual(1);
      expect(prev[0].href).toEqual(expect.any(String));
      expect(currentPage > 1).toBe(true);
    }
  });

  // Helper function for property validation (v2 specific)
  const validateEventV2Properties = (item: any, context: string) => {
    expect(item.id, `${context} id`).toEqual(expect.any(Number));
    // status might not be present in v2, or named differently. Let's assume it might be.
    if (item.status) expect(item.status, `${context} status`).toEqual(expect.any(String));
    expect(item.link, `${context} link`).toEqual(expect.any(String));

    // Title: check if object with rendered, fallback to string
    if (item.title && typeof item.title === 'object' && item.title.rendered !== undefined) {
      expect(item.title.rendered, `${context} title.rendered`).toEqual(expect.any(String));
    } else {
      expect(item.title, `${context} title`).toEqual(expect.any(String));
    }

    // Content: check if object with rendered, fallback to string
    if (item.content && typeof item.content === 'object' && item.content.rendered !== undefined) {
      expect(item.content.rendered, `${context} content.rendered`).toEqual(expect.any(String));
    } else if (item.content !== undefined) { // content can be empty string
      expect(item.content, `${context} content`).toEqual(expect.any(String));
    }

    // Meta fields (assuming direct properties for v2)
    if (item.event_date_gmt) expect(item.event_date_gmt, `${context} event_date_gmt`).toEqual(expect.any(String));
    if (item.event_end_date_gmt) expect(item.event_end_date_gmt, `${context} event_end_date_gmt`).toEqual(expect.any(String));
    if (item.city) expect(item.city, `${context} city`).toEqual(expect.any(String));
    if (item.country_code) expect(item.country_code, `${context} country_code`).toEqual(expect.any(String));
    if (item.tmd_event_type_id) expect(item.tmd_event_type_id).toBeInstanceOf(Object); // Number or Array
    if (item.tmd_social_facebook) expect(item.tmd_social_facebook, `${context} tmd_social_facebook`).toEqual(expect.any(String));
  };

  it('embedded events should have key properties with correct types', () => {
    if (!response?.data) throw new Error('No response data from API for embedded event property validation (v2)');
    const eventData = getEmbeddedEventsV2(response.data);

    if (!eventData || eventData.length === 0) {
      console.warn('API v2 /events: No embedded events to validate properties. Skipping.');
      return;
    }
    validateEventV2Properties(eventData[0], 'First embedded event (v2)');
  });

  describe('Fetch Single Event (v2)', () => {
    let singleEventResponse: AxiosResponse | null = null;
    let singleEventError: any = null;
    let firstEventLink: string | null = null; // V2 might use 'link' directly or a HAL link

    beforeAll(async () => {
      if (errorResponse || !response?.data) {
        console.warn('API v2 /events: Skipping single event tests due to collection fetch failure or no data.');
        return;
      }
      const eventData = getEmbeddedEventsV2(response.data);
      if (eventData && eventData.length > 0) {
        const firstEvent = eventData[0];
        // Prefer HAL self link if available, otherwise use 'link' property if it's a full URL
        if (firstEvent._links?.self?.href) {
          firstEventLink = firstEvent._links.self.href;
        } else if (firstEvent.link && (firstEvent.link.startsWith('http://') || firstEvent.link.startsWith('https://'))) {
          firstEventLink = firstEvent.link;
        }

        if (firstEventLink) {
          try {
            singleEventResponse = await axios.get(firstEventLink, { timeout: DEFAULT_REQUEST_TIMEOUT });
          } catch (error) {
            singleEventError = error;
            console.warn(`API v2 /events: Could not fetch single event from ${firstEventLink}. Error: ${error.message}`);
          }
        } else {
          console.warn('API v2 /events: No usable link (HAL self or direct link) found in first collection item to fetch single event.');
        }
      } else {
        console.warn('API v2 /events: No items found in collection to fetch single event.');
      }
    });

    it('should fetch a single event if an item exists and return status 200', () => {
      if (!firstEventLink) {
        console.warn('API v2 /events: Skipped: No single event to fetch.');
        return;
      }
      if (singleEventError) {
        expect(singleEventError.message).toBeNull();
      }
      expect(singleEventResponse).toBeDefined();
      expect(singleEventResponse?.status).toBe(200);
    });

    it('single event response should have HAL _links.self or be a valid entity', () => {
      if (!singleEventResponse?.data) {
        if (!firstEventLink) return;
        throw new Error('No response data for single event HAL _links.self test (v2)');
      }
      // V2 might not be strictly HAL for single items, so check for basic structure
      // V2 might not be strictly HAL for single items. Self link might be just item.link
      if (singleEventResponse.data._links?.self?.[0]?.href) {
        expect(singleEventResponse.data._links.self[0].href).toEqual(expect.any(String));
      } else if (singleEventResponse.data.link) {
         expect(singleEventResponse.data.link).toEqual(expect.any(String));
      } else {
        // If no HAL self and no direct link, at least expect an ID
        expect(singleEventResponse.data.id).toBeDefined();
      }
    });

    it('single event response should have HAL _links.collection if available', () => {
      if (!singleEventResponse?.data) {
        if (!firstEventLink) return;
        throw new Error('No response data for single event HAL _links.collection test (v2)');
      }
      if (singleEventResponse.data._links?.collection?.[0]?.href) {
        expect(singleEventResponse.data._links.collection[0].href).toEqual(expect.stringContaining(EVENTS_ENDPOINT_V2));
      } else {
        console.warn('API v2 /events: Single event response does not have _links.collection. This might be acceptable for v2.');
      }
    });

    it('single event should have key properties with correct types', () => {
      if (!singleEventResponse?.data) {
        if (!firstEventLink) return;
        throw new Error('No response data for single event property validation (v2)');
      }
      validateEventV2Properties(singleEventResponse.data, 'Single fetched event (v2)');
    });

    it('single event response should have valid embedded author if present (v2)', () => {
      if (!singleEventResponse?.data?._embedded?.author) {
        if (!firstEventLink) return;
        console.warn('API v2 /events (single): Skipping author validation as _embedded.author is not present.');
        return;
      }
      const author = singleEventResponse.data._embedded.author[0];
      expect(author).toBeDefined();
      expect(author.id).toEqual(expect.any(Number));
      expect(author.name).toEqual(expect.any(String));
      // V2 author might not have full HAL links
      if (author.link) expect(author.link).toEqual(expect.any(String));
    });

    it('single event response should have valid embedded wp:term if present (v2)', () => {
      if (!singleEventResponse?.data?._embedded?.['wp:term']) {
        if (!firstEventLink) return;
        console.warn('API v2 /events (single): Skipping wp:term validation as _embedded["wp:term"] is not present.');
        return;
      }
      const termGroups: any[][] = singleEventResponse.data._embedded['wp:term'];
      expect(Array.isArray(termGroups)).toBe(true);
      if (termGroups.length === 0) {
        console.warn('API v2 /events (single): wp:term is empty.');
        return;
      }
      termGroups.forEach((termArray: any[], groupIndex: number) => {
        if (termArray.length > 0) {
          const term = termArray[0];
          expect(term, `Term in group ${groupIndex} is undefined`).toBeDefined();
          expect(term.id, `Term id in group ${groupIndex}`).toEqual(expect.any(Number));
          expect(term.name, `Term name in group ${groupIndex}`).toEqual(expect.any(String));
           // ... other term properties like slug, link, taxonomy might be present
        }
      });
    });

    it('single event response should have detailed HAL links if present (v2)', () => {
      if (!singleEventResponse?.data?._links) {
        if (!firstEventLink) return;
        console.warn('API v2 /events (single): No _links object to validate further for single event.');
        return;
      }
      const links = singleEventResponse.data._links;

      if (links.author?.[0]?.href) {
        expect(links.author[0].href).toEqual(expect.any(String));
      }
      if (links['wp:featuredmedia']?.[0]?.href) {
        expect(links['wp:featuredmedia'][0].href).toEqual(expect.any(String));
      }
      // Add more link checks as relevant for v2 if known
    });
  });
});
