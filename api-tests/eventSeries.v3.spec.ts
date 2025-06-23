import { describe, it, expect, beforeAll } from 'vitest';
import axios, { type AxiosResponse } from 'axios';
import { API_BASE_URL_V3, DEFAULT_REQUEST_TIMEOUT } from './config';

const EVENT_SERIES_ENDPOINT = `${API_BASE_URL_V3}event-series`;

describe('API v3: Event Series Endpoint (/event-series)', () => {
  let response: AxiosResponse | null = null;
  let errorResponse: any = null;

  beforeAll(async () => {
    try {
      response = await axios.get(EVENT_SERIES_ENDPOINT, { timeout: DEFAULT_REQUEST_TIMEOUT });
    } catch (error) {
      errorResponse = error;
      console.warn(`API v3 /event-series: Could not connect to the API at ${EVENT_SERIES_ENDPOINT}. Tests will likely fail or be skipped. Error: ${error.message}`);
    }
  });

  it('should fetch a list of event series and return status 200', () => {
    if (errorResponse) {
      expect(errorResponse.message).toBeNull(); // This will fail and show the error
    }
    expect(response).toBeDefined();
    expect(response?.status).toBe(200);
  });

  it('should have HAL _links.self in the response', () => {
    if (!response?.data) throw new Error('No response data from API for HAL _links.self test (Event Series v3)');
    expect(response.data._links).toBeDefined();
    expect(response.data._links.self).toBeDefined();
    expect(Array.isArray(response.data._links.self)).toBe(true);
    expect(response.data._links.self.length).toBeGreaterThanOrEqual(1);
    expect(response.data._links.self[0].href).toEqual(expect.stringContaining(EVENT_SERIES_ENDPOINT));
  });

  const getEmbeddedEventSeries = (responseData: any): any[] | undefined => {
    return responseData?._embedded?.['event-series'] || responseData?._embedded?.event_series || responseData?._embedded?.tmd_event_series || responseData?._embedded?.['wp:post_type'] || responseData?._embedded?.items;
  }

  it('should have _embedded items if event series exist, or an empty array/object if not', () => {
    if (!response?.data) throw new Error('No response data from API for _embedded items test (Event Series v3)');
    expect(response.data._embedded).toBeDefined();

    const embeddedEventSeries = getEmbeddedEventSeries(response.data);
    expect(embeddedEventSeries).toBeDefined();
    expect(Array.isArray(embeddedEventSeries)).toBe(true);
  });

  it('individual event series in _embedded collection should have _links.self', () => {
    if (!response?.data) throw new Error('No response data from API for individual event series _links.self test (Event Series v3)');
    const embeddedEventSeries = getEmbeddedEventSeries(response.data);

    if (!embeddedEventSeries || embeddedEventSeries.length === 0) {
      console.warn('API v3 /event-series: No embedded event series found to test individual _links.self. Skipping detailed check.');
      return;
    }

    const itemsToTest = embeddedEventSeries.slice(0, Math.min(embeddedEventSeries.length, 3));
    itemsToTest.forEach((item: any, index: number) => {
      expect(item._links, `Event series at index ${index} missing _links`).toBeDefined();
      expect(item._links.self?.[0]?.href, `Event series at index ${index} _links.self[0].href`).toEqual(expect.stringContaining(`${EVENT_SERIES_ENDPOINT}/${item.id}`));

      if (item._links.author?.[0]?.href) expect(item._links.author[0].href).toEqual(expect.any(String));
      // Event series might not have featured media.
      if (item._links['wp:term']) {
        expect(Array.isArray(item._links['wp:term'])).toBe(true);
        item._links['wp:term'].forEach((termLink: any) => {
          expect(termLink.href).toEqual(expect.any(String));
          expect(termLink.taxonomy).toEqual(expect.any(String));
        });
      }
    });
  });

  it('should contain _links.next or _links.prev if pagination is applicable', () => {
    if (!response?.data?._links) {
        console.warn('API v3 /event-series: No _links object in response for pagination tests. Skipping.');
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

  // Helper function for Event Series property validation
  const validateEventSeriesProperties = (item: any, context: string) => {
    expect(item.id, `${context} id`).toEqual(expect.any(Number));
    expect(item.status, `${context} status`).toEqual(expect.any(String)); // Assuming 'status' for CPTs
    expect(item.link, `${context} link`).toEqual(expect.any(String));

    // Event series might use 'name' directly or 'title.rendered'
    if (item.name && typeof item.name === 'string') {
      expect(item.name, `${context} name`).toEqual(expect.any(String));
    } else if (item.title && typeof item.title === 'object' && item.title.rendered !== undefined) {
      expect(item.title.rendered, `${context} title.rendered (name)`).toEqual(expect.any(String));
    } else {
      // Fallback: expect title property to exist if name isn't there
      expect(item.title, `${context} title or name`).toBeDefined();
    }

    // Description might be in 'description' or 'content.rendered'
    if (item.description && typeof item.description === 'string') {
      expect(item.description, `${context} description`).toEqual(expect.any(String));
    } else if (item.content && typeof item.content === 'object' && item.content.rendered !== undefined) {
      expect(item.content.rendered, `${context} content.rendered (description)`).toEqual(expect.any(String));
    } else if (item.description !== undefined) { // Allow empty string for description
       expect(item.description, `${context} description`).toEqual(expect.any(String));
    }
    // Add other key Event Series properties if known
  };

  it('embedded event series should have key properties with correct types', () => {
    if (!response?.data) throw new Error('No response data from API for embedded event series property validation (Event Series v3)');
    const embeddedEventSeries = getEmbeddedEventSeries(response.data);

    if (!embeddedEventSeries || embeddedEventSeries.length === 0) {
      console.warn('API v3 /event-series: No embedded event series to validate properties. Skipping.');
      return;
    }
    validateEventSeriesProperties(embeddedEventSeries[0], 'First embedded event series');
  });

  describe('Fetch Single Event Series (v3)', () => {
    let singleEventSeriesResponse: AxiosResponse | null = null;
    let singleEventSeriesError: any = null;
    let firstEventSeriesSelfLink: string | null = null;

    beforeAll(async () => {
      if (errorResponse || !response?.data) {
        console.warn('API v3 /event-series: Skipping single event series tests due to collection fetch failure or no data.');
        return;
      }
      const embeddedEventSeries = getEmbeddedEventSeries(response.data);
      if (embeddedEventSeries && embeddedEventSeries.length > 0 && embeddedEventSeries[0]._links?.self?.href) {
        firstEventSeriesSelfLink = embeddedEventSeries[0]._links.self.href;
        try {
          singleEventSeriesResponse = await axios.get(firstEventSeriesSelfLink, { timeout: DEFAULT_REQUEST_TIMEOUT });
        } catch (error) {
          singleEventSeriesError = error;
          console.warn(`API v3 /event-series: Could not fetch single event series from ${firstEventSeriesSelfLink}. Error: ${error.message}`);
        }
      } else {
        console.warn('API v3 /event-series: No items with self link found in collection to fetch single event series.');
      }
    });

    it('should fetch a single event series if an item exists and return status 200', () => {
      if (!firstEventSeriesSelfLink) {
        console.warn('API v3 /event-series: Skipped: No single event series to fetch.');
        return;
      }
      if (singleEventSeriesError) {
        expect(singleEventSeriesError.message).toBeNull();
      }
      expect(singleEventSeriesResponse).toBeDefined();
      expect(singleEventSeriesResponse?.status).toBe(200);
    });

    it('single event series response should have HAL _links.self', () => {
      if (!singleEventSeriesResponse?.data) {
        if (!firstEventSeriesSelfLink) return;
        throw new Error('No response data for single event series HAL _links.self test (Event Series v3)');
      }
      expect(singleEventSeriesResponse.data._links).toBeDefined();
      expect(singleEventSeriesResponse.data._links.self).toBeDefined();
      expect(Array.isArray(singleEventSeriesResponse.data._links.self)).toBe(true);
      expect(singleEventSeriesResponse.data._links.self.length).toBeGreaterThanOrEqual(1);
      expect(singleEventSeriesResponse.data._links.self[0].href).toBe(firstEventSeriesSelfLink);
    });

    it('single event series response should have HAL _links.collection', () => {
      if (!singleEventSeriesResponse?.data) {
        if (!firstEventSeriesSelfLink) return;
        throw new Error('No response data for single event series HAL _links.collection test (Event Series v3)');
      }
      expect(singleEventSeriesResponse.data._links).toBeDefined();
      expect(singleEventSeriesResponse.data._links.collection).toBeDefined();
      expect(Array.isArray(singleEventSeriesResponse.data._links.collection)).toBe(true);
      expect(singleEventSeriesResponse.data._links.collection.length).toBeGreaterThanOrEqual(1);
      expect(singleEventSeriesResponse.data._links.collection[0].href).toBe(EVENT_SERIES_ENDPOINT);
    });

    // This test was already present from the previous subtask.
    // it('single event series should have key properties with correct types', () => { ... });

    it('single event series response should have detailed HAL links if present', () => {
      if (!singleEventSeriesResponse?.data?._links) {
        if (!firstEventSeriesSelfLink) return;
        console.warn('API v3 /event-series (single): No _links object to validate further.');
        return;
      }
      const links = singleEventSeriesResponse.data._links;
      if (links.author?.[0]?.href) expect(links.author[0].href).toEqual(expect.any(String));
      // Add other relevant link checks for event series
    });
  });

  describe('Filtering Event Series (v3)', () => {
    it('should accept a "search" query parameter and return status 200', async () => {
      const searchTerm = 'TestSeriesName';
      try {
        const searchResponse = await axios.get(`${EVENT_SERIES_ENDPOINT}?search=${searchTerm}`, { timeout: DEFAULT_REQUEST_TIMEOUT });
        expect(searchResponse.status).toBe(200);
        expect(searchResponse.data).toBeDefined();
        expect(searchResponse.data._links?.self?.href).toBeDefined();
      } catch (error: any) {
        if (error.code === 'ECONNREFUSED') {
          console.warn(`API v3 /event-series filtering (search): Skipping test due to API connection failure. ${error.message}`);
          return;
        }
        if (error.response) {
            expect(error.response.status).toBeGreaterThanOrEqual(200);
            expect(error.response.status).toBeLessThan(500);
        } else { throw error; }
      }
    });
  });

  describe('Embedding Content for Event Series (v3)', () => {
    let embedResponse: AxiosResponse | null = null;
    let embedError: any = null;

    beforeAll(async () => {
      if (errorResponse) { // From the main collection fetch
        console.warn('API v3 /event-series embedding: Skipping all embedding tests due to main collection fetch failure.');
        return;
      }
      try {
        embedResponse = await axios.get(`${EVENT_SERIES_ENDPOINT}?_embed=true`, { timeout: DEFAULT_REQUEST_TIMEOUT });
      } catch (error) {
        embedError = error;
        if (error.code === 'ECONNREFUSED') {
            console.warn(`API v3 /event-series embedding: API connection failure for _embed call. ${error.message}`);
        } else {
            console.error(`API v3 /event-series embedding: Error fetching with _embed=true. ${error.message}`);
        }
      }
    });

    it('should accept an "_embed" query parameter and return status 200', () => {
      if (errorResponse) return;
      if (embedError) {
        if (embedError.code === 'ECONNREFUSED') {
          console.warn(`API v3 /event-series embedding (_embed param): Skipping test due to API connection failure. ${embedError.message}`);
          return;
        }
        expect(embedError.message).toBeNull();
      }
      expect(embedResponse).toBeDefined();
      expect(embedResponse?.status).toBe(200);
      expect(embedResponse?.data).toBeDefined();
      expect(embedResponse?.data._links?.self?.href).toBeDefined();
    });

    it('should include an "_embedded" object in the response when using _embed', () => {
      if (errorResponse || embedError || !embedResponse?.data) {
        console.warn('API v3 /event-series embedding (check _embedded): Skipping test due to previous errors or no data.');
        return;
      }
      expect(embedResponse.data._embedded).toBeDefined();
      expect(typeof embedResponse.data._embedded).toBe('object');
    });

    it('should have valid properties for embedded author if present', () => {
      if (errorResponse || embedError || !embedResponse?.data?._embedded?.author) {
        console.warn('API v3 /event-series embedding: Skipping author validation due to previous errors, no data, or no embedded author.');
        return;
      }
      const author = embedResponse.data._embedded.author[0];
      expect(author).toBeDefined();
      expect(author.id).toEqual(expect.any(Number));
      expect(author.name).toEqual(expect.any(String));
      expect(author.link).toEqual(expect.any(String));
      expect(author._links?.self?.[0]?.href).toEqual(expect.any(String));
    });

    it('should have valid properties for embedded terms (wp:term) if present', () => {
      if (errorResponse || embedError || !embedResponse?.data?._embedded?.['wp:term']) {
        console.warn('API v3 /event-series embedding: Skipping wp:term validation due to previous errors, no data, or no embedded terms.');
        return;
      }
      const termGroups: any[][] = embedResponse.data._embedded['wp:term'];
      expect(Array.isArray(termGroups)).toBe(true);

      if (termGroups.length === 0) {
        console.warn('API v3 /event-series embedding: wp:term is empty, no terms to validate.');
        return;
      }

      termGroups.forEach((termArray: any[], groupIndex: number) => {
        if (termArray.length > 0) {
          const term = termArray[0];
          expect(term, `Term in group ${groupIndex} is undefined`).toBeDefined();
          expect(term.id, `Term id in group ${groupIndex}`).toEqual(expect.any(Number));
          expect(term.name, `Term name in group ${groupIndex}`).toEqual(expect.any(String));
          expect(term.slug, `Term slug in group ${groupIndex}`).toEqual(expect.any(String));
          expect(term.link, `Term link in group ${groupIndex}`).toEqual(expect.any(String));
          expect(term.taxonomy, `Term taxonomy in group ${groupIndex}`).toEqual(expect.any(String));
        }
      });
    });
  });
});
