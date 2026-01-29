import type { VercelRequest, VercelResponse } from '@vercel/node';
import { GoogleGenAI } from '@google/genai';

interface GenerateRequestBody {
  prompt: string;
  size: '1K' | '2K' | '4K';
  referenceImage?: {
    data: string;
    mimeType: string;
  };
}

const MAX_PROMPT_LENGTH = 3000;

function sanitizeInput(input: string): string {
  if (!input || typeof input !== 'string') {
    return '';
  }
  return input
    .trim()
    .slice(0, MAX_PROMPT_LENGTH)
    .replace(/[<>]/g, '');
}

function validateSize(size: unknown): size is '1K' | '2K' | '4K' {
  return size === '1K' || size === '2K' || size === '4K';
}

function validateReferenceImage(
  img: unknown
): img is { data: string; mimeType: string } {
  if (!img || typeof img !== 'object') return false;
  const i = img as Record<string, unknown>;
  return (
    typeof i.data === 'string' &&
    typeof i.mimeType === 'string' &&
    ['image/png', 'image/jpeg', 'image/webp', 'image/gif'].includes(i.mimeType)
  );
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
    const body = req.body as GenerateRequestBody;
    const prompt = sanitizeInput(body.prompt);

    if (!prompt) {
      return res.status(400).json({ error: 'Prompt required' });
    }

    if (!validateSize(body.size)) {
      return res.status(400).json({ error: 'Invalid size. Must be 1K, 2K, or 4K' });
    }

    const referenceImage = validateReferenceImage(body.referenceImage)
      ? body.referenceImage
      : undefined;

    const ai = new GoogleGenAI({ apiKey });

    const parts: Array<
      | { text: string }
      | { inlineData: { data: string; mimeType: string } }
    > = [];

    // Build seed-aware prompt
    let fullPrompt: string;
    if (referenceImage) {
      parts.push({
        inlineData: { data: referenceImage.data, mimeType: referenceImage.mimeType },
      });

      fullPrompt = `EVOLUTION MODE: The reference image is the CURRENT app icon (seed).

CRITICAL RULES FOR EVOLUTION:
1. PRESERVE the core subject/metaphor from the seed image - it must remain recognizable
2. PRESERVE the general shape, composition, and centering
3. EVOLVE the lighting, materials, textures, and color treatment per the direction below
4. Maintain icon format: square, centered, suitable for app stores

DIRECTION TO EVOLVE INTO:
${prompt}

OUTPUT REQUIREMENTS:
- App Store icon format
- High fidelity 3D render
- Soft global illumination
- Vibrant but professional colors
- Clean edges, centered composition
- Neutral or subtly gradient background
- Must feel like a natural evolution of the seed, not a replacement`;
    } else {
      fullPrompt = `Generate a premium mobile app icon from scratch.

SUBJECT: ${prompt}

OUTPUT REQUIREMENTS:
- App Store icon format
- High fidelity 3D render
- Soft global illumination
- Vibrant but professional colors
- Clean edges, centered composition
- Neutral or subtly gradient background`;
    }

    parts.push({ text: fullPrompt });

    const response = await ai.models.generateContent({
      model: 'gemini-2.0-flash-exp-image-generation',
      contents: { parts },
      config: {
        responseModalities: ['image', 'text'],
      },
    });

    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData) {
        return res.status(200).json({
          imageData: part.inlineData.data,
          mimeType: part.inlineData.mimeType || 'image/png',
        });
      }
    }

    return res.status(500).json({ error: 'Generation failed to return an image' });
  } catch (error) {
    console.error('Image generation error:', error);
    const message = error instanceof Error ? error.message : 'Image generation failed';
    return res.status(500).json({ error: message });
  }
}
