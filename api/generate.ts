import type { VercelRequest, VercelResponse } from '@vercel/node';
import { GoogleGenAI } from '@google/genai';

// Inlined validators to ensure proper Vercel bundling
const MAX_PROMPT_LENGTH = 3000;

const ALLOWED_IMAGE_TYPES = [
  'image/png',
  'image/jpeg',
  'image/webp',
  'image/gif',
] as const;

type AllowedImageType = (typeof ALLOWED_IMAGE_TYPES)[number];
type IconSize = '1K' | '2K' | '4K';

interface ReferenceImage {
  data: string;
  mimeType: string;
}

function sanitizeInput(input: string, maxLength: number = MAX_PROMPT_LENGTH): string {
  if (!input || typeof input !== 'string') {
    return '';
  }
  return input
    .trim()
    .slice(0, maxLength)
    .replace(/[<>]/g, '');
}

function validateSize(size: unknown): size is IconSize {
  return size === '1K' || size === '2K' || size === '4K';
}

function validateReferenceImage(img: unknown): img is ReferenceImage {
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

interface SelectedDimension {
  enabled: boolean;
  value: string;
}

interface SelectedDimensions {
  style?: SelectedDimension;
  pose?: SelectedDimension;
  costume?: SelectedDimension;
  mood?: SelectedDimension;
}

interface IconAnalysis {
  coreSubject?: string;
  appFunction?: string;
  currentStyle?: string;
  mustPreserve?: string[];
}

interface GenerateRequestBody {
  prompt: string;
  size: IconSize;
  referenceImage?: ReferenceImage;
  // New evolution mode fields
  evolutionMode?: boolean;
  selectedDimensions?: SelectedDimensions;
  // New unified suggestion field (simplified flow)
  evolutionDirection?: string;
  iconAnalysis?: IconAnalysis;
  functionGuard?: string[];
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
    const prompt = sanitizeInput(body.prompt || '', MAX_PROMPT_LENGTH);
    const evolutionMode = body.evolutionMode === true;

    // Prompt is optional in evolution mode (used only for additional instructions)
    if (!prompt && !evolutionMode) {
      return res.status(400).json({ error: 'Prompt required' });
    }

    if (!validateSize(body.size)) {
      return res.status(400).json({ error: 'Invalid size. Must be 1K, 2K, or 4K' });
    }

    const referenceImage = validateReferenceImage(body.referenceImage)
      ? body.referenceImage
      : undefined;
    const selectedDimensions = body.selectedDimensions;
    const evolutionDirection = typeof body.evolutionDirection === 'string'
      ? sanitizeInput(body.evolutionDirection, MAX_PROMPT_LENGTH)
      : undefined;
    const iconAnalysis = body.iconAnalysis;
    const functionGuard = Array.isArray(body.functionGuard) ? body.functionGuard : [];

    const ai = new GoogleGenAI({ apiKey });

    const parts: Array<
      | { text: string }
      | { inlineData: { data: string; mimeType: string } }
    > = [];

    // Build seed-aware prompt
    let fullPrompt: string;

    // New unified suggestion mode (simplified flow)
    if (evolutionMode && referenceImage && evolutionDirection) {
      parts.push({
        inlineData: { data: referenceImage.data, mimeType: referenceImage.mimeType },
      });

      const coreSubject = iconAnalysis?.coreSubject || '原有主體';
      const appFunction = iconAnalysis?.appFunction || '原有功能';
      const mustPreserve = functionGuard.length > 0
        ? functionGuard.join(', ')
        : iconAnalysis?.mustPreserve?.join(', ') || '核心識別元素';

      fullPrompt = `娛樂趨勢演化模式：附上的圖片是現有的 App Icon（種子 icon）。

核心主體：${coreSubject}
App 功能：${appFunction}

演化關鍵規則：
1. 必須保留：${mustPreserve}
2. 核心主體必須一眼可辨認 - 這是「演化」不是「重新設計」
3. 保持 App 功能的視覺暗示
4. 維持 icon 格式：方形、居中、適合 App Store

演化方向：
${evolutionDirection}

${prompt ? `額外指示: ${prompt}` : ''}

輸出要求：
- App Store icon 格式
- 高保真 3D 渲染
- 柔和的全局光照
- 鮮豔但專業的配色
- 乾淨的邊緣，居中構圖
- 中性或微漸層背景
- 必須感覺像種子 icon 的自然演化，而非替換品`;

    // Legacy evolution mode with selected dimensions (backwards compatible)
    } else if (evolutionMode && referenceImage && selectedDimensions) {
      parts.push({
        inlineData: { data: referenceImage.data, mimeType: referenceImage.mimeType },
      });

      const enabledDimensions: string[] = [];

      if (selectedDimensions.style?.enabled && selectedDimensions.style.value) {
        enabledDimensions.push(`風格演化: ${selectedDimensions.style.value}`);
      }
      if (selectedDimensions.pose?.enabled && selectedDimensions.pose.value) {
        enabledDimensions.push(`動作演化: ${selectedDimensions.pose.value}`);
      }
      if (selectedDimensions.costume?.enabled && selectedDimensions.costume.value) {
        enabledDimensions.push(`服裝/道具演化: ${selectedDimensions.costume.value}`);
      }
      if (selectedDimensions.mood?.enabled && selectedDimensions.mood.value) {
        enabledDimensions.push(`背景/氛圍演化: ${selectedDimensions.mood.value}`);
      }

      const dimensionsText = enabledDimensions.length > 0
        ? enabledDimensions.join('\n')
        : '保持原有風格，僅進行品質提升';

      const coreSubject = iconAnalysis?.coreSubject || '原有主體';
      const appFunction = iconAnalysis?.appFunction || '原有功能';
      const mustPreserve = functionGuard.length > 0
        ? functionGuard.join(', ')
        : iconAnalysis?.mustPreserve?.join(', ') || '核心識別元素';

      fullPrompt = `娛樂趨勢演化模式：附上的圖片是現有的 App Icon（種子 icon）。

核心主體：${coreSubject}
App 功能：${appFunction}

演化關鍵規則：
1. 必須保留：${mustPreserve}
2. 核心主體必須一眼可辨認 - 這是「演化」不是「重新設計」
3. 保持 App 功能的視覺暗示
4. 維持 icon 格式：方形、居中、適合 App Store

選擇的演化維度：
${dimensionsText}

${prompt ? `額外指示: ${prompt}` : ''}

輸出要求：
- App Store icon 格式
- 高保真 3D 渲染
- 柔和的全局光照
- 鮮豔但專業的配色
- 乾淨的邊緣，居中構圖
- 中性或微漸層背景
- 必須感覺像種子 icon 的自然演化，而非替換品`;

    } else if (referenceImage) {
      // Legacy evolution mode (backwards compatible)
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
