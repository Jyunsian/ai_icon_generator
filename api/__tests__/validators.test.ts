import { describe, it, expect } from 'vitest';
import {
  sanitizeInput,
  validateScreenshot,
  validateSize,
  validateReferenceImage,
  validateApiKey,
  filterValidScreenshots,
  validateAnalysis,
  validateTrends,
  MAX_INPUT_LENGTH,
  MAX_PROMPT_LENGTH,
  ALLOWED_IMAGE_TYPES,
} from '../utils/validators';

describe('sanitizeInput', () => {
  it('should trim whitespace', () => {
    expect(sanitizeInput('  hello  ')).toBe('hello');
  });

  it('should remove angle brackets', () => {
    expect(sanitizeInput('<script>alert("xss")</script>')).toBe('scriptalert("xss")/script');
  });

  it('should truncate to max length', () => {
    const longString = 'a'.repeat(MAX_INPUT_LENGTH + 100);
    expect(sanitizeInput(longString).length).toBe(MAX_INPUT_LENGTH);
  });

  it('should use custom max length', () => {
    const longString = 'a'.repeat(100);
    expect(sanitizeInput(longString, 50).length).toBe(50);
  });

  it('should return empty string for non-string input', () => {
    expect(sanitizeInput(null as unknown as string)).toBe('');
    expect(sanitizeInput(undefined as unknown as string)).toBe('');
    expect(sanitizeInput(123 as unknown as string)).toBe('');
  });

  it('should handle empty string', () => {
    expect(sanitizeInput('')).toBe('');
  });
});

describe('validateScreenshot', () => {
  it('should accept valid PNG screenshot', () => {
    const screenshot = { data: 'base64data', mimeType: 'image/png' };
    expect(validateScreenshot(screenshot)).toBe(true);
  });

  it('should accept valid JPEG screenshot', () => {
    const screenshot = { data: 'base64data', mimeType: 'image/jpeg' };
    expect(validateScreenshot(screenshot)).toBe(true);
  });

  it('should accept valid WebP screenshot', () => {
    const screenshot = { data: 'base64data', mimeType: 'image/webp' };
    expect(validateScreenshot(screenshot)).toBe(true);
  });

  it('should accept valid GIF screenshot', () => {
    const screenshot = { data: 'base64data', mimeType: 'image/gif' };
    expect(validateScreenshot(screenshot)).toBe(true);
  });

  it('should reject invalid MIME types', () => {
    const screenshot = { data: 'base64data', mimeType: 'image/svg+xml' };
    expect(validateScreenshot(screenshot)).toBe(false);
  });

  it('should reject null', () => {
    expect(validateScreenshot(null)).toBe(false);
  });

  it('should reject undefined', () => {
    expect(validateScreenshot(undefined)).toBe(false);
  });

  it('should reject non-object', () => {
    expect(validateScreenshot('string')).toBe(false);
    expect(validateScreenshot(123)).toBe(false);
  });

  it('should reject missing data', () => {
    const screenshot = { mimeType: 'image/png' };
    expect(validateScreenshot(screenshot)).toBe(false);
  });

  it('should reject missing mimeType', () => {
    const screenshot = { data: 'base64data' };
    expect(validateScreenshot(screenshot)).toBe(false);
  });

  it('should reject non-string data', () => {
    const screenshot = { data: 123, mimeType: 'image/png' };
    expect(validateScreenshot(screenshot)).toBe(false);
  });
});

describe('validateSize', () => {
  it('should accept 1K', () => {
    expect(validateSize('1K')).toBe(true);
  });

  it('should accept 2K', () => {
    expect(validateSize('2K')).toBe(true);
  });

  it('should accept 4K', () => {
    expect(validateSize('4K')).toBe(true);
  });

  it('should reject invalid sizes', () => {
    expect(validateSize('3K')).toBe(false);
    expect(validateSize('8K')).toBe(false);
    expect(validateSize('')).toBe(false);
    expect(validateSize('1k')).toBe(false);
    expect(validateSize(null)).toBe(false);
    expect(validateSize(1024)).toBe(false);
  });
});

describe('validateReferenceImage', () => {
  it('should accept valid reference image', () => {
    const img = { data: 'base64data', mimeType: 'image/png' };
    expect(validateReferenceImage(img)).toBe(true);
  });

  it('should accept all allowed image types', () => {
    for (const mimeType of ALLOWED_IMAGE_TYPES) {
      const img = { data: 'base64data', mimeType };
      expect(validateReferenceImage(img)).toBe(true);
    }
  });

  it('should reject invalid MIME types', () => {
    const img = { data: 'base64data', mimeType: 'application/pdf' };
    expect(validateReferenceImage(img)).toBe(false);
  });

  it('should reject null and undefined', () => {
    expect(validateReferenceImage(null)).toBe(false);
    expect(validateReferenceImage(undefined)).toBe(false);
  });

  it('should reject missing properties', () => {
    expect(validateReferenceImage({ data: 'base64' })).toBe(false);
    expect(validateReferenceImage({ mimeType: 'image/png' })).toBe(false);
    expect(validateReferenceImage({})).toBe(false);
  });
});

describe('validateApiKey', () => {
  it('should accept valid API key', () => {
    expect(validateApiKey('sk-abc123')).toBe(true);
    expect(validateApiKey('AIzaSy...')).toBe(true);
  });

  it('should reject undefined', () => {
    expect(validateApiKey(undefined)).toBe(false);
  });

  it('should reject empty string', () => {
    expect(validateApiKey('')).toBe(false);
  });
});

describe('filterValidScreenshots', () => {
  it('should filter out invalid screenshots', () => {
    const screenshots = [
      { data: 'valid1', mimeType: 'image/png' },
      { data: 123, mimeType: 'image/png' }, // invalid
      { data: 'valid2', mimeType: 'image/jpeg' },
      null, // invalid
      { data: 'invalid', mimeType: 'image/svg+xml' }, // invalid mime
    ];
    const result = filterValidScreenshots(screenshots);
    expect(result).toHaveLength(2);
    expect(result[0]).toEqual({ data: 'valid1', mimeType: 'image/png' });
    expect(result[1]).toEqual({ data: 'valid2', mimeType: 'image/jpeg' });
  });

  it('should limit to maxCount', () => {
    const screenshots = [
      { data: 'a', mimeType: 'image/png' },
      { data: 'b', mimeType: 'image/png' },
      { data: 'c', mimeType: 'image/png' },
      { data: 'd', mimeType: 'image/png' },
    ];
    const result = filterValidScreenshots(screenshots, 2);
    expect(result).toHaveLength(2);
  });

  it('should handle empty array', () => {
    expect(filterValidScreenshots([])).toEqual([]);
  });
});

describe('validateAnalysis', () => {
  const validAnalysis = {
    vertical: 'Photo Tool',
    demographics: 'Young adults 18-35',
    features: ['feature1', 'feature2'],
    competitors: [{ name: 'Comp1', colorPalette: ['#fff'], style: 'modern' }],
    psychographicProfile: {
      functionalMotivation: 'edit photos',
      emotionalMotivation: 'express creativity',
      socialMotivation: 'share moments',
      summary: 'creative expression',
    },
  };

  it('should accept valid analysis with object psychographicProfile', () => {
    expect(validateAnalysis(validAnalysis)).toBe(true);
  });

  it('should accept valid analysis with string psychographicProfile', () => {
    const analysis = {
      ...validAnalysis,
      psychographicProfile: 'creative expression seekers',
    };
    expect(validateAnalysis(analysis)).toBe(true);
  });

  it('should reject null', () => {
    expect(validateAnalysis(null)).toBe(false);
  });

  it('should reject missing vertical', () => {
    const analysis = { ...validAnalysis };
    delete (analysis as Record<string, unknown>).vertical;
    expect(validateAnalysis(analysis)).toBe(false);
  });

  it('should reject missing demographics', () => {
    const analysis = { ...validAnalysis };
    delete (analysis as Record<string, unknown>).demographics;
    expect(validateAnalysis(analysis)).toBe(false);
  });

  it('should reject non-array features', () => {
    const analysis = { ...validAnalysis, features: 'not an array' };
    expect(validateAnalysis(analysis)).toBe(false);
  });

  it('should reject non-array competitors', () => {
    const analysis = { ...validAnalysis, competitors: 'not an array' };
    expect(validateAnalysis(analysis)).toBe(false);
  });

  it('should reject null psychographicProfile', () => {
    const analysis = { ...validAnalysis, psychographicProfile: null };
    expect(validateAnalysis(analysis)).toBe(false);
  });
});

describe('validateTrends', () => {
  const validTrends = {
    subcultureOverlap: [{ community: 'test', visualLanguage: 'modern' }],
    visualTrends: [{ trend: 'minimalism', description: 'clean design' }],
    sentimentKeywords: ['keyword1', 'keyword2'],
    entertainmentNarrative: [
      { category: 'Movies', items: [{ title: 'Movie1', description: 'desc' }] },
    ],
  };

  it('should accept valid trends', () => {
    expect(validateTrends(validTrends)).toBe(true);
  });

  it('should reject null', () => {
    expect(validateTrends(null)).toBe(false);
  });

  it('should reject undefined', () => {
    expect(validateTrends(undefined)).toBe(false);
  });

  it('should reject missing subcultureOverlap', () => {
    const trends = { ...validTrends };
    delete (trends as Record<string, unknown>).subcultureOverlap;
    expect(validateTrends(trends)).toBe(false);
  });

  it('should reject non-array visualTrends', () => {
    const trends = { ...validTrends, visualTrends: 'not an array' };
    expect(validateTrends(trends)).toBe(false);
  });

  it('should reject non-array sentimentKeywords', () => {
    const trends = { ...validTrends, sentimentKeywords: {} };
    expect(validateTrends(trends)).toBe(false);
  });

  it('should reject non-array entertainmentNarrative', () => {
    const trends = { ...validTrends, entertainmentNarrative: null };
    expect(validateTrends(trends)).toBe(false);
  });

  it('should accept empty arrays', () => {
    const trends = {
      subcultureOverlap: [],
      visualTrends: [],
      sentimentKeywords: [],
      entertainmentNarrative: [],
    };
    expect(validateTrends(trends)).toBe(true);
  });
});
