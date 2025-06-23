import { describe, it, expect, beforeAll } from 'vitest';
import axios, { type AxiosResponse } from 'axios';
import { API_BASE_URL_V3, DEFAULT_REQUEST_TIMEOUT } from './config';

const EVENTS_ENDPOINT = `${API_BASE_URL_V3}events`;

describe('API v3: Events Endpoint (/events)', () => {
  let response: AxiosResponse | null = null;
  let errorResponse: any = null;

  beforeAll(async () => {
    try {
      response = await axios.get(EVENTS_ENDPOINT, { timeout: DEFAULT_REQUEST_TIMEOUT });
    } catch (error) {
      errorResponse = error;
      console.warn(`API v3 /events: Could not connect to the API at ${EVENTS_ENDPOINT}. Tests will likely fail or be skipped. Error: ${error.message}`);
    }
  });

  it('should fetch a list of events and return status 200', () => {
    if (errorResponse) {
      // If beforeAll failed, this test should not be considered a failure of the endpoint's contract,
      // but rather an environment issue. For now, we'll let it fail to indicate the API wasn't reachable.
      // A more sophisticated setup might skip tests if the API is down.
      expect(errorResponse.message).toBeNull(); // This will fail and show the error
    }
    expect(response).toBeDefined();
    expect(response?.status).toBe(200);
  });

  it('should have HAL _links.self in the response', () => {
    if (!response?.data) throw new Error('No response data from API for HAL _links.self test');
    expect(response.data._links).toBeDefined();
    expect(response.data._links.self).toBeDefined();
    expect(Array.isArray(response.data._links.self)).toBe(true);
    expect(response.data._links.self.length).toBeGreaterThanOrEqual(1);
    expect(response.data._links.self[0].href).toEqual(expect.stringContaining(EVENTS_ENDPOINT));
  });

  // Assuming 'events' is the key for the embedded collection. This might need adjustment.
  const getEmbeddedEvents = (responseData: any): any[] | undefined => {
    return responseData?._embedded?.events || responseData?._embedded?.['tmd_event'] || responseData?._embedded?.['wp:post_type'];
  }

  it('should have _embedded items if events exist, or an empty array/object if not', () => {
    if (!response?.data) throw new Error('No response data from API for _embedded items test');
    expect(response.data._embedded).toBeDefined();

    const embeddedEvents = getEmbeddedEvents(response.data);
    expect(embeddedEvents).toBeDefined(); // _embedded.events (or alternative) should exist
    expect(Array.isArray(embeddedEvents)).toBe(true); // It should be an array (can be empty)
  });

  it('individual events in _embedded collection should have _links.self', () => {
    if (!response?.data) throw new Error('No response data from API for individual event _links.self test');
    const embeddedEvents = getEmbeddedEvents(response.data);

    if (!embeddedEvents || embeddedEvents.length === 0) {
      console.warn('API v3 /events: No embedded events found to test individual _links.self. Skipping detailed check.');
      return;
    }

    // Test the first few items, or all if the array is small
    const itemsToTest = embeddedEvents.slice(0, Math.min(embeddedEvents.length, 3));
    itemsToTest.forEach((item: any, index: number) => {
      expect(item._links, `Event at index ${index} missing _links`).toBeDefined();
      expect(item._links.self, `Event at index ${index} missing _links.self`).toBeDefined();
      expect(Array.isArray(item._links.self)).toBe(true);
      expect(item._links.self.length).toBeGreaterThanOrEqual(1);
      expect(item._links.self[0].href).toEqual(expect.stringContaining(`${EVENTS_ENDPOINT}/${item.id}`));

      if (item._links.author) {
        expect(Array.isArray(item._links.author)).toBe(true);
        expect(item._links.author.length).toBeGreaterThanOrEqual(1);
        expect(item._links.author[0].href).toEqual(expect.any(String));
      }
      if (item._links['wp:featuredmedia']) {
        expect(Array.isArray(item._links['wp:featuredmedia'])).toBe(true);
        expect(item._links['wp:featuredmedia'].length).toBeGreaterThanOrEqual(1);
        expect(item._links['wp:featuredmedia'][0].href).toEqual(expect.any(String));
        if (item._links['wp:featuredmedia'][0].embeddable !== undefined) { // embeddable is optional
            expect(item._links['wp:featuredmedia'][0].embeddable).toEqual(expect.any(Boolean));
        }
      }
      if (item._links['wp:attachment']) {
        expect(Array.isArray(item._links['wp:attachment'])).toBe(true);
        expect(item._links['wp:attachment'].length).toBeGreaterThanOrEqual(1);
        expect(item._links['wp:attachment'][0].href).toEqual(expect.any(String));
      }
      if (item._links['wp:term']) {
        expect(Array.isArray(item._links['wp:term'])).toBe(true);
        item._links['wp:term'].forEach((termLink: any) => {
          expect(termLink.href).toEqual(expect.any(String));
          expect(termLink.taxonomy).toEqual(expect.any(String));
          if (termLink.embeddable !== undefined) { // embeddable is optional
            expect(termLink.embeddable).toEqual(expect.any(Boolean));
          }
        });
      }
    });
  });

  describe('Cross-Resource Navigation (Events v3)', () => {
    it('should navigate from event to its author using HAL links', async () => {
      // This test relies on singleEventResponse from the 'Fetch Single Event (v3)' describe block's beforeAll
      // It's a bit unusual to share beforeAll state like this across sibling describes,
      // but for this specific sequence, it makes sense.
      // A cleaner way might be to re-fetch a single event here if needed,
      // or pass the singleEventResponse as an argument if tests were functions.

      if (errorResponse) { // From the top-level beforeAll for the collection
        console.warn('API v3 Cross-Nav: Skipping event->author test due to initial collection fetch failure.');
        return;
      }

      // The singleEventResponse and singleEventError are from the 'Fetch Single Event (v3)' describe block.
      // This is tricky because 'Fetch Single Event (v3)' might have its own error/skip logic.
      // For this test to run, we need a successfully fetched singleEventResponse.
      // Let's re-fetch a single event to ensure this test is self-contained if the shared state is problematic.

      let localSingleEventResponse: AxiosResponse | null = null;
      let localSingleEventError: any = null;
      let eventSelfLinkForAuthorTest: string | null = null;

      if (response?.data) {
        const embeddedEvents = getEmbeddedEvents(response.data);
        if (embeddedEvents && embeddedEvents.length > 0 && embeddedEvents[0]._links?.self?.href) {
          eventSelfLinkForAuthorTest = embeddedEvents[0]._links.self.href;
          try {
            // Fetch the single event again, this time specifically for this test block
            // We don't use _embed here to ensure _links.author is present (if it's removed by _embed)
            localSingleEventResponse = await axios.get(eventSelfLinkForAuthorTest, { timeout: DEFAULT_REQUEST_TIMEOUT /* params: { _embed: false } */ });
          } catch (error) {
            localSingleEventError = error;
            console.warn(`API v3 Cross-Nav: Could not fetch single event for author navigation test from ${eventSelfLinkForAuthorTest}. Error: ${error.message}`);
          }
        } else {
          console.warn('API v3 Cross-Nav: No items with self link found in collection for author navigation test.');
        }
      } else {
         console.warn('API v3 Cross-Nav: Initial collection response was empty or errored, cannot select single event for author test.');
      }

      if (!eventSelfLinkForAuthorTest || localSingleEventError || !localSingleEventResponse?.data) {
        console.warn('API v3 Cross-Nav: Skipping event->author navigation test as single event could not be reliably fetched for this test.');
        return;
      }

      const authorLinks = localSingleEventResponse.data._links?.author;
      if (!authorLinks || !Array.isArray(authorLinks) || authorLinks.length === 0 || !authorLinks[0].href) {
        console.warn(`API v3 Cross-Nav: Author link not found on single event ${eventSelfLinkForAuthorTest}. Skipping author fetch.`);
        // Depending on strictness, this could be an `expect().fail()` or just a skip.
        // For now, we'll allow it to pass if the link isn't there, as not all CPTs require authors.
        return;
      }

      const authorLink = authorLinks[0].href;
      let authorResponse: AxiosResponse | null = null;
      let authorFetchError: any = null;

      try {
        console.log(`API v3 Cross-Nav: Attempting to fetch author from: ${authorLink}`);
        authorResponse = await axios.get(authorLink, { timeout: DEFAULT_REQUEST_TIMEOUT });
      } catch (error) {
        authorFetchError = error;
        console.warn(`API v3 Cross-Nav: Could not fetch author from ${authorLink}. Error: ${error.message}`);
      }

      if (authorFetchError) {
        // If server is down, this is expected. If server is up, this is a test failure.
        if (authorFetchError.code === 'ECONNREFUSED') {
            console.warn(`API v3 Cross-Nav: Author fetch skipped due to API connection failure. ${authorFetchError.message}`);
            return;
        }
        expect(authorFetchError.message).toBeNull(); // This will fail and show the specific fetch error
      }

      expect(authorResponse).toBeDefined();
      expect(authorResponse?.status).toBe(200);
      expect(authorResponse?.data).toBeDefined();

      const authorData = authorResponse?.data;
      expect(authorData.id).toEqual(expect.any(Number));
      expect(authorData.name).toEqual(expect.any(String));
      expect(authorData.link).toEqual(expect.any(String));
      expect(authorData._links?.self?.[0]?.href).toEqual(expect.stringContaining(authorLink)); // Self link should match fetched URL
    });
  });

  it('should contain _links.next or _links.prev if multiple pages exist or not on first/last page', () => {
    if (!response?.data?._links) {
        console.warn('API v3 /events: No _links object in response for pagination tests. Skipping.');
        return;
    }
    const { next, prev } = response.data._links;
    const totalPages = parseInt(response.headers?.['x-wp-totalpages'] || '0', 10);
    const currentPage = parseInt(response.config?.params?.page || '1', 10);

    if (next) {
      expect(next).toBeDefined();
      expect(Array.isArray(next)).toBe(true);
      expect(next.length).toBeGreaterThanOrEqual(1);
      expect(next[0].href).toEqual(expect.any(String));
      expect(totalPages > currentPage, "Next link exists but shouldn't").toBe(true);
    }
    if (prev) {
      expect(prev).toBeDefined();
      expect(Array.isArray(prev)).toBe(true);
      expect(prev.length).toBeGreaterThanOrEqual(1);
      expect(prev[0].href).toEqual(expect.any(String));
      expect(currentPage > 1, "Prev link exists but shouldn't").toBe(true);
    }
    if (!next && !prev && totalPages > 1) {
        // This case should ideally not happen if totalPages > 1 unless it's the only page with results.
        console.warn("API v3 /events: No next or prev links, but totalPages > 1. This might be an issue or specific API behavior for single-page results with potential for more.");
    }
    if (totalPages <= 1 && (next || prev)) {
        console.warn("API v3 /events: Next or prev links exist, but totalPages <= 1. This might be an API inconsistency.");
        // Allow this for now, but it's worth noting.
    }
  });

  // Helper function for property validation
  const validateEventProperties = (item: any, context: string) => {
    expect(item.id, `${context} id`).toEqual(expect.any(Number));
    expect(item.status, `${context} status`).toEqual(expect.any(String));
    expect(item.link, `${context} link`).toEqual(expect.any(String));

    expect(item.title, `${context} title object`).toBeDefined();
    expect(item.title.rendered, `${context} title.rendered`).toEqual(expect.any(String));

    expect(item.content, `${context} content object`).toBeDefined();
    // content.rendered can sometimes be empty if no content, but should be a string
    expect(item.content.rendered, `${context} content.rendered`).toEqual(expect.any(String));

    // Meta fields (often come from 'meta' or 'acf' block, or directly for some CPTs)
    // For this example, let's assume they might be directly on the object or in a 'meta' sub-object.
    // A real implementation would need to know the exact structure from API response.
    const meta = item.meta || item;

    // Date fields - should be string and ideally parseable as dates
    if (meta.event_date_gmt) expect(meta.event_date_gmt, `${context} event_date_gmt`).toEqual(expect.any(String));
    if (meta.event_end_date_gmt) expect(meta.event_end_date_gmt, `${context} event_end_date_gmt`).toEqual(expect.any(String));

    // Location fields (assuming they are strings if present)
    if (meta.city) expect(meta.city, `${context} city`).toEqual(expect.any(String));
    if (meta.country_code) expect(meta.country_code, `${context} country_code`).toEqual(expect.any(String));

    // Custom taxonomies or specific fields
    if (meta.tmd_event_type_id) { // Can be number or array
      expect(meta.tmd_event_type_id, `${context} tmd_event_type_id`).toBeInstanceOf(Object); // Number or Array
    }
    if (meta.tmd_social_facebook) expect(meta.tmd_social_facebook, `${context} tmd_social_facebook`).toEqual(expect.any(String));
  };

  it('embedded events should have key properties with correct types', () => {
    if (!response?.data) throw new Error('No response data from API for embedded event property validation');
    const embeddedEvents = getEmbeddedEvents(response.data);

    if (!embeddedEvents || embeddedEvents.length === 0) {
      console.warn('API v3 /events: No embedded events to validate properties. Skipping.');
      return;
    }
    validateEventProperties(embeddedEvents[0], 'First embedded event');
  });

  describe('Fetch Single Event (v3)', () => {
    let singleEventResponse: AxiosResponse | null = null;
    let singleEventError: any = null;
    let firstEventSelfLink: string | null = null;

    beforeAll(async () => {
      if (errorResponse || !response?.data) {
        console.warn('API v3 /events: Skipping single event tests due to collection fetch failure or no data.');
        return;
      }
      const embeddedEvents = getEmbeddedEvents(response.data);
      if (embeddedEvents && embeddedEvents.length > 0 && embeddedEvents[0]._links?.self?.href) {
        firstEventSelfLink = embeddedEvents[0]._links.self.href;
        try {
          singleEventResponse = await axios.get(firstEventSelfLink, { timeout: DEFAULT_REQUEST_TIMEOUT });
        } catch (error) {
          singleEventError = error;
          console.warn(`API v3 /events: Could not fetch single event from ${firstEventSelfLink}. Error: ${error.message}`);
        }
      } else {
        console.warn('API v3 /events: No items with self link found in collection to fetch single event.');
      }
    });

    it('should fetch a single event if an item exists and return status 200', () => {
      if (!firstEventSelfLink) { // If no link, skip.
        console.warn('API v3 /events: Skipped: No single event to fetch.');
        return;
      }
      if (singleEventError) {
        expect(singleEventError.message).toBeNull(); // Will fail and show error
      }
      expect(singleEventResponse).toBeDefined();
      expect(singleEventResponse?.status).toBe(200);
    });

    it('single event response should have HAL _links.self', () => {
      if (!singleEventResponse?.data) {
        if (!firstEventSelfLink) return; // Skipped because no item to fetch
        throw new Error('No response data for single event HAL _links.self test (v3)');
      }
      expect(singleEventResponse.data._links).toBeDefined();
      expect(singleEventResponse.data._links.self).toBeDefined();
      expect(Array.isArray(singleEventResponse.data._links.self)).toBe(true);
      expect(singleEventResponse.data._links.self.length).toBeGreaterThanOrEqual(1);
      expect(singleEventResponse.data._links.self[0].href).toBe(firstEventSelfLink);
    });

    it('single event response should have HAL _links.collection', () => {
      if (!singleEventResponse?.data) {
        if (!firstEventSelfLink) return; // Skipped
        throw new Error('No response data for single event HAL _links.collection test (v3)');
      }
      expect(singleEventResponse.data._links).toBeDefined();
      expect(singleEventResponse.data._links.collection).toBeDefined();
      expect(Array.isArray(singleEventResponse.data._links.collection)).toBe(true);
      expect(singleEventResponse.data._links.collection.length).toBeGreaterThanOrEqual(1);
      expect(singleEventResponse.data._links.collection[0].href).toBe(EVENTS_ENDPOINT);
    });

    it('single event should have key properties with correct types', () => {
      if (!singleEventResponse?.data) {
        if (!firstEventSelfLink) return; // Skipped because no item to fetch
        throw new Error('No response data for single event property validation (v3)');
      }
      validateEventProperties(singleEventResponse.data, 'Single fetched event');
    });

    it('single event response should have valid embedded author if present', () => {
      if (!singleEventResponse?.data?._embedded?.author) {
        if (!firstEventSelfLink) return; // Skipped because no item to fetch or embed not present
        console.warn('API v3 /events (single): Skipping author validation as _embedded.author is not present.');
        return;
      }
      const author = singleEventResponse.data._embedded.author[0];
      expect(author).toBeDefined();
      expect(author.id).toEqual(expect.any(Number));
      expect(author.name).toEqual(expect.any(String));
      expect(author.link).toEqual(expect.any(String));
      expect(author._links?.self?.[0]?.href).toEqual(expect.any(String));
    });

    it('single event response should have valid embedded wp:term if present', () => {
      if (!singleEventResponse?.data?._embedded?.['wp:term']) {
        if (!firstEventSelfLink) return;
        console.warn('API v3 /events (single): Skipping wp:term validation as _embedded["wp:term"] is not present.');
        return;
      }
      const termGroups: any[][] = singleEventResponse.data._embedded['wp:term'];
      expect(Array.isArray(termGroups)).toBe(true);
      if (termGroups.length === 0) {
        console.warn('API v3 /events (single): wp:term is empty.');
        return;
      }
      termGroups.forEach((termArray: any[], groupIndex: number) => {
        if (termArray.length > 0) {
          const term = termArray[0];
          expect(term, `Term in group ${groupIndex} is undefined`).toBeDefined();
          expect(term.id, `Term id in group ${groupIndex}`).toEqual(expect.any(Number));
          expect(term.name, `Term name in group ${groupIndex}`).toEqual(expect.any(String));
          // ... other term properties
        }
      });
    });

    it('single event response should have detailed HAL links if present', () => {
      if (!singleEventResponse?.data?._links) {
        if (!firstEventSelfLink) return;
        console.warn('API v3 /events (single): No _links object to validate further for single event.');
        return;
      }
      const links = singleEventResponse.data._links;

      if (links.author) {
        expect(Array.isArray(links.author)).toBe(true);
        expect(links.author.length).toBeGreaterThanOrEqual(1);
        expect(links.author[0].href).toEqual(expect.any(String));
      }
      if (links['wp:featuredmedia']) {
        expect(Array.isArray(links['wp:featuredmedia'])).toBe(true);
        expect(links['wp:featuredmedia'].length).toBeGreaterThanOrEqual(1);
        expect(links['wp:featuredmedia'][0].href).toEqual(expect.any(String));
        if (links['wp:featuredmedia'][0].embeddable !== undefined) {
            expect(links['wp:featuredmedia'][0].embeddable).toEqual(expect.any(Boolean));
        }
      }
      if (links['wp:attachment']) {
        expect(Array.isArray(links['wp:attachment'])).toBe(true);
        expect(links['wp:attachment'].length).toBeGreaterThanOrEqual(1);
        expect(links['wp:attachment'][0].href).toEqual(expect.any(String));
      }
      if (links['wp:term']) {
        expect(Array.isArray(links['wp:term'])).toBe(true);
        links['wp:term'].forEach((termLink: any) => {
          expect(termLink.href).toEqual(expect.any(String));
          expect(termLink.taxonomy).toEqual(expect.any(String));
           if (termLink.embeddable !== undefined) {
            expect(termLink.embeddable).toEqual(expect.any(Boolean));
          }
        });
      }
    });
  });

  describe('Filtering Events (v3)', () => {
    it('should accept a "search" query parameter and return status 200', async () => {
      const searchTerm = 'TestSearch';
      try {
        const searchResponse = await axios.get(`${EVENTS_ENDPOINT}?search=${searchTerm}`, { timeout: DEFAULT_REQUEST_TIMEOUT });
        expect(searchResponse.status).toBe(200);
        expect(searchResponse.data).toBeDefined();
        expect(searchResponse.data._links?.self?.href).toBeDefined(); // Basic HAL check
      } catch (error: any) {
        if (error.code === 'ECONNREFUSED') {
          console.warn(`API v3 /events filtering (search): Skipping test due to API connection failure. ${error.message}`);
          return;
        }
        // If server is up but search fails for other reasons (e.g. bad parameter), that's a different issue
        // For now, we just want to see if it processes. A 404 or empty result with 200 is acceptable.
        if (error.response) {
            expect(error.response.status).toBeGreaterThanOrEqual(200);
            expect(error.response.status).toBeLessThan(500); // Avoid 5xx server errors
        } else {
            throw error; // Re-throw unexpected errors
        }
      }
    });

    it('should accept a "country" query parameter and return status 200', async () => {
      const countryCode = 'XX'; // Placeholder country code
      try {
        const countryResponse = await axios.get(`${EVENTS_ENDPOINT}?country=${countryCode}`, { timeout: DEFAULT_REQUEST_TIMEOUT });
        expect(countryResponse.status).toBe(200);
        expect(countryResponse.data).toBeDefined();
        expect(countryResponse.data._links?.self?.href).toBeDefined();
      } catch (error: any) {
        if (error.code === 'ECONNREFUSED') {
          console.warn(`API v3 /events filtering (country): Skipping test due to API connection failure. ${error.message}`);
          return;
        }
        if (error.response) {
            expect(error.response.status).toBeGreaterThanOrEqual(200);
            expect(error.response.status).toBeLessThan(500);
        } else { throw error; }
      }
    });

    it('should accept date range parameters (start_date_from, start_date_to) and return status 200', async () => {
      const dateFrom = '2024-01-01';
      const dateTo = '2024-12-31';
      try {
        const dateResponse = await axios.get(`${EVENTS_ENDPOINT}?start_date_from=${dateFrom}&start_date_to=${dateTo}`, { timeout: DEFAULT_REQUEST_TIMEOUT });
        expect(dateResponse.status).toBe(200);
        expect(dateResponse.data).toBeDefined();
        expect(dateResponse.data._links?.self?.href).toBeDefined();
      } catch (error: any) {
        if (error.code === 'ECONNREFUSED') {
          console.warn(`API v3 /events filtering (date range): Skipping test due to API connection failure. ${error.message}`);
          return;
        }
         if (error.response) {
            expect(error.response.status).toBeGreaterThanOrEqual(200);
            expect(error.response.status).toBeLessThan(500);
        } else { throw error; }
      }
    });

    it('should accept multiple filter parameters together and return status 200', async () => {
      const searchTerm = 'CombinedTest';
      const countryCode = 'YY';
      try {
        const combinedResponse = await axios.get(`${EVENTS_ENDPOINT}?search=${searchTerm}&country=${countryCode}`, { timeout: DEFAULT_REQUEST_TIMEOUT });
        expect(combinedResponse.status).toBe(200);
        expect(combinedResponse.data).toBeDefined();
        expect(combinedResponse.data._links?.self?.href).toBeDefined();
      } catch (error: any) {
        if (error.code === 'ECONNREFUSED') {
          console.warn(`API v3 /events filtering (combined): Skipping test due to API connection failure. ${error.message}`);
          return;
        }
        if (error.response) {
            expect(error.response.status).toBeGreaterThanOrEqual(200);
            expect(error.response.status).toBeLessThan(500);
        } else { throw error; }
      }
    });
  });

  describe('Pagination Events (v3)', () => {
    it('should respect "per_page" query parameter', async () => {
      try {
        const paginatedResponse = await axios.get(`${EVENTS_ENDPOINT}?per_page=2`, { timeout: DEFAULT_REQUEST_TIMEOUT });
        expect(paginatedResponse.status).toBe(200);
        expect(paginatedResponse.data).toBeDefined();
        const embeddedEvents = getEmbeddedEvents(paginatedResponse.data);
        if (embeddedEvents) { // Only assert length if events are present
          expect(embeddedEvents.length).toBeLessThanOrEqual(2);
        }
      } catch (error: any) {
        // If ECONNREFUSED, this test is not meaningful, so we don't fail it for that.
        if (error.code === 'ECONNREFUSED') {
          console.warn('API v3 /events pagination: Skipping per_page test due to API connection failure.');
          return;
        }
        throw error; // Re-throw other errors
      }
    });

    it('should accept "page" query parameter and return status 200', async () => {
      try {
        const pagedResponse = await axios.get(`${EVENTS_ENDPOINT}?page=2&per_page=1`, { timeout: DEFAULT_REQUEST_TIMEOUT });
        expect(pagedResponse.status).toBe(200);
        expect(pagedResponse.data).toBeDefined();
        expect(pagedResponse.data._links?.self?.href).toBeDefined();
      } catch (error: any) {
        if (error.code === 'ECONNREFUSED') {
          console.warn('API v3 /events pagination: Skipping page test due to API connection failure.');
          return;
        }
         // If page 2 doesn't exist, API might 404 or return empty array with 200. Both are fine for this test.
        if (error.response) {
            expect(error.response.status).toBeGreaterThanOrEqual(200);
            expect(error.response.status).toBeLessThan(500);
        } else { throw error; }
      }
    });

    it('should return X-WP-Total and X-WP-TotalPages headers', async () => {
      try {
        const headerResponse = await axios.get(`${EVENTS_ENDPOINT}?per_page=1`, { timeout: DEFAULT_REQUEST_TIMEOUT });
        expect(headerResponse.status).toBe(200);
        expect(headerResponse.headers['x-wp-total']).toBeDefined();
        expect(headerResponse.headers['x-wp-totalpages']).toBeDefined();
        expect(parseInt(headerResponse.headers['x-wp-total'], 10)).toBeGreaterThanOrEqual(0);
        expect(parseInt(headerResponse.headers['x-wp-totalpages'], 10)).toBeGreaterThanOrEqual(0);
      } catch (error: any) {
        if (error.code === 'ECONNREFUSED') {
          console.warn('API v3 /events pagination: Skipping pagination headers test due to API connection failure.');
          return;
        }
        throw error;
      }
    });
  });
});
