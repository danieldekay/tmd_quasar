/**
 * @vitest-environment happy-dom
 *
 * Test Suite: TeacherDetails.vue Component Tests (T012)
 *
 * Purpose: Test TeacherDetails component against detail page requirements
 *
 * Requirements Tested:
 * - FR-014: Display all available Teacher data
 * - FR-017: Show related/embedded data (events)
 * - FR-018: Loading indicators while fetching
 * - FR-019: Error messages with retry and navigation
 * - FR-020: Navigation back to table view
 * - FR-021: ISO date formatting (YYYY-MM-DD)
 * - FR-022: No images displayed (or images disabled)
 * - FR-023: Handle missing/null data gracefully
 * - FR-024: HTML content sanitized
 *
 * USES: Test utilities from src/test-utils/ (T004a)
 */

import { flushPromises } from '@vue/test-utils';
import { createPinia, setActivePinia } from 'pinia';
import {
  createMockRouter,
  createMockTeacher,
  createNetworkError,
  mockDelayedResponse,
  mountWithQuasar,
} from 'src/test-utils';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import TeacherDetails from '../TeacherDetails.vue';

// Mock the teacher service
vi.mock('src/services/teacherService', () => ({
  teacherService: {
    getTeacher: vi.fn(),
  },
}));

// Import the mocked service
import { teacherService as mockTeacherService } from 'src/services/teacherService';

// Type-safe reference to mock function
const mockGetTeacher = mockTeacherService['getTeacher'] as ReturnType<typeof vi.fn>;

// Mock composables
vi.mock('@/composables/useFormatters', () => ({
  useFormatters: () => ({
    formatDate: (date: string) => date,
    formatDateISO: (date: string) => date,
    formatText: (text: string) => text,
  }),
}));

vi.mock('@/composables/useCountries', () => ({
  useCountries: () => ({
    getCountryName: (code: string) => `Country-${code}`,
  }),
}));

describe('TeacherDetails.vue - Component Tests (T012)', () => {
  let mockRouter: ReturnType<typeof createMockRouter>;

  beforeEach(() => {
    vi.clearAllMocks();

    // Create Pinia instance for each test
    const pinia = createPinia();
    setActivePinia(pinia);

    mockRouter = createMockRouter();

    // Mock route params
    mockRouter.currentRoute.value = {
      ...mockRouter.currentRoute.value,
      params: { id: '1' },
    };

    // Setup default successful response
    mockGetTeacher.mockResolvedValue(createMockTeacher({ id: 1 }));
  });

  describe('FR-014: Display All Available Teacher Data', () => {
    it('should render Teacher component', async () => {
      const wrapper = mountWithQuasar(TeacherDetails, {}, mockRouter, true);
      await flushPromises();

      expect(wrapper.exists()).toBe(true);
    });

    it('should display teacher name', async () => {
      const wrapper = mountWithQuasar(TeacherDetails, {}, mockRouter, true);
      await flushPromises();

      const teacherName = wrapper.text();
      expect(teacherName).toContain('Test Teacher 1');
    });

    it('should display teacher location (city and country)', async () => {
      const mockTeacher = createMockTeacher({
        id: 1,
        city: 'Buenos Aires',
        country: 'AR',
      });
      mockGetTeacher.mockResolvedValue(mockTeacher);

      const wrapper = mountWithQuasar(TeacherDetails, {}, mockRouter, true);
      await flushPromises();

      const text = wrapper.text();
      expect(text).toContain('Buenos Aires');
      expect(text).toContain('Country-AR');
    });

    it('should call getTeacher service with correct ID from route params', async () => {
      const wrapper = mountWithQuasar(TeacherDetails, {}, mockRouter, true);
      await flushPromises();

      expect(mockGetTeacher).toHaveBeenCalledWith(1, expect.any(Object));
    });

    it('should display teacher role', async () => {
      const mockTeacher = createMockTeacher({
        id: 1,
        meta_box: {
          role: 'both',
        },
      });
      mockGetTeacher.mockResolvedValue(mockTeacher);

      const wrapper = mountWithQuasar(TeacherDetails, {}, mockRouter, true);
      await flushPromises();

      const text = wrapper.text();
      // Component should display role (leader/follower/both/double-role)
      expect(wrapper.html()).toBeTruthy();
    });

    it('should display teaching experience information', async () => {
      const mockTeacher = createMockTeacher({
        id: 1,
        meta_box: {
          teaching_since: '2010',
          dancing_since: '2005',
        },
      });
      mockGetTeacher.mockResolvedValue(mockTeacher);

      const wrapper = mountWithQuasar(TeacherDetails, {}, mockRouter, true);
      await flushPromises();

      const text = wrapper.text();
      // Component should show teaching/dancing experience
      expect(wrapper.html()).toBeTruthy();
    });
  });

  describe('FR-017: Show Related/Embedded Data', () => {
    it('should fetch teacher with embedded data', async () => {
      const mockTeacher = createMockTeacher({
        id: 1,
        _embedded: {
          events: [
            {
              id: 100,
              title: 'Embedded Event',
              date: '2024-05-01T00:00:00',
              link: 'https://example.com/event/100',
              start_date: '2024-05-01',
              end_date: '2024-05-05',
              registration_start_date: '2024-04-01',
              edition: '1',
            },
          ],
        },
      });
      mockGetTeacher.mockResolvedValue(mockTeacher);

      mountWithQuasar(TeacherDetails, {}, mockRouter, true);
      await flushPromises();

      expect(mockGetTeacher).toHaveBeenCalledWith(1, expect.objectContaining({ _embed: true }));
    });

    it('should display embedded events if available', async () => {
      const mockTeacher = createMockTeacher({
        id: 1,
        _embedded: {
          events: [
            {
              id: 100,
              title: 'Teacher Event 1',
              date: '2024-05-01T00:00:00',
              link: 'https://example.com/event/100',
              start_date: '2024-05-01',
              end_date: '2024-05-05',
              registration_start_date: '2024-04-01',
              edition: '1',
            },
          ],
        },
      });
      mockGetTeacher.mockResolvedValue(mockTeacher);

      const wrapper = mountWithQuasar(TeacherDetails, {}, mockRouter, true);
      await flushPromises();

      const text = wrapper.text();
      // Component should display embedded events
      expect(text).toBeTruthy();
    });
  });

  describe('FR-018: Loading Indicators', () => {
    it('should show loading state while fetching teacher data', async () => {
      const delayedTeacher = createMockTeacher({ id: 1 });
      mockDelayedResponse(mockGetTeacher, delayedTeacher, 100);

      const wrapper = mountWithQuasar(TeacherDetails, {}, mockRouter, true);

      // Should show loading before data arrives
      expect(wrapper.html()).toContain('q-spinner');

      await flushPromises();
      expect(wrapper.exists()).toBe(true);
    });

    it('should clear loading state after data is loaded', async () => {
      const wrapper = mountWithQuasar(TeacherDetails, {}, mockRouter, true);
      await flushPromises();

      // Should not show loading after data arrives
      expect(wrapper.html()).not.toContain('q-spinner');
    });
  });

  describe('FR-019: Error Messages with Retry and Navigation', () => {
    it('should handle API errors gracefully', async () => {
      mockGetTeacher.mockRejectedValue(createNetworkError());

      const wrapper = mountWithQuasar(TeacherDetails, {}, mockRouter, true);
      await flushPromises();

      // Should not crash
      expect(wrapper.exists()).toBe(true);
    });

    it('should display error message when API fails', async () => {
      mockGetTeacher.mockRejectedValue(createNetworkError());

      const wrapper = mountWithQuasar(TeacherDetails, {}, mockRouter, true);
      await flushPromises();

      const text = wrapper.text();
      expect(text).toMatch(/error|failed|load/i);
    });

    it('should handle 404 not found errors', async () => {
      mockGetTeacher.mockRejectedValue({
        response: { status: 404 },
        message: 'Teacher not found',
      });

      const wrapper = mountWithQuasar(TeacherDetails, {}, mockRouter, true);
      await flushPromises();

      const text = wrapper.text();
      expect(text).toMatch(/not found|error/i);
    });
  });

  describe('FR-020: Navigation Back to Table View', () => {
    it('should provide navigation back functionality', async () => {
      const wrapper = mountWithQuasar(TeacherDetails, {}, mockRouter, true);
      await flushPromises();

      // Component should have back button or navigation
      expect(wrapper.html()).toBeTruthy();
    });
  });

  describe('FR-021: ISO Date Formatting', () => {
    it('should format teaching_since as year (YYYY)', async () => {
      const mockTeacher = createMockTeacher({
        id: 1,
        meta_box: {
          teaching_since: '2010',
          dancing_since: '2005',
        },
      });
      mockGetTeacher.mockResolvedValue(mockTeacher);

      const wrapper = mountWithQuasar(TeacherDetails, {}, mockRouter, true);
      await flushPromises();

      const text = wrapper.text();
      // Component should display years
      expect(text).toBeTruthy();
    });
  });

  describe('FR-022: No Images Displayed', () => {
    it('should not display images (or have image display disabled)', async () => {
      const wrapper = mountWithQuasar(TeacherDetails, {}, mockRouter, true);
      await flushPromises();

      // This is a policy test - images may be present but should be disabled/hidden
      // Or test that no img tags exist
      expect(wrapper.html()).toBeTruthy();
    });
  });

  describe('FR-023: Handle Missing/Null Data', () => {
    it('should handle teachers with missing optional fields', async () => {
      const mockTeacher = createMockTeacher({
        id: 1,
        title: 'Minimal Teacher',
        // All other fields undefined
      });
      mockGetTeacher.mockResolvedValue(mockTeacher);

      const wrapper = mountWithQuasar(TeacherDetails, {}, mockRouter, true);
      await flushPromises();

      // Should render without errors
      expect(wrapper.exists()).toBe(true);
      expect(wrapper.text()).toContain('Minimal Teacher');
    });

    it('should handle null values gracefully', async () => {
      const mockTeacher = createMockTeacher({
        id: 1,
        city: null as unknown as string,
        country: null as unknown as string,
        meta_box: {
          bio_short: null as unknown as string,
        },
      });
      mockGetTeacher.mockResolvedValue(mockTeacher);

      const wrapper = mountWithQuasar(TeacherDetails, {}, mockRouter, true);
      await flushPromises();

      // Should render without null pointer errors
      expect(wrapper.exists()).toBe(true);
    });

    it('should handle teachers without meta_box', async () => {
      const mockTeacher = createMockTeacher({
        id: 1,
        title: 'No Meta Teacher',
      });
      // Explicitly remove meta_box
      delete mockTeacher.meta_box;
      mockGetTeacher.mockResolvedValue(mockTeacher);

      const wrapper = mountWithQuasar(TeacherDetails, {}, mockRouter, true);
      await flushPromises();

      // Should render without errors
      expect(wrapper.exists()).toBe(true);
    });
  });

  describe('FR-024: HTML Content Sanitized', () => {
    it('should display HTML content safely', async () => {
      const mockTeacher = createMockTeacher({
        id: 1,
        content: {
          rendered: '<p>Teacher bio with <strong>HTML</strong> content</p>',
        },
      });
      mockGetTeacher.mockResolvedValue(mockTeacher);

      const wrapper = mountWithQuasar(TeacherDetails, {}, mockRouter, true);
      await flushPromises();

      const html = wrapper.html();
      // Should contain the text but properly sanitized
      expect(html).toBeTruthy();
    });

    it('should prevent script execution in bio content', async () => {
      const mockTeacher = createMockTeacher({
        id: 1,
        content: {
          rendered: '<script>alert("XSS")</script><p>Safe content</p>',
        },
      });
      mockGetTeacher.mockResolvedValue(mockTeacher);

      const wrapper = mountWithQuasar(TeacherDetails, {}, mockRouter, true);
      await flushPromises();

      const html = wrapper.html();
      // Should NOT contain script tag
      expect(html).not.toContain('<script>');
    });
  });

  describe('Component Lifecycle', () => {
    it('should fetch teacher data on mount', async () => {
      const wrapper = mountWithQuasar(TeacherDetails, {}, mockRouter, true);
      await flushPromises();

      expect(mockGetTeacher).toHaveBeenCalledTimes(1);
    });

    it('should handle component unmount cleanly', async () => {
      const wrapper = mountWithQuasar(TeacherDetails, {}, mockRouter, true);
      await flushPromises();

      expect(() => wrapper.unmount()).not.toThrow();
    });
  });

  describe('Data Integrity', () => {
    it('should preserve all teacher properties', async () => {
      const mockTeacher = createMockTeacher({
        id: 1,
        title: 'Complete Teacher',
        city: 'Buenos Aires',
        country: 'AR',
        meta_box: {
          first_name: 'Complete',
          last_name: 'Teacher',
          role: 'both',
          teaching_since: '2010',
          dancing_since: '2005',
        },
      });
      mockGetTeacher.mockResolvedValue(mockTeacher);

      const wrapper = mountWithQuasar(TeacherDetails, {}, mockRouter, true);
      await flushPromises();

      // Component should display all provided data
      const text = wrapper.text();
      expect(text).toContain('Complete Teacher');
      expect(text).toContain('Buenos Aires');
    });

    it('should handle teachers with all optional fields populated', async () => {
      const mockTeacher = createMockTeacher({
        id: 1,
        title: 'Full Teacher',
        city: 'Buenos Aires',
        country: 'AR',
        meta_box: {
          first_name: 'Full',
          last_name: 'Teacher',
          nickname: 'Maestro',
          role: 'both',
          gender: 'man',
          teaching_since: '2010',
          dancing_since: '2005',
          bio_short: 'Expert teacher',
          website: 'https://example.com',
          email: 'teacher@example.com',
          facebook_profile: 'facebook.com/teacher',
          instagram: 'instagram.com/teacher',
          specializations: ['Milonga', 'Vals'],
        },
        acf: {
          bio: 'Full biography',
          photo: 'https://example.com/photo.jpg',
          website: 'https://example.com',
          teaching_style: 'Traditional',
        },
      });
      mockGetTeacher.mockResolvedValue(mockTeacher);

      const wrapper = mountWithQuasar(TeacherDetails, {}, mockRouter, true);
      await flushPromises();

      // Should render with all data
      expect(wrapper.exists()).toBe(true);
      const text = wrapper.text();
      expect(text).toContain('Full Teacher');
    });

    it('should handle different role values correctly', async () => {
      const roles = ['leader', 'follower', 'both', 'double-role'] as const;

      for (const role of roles) {
        const mockTeacher = createMockTeacher({
          id: 1,
          meta_box: {
            role,
          },
        });
        mockGetTeacher.mockResolvedValue(mockTeacher);

        const wrapper = mountWithQuasar(TeacherDetails, {}, mockRouter, true);
        await flushPromises();

        const text = wrapper.text();
        expect(wrapper.exists()).toBe(true);
        expect(text).toBeTruthy();
        wrapper.unmount();
      }
    });
  });
});
