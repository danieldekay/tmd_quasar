/**
 * Category Images Unit Tests
 *
 * Tests for category configuration and image mapping utilities following TDD approach.
 * These tests MUST fail until the implementation is complete.
 *
 * Reference: /specs/004-event-display/contracts/category-images.contract.md
 */

import { describe, expect, it } from 'vitest';
import {
  CATEGORY_CONFIG,
  getCategoryConfig,
  getCategoryDefaultImage,
  getCategoryPillData,
} from '../categoryImages';

describe('CATEGORY_CONFIG', () => {
  it('should have marathon category with correct properties', () => {
    expect(CATEGORY_CONFIG.marathon).toBeDefined();
    expect(CATEGORY_CONFIG.marathon?.slug).toBe('marathon');
    expect(CATEGORY_CONFIG.marathon?.name).toBe('Tango Marathon');
    expect(CATEGORY_CONFIG.marathon?.color).toBe('#1976D2'); // Blue
    expect(CATEGORY_CONFIG.marathon?.icon).toBe('event');
  });

  it('should have festival category with correct properties', () => {
    expect(CATEGORY_CONFIG.festival).toBeDefined();
    expect(CATEGORY_CONFIG.festival?.slug).toBe('festival');
    expect(CATEGORY_CONFIG.festival?.name).toBe('Tango Festival');
    expect(CATEGORY_CONFIG.festival?.color).toBe('#7B1FA2'); // Purple
    expect(CATEGORY_CONFIG.festival?.icon).toBe('celebration');
  });

  it('should have encuentro category with correct properties', () => {
    expect(CATEGORY_CONFIG.encuentro).toBeDefined();
    expect(CATEGORY_CONFIG.encuentro?.slug).toBe('encuentro');
    expect(CATEGORY_CONFIG.encuentro?.name).toBe('Tango Encuentro');
    expect(CATEGORY_CONFIG.encuentro?.color).toBe('#C2185B'); // Pink
    expect(CATEGORY_CONFIG.encuentro?.icon).toBe('people');
  });

  it('should have workshop category with correct properties', () => {
    expect(CATEGORY_CONFIG.workshop).toBeDefined();
    expect(CATEGORY_CONFIG.workshop?.slug).toBe('workshop');
    expect(CATEGORY_CONFIG.workshop?.name).toBe('Tango Workshop');
    expect(CATEGORY_CONFIG.workshop?.color).toBe('#388E3C'); // Green
    expect(CATEGORY_CONFIG.workshop?.icon).toBe('school');
  });

  it('should have valid color hex codes for all categories', () => {
    const categories = Object.values(CATEGORY_CONFIG);
    categories.forEach((cat) => {
      expect(cat.color).toMatch(/^#[0-9A-F]{6}$/i);
      expect(cat.textColor).toMatch(/^#[0-9A-F]{6}$/i);
    });
  });

  it('should have defaultImage paths for all categories', () => {
    const categories = Object.values(CATEGORY_CONFIG);
    categories.forEach((cat) => {
      expect(cat.defaultImage).toBeTruthy();
      expect(typeof cat.defaultImage).toBe('string');
    });
  });

  it('should have valid Material icon names for all categories', () => {
    const categories = Object.values(CATEGORY_CONFIG);
    categories.forEach((cat) => {
      expect(cat.icon).toBeTruthy();
      expect(typeof cat.icon).toBe('string');
    });
  });
});

describe('getCategoryConfig', () => {
  describe('known categories', () => {
    it('should return marathon config for "marathon" slug', () => {
      const config = getCategoryConfig('marathon');
      expect(config.slug).toBe('marathon');
      expect(config.name).toBe('Tango Marathon');
      expect(config.color).toBe('#1976D2');
    });

    it('should return festival config for "festival" slug', () => {
      const config = getCategoryConfig('festival');
      expect(config.slug).toBe('festival');
      expect(config.color).toBe('#7B1FA2');
    });

    it('should return encuentro config for "encuentro" slug', () => {
      const config = getCategoryConfig('encuentro');
      expect(config.slug).toBe('encuentro');
      expect(config.color).toBe('#C2185B');
    });

    it('should return workshop config for "workshop" slug', () => {
      const config = getCategoryConfig('workshop');
      expect(config.slug).toBe('workshop');
      expect(config.color).toBe('#388E3C');
    });
  });

  describe('case insensitivity', () => {
    it('should handle uppercase category slugs', () => {
      const config = getCategoryConfig('MARATHON');
      expect(config.slug).toBe('marathon');
    });

    it('should handle mixed case category slugs', () => {
      const config = getCategoryConfig('FeStIvAl');
      expect(config.slug).toBe('festival');
    });
  });

  describe('unknown categories and edge cases', () => {
    it('should fallback to marathon for unknown category', () => {
      const config = getCategoryConfig('unknown-category');
      expect(config.slug).toBe('marathon');
    });

    it('should fallback to marathon for undefined', () => {
      const config = getCategoryConfig(undefined);
      expect(config.slug).toBe('marathon');
    });

    it('should fallback to marathon for empty string', () => {
      const config = getCategoryConfig('');
      expect(config.slug).toBe('marathon');
    });

    it('should never return null or undefined', () => {
      const config = getCategoryConfig('anything');
      expect(config).toBeDefined();
      expect(config).not.toBeNull();
    });

    it('should return CategoryConfig type', () => {
      const config = getCategoryConfig('marathon');
      expect(config).toHaveProperty('slug');
      expect(config).toHaveProperty('name');
      expect(config).toHaveProperty('color');
      expect(config).toHaveProperty('textColor');
      expect(config).toHaveProperty('icon');
      expect(config).toHaveProperty('defaultImage');
    });
  });
});

describe('getCategoryDefaultImage', () => {
  describe('valid category arrays', () => {
    it('should return marathon image path for marathon category', () => {
      const imagePath = getCategoryDefaultImage(['marathon']);
      expect(imagePath).toContain('marathon');
      expect(imagePath).toBeTruthy();
    });

    it('should return festival image path for festival category', () => {
      const imagePath = getCategoryDefaultImage(['festival']);
      expect(imagePath).toContain('festival');
    });

    it('should use first category when multiple categories provided', () => {
      const imagePath = getCategoryDefaultImage(['festival', 'marathon']);
      expect(imagePath).toContain('festival');
    });

    it('should return valid image paths (not empty strings)', () => {
      const imagePath = getCategoryDefaultImage(['workshop']);
      expect(imagePath.length).toBeGreaterThan(0);
    });
  });

  describe('fallback behavior', () => {
    it('should fallback to marathon for unknown category', () => {
      const imagePath = getCategoryDefaultImage(['unknown']);
      expect(imagePath).toContain('marathon');
    });

    it('should fallback to marathon for empty array', () => {
      const imagePath = getCategoryDefaultImage([]);
      expect(imagePath).toContain('marathon');
    });

    it('should fallback to marathon for undefined', () => {
      const imagePath = getCategoryDefaultImage(undefined);
      expect(imagePath).toContain('marathon');
    });

    it('should never return null or undefined', () => {
      const imagePath = getCategoryDefaultImage([]);
      expect(imagePath).toBeDefined();
      expect(imagePath).not.toBeNull();
      expect(typeof imagePath).toBe('string');
    });
  });
});

describe('getCategoryPillData', () => {
  describe('valid category arrays', () => {
    it('should return marathon config for marathon category', () => {
      const pillData = getCategoryPillData(['marathon']);
      expect(pillData).not.toBeNull();
      expect(pillData?.slug).toBe('marathon');
      expect(pillData?.name).toBe('Tango Marathon');
    });

    it('should return festival config for festival category', () => {
      const pillData = getCategoryPillData(['festival']);
      expect(pillData?.slug).toBe('festival');
      expect(pillData?.color).toBe('#7B1FA2');
    });

    it('should use first category when multiple provided', () => {
      const pillData = getCategoryPillData(['festival', 'marathon']);
      expect(pillData?.slug).toBe('festival');
    });

    it('should return complete CategoryConfig object', () => {
      const pillData = getCategoryPillData(['workshop']);
      expect(pillData).toHaveProperty('slug');
      expect(pillData).toHaveProperty('name');
      expect(pillData).toHaveProperty('color');
      expect(pillData).toHaveProperty('textColor');
      expect(pillData).toHaveProperty('icon');
    });
  });

  describe('null return behavior', () => {
    it('should return null for undefined categories', () => {
      const pillData = getCategoryPillData(undefined);
      expect(pillData).toBeNull();
    });

    it('should return null for empty array', () => {
      const pillData = getCategoryPillData([]);
      expect(pillData).toBeNull();
    });
  });

  describe('unknown categories', () => {
    it('should still return data for unknown categories (fallback to marathon)', () => {
      const pillData = getCategoryPillData(['completely-unknown']);
      expect(pillData).not.toBeNull();
      expect(pillData?.slug).toBe('marathon');
    });
  });
});
