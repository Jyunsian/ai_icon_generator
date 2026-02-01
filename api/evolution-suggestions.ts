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

function filterTrendsBySelection(
  trends: EntertainmentTrends,
  selectedTrends: string[]
): { filteredContext: string; selectedNames: string[] } {
  if (selectedTrends.length === 0) {
    return { filteredContext: '', selectedNames: [] };
  }

  // Frontend sends IDs like "movie-Knives Out", "anime-Demon Slayer", "aesthetic-Y2K"
  // We need to match against these prefixed formats
  const selectedSet = new Set(selectedTrends.map(t => t.toLowerCase()));
  const selectedNames: string[] = [];
  const sections: string[] = [];

  // Filter movies - match against "movie-{title}"
  const selectedMovies = trends.movies.filter(m => {
    const trendId = `movie-${m.title}`.toLowerCase();
    const match = selectedSet.has(trendId);
    if (match) selectedNames.push(m.title);
    return match;
  });
  if (selectedMovies.length > 0) {
    sections.push(`## 影視趨勢
${selectedMovies.map(m => `- ${sanitizeInput(m.title)}: ${sanitizeInput(m.relevance)}\n  視覺元素: ${m.visualElements.map(v => sanitizeInput(v)).join(', ')}`).join('\n')}`);
  }

  // Filter games - match against "game-{title}"
  const selectedGames = trends.games.filter(g => {
    const trendId = `game-${g.title}`.toLowerCase();
    const match = selectedSet.has(trendId);
    if (match) selectedNames.push(g.title);
    return match;
  });
  if (selectedGames.length > 0) {
    sections.push(`## 遊戲趨勢
${selectedGames.map(g => `- ${sanitizeInput(g.title)}: ${sanitizeInput(g.relevance)}\n  視覺元素: ${g.visualElements.map(v => sanitizeInput(v)).join(', ')}`).join('\n')}`);
  }

  // Filter anime - match against "anime-{title}"
  const selectedAnime = trends.anime.filter(a => {
    const trendId = `anime-${a.title}`.toLowerCase();
    const match = selectedSet.has(trendId);
    if (match) selectedNames.push(a.title);
    return match;
  });
  if (selectedAnime.length > 0) {
    sections.push(`## 動畫趨勢
${selectedAnime.map(a => `- ${sanitizeInput(a.title)}: ${sanitizeInput(a.relevance)}\n  視覺元素: ${a.visualElements.map(v => sanitizeInput(v)).join(', ')}`).join('\n')}`);
  }

  // Filter aesthetics - match against "aesthetic-{name}"
  const selectedAesthetics = trends.aesthetics.filter(a => {
    const trendId = `aesthetic-${a.name}`.toLowerCase();
    const match = selectedSet.has(trendId);
    if (match) selectedNames.push(a.name);
    return match;
  });
  if (selectedAesthetics.length > 0) {
    sections.push(`## 美學潮流
${selectedAesthetics.map(a => `- ${sanitizeInput(a.name)}: ${sanitizeInput(a.description)}\n  例子: ${a.examples.map(e => sanitizeInput(e)).join(', ')}`).join('\n')}`);
  }

  return { filteredContext: sections.join('\n\n'), selectedNames };
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

    const { iconAnalysis, entertainmentTrends, selectedTrends = [] } = body;

    // Sanitize user-provided strings before using in prompt
    const coreSubject = sanitizeInput(iconAnalysis.coreSubject);
    const appFunction = sanitizeInput(iconAnalysis.appFunction);
    const currentStyle = sanitizeInput(iconAnalysis.currentStyle);
    const mustPreserve = iconAnalysis.mustPreserve.map(s => sanitizeInput(s)).filter(Boolean);

    const ai = new GoogleGenAI({ apiKey });

    // Filter trends to only include user-selected ones
    const { filteredContext, selectedNames } = filterTrendsBySelection(
      entertainmentTrends,
      selectedTrends
    );

    // Build prompt based on whether user selected specific trends
    const hasSelection = selectedNames.length > 0;

    const prompt = hasSelection
      ? `你是一位創意總監與 Icon 設計專家。

基於用戶選擇的娛樂趨勢，為這個 App Icon 提出一個統一的演化方向建議。

## 原 Icon 分析
- 核心主體：${coreSubject}
- App 功能：${appFunction}
- 現有風格：${currentStyle}
- 必須保留的元素：${mustPreserve.join(', ')}

## 用戶選擇的趨勢
${filteredContext}

請提出一個整合性的演化建議，將所有選定趨勢的視覺元素融合成一個統一且協調的設計方向。

要求：
1. 不要分開描述各個趨勢的影響，而是將它們融合成一個連貫的演化概念
2. 具體描述視覺效果（色彩、光影、質感、元素等）
3. 解釋這個方向如何保留 Icon 的核心識別同時帶來新鮮感
4. 提供 3-5 個關鍵視覺元素作為設計指引

## 功能守護提醒
最後，請提醒用戶在演化過程中應該保留哪些元素，以確保：
1. 用戶仍能認出這是同一個 App
2. Icon 仍能清楚傳達 App 的功能

請返回 JSON 格式的建議。`
      : `你是一位創意總監與 Icon 設計專家。

用戶尚未選擇任何特定趨勢，請根據 Icon 的特性提供一個通用的品質提升建議。

## 原 Icon 分析
- 核心主體：${coreSubject}
- App 功能：${appFunction}
- 現有風格：${currentStyle}
- 必須保留的元素：${mustPreserve.join(', ')}

請提出一個品質提升的建議，專注於：
1. 提升視覺精緻度和現代感
2. 優化光影和材質表現
3. 增強色彩層次和對比
4. 保持核心識別元素

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
            suggestion: {
              type: Type.OBJECT,
              properties: {
                evolutionDirection: { type: Type.STRING },
                rationale: { type: Type.STRING },
                keyElements: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING },
                },
              },
              required: ['evolutionDirection', 'rationale', 'keyElements'],
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
          required: ['suggestion', 'functionGuard'],
        },
      },
    });

    const text = response.text || '{}';
    const cleaned = text.replace(/```json\n?|```/g, '').trim();
    const data = JSON.parse(cleaned);

    // Add selected trends info to response for display
    return res.status(200).json({
      ...data,
      selectedTrendNames: selectedNames,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Evolution suggestions generation failed';
    return res.status(500).json({ error: message });
  }
}
