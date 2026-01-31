/**
 * Shared validation utilities for API endpoints
 */

// Default max lengths for different input types
export const MAX_INPUT_LENGTH = 5000;
export const MAX_PROMPT_LENGTH = 3000;
export const MAX_SCREENSHOTS = 10;

// Allowed image MIME types
export const ALLOWED_IMAGE_TYPES = [
  'image/png',
  'image/jpeg',
  'image/webp',
  'image/gif',
] as const;

export type AllowedImageType = (typeof ALLOWED_IMAGE_TYPES)[number];

export interface ScreenshotInput {
  data: string;
  mimeType: string;
}

export interface ReferenceImage {
  data: string;
  mimeType: string;
}

export type IconSize = '1K' | '2K' | '4K';

/**
 * Sanitize user input by trimming, limiting length, and removing potentially dangerous characters
 */
export function sanitizeInput(input: string, maxLength: number = MAX_INPUT_LENGTH): string {
  if (!input || typeof input !== 'string') {
    return '';
  }
  return input
    .trim()
    .slice(0, maxLength)
    .replace(/[<>]/g, '');
}

/**
 * Validate that an object is a valid screenshot input
 */
export function validateScreenshot(screenshot: unknown): screenshot is ScreenshotInput {
  if (!screenshot || typeof screenshot !== 'object') {
    return false;
  }
  const s = screenshot as Record<string, unknown>;
  return (
    typeof s.data === 'string' &&
    typeof s.mimeType === 'string' &&
    ALLOWED_IMAGE_TYPES.includes(s.mimeType as AllowedImageType)
  );
}

/**
 * Validate icon size parameter
 */
export function validateSize(size: unknown): size is IconSize {
  return size === '1K' || size === '2K' || size === '4K';
}

/**
 * Validate reference image for generation
 */
export function validateReferenceImage(img: unknown): img is ReferenceImage {
  if (!img || typeof img !== 'object') {
    return false;
  }
  const i = img as Record<string, unknown>;
  return (
    typeof i.data === 'string' &&
    typeof i.mimeType === 'string' &&
    ALLOWED_IMAGE_TYPES.includes(i.mimeType as AllowedImageType)
  );
}

/**
 * Validate API key is present
 */
export function validateApiKey(apiKey: string | undefined): apiKey is string {
  return typeof apiKey === 'string' && apiKey.length > 0;
}

/**
 * Filter and validate an array of screenshots
 */
export function filterValidScreenshots(
  screenshots: unknown[],
  maxCount: number = MAX_SCREENSHOTS
): ScreenshotInput[] {
  const validScreenshots: ScreenshotInput[] = [];
  for (const s of screenshots.slice(0, maxCount)) {
    if (validateScreenshot(s)) {
      validScreenshots.push(s);
    }
  }
  return validScreenshots;
}

// Analysis result validation types
export interface PsychographicProfile {
  functionalMotivation: string;
  emotionalMotivation: string;
  socialMotivation: string;
  summary: string;
}

export interface SeedIconAnalysis {
  identified: boolean;
  screenshotIndex?: number;
  primaryMetaphor: string;
  colorPalette: string[];
  shapeLanguage: string;
  lightingStyle: string;
  mustPreserve: string[];
}

export interface AnalysisResult {
  appName?: string;
  appCategory?: string;
  vertical: string;
  demographics: string;
  features: string[];
  competitors: { name: string; colorPalette: string[]; style: string }[];
  psychographicProfile: PsychographicProfile | string;
  visualDna?: string;
  seedIconAnalysis?: SeedIconAnalysis;
}

export interface TrendSynthesis {
  subcultureOverlap: Array<{ community: string; visualLanguage: string }>;
  visualTrends: Array<{ trend: string; description: string }>;
  sentimentKeywords: string[];
  entertainmentNarrative: Array<{
    category: string;
    items: Array<{ title: string; description: string }>;
  }>;
  methodologyReasoning?: string;
  sources?: Array<{ title: string; uri: string }>;
}

/**
 * Validate analysis result structure
 */
export function validateAnalysis(analysis: unknown): analysis is AnalysisResult {
  if (!analysis || typeof analysis !== 'object') {
    return false;
  }
  const a = analysis as Record<string, unknown>;
  // Support both old string format and new object format for psychographicProfile
  const hasValidPsychographic =
    typeof a.psychographicProfile === 'string' ||
    (typeof a.psychographicProfile === 'object' && a.psychographicProfile !== null);
  return (
    typeof a.vertical === 'string' &&
    typeof a.demographics === 'string' &&
    Array.isArray(a.features) &&
    Array.isArray(a.competitors) &&
    hasValidPsychographic
  );
}

/**
 * Validate trends structure
 */
export function validateTrends(trends: unknown): trends is TrendSynthesis {
  if (!trends || typeof trends !== 'object') {
    return false;
  }
  const t = trends as Record<string, unknown>;
  return (
    Array.isArray(t.subcultureOverlap) &&
    Array.isArray(t.visualTrends) &&
    Array.isArray(t.sentimentKeywords) &&
    Array.isArray(t.entertainmentNarrative)
  );
}
