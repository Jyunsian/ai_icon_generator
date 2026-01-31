import type { VercelRequest, VercelResponse } from '@vercel/node';
import { GoogleGenAI, Type } from '@google/genai';
import { sanitizeInput, type PsychographicProfile } from './utils/validators';

interface TrendsRequestBody {
  vertical: string;
  demographics: string;
  appName?: string;
  psychographicProfile?: PsychographicProfile;
  features?: string[];
  context?: string;
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
    const body = req.body as TrendsRequestBody;
    const vertical = sanitizeInput(body.vertical);
    const demographics = sanitizeInput(body.demographics);
    const appName = body.appName ? sanitizeInput(body.appName) : undefined;
    const psychographicProfile = body.psychographicProfile;
    const features = body.features?.map((f) => sanitizeInput(f));

    if (!vertical || !demographics) {
      return res.status(400).json({ error: 'Vertical and demographics required' });
    }

    const ai = new GoogleGenAI({ apiKey });

    // Build context-aware prompt
    const appContext = appName ? `App: ${appName}` : 'App: Unknown';
    const emotionalWhy = psychographicProfile?.emotionalMotivation || 'Not specified';
    const functionalWhy = psychographicProfile?.functionalMotivation || 'Not specified';
    const coreFeatures = features?.length ? features.join(', ') : 'Not specified';

    const response = await ai.models.generateContent({
      model: 'gemini-2.0-flash',
      contents: `Act as a Cultural Media & Market Trend Analyst.

    APP CONTEXT:
    - ${appContext}
    - Vertical: ${vertical}
    - Target Audience: ${demographics}
    - User's Emotional Why: ${emotionalWhy}
    - User's Functional Why: ${functionalWhy}
    - Core Features: ${coreFeatures}

    RESEARCH TASKS (last 30 days):

    1. AUDIENCE-SPECIFIC CONTENT:
       What movies, shows, games, and IPs are trending with ${demographics}?
       Be SPECIFIC - name actual titles.

    2. VISUAL TRENDS:
       What aesthetic movements dominate this audience's visual diet?
       (e.g., "Y2K revival", "clean minimalism", "cottagecore", "cyberpunk", "dopamine decor")

    3. VIRAL HOOKS:
       What visual moments from trending content could inspire icon design?
       How do these connect to "${emotionalWhy}"?

    4. SUBCULTURE OVERLAP:
       What communities/fandoms overlap with ${vertical} users?
       What visual language do they share?

    Return structured arrays, NOT markdown text:
    - entertainmentNarrative: array of categories (e.g., "Movies/Shows", "Games", "IPs") each with title/description items
    - subcultureOverlap: array of communities with their visual language
    - visualTrends: array of trends with descriptions

    Do NOT use markdown formatting like asterisks or bullet points in string values.`,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            subcultureOverlap: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  community: { type: Type.STRING },
                  visualLanguage: { type: Type.STRING },
                },
                required: ['community', 'visualLanguage'],
              },
            },
            visualTrends: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  trend: { type: Type.STRING },
                  description: { type: Type.STRING },
                },
                required: ['trend', 'description'],
              },
            },
            sentimentKeywords: { type: Type.ARRAY, items: { type: Type.STRING } },
            entertainmentNarrative: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  category: { type: Type.STRING },
                  items: {
                    type: Type.ARRAY,
                    items: {
                      type: Type.OBJECT,
                      properties: {
                        title: { type: Type.STRING },
                        description: { type: Type.STRING },
                      },
                      required: ['title', 'description'],
                    },
                  },
                },
                required: ['category', 'items'],
              },
            },
            methodologyReasoning: { type: Type.STRING },
          },
          required: [
            'subcultureOverlap',
            'visualTrends',
            'sentimentKeywords',
            'entertainmentNarrative',
            'methodologyReasoning',
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
    console.error('Trends synthesis error:', error);
    const message = error instanceof Error ? error.message : 'Trend synthesis failed';
    return res.status(500).json({ error: message });
  }
}
