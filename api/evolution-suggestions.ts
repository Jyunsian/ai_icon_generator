import type { VercelRequest, VercelResponse } from '@vercel/node';
import { GoogleGenAI, Type } from '@google/genai';

const MAX_STRING_LENGTH = 500;

interface IconAnalysis {
  coreSubject: string;
  appFunction: string;
  currentStyle: string;
  mustPreserve: string[];
}

interface EntertainmentTrendItem {
  title: string;
  relevance: string;
  visualElements: string[];
}

interface AestheticTrend {
  name: string;
  description: string;
  examples: string[];
}

interface EntertainmentTrends {
  movies: EntertainmentTrendItem[];
  games: EntertainmentTrendItem[];
  anime: EntertainmentTrendItem[];
  aesthetics: AestheticTrend[];
}

interface EvolutionSuggestionsRequest {
  iconAnalysis: IconAnalysis;
  entertainmentTrends: EntertainmentTrends;
  selectedTrends?: string[];
}

function sanitizeInput(input: unknown, maxLength: number = MAX_STRING_LENGTH): string {
  if (!input || typeof input !== 'string') {
    return '';
  }
  return input.trim().slice(0, maxLength).replace(/[<>]/g, '');
}

function validateIconAnalysis(obj: unknown): obj is IconAnalysis {
  if (!obj || typeof obj !== 'object') return false;
  const o = obj as Record<string, unknown>;
  return (
    typeof o.coreSubject === 'string' &&
    typeof o.appFunction === 'string' &&
    typeof o.currentStyle === 'string' &&
    Array.isArray(o.mustPreserve)
  );
}

function validateEntertainmentTrends(obj: unknown): obj is EntertainmentTrends {
  if (!obj || typeof obj !== 'object') return false;
  const o = obj as Record<string, unknown>;
  return (
    Array.isArray(o.movies) &&
    Array.isArray(o.games) &&
    Array.isArray(o.anime) &&
    Array.isArray(o.aesthetics)
  );
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
    const body = req.body as EvolutionSuggestionsRequest;

    if (!validateIconAnalysis(body.iconAnalysis)) {
      return res.status(400).json({ error: 'Invalid or missing iconAnalysis' });
    }
    if (!validateEntertainmentTrends(body.entertainmentTrends)) {
      return res.status(400).json({ error: 'Invalid or missing entertainmentTrends' });
    }

    const { iconAnalysis, entertainmentTrends, selectedTrends } = body;

    // Sanitize user-provided strings before using in prompt
    const coreSubject = sanitizeInput(iconAnalysis.coreSubject);
    const appFunction = sanitizeInput(iconAnalysis.appFunction);
    const currentStyle = sanitizeInput(iconAnalysis.currentStyle);
    const mustPreserve = iconAnalysis.mustPreserve.map(s => sanitizeInput(s)).filter(Boolean);

    const ai = new GoogleGenAI({ apiKey });

    const trendsContext = `
## 影視趨勢
${entertainmentTrends.movies.map(m => `- ${sanitizeInput(m.title)}: ${sanitizeInput(m.relevance)}\n  視覺元素: ${m.visualElements.map(v => sanitizeInput(v)).join(', ')}`).join('\n')}

## 遊戲趨勢
${entertainmentTrends.games.map(g => `- ${sanitizeInput(g.title)}: ${sanitizeInput(g.relevance)}\n  視覺元素: ${g.visualElements.map(v => sanitizeInput(v)).join(', ')}`).join('\n')}

## 動畫趨勢
${entertainmentTrends.anime.map(a => `- ${sanitizeInput(a.title)}: ${sanitizeInput(a.relevance)}\n  視覺元素: ${a.visualElements.map(v => sanitizeInput(v)).join(', ')}`).join('\n')}

## 美學潮流
${entertainmentTrends.aesthetics.map(a => `- ${sanitizeInput(a.name)}: ${sanitizeInput(a.description)}\n  例子: ${a.examples.map(e => sanitizeInput(e)).join(', ')}`).join('\n')}
`;

    const selectedTrendsContext = selectedTrends && selectedTrends.length > 0
      ? `\n用戶特別感興趣的趨勢：${selectedTrends.join(', ')}\n`
      : '';

    const prompt = `你是一位創意總監與 Icon 設計專家。

基於以下的娛樂趨勢洞察，為這個 App Icon 提出演化方向建議。

## 原 Icon 分析
- 核心主體：${coreSubject}
- App 功能：${appFunction}
- 現有風格：${currentStyle}
- 必須保留的元素：${mustPreserve.join(', ')}

## 娛樂趨勢
${trendsContext}
${selectedTrendsContext}

請在以下 4 個維度提出具體的演化建議：

### 1. 風格 (Style)
如何融入當前視覺美學潮流來改變 Icon 的整體風格？
- 給出具體的風格建議（如 Y2K 霓虹光暈、Aura 漸層、像素風等）
- 解釋為什麼這個風格會與目標用戶產生共鳴
- 提供具體的參考例子

### 2. 動作 (Pose)
可以借鑒哪些熱門 IP 的標誌性姿態或手勢？
- 給出具體的動作建議（如特定角色的手勢、表情、姿態）
- 解釋這個動作的文化意義和用戶認知度
- 提供具體的參考來源

### 3. 服裝/道具 (Costume)
可以融入哪些熱門 IP 的服裝或道具元素？
- 給出具體的服裝/道具建議
- 解釋這個元素為什麼會引起用戶共鳴
- 提供具體的參考來源

### 4. 背景/氛圍 (Mood)
如何調整背景和整體氛圍來呼應當前趨勢？
- 給出具體的氛圍建議（如漸層、光暈、場景等）
- 解釋這個氛圍如何增強 Icon 的吸引力
- 提供具體的參考例子

## 功能守護提醒
最後，請提醒用戶在演化過程中應該保留哪些元素，以確保：
1. 用戶仍能認出這是同一個 App
2. Icon 仍能清楚傳達 App 的功能

請返回 JSON 格式的建議。`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.0-flash',
      contents: { parts: [{ text: prompt }] },
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            suggestions: {
              type: Type.OBJECT,
              properties: {
                style: {
                  type: Type.OBJECT,
                  properties: {
                    recommendation: { type: Type.STRING },
                    rationale: { type: Type.STRING },
                    reference: { type: Type.STRING },
                  },
                  required: ['recommendation', 'rationale', 'reference'],
                },
                pose: {
                  type: Type.OBJECT,
                  properties: {
                    recommendation: { type: Type.STRING },
                    rationale: { type: Type.STRING },
                    reference: { type: Type.STRING },
                  },
                  required: ['recommendation', 'rationale', 'reference'],
                },
                costume: {
                  type: Type.OBJECT,
                  properties: {
                    recommendation: { type: Type.STRING },
                    rationale: { type: Type.STRING },
                    reference: { type: Type.STRING },
                  },
                  required: ['recommendation', 'rationale', 'reference'],
                },
                mood: {
                  type: Type.OBJECT,
                  properties: {
                    recommendation: { type: Type.STRING },
                    rationale: { type: Type.STRING },
                    reference: { type: Type.STRING },
                  },
                  required: ['recommendation', 'rationale', 'reference'],
                },
              },
              required: ['style', 'pose', 'costume', 'mood'],
            },
            functionGuard: {
              type: Type.OBJECT,
              properties: {
                warning: { type: Type.STRING },
                reason: { type: Type.STRING },
              },
              required: ['warning', 'reason'],
            },
          },
          required: ['suggestions', 'functionGuard'],
        },
      },
    });

    const text = response.text || '{}';
    const cleaned = text.replace(/```json\n?|```/g, '').trim();
    const data = JSON.parse(cleaned);

    return res.status(200).json(data);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Evolution suggestions generation failed';
    return res.status(500).json({ error: message });
  }
}
