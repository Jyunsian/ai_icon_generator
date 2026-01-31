import type { VercelRequest, VercelResponse } from '@vercel/node';
import { GoogleGenAI, Type } from '@google/genai';
import gplay from 'google-play-scraper';

// Inlined validators to ensure proper Vercel bundling
const MAX_INPUT_LENGTH = 5000;
const MAX_SCREENSHOTS = 10;

const ALLOWED_IMAGE_TYPES = [
  'image/png',
  'image/jpeg',
  'image/webp',
  'image/gif',
] as const;

type AllowedImageType = (typeof ALLOWED_IMAGE_TYPES)[number];

interface ScreenshotInput {
  data: string;
  mimeType: string;
}

function sanitizeInput(input: string, maxLength: number = MAX_INPUT_LENGTH): string {
  if (!input || typeof input !== 'string') {
    return '';
  }
  return input
    .trim()
    .slice(0, maxLength)
    .replace(/[<>]/g, '');
}

function validateScreenshot(screenshot: unknown): screenshot is ScreenshotInput {
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

function filterValidScreenshots(
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

interface AnalyzeRequestBody {
  input: string;
  screenshots?: ScreenshotInput[];
  context?: string;
}

interface PlayStoreDetection {
  isPlayStore: boolean;
  packageId?: string;
  url?: string;
}

function detectPlayStoreUrl(input: string): PlayStoreDetection {
  const pattern = /play\.google\.com\/store\/apps\/details\?id=([a-zA-Z0-9._]+)/;
  const match = input.match(pattern);
  if (match) {
    return {
      isPlayStore: true,
      packageId: match[1],
      url: `https://play.google.com/store/apps/details?id=${match[1]}`,
    };
  }
  return { isPlayStore: false };
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.error('GEMINI_API_KEY not configured');
    return res.status(500).json({ error: 'Server configuration error' });
  }

  try {
    const body = req.body as AnalyzeRequestBody;
    const input = sanitizeInput(body.input);
    const context = body.context ? sanitizeInput(body.context) : undefined;

    if (!input && (!body.screenshots || body.screenshots.length === 0)) {
      return res.status(400).json({ error: 'Input or screenshots required' });
    }

    const screenshots = Array.isArray(body.screenshots)
      ? filterValidScreenshots(body.screenshots)
      : [];

    const ai = new GoogleGenAI({ apiKey });

    // Detect if input contains a Play Store URL
    const playStoreInfo = detectPlayStoreUrl(input);

    // Fetch actual icon from Play Store if URL detected (with 5s timeout)
    let playStoreIcon: { data: string; mimeType: string } | null = null;
    if (playStoreInfo.isPlayStore && playStoreInfo.packageId) {
      try {
        const app = await gplay.app({ appId: playStoreInfo.packageId });
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000);
        const iconResponse = await fetch(app.icon, { signal: controller.signal });
        clearTimeout(timeoutId);
        const buffer = await iconResponse.arrayBuffer();
        const base64 = Buffer.from(buffer).toString('base64');
        playStoreIcon = { data: base64, mimeType: 'image/png' };
      } catch (error) {
        console.error('Failed to fetch Play Store icon:', error);
      }
    }

    // Build the prompt based on input type
    const urlInstructions = playStoreInfo.isPlayStore
      ? `
GOOGLE PLAY URL DETECTED: ${playStoreInfo.url}
Package ID: ${playStoreInfo.packageId}

${playStoreIcon ? 'THE FIRST IMAGE BELOW IS THE APP ICON FROM GOOGLE PLAY - use this as the primary "seed" for evolution.\nPerform SEED ANALYSIS on this icon.' : 'ADDITIONAL URL-SPECIFIC TASKS:\n- Extract the app name from the Play Store listing\n- Extract the app category'}
`
      : '';

    const screenshotClassificationInstructions =
      screenshots.length > 0
        ? `
    SCREENSHOT CLASSIFICATION (for each uploaded image, index starting at 0):
    Determine which image is the ORIGINAL APP ICON (look for: square format, centered subject, icon-like composition).
    If an original icon is found, perform SEED ANALYSIS on it.
    `
        : '';

    const textPart = {
      text: `Act as a senior ASO & Product Strategist. Analyze this app based on the provided metadata/link and screenshots.

    METADATA/LINK: ${input}
    ${context ? `USER CONTEXT: ${context}` : ''}
    ${urlInstructions}

    TASKS:
    1. Extract App Name and Category (if identifiable from input or screenshots).
    2. Identify the Vertical (e.g., Social Utility, Photo Tool, Game).
    3. Identify the Core Functional Utility (e.g., "Downloading WhatsApp Statuses", "Photo Editing").
    4. Identify Demographics (be specific: age range, region, device preference).
    5. Audit the screenshots for "Visual DNA" (colors, shapes, primary metaphors).
    6. Identify 3 visual competitors in the same category - include their color palettes and visual styles.
    7. Create a STRUCTURED Psychographic Profile with:
       - Functional Motivation: What practical problem does the user solve?
       - Emotional Motivation: What feeling does the user seek?
       - Social Motivation: How does this app affect user's social identity?
       - Summary: One sentence combining all three.
    ${screenshotClassificationInstructions}
    8. SEED ICON ANALYSIS (if original app icon identified in screenshots):
       - Primary metaphor/subject of the icon
       - Color palette (hex codes)
       - Shape language (rounded, sharp, organic, geometric)
       - Lighting style (flat, 3D, gradient, glossy)
       - Elements that MUST be preserved in any evolution

    Return valid JSON.`,
    };

    const parts: Array<
      | { text: string }
      | { inlineData: { data: string; mimeType: string } }
    > = [textPart];

    // Add Play Store icon as the first image (seed icon)
    if (playStoreIcon) {
      parts.push({
        inlineData: { data: playStoreIcon.data, mimeType: playStoreIcon.mimeType },
      });
    }

    for (const s of screenshots) {
      parts.push({
        inlineData: { data: s.data, mimeType: s.mimeType },
      });
    }

    const response = await ai.models.generateContent({
      model: 'gemini-2.0-flash',
      contents: { parts },
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            appName: { type: Type.STRING },
            appCategory: { type: Type.STRING },
            vertical: { type: Type.STRING },
            demographics: { type: Type.STRING },
            features: { type: Type.ARRAY, items: { type: Type.STRING } },
            competitors: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  name: { type: Type.STRING },
                  colorPalette: { type: Type.ARRAY, items: { type: Type.STRING } },
                  style: { type: Type.STRING },
                },
                required: ['name', 'colorPalette', 'style'],
              },
            },
            psychographicProfile: {
              type: Type.OBJECT,
              properties: {
                functionalMotivation: { type: Type.STRING },
                emotionalMotivation: { type: Type.STRING },
                socialMotivation: { type: Type.STRING },
                summary: { type: Type.STRING },
              },
              required: ['functionalMotivation', 'emotionalMotivation', 'socialMotivation', 'summary'],
            },
            visualDna: { type: Type.STRING },
            seedIconAnalysis: {
              type: Type.OBJECT,
              properties: {
                identified: { type: Type.BOOLEAN },
                screenshotIndex: { type: Type.NUMBER },
                primaryMetaphor: { type: Type.STRING },
                colorPalette: { type: Type.ARRAY, items: { type: Type.STRING } },
                shapeLanguage: { type: Type.STRING },
                lightingStyle: { type: Type.STRING },
                mustPreserve: { type: Type.ARRAY, items: { type: Type.STRING } },
              },
              required: ['identified', 'primaryMetaphor', 'colorPalette', 'shapeLanguage', 'lightingStyle', 'mustPreserve'],
            },
          },
          required: [
            'vertical',
            'demographics',
            'features',
            'competitors',
            'psychographicProfile',
            'visualDna',
          ],
        },
      },
    });

    const text = response.text || '{}';
    const cleaned = text.replace(/```json\n?|```/g, '').trim();
    const data = JSON.parse(cleaned);

    // Extract grounding sources
    const sources: Array<{ title: string; uri: string }> = [];
    const metadata = response.candidates?.[0]?.groundingMetadata;
    const chunks = metadata?.groundingChunks;
    if (chunks) {
      for (const chunk of chunks) {
        if (chunk.web) {
          sources.push({
            title: chunk.web.title || 'Source',
            uri: chunk.web.uri || '',
          });
        }
      }
    }
    data.sources = sources;

    return res.status(200).json(data);
  } catch (error) {
    console.error('Analysis error:', error);
    const message = error instanceof Error ? error.message : 'Analysis failed';
    return res.status(500).json({ error: message });
  }
}
