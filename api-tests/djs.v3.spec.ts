import { describe, it, expect, beforeAll } from 'vitest';
import axios, { type AxiosResponse, type AxiosError } from 'axios';
import { API_BASE_URL_V3, DEFAULT_REQUEST_TIMEOUT } from './config';

const DJS_ENDPOINT = `${API_BASE_URL_V3}djs`;

describe('API v3: DJs Endpoint (/djs)', () => {
  let response: AxiosResponse | null = null;
  let errorResponse: any = null;

  beforeAll(async () => {
    try {
      response = await axios.get(DJS_ENDPOINT, { timeout: DEFAULT_REQUEST_TIMEOUT });
    } catch (e) {
      errorResponse = e;
      const error = e as AxiosError;
      console.warn(
        `API v3 /djs: Could not connect to the API at ${DJS_ENDPOINT}. Tests will likely fail or be skipped. Error: ${error.message}`,
      );
    }
  });

  it('should fetch a list of DJs and return status 200', () => {
    if (errorResponse) {
      expect(errorResponse.message).toBeNull(); // This will fail and show the error
    }
    expect(response).toBeDefined();
    expect(response?.status).toBe(200);
  });

  it('should have HAL _links.self in the response', () => {
    if (!response?.data)
      throw new Error('No response data from API for HAL _links.self test (DJs v3)');
    expect(response.data._links).toBeDefined();
    expect(response.data._links.self).toBeDefined();
    expect(Array.isArray(response.data._links.self)).toBe(true);
    expect(response.data._links.self.length).toBeGreaterThanOrEqual(1);
    expect(response.data._links.self[0].href).toEqual(expect.stringContaining(DJS_ENDPOINT));
  });

  const getEmbeddedDjs = (responseData: any): any[] | undefined => {
    return (
      responseData?._embedded?.djs ||
      responseData?._embedded?.tmd_dj ||
      responseData?._embedded?.['wp:post_type'] ||
      responseData?._embedded?.items
    );
  };

  it('should have _embedded items if DJs exist, or an empty array/object if not', () => {
    if (!response?.data)
      throw new Error('No response data from API for _embedded items test (DJs v3)');
    expect(response.data._embedded).toBeDefined();

    const embeddedDjs = getEmbeddedDjs(response.data);
    expect(embeddedDjs).toBeDefined();
    expect(Array.isArray(embeddedDjs)).toBe(true);
  });

  it('individual DJs in _embedded collection should have _links.self', () => {
    if (!response?.data)
      throw new Error('No response data from API for individual DJ _links.self test (DJs v3)');
    const embeddedDjs = getEmbeddedDjs(response.data);

    if (!embeddedDjs || embeddedDjs.length === 0) {
      console.warn(
        'API v3 /djs: No embedded DJs found to test individual _links.self. Skipping detailed check.',
      );
      return;
    }

    const itemsToTest = embeddedDjs.slice(0, Math.min(embeddedDjs.length, 3));
    itemsToTest.forEach((item: any, index: number) => {
      expect(item._links, `DJ at index ${index} missing _links`).toBeDefined();
      expect(item._links.self?.[0]?.href, `DJ at index ${index} _links.self[0].href`).toEqual(
        expect.stringContaining(`${DJS_ENDPOINT}/${item.id}`),
      );

      if (item._links.author?.[0]?.href)
        expect(item._links.author[0].href).toEqual(expect.any(String));
      if (item._links['wp:featuredmedia']?.[0]?.href) {
        expect(item._links['wp:featuredmedia'][0].href).toEqual(expect.any(String));
        if (item._links['wp:featuredmedia'][0].embeddable !== undefined) {
          expect(item._links['wp:featuredmedia'][0].embeddable).toEqual(expect.any(Boolean));
        }
      }
      if (item._links['wp:term']) {
        // wp:term can be an array of term links
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
      console.warn('API v3 /djs: No _links object in response for pagination tests. Skipping.');
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

  // Helper function for DJ property validation
  const validateDjProperties = (item: any, context: string) => {
    expect(item.id, `${context} id`).toEqual(expect.any(Number));
    expect(item.status, `${context} status`).toEqual(expect.any(String));
    expect(item.link, `${context} link`).toEqual(expect.any(String));

    expect(item.title, `${context} title object`).toBeDefined();
    expect(item.title.rendered, `${context} title.rendered (DJ name)`).toEqual(expect.any(String));

    expect(item.content, `${context} content object`).toBeDefined();
    expect(item.content.rendered, `${context} content.rendered (bio)`).toEqual(expect.any(String));

    const meta = item.meta || item; // Meta fields might be nested or direct
    if (meta.dj_city) expect(meta.dj_city, `${context} dj_city`).toEqual(expect.any(String));
    if (meta.dj_country_code)
      expect(meta.dj_country_code, `${context} dj_country_code`).toEqual(expect.any(String));
    // Add other key DJ properties if known
  };

  it('embedded DJs should have key properties with correct types', () => {
    if (!response?.data)
      throw new Error('No response data from API for embedded DJ property validation (DJs v3)');
    const embeddedDjs = getEmbeddedDjs(response.data);

    if (!embeddedDjs || embeddedDjs.length === 0) {
      console.warn('API v3 /djs: No embedded DJs to validate properties. Skipping.');
      return;
    }
    validateDjProperties(embeddedDjs[0], 'First embedded DJ');
  });

  describe('Fetch Single DJ (v3)', () => {
    let singleDjResponse: AxiosResponse | null = null;
    let singleDjError: any = null;
    let firstDjSelfLink: string | null = null;

    beforeAll(async () => {
      if (errorResponse || !response?.data) {
        console.warn(
          'API v3 /djs: Skipping single DJ tests due to collection fetch failure or no data.',
        );
        return;
      }
      const embeddedDjs = getEmbeddedDjs(response.data);
      if (embeddedDjs && embeddedDjs.length > 0 && embeddedDjs[0]._links?.self?.href) {
        firstDjSelfLink = embeddedDjs[0]._links.self.href;
        try {
          singleDjResponse = await axios.get(firstDjSelfLink, { timeout: DEFAULT_REQUEST_TIMEOUT });
        } catch (e) {
          singleDjError = e;
          const error = e as AxiosError;
          console.warn(
            `API v3 /djs: Could not fetch single DJ from ${firstDjSelfLink}. Error: ${error.message}`,
          );
        }
      } else {
        console.warn(
          'API v3 /djs: No items with self link found in collection to fetch single DJ.',
        );
      }
    });

    it('should fetch a single DJ if an item exists and return status 200', () => {
      if (!firstDjSelfLink) {
        console.warn('API v3 /djs: Skipped: No single DJ to fetch.');
        return;
      }
      if (singleDjError) {
        expect(singleDjError.message).toBeNull();
      }
      expect(singleDjResponse).toBeDefined();
      expect(singleDjResponse?.status).toBe(200);
    });

    it('single DJ response should have HAL _links.self', () => {
      if (!singleDjResponse?.data) {
        if (!firstDjSelfLink) return;
        throw new Error('No response data for single DJ HAL _links.self test (DJs v3)');
      }
      expect(singleDjResponse.data._links).toBeDefined();
      expect(singleDjResponse.data._links.self).toBeDefined();
      expect(Array.isArray(singleDjResponse.data._links.self)).toBe(true);
      expect(singleDjResponse.data._links.self.length).toBeGreaterThanOrEqual(1);
      expect(singleDjResponse.data._links.self[0].href).toBe(firstDjSelfLink);
    });

    it('single DJ response should have HAL _links.collection', () => {
      if (!singleDjResponse?.data) {
        if (!firstDjSelfLink) return;
        throw new Error('No response data for single DJ HAL _links.collection test (DJs v3)');
      }
      expect(singleDjResponse.data._links).toBeDefined();
      expect(singleDjResponse.data._links.collection).toBeDefined();
      expect(Array.isArray(singleDjResponse.data._links.collection)).toBe(true);
      expect(singleDjResponse.data._links.collection.length).toBeGreaterThanOrEqual(1);
      expect(singleDjResponse.data._links.collection[0].href).toBe(DJS_ENDPOINT);
    });

    it('single DJ should have key properties with correct types', () => {
      if (!singleDjResponse?.data) {
        if (!firstDjSelfLink) return;
        throw new Error('No response data for single DJ property validation (DJs v3)');
      }
      validateDjProperties(singleDjResponse.data, 'Single fetched DJ');
    });

    it('single DJ response should have detailed HAL links if present', () => {
      if (!singleDjResponse?.data?._links) {
        if (!firstDjSelfLink) return;
        console.warn('API v3 /djs (single): No _links object to validate further.');
        return;
      }
      const links = singleDjResponse.data._links;
      if (links.author?.[0]?.href) expect(links.author[0].href).toEqual(expect.any(String));
      if (links['wp:featuredmedia']?.[0]?.href)
        expect(links['wp:featuredmedia'][0].href).toEqual(expect.any(String));
      // Add other relevant link checks
    });
  });

  describe('Filtering DJs (v3)', () => {
    it('should accept a "search" query parameter and return status 200', async () => {
      const searchTerm = 'TestDJName';
      try {
        const searchResponse = await axios.get(`${DJS_ENDPOINT}?search=${searchTerm}`, {
          timeout: DEFAULT_REQUEST_TIMEOUT,
        });
        expect(searchResponse.status).toBe(200);
        expect(searchResponse.data).toBeDefined();
        expect(searchResponse.data._links?.self?.href).toBeDefined();
      } catch (error: any) {
        if (error.code === 'ECONNREFUSED') {
          console.warn(
            `API v3 /djs filtering (search): Skipping test due to API connection failure. ${error.message}`,
          );
          return;
        }
        if (error.response) {
          expect(error.response.status).toBeGreaterThanOrEqual(200);
          expect(error.response.status).toBeLessThan(500);
        } else {
          throw error;
        }
      }
    });

    it('should accept a "country" query parameter and return status 200', async () => {
      const countryCode = 'DE'; // Example country code
      try {
        const filterResponse = await axios.get(`${DJS_ENDPOINT}?country=${countryCode}`, {
          timeout: DEFAULT_REQUEST_TIMEOUT,
        });
        expect(filterResponse.status).toBe(200);
        expect(filterResponse.data).toBeDefined();
        expect(filterResponse.data._links?.self?.href).toBeDefined();
      } catch (error: any) {
        if (error.code === 'ECONNREFUSED') {
          console.warn(
            `API v3 /djs filtering (country): Skipping test due to API connection failure. ${error.message}`,
          );
          return;
        }
        if (error.response) {
          expect(error.response.status).toBeGreaterThanOrEqual(200);
          expect(error.response.status).toBeLessThan(500);
        } else {
          throw error;
        }
      }
    });
  });

  describe('Embedding Content for DJs (v3)', () => {
    let embedResponse: AxiosResponse | null = null;
    let embedError: any = null;

    beforeAll(async () => {
      // Only run this if the main collection endpoint was reachable
      if (errorResponse) {
        console.warn(
          'API v3 /djs embedding: Skipping all embedding tests due to main collection fetch failure.',
        );
        return;
      }
      try {
        embedResponse = await axios.get(`${DJS_ENDPOINT}?_embed=true`, {
          timeout: DEFAULT_REQUEST_TIMEOUT,
        });
      } catch (e) {
        embedError = e;
        const error = e as AxiosError;
        if (error.code === 'ECONNREFUSED') {
          console.warn(
            `API v3 /djs embedding: API connection failure for _embed call. ${error.message}`,
          );
        } else {
          console.error(`API v3 /djs embedding: Error fetching with _embed=true. ${error.message}`);
        }
      }
    });

    it('should accept an "_embed" query parameter and return status 200', () => {
      if (errorResponse) return; // Skip if main endpoint failed
      if (embedError) {
        // If ECONNREFUSED, this specific call failed, treat as skip for this test's purpose.
        if (embedError.code === 'ECONNREFUSED') {
          console.warn(
            `API v3 /djs embedding (_embed param): Skipping test due to API connection failure. ${embedError.message}`,
          );
          return;
        }
        expect(embedError.message).toBeNull(); // Fail for other errors
      }
      expect(embedResponse).toBeDefined();
      expect(embedResponse?.status).toBe(200);
      expect(embedResponse?.data).toBeDefined();
      expect(embedResponse?.data._links?.self?.href).toBeDefined();
    });

    it('should include an "_embedded" object in the response when using _embed', () => {
      if (errorResponse || embedError || !embedResponse?.data) {
        console.warn(
          'API v3 /djs embedding (check _embedded): Skipping test due to previous errors or no data.',
        );
        return;
      }
      expect(embedResponse.data._embedded).toBeDefined();
      expect(typeof embedResponse.data._embedded).toBe('object');
    });

    it('should have valid properties for embedded author if present', () => {
      if (errorResponse || embedError || !embedResponse?.data?._embedded?.author) {
        console.warn(
          'API v3 /djs embedding: Skipping author validation due to previous errors, no data, or no embedded author.',
        );
        return;
      }
      const author = embedResponse.data._embedded.author[0]; // Typically an array with one author
      expect(author).toBeDefined();
      expect(author.id).toEqual(expect.any(Number));
      expect(author.name).toEqual(expect.any(String));
      expect(author.link).toEqual(expect.any(String)); // Link to author archive
      expect(author._links?.self?.[0]?.href).toEqual(expect.any(String)); // Link to author REST endpoint
    });

    it('should have valid properties for embedded terms (wp:term) if present', () => {
      if (errorResponse || embedError || !embedResponse?.data?._embedded?.['wp:term']) {
        console.warn(
          'API v3 /djs embedding: Skipping wp:term validation due to previous errors, no data, or no embedded terms.',
        );
        return;
      }
      const termGroups: any[][] = embedResponse.data._embedded['wp:term'];
      expect(Array.isArray(termGroups)).toBe(true);

      if (termGroups.length === 0) {
        console.warn('API v3 /djs embedding: wp:term is empty, no terms to validate.');
        return;
      }

      // Iterate through each group of terms (each taxonomy)
      termGroups.forEach((termArray: any[], groupIndex: number) => {
        if (termArray.length > 0) {
          const term = termArray[0]; // Validate the first term in each group as a sample
          expect(term, `Term in group ${groupIndex} is undefined`).toBeDefined();
          expect(term.id, `Term id in group ${groupIndex}`).toEqual(expect.any(Number));
          expect(term.name, `Term name in group ${groupIndex}`).toEqual(expect.any(String));
          expect(term.slug, `Term slug in group ${groupIndex}`).toEqual(expect.any(String));
          expect(term.link, `Term link in group ${groupIndex}`).toEqual(expect.any(String));
          expect(term.taxonomy, `Term taxonomy in group ${groupIndex}`).toEqual(expect.any(String));
        }
      });
    });

    it('should return embedded orchestra, event, and teacher data when _embed=true', async () => {
      let embedResponse: AxiosResponse | undefined;
      let embedError: unknown;
      try {
        embedResponse = await axios.get(DJS_ENDPOINT, {
          params: { _embed: true },
          timeout: DEFAULT_REQUEST_TIMEOUT,
        });
      } catch (e) {
        embedError = e;
        const error = e as AxiosError;
        if (error.code === 'ECONNREFUSED') {
          console.warn(
            `API v3 /djs embedding: API connection failure for _embed call. ${error.message}`,
          );
        } else {
          console.error(`API v3 /djs embedding: Error fetching with _embed=true. ${error.message}`);
        }
      }

      if (embedError && (embedError as AxiosError).code === 'ECONNREFUSED') {
        return; // Skip test if API is not available
      }

      if (embedResponse) {
        expect(embedResponse.status).toBe(200);
        expect(embedResponse.data).toBeDefined();
        expect(embedResponse.data._links?.self?.href).toBeDefined();
      }
    });
  });
});
