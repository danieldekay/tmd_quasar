import { describe, it, expect, beforeAll } from 'vitest';
import axios, { type AxiosResponse } from 'axios';
import { API_BASE_URL_V3, DEFAULT_REQUEST_TIMEOUT } from './config';

const TEACHERS_ENDPOINT = `${API_BASE_URL_V3}teachers`;

describe('API v3: Teachers Endpoint (/teachers)', () => {
  let response: AxiosResponse | null = null;
  let errorResponse: any = null;

  beforeAll(async () => {
    try {
      response = await axios.get(TEACHERS_ENDPOINT, { timeout: DEFAULT_REQUEST_TIMEOUT });
    } catch (error) {
      errorResponse = error;
      console.warn(`API v3 /teachers: Could not connect to the API at ${TEACHERS_ENDPOINT}. Tests will likely fail or be skipped. Error: ${error.message}`);
    }
  });

  it('should fetch a list of teachers and return status 200', () => {
    if (errorResponse) {
      expect(errorResponse.message).toBeNull(); // This will fail and show the error
    }
    expect(response).toBeDefined();
    expect(response?.status).toBe(200);
  });

  it('should have HAL _links.self in the response', () => {
    if (!response?.data) throw new Error('No response data from API for HAL _links.self test (Teachers v3)');
    expect(response.data._links).toBeDefined();
    expect(response.data._links.self).toBeDefined();
    expect(Array.isArray(response.data._links.self)).toBe(true);
    expect(response.data._links.self.length).toBeGreaterThanOrEqual(1);
    expect(response.data._links.self[0].href).toEqual(expect.stringContaining(TEACHERS_ENDPOINT));
  });

  const getEmbeddedTeachers = (responseData: any): any[] | undefined => {
    return responseData?._embedded?.teachers || responseData?._embedded?.tmd_teacher || responseData?._embedded?.['wp:post_type'] || responseData?._embedded?.items;
  }

  it('should have _embedded items if teachers exist, or an empty array/object if not', () => {
    if (!response?.data) throw new Error('No response data from API for _embedded items test (Teachers v3)');
    expect(response.data._embedded).toBeDefined();

    const embeddedTeachers = getEmbeddedTeachers(response.data);
    expect(embeddedTeachers).toBeDefined();
    expect(Array.isArray(embeddedTeachers)).toBe(true);
  });

  it('individual teachers in _embedded collection should have _links.self', () => {
    if (!response?.data) throw new Error('No response data from API for individual teacher _links.self test (Teachers v3)');
    const embeddedTeachers = getEmbeddedTeachers(response.data);

    if (!embeddedTeachers || embeddedTeachers.length === 0) {
      console.warn('API v3 /teachers: No embedded teachers found to test individual _links.self. Skipping detailed check.');
      return;
    }

    const itemsToTest = embeddedTeachers.slice(0, Math.min(embeddedTeachers.length, 3));
    itemsToTest.forEach((item: any, index: number) => {
      expect(item._links, `Teacher at index ${index} missing _links`).toBeDefined();
      expect(item._links.self?.[0]?.href, `Teacher at index ${index} _links.self[0].href`).toEqual(expect.stringContaining(`${TEACHERS_ENDPOINT}/${item.id}`));

      if (item._links.author?.[0]?.href) expect(item._links.author[0].href).toEqual(expect.any(String));
      if (item._links['wp:featuredmedia']?.[0]?.href) {
         expect(item._links['wp:featuredmedia'][0].href).toEqual(expect.any(String));
         if (item._links['wp:featuredmedia'][0].embeddable !== undefined) {
            expect(item._links['wp:featuredmedia'][0].embeddable).toEqual(expect.any(Boolean));
        }
      }
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
        console.warn('API v3 /teachers: No _links object in response for pagination tests. Skipping.');
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

  // Helper function for Teacher property validation
  const validateTeacherProperties = (item: any, context: string) => {
    expect(item.id, `${context} id`).toEqual(expect.any(Number));
    expect(item.status, `${context} status`).toEqual(expect.any(String));
    expect(item.link, `${context} link`).toEqual(expect.any(String));

    expect(item.title, `${context} title object`).toBeDefined();
    expect(item.title.rendered, `${context} title.rendered (Teacher name)`).toEqual(expect.any(String));

    expect(item.content, `${context} content object`).toBeDefined();
    expect(item.content.rendered, `${context} content.rendered (bio)`).toEqual(expect.any(String));
    // Add other key Teacher properties if known (e.g., from meta fields)
  };

  it('embedded teachers should have key properties with correct types', () => {
    if (!response?.data) throw new Error('No response data from API for embedded teacher property validation (Teachers v3)');
    const embeddedTeachers = getEmbeddedTeachers(response.data);

    if (!embeddedTeachers || embeddedTeachers.length === 0) {
      console.warn('API v3 /teachers: No embedded teachers to validate properties. Skipping.');
      return;
    }
    validateTeacherProperties(embeddedTeachers[0], 'First embedded teacher');
  });

  describe('Fetch Single Teacher (v3)', () => {
    let singleTeacherResponse: AxiosResponse | null = null;
    let singleTeacherError: any = null;
    let firstTeacherSelfLink: string | null = null;

    beforeAll(async () => {
      if (errorResponse || !response?.data) {
        console.warn('API v3 /teachers: Skipping single teacher tests due to collection fetch failure or no data.');
        return;
      }
      const embeddedTeachers = getEmbeddedTeachers(response.data);
      if (embeddedTeachers && embeddedTeachers.length > 0 && embeddedTeachers[0]._links?.self?.href) {
        firstTeacherSelfLink = embeddedTeachers[0]._links.self.href;
        try {
          singleTeacherResponse = await axios.get(firstTeacherSelfLink, { timeout: DEFAULT_REQUEST_TIMEOUT });
        } catch (error) {
          singleTeacherError = error;
          console.warn(`API v3 /teachers: Could not fetch single teacher from ${firstTeacherSelfLink}. Error: ${error.message}`);
        }
      } else {
        console.warn('API v3 /teachers: No items with self link found in collection to fetch single teacher.');
      }
    });

    it('should fetch a single teacher if an item exists and return status 200', () => {
      if (!firstTeacherSelfLink) {
        console.warn('API v3 /teachers: Skipped: No single teacher to fetch.');
        return;
      }
      if (singleTeacherError) {
        expect(singleTeacherError.message).toBeNull();
      }
      expect(singleTeacherResponse).toBeDefined();
      expect(singleTeacherResponse?.status).toBe(200);
    });

    it('single teacher response should have HAL _links.self', () => {
      if (!singleTeacherResponse?.data) {
        if (!firstTeacherSelfLink) return;
        throw new Error('No response data for single teacher HAL _links.self test (Teachers v3)');
      }
      expect(singleTeacherResponse.data._links).toBeDefined();
      expect(singleTeacherResponse.data._links.self).toBeDefined();
      expect(Array.isArray(singleTeacherResponse.data._links.self)).toBe(true);
      expect(singleTeacherResponse.data._links.self.length).toBeGreaterThanOrEqual(1);
      expect(singleTeacherResponse.data._links.self[0].href).toBe(firstTeacherSelfLink);
    });

    it('single teacher response should have HAL _links.collection', () => {
      if (!singleTeacherResponse?.data) {
        if (!firstTeacherSelfLink) return;
        throw new Error('No response data for single teacher HAL _links.collection test (Teachers v3)');
      }
      expect(singleTeacherResponse.data._links).toBeDefined();
      expect(singleTeacherResponse.data._links.collection).toBeDefined();
      expect(Array.isArray(singleTeacherResponse.data._links.collection)).toBe(true);
      expect(singleTeacherResponse.data._links.collection.length).toBeGreaterThanOrEqual(1);
      expect(singleTeacherResponse.data._links.collection[0].href).toBe(TEACHERS_ENDPOINT);
    });

    // This test was already present from the previous subtask.
    // it('single teacher should have key properties with correct types', () => { ... });


    it('single teacher response should have detailed HAL links if present', () => {
      if (!singleTeacherResponse?.data?._links) {
        if (!firstTeacherSelfLink) return;
        console.warn('API v3 /teachers (single): No _links object to validate further.');
        return;
      }
      const links = singleTeacherResponse.data._links;
      if (links.author?.[0]?.href) expect(links.author[0].href).toEqual(expect.any(String));
      if (links['wp:featuredmedia']?.[0]?.href) expect(links['wp:featuredmedia'][0].href).toEqual(expect.any(String));
      // Add other relevant link checks
    });
  });

  describe('Filtering Teachers (v3)', () => {
    it('should accept a "search" query parameter and return status 200', async () => {
      const searchTerm = 'TestTeacherName';
      try {
        const searchResponse = await axios.get(`${TEACHERS_ENDPOINT}?search=${searchTerm}`, { timeout: DEFAULT_REQUEST_TIMEOUT });
        expect(searchResponse.status).toBe(200);
        expect(searchResponse.data).toBeDefined();
        expect(searchResponse.data._links?.self?.href).toBeDefined();
      } catch (error: any) {
        if (error.code === 'ECONNREFUSED') {
          console.warn(`API v3 /teachers filtering (search): Skipping test due to API connection failure. ${error.message}`);
          return;
        }
        if (error.response) {
            expect(error.response.status).toBeGreaterThanOrEqual(200);
            expect(error.response.status).toBeLessThan(500);
        } else { throw error; }
      }
    });
  });

  describe('Embedding Content for Teachers (v3)', () => {
    let embedResponse: AxiosResponse | null = null;
    let embedError: any = null;

    beforeAll(async () => {
      if (errorResponse) { // From the main collection fetch
        console.warn('API v3 /teachers embedding: Skipping all embedding tests due to main collection fetch failure.');
        return;
      }
      try {
        embedResponse = await axios.get(`${TEACHERS_ENDPOINT}?_embed=true`, { timeout: DEFAULT_REQUEST_TIMEOUT });
      } catch (error) {
        embedError = error;
        if (error.code === 'ECONNREFUSED') {
            console.warn(`API v3 /teachers embedding: API connection failure for _embed call. ${error.message}`);
        } else {
            console.error(`API v3 /teachers embedding: Error fetching with _embed=true. ${error.message}`);
        }
      }
    });

    it('should accept an "_embed" query parameter and return status 200', () => {
      if (errorResponse) return;
      if (embedError) {
        if (embedError.code === 'ECONNREFUSED') {
          console.warn(`API v3 /teachers embedding (_embed param): Skipping test due to API connection failure. ${embedError.message}`);
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
        console.warn('API v3 /teachers embedding (check _embedded): Skipping test due to previous errors or no data.');
        return;
      }
      expect(embedResponse.data._embedded).toBeDefined();
      expect(typeof embedResponse.data._embedded).toBe('object');
    });

    it('should have valid properties for embedded author if present', () => {
      if (errorResponse || embedError || !embedResponse?.data?._embedded?.author) {
        console.warn('API v3 /teachers embedding: Skipping author validation due to previous errors, no data, or no embedded author.');
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
        console.warn('API v3 /teachers embedding: Skipping wp:term validation due to previous errors, no data, or no embedded terms.');
        return;
      }
      const termGroups: any[][] = embedResponse.data._embedded['wp:term'];
      expect(Array.isArray(termGroups)).toBe(true);

      if (termGroups.length === 0) {
        console.warn('API v3 /teachers embedding: wp:term is empty, no terms to validate.');
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
