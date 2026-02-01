import type { VercelRequest, VercelResponse } from '@vercel/node';
import { GoogleGenAI, Type } from '@google/genai';
import gplay from 'google-play-scraper';

const MAX_INPUT_LENGTH = 2000;
const MAX_IMAGE_SIZE_BYTES = 10 * 1024 * 1024; // 10MB

const ALLOWED_IMAGE_TYPES = [
  'image/png',
  'image/jpeg',
  'image/webp',
  'image/gif',
] as const;

type AllowedImageType = (typeof ALLOWED_IMAGE_TYPES)[number];

function sanitizeInput(input: string, maxLength: number = MAX_INPUT_LENGTH): string {
  if (!input || typeof input !== 'string') {
    return '';
  }
  return input.trim().slice(0, maxLength).replace(/[<>]/g, '');
}

function validateImageMimeType(mimeType: unknown): mimeType is AllowedImageType {
  return typeof mimeType === 'string' && ALLOWED_IMAGE_TYPES.includes(mimeType as AllowedImageType);
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

interface PlayStoreAppInfo {
  icon: string;
  iconMimeType: string;
  name: string;
  category: string;
  description: string;
}

async function fetchPlayStoreAppInfo(packageId: string): Promise<PlayStoreAppInfo> {
  const app = await gplay.app({ appId: packageId });

  // Fetch icon with timeout
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 5000);
  const iconResponse = await fetch(app.icon, { signal: controller.signal });
  clearTimeout(timeoutId);
  const buffer = await iconResponse.arrayBuffer();
  const iconBase64 = Buffer.from(buffer).toString('base64');

  return {
    icon: iconBase64,
    iconMimeType: 'image/png',
    name: app.title,
    category: app.genre || 'Other',
    description: app.summary || app.description?.slice(0, 500) || '',
  };
}

interface EntertainmentInsightsRequest {
  // Option A: Play Store URL (auto-fetch)
  playStoreUrl?: string;
  // Option B: Manual input
  appIcon?: string;
  appIconMimeType?: string;
  appName?: string;
  appCategory?: string;
  appDescription?: string;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'Server configuration error' });
  }

  try {
    const body = req.body as EntertainmentInsightsRequest;

    let appIcon: string;
    let mimeType: AllowedImageType;
    let appName: string;
    let appCategory: string;
    let appDescription: string;

    // Check if Play Store URL provided
    const playStoreDetection = body.playStoreUrl
      ? detectPlayStoreUrl(body.playStoreUrl)
      : { isPlayStore: false };

    if (playStoreDetection.isPlayStore && playStoreDetection.packageId) {
      // Fetch app info from Play Store
      try {
        const playStoreInfo = await fetchPlayStoreAppInfo(playStoreDetection.packageId);
        appIcon = playStoreInfo.icon;
        mimeType = playStoreInfo.iconMimeType as AllowedImageType;
        appName = sanitizeInput(playStoreInfo.name);
        appCategory = sanitizeInput(playStoreInfo.category);
        appDescription = sanitizeInput(playStoreInfo.description);
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Failed to fetch Play Store app info';
        return res.status(400).json({ error: `Play Store fetch failed: ${message}` });
      }
    } else {
      // Manual input mode
      if (!body.appIcon || typeof body.appIcon !== 'string') {
        return res.status(400).json({ error: 'appIcon is required (base64) or provide playStoreUrl' });
      }

      // Validate image size (base64 is ~4/3 the size of binary)
      const estimatedSize = (body.appIcon.length * 3) / 4;
      if (estimatedSize > MAX_IMAGE_SIZE_BYTES) {
        return res.status(400).json({ error: 'Image too large. Maximum 10MB allowed.' });
      }

      appIcon = body.appIcon;
      mimeType = validateImageMimeType(body.appIconMimeType)
        ? body.appIconMimeType
        : 'image/png';
      appName = sanitizeInput(body.appName || '');
      appCategory = sanitizeInput(body.appCategory || '');
      appDescription = sanitizeInput(body.appDescription || '');

      if (!appName) {
        return res.status(400).json({ error: 'appName is required' });
      }
      if (!appCategory) {
        return res.status(400).json({ error: 'appCategory is required' });
      }
      if (!appDescription) {
        return res.status(400).json({ error: 'appDescription is required' });
      }
    }

    const ai = new GoogleGenAI({ apiKey });

    const prompt = `你是一位文化趨勢分析師與 App Icon 設計顧問。

分析以下 App 的目標用戶群，研究他們最近在關注什麼娛樂內容，並分析現有的 App Icon。

App 資訊：
- 名稱：${appName}
- 類別：${appCategory}
- 功能描述：${appDescription}

[附上的圖片是這個 App 的現有 Icon]

請完成以下任務：

## 1. 目標用戶分析
識別這個 App 的主要目標用戶群：
- 人口統計特徵（年齡、地區、興趣）
- 他們可能關注的興趣領域

## 2. 娛樂趨勢洞察
研究這類目標用戶最近 30 天內的娛樂偏好：

### 影視（電影、劇集）
找出 3-5 個目標用戶群最可能關注的熱門影視作品
- 每個作品需要說明「與目標用戶的相關性」和「可借鑑的視覺元素」

### 遊戲 IP
找出 2-3 個目標用戶群活躍的遊戲或遊戲社群
- 說明相關性和可借鑑的視覺元素

### 動畫/漫畫
找出 2-3 個相關的動畫或漫畫 IP
- 說明相關性和可借鑑的視覺元素

### 視覺美學潮流
識別 2-3 個當前流行的視覺美學趨勢（如 Y2K、Aura、像素風等）
- 說明這些趨勢如何與目標用戶共鳴

## 3. 現有 Icon 分析
仔細分析附上的 App Icon：
- 核心主體是什麼？（例如：一隻橘貓、一個計算機）
- 這個 Icon 如何傳達 App 的功能？
- 現有的視覺風格是什麼？（3D、扁平、卡通、寫實等）
- 哪些元素是「必須保留」的，以確保用戶仍能認出這是同一個 App，並理解它的功能？

請返回 JSON 格式的分析結果。`;

    const parts: Array<
      | { text: string }
      | { inlineData: { data: string; mimeType: string } }
    > = [
      { text: prompt },
      { inlineData: { data: appIcon, mimeType } },
    ];

    const response = await ai.models.generateContent({
      model: 'gemini-2.0-flash',
      contents: { parts },
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            targetAudience: {
              type: Type.OBJECT,
              properties: {
                demographics: { type: Type.STRING },
                interests: { type: Type.ARRAY, items: { type: Type.STRING } },
              },
              required: ['demographics', 'interests'],
            },
            entertainmentTrends: {
              type: Type.OBJECT,
              properties: {
                movies: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      title: { type: Type.STRING },
                      relevance: { type: Type.STRING },
                      visualElements: { type: Type.ARRAY, items: { type: Type.STRING } },
                    },
                    required: ['title', 'relevance', 'visualElements'],
                  },
                },
                games: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      title: { type: Type.STRING },
                      relevance: { type: Type.STRING },
                      visualElements: { type: Type.ARRAY, items: { type: Type.STRING } },
                    },
                    required: ['title', 'relevance', 'visualElements'],
                  },
                },
                anime: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      title: { type: Type.STRING },
                      relevance: { type: Type.STRING },
                      visualElements: { type: Type.ARRAY, items: { type: Type.STRING } },
                    },
                    required: ['title', 'relevance', 'visualElements'],
                  },
                },
                aesthetics: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      name: { type: Type.STRING },
                      description: { type: Type.STRING },
                      examples: { type: Type.ARRAY, items: { type: Type.STRING } },
                    },
                    required: ['name', 'description', 'examples'],
                  },
                },
              },
              required: ['movies', 'games', 'anime', 'aesthetics'],
            },
            iconAnalysis: {
              type: Type.OBJECT,
              properties: {
                coreSubject: { type: Type.STRING },
                appFunction: { type: Type.STRING },
                currentStyle: { type: Type.STRING },
                mustPreserve: { type: Type.ARRAY, items: { type: Type.STRING } },
              },
              required: ['coreSubject', 'appFunction', 'currentStyle', 'mustPreserve'],
            },
          },
          required: ['targetAudience', 'entertainmentTrends', 'iconAnalysis'],
        },
      },
    });

    const text = response.text || '{}';
    const cleaned = text.replace(/```json\n?|```/g, '').trim();
    const data = JSON.parse(cleaned);

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
    const message = error instanceof Error ? error.message : 'Entertainment insights analysis failed';
    return res.status(500).json({ error: message });
  }
}
