import type { VercelRequest, VercelResponse } from '@vercel/node';
import { GoogleGenAI, Type } from '@google/genai';

interface PsychographicProfile {
  functionalMotivation: string;
  emotionalMotivation: string;
  socialMotivation: string;
  summary: string;
}

interface SeedIconAnalysis {
  identified: boolean;
  screenshotIndex?: number;
  primaryMetaphor: string;
  colorPalette: string[];
  shapeLanguage: string;
  lightingStyle: string;
  mustPreserve: string[];
}

interface AnalysisResult {
  appName?: string;
  appCategory?: string;
  vertical: string;
  demographics: string;
  features: string[];
  competitors: { name: string; colorPalette: string[]; style: string }[];
  psychographicProfile: PsychographicProfile;
  visualDna?: string;
  seedIconAnalysis?: SeedIconAnalysis;
}

interface EntertainmentItem {
  title: string;
  description: string;
}

interface EntertainmentCategory {
  category: string;
  items: EntertainmentItem[];
}

interface SubcultureItem {
  community: string;
  visualLanguage: string;
}

interface VisualTrendItem {
  trend: string;
  description: string;
}

interface TrendSynthesis {
  subcultureOverlap: SubcultureItem[];
  visualTrends: VisualTrendItem[];
  sentimentKeywords: string[];
  entertainmentNarrative: EntertainmentCategory[];
}

interface BriefsRequestBody {
  analysis: AnalysisResult;
  trends: TrendSynthesis;
  context?: string;
}

const MAX_INPUT_LENGTH = 2000;

function sanitizeInput(input: string): string {
  if (!input || typeof input !== 'string') {
    return '';
  }
  return input
    .trim()
    .slice(0, MAX_INPUT_LENGTH)
    .replace(/[<>]/g, '');
}

function validateAnalysis(analysis: unknown): analysis is AnalysisResult {
  if (!analysis || typeof analysis !== 'object') return false;
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

function validateTrends(trends: unknown): trends is TrendSynthesis {
  if (!trends || typeof trends !== 'object') return false;
  const t = trends as Record<string, unknown>;
  return (
    Array.isArray(t.subcultureOverlap) &&
    Array.isArray(t.visualTrends) &&
    Array.isArray(t.sentimentKeywords) &&
    Array.isArray(t.entertainmentNarrative)
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
    const body = req.body as BriefsRequestBody;

    if (!validateAnalysis(body.analysis)) {
      return res.status(400).json({ error: 'Invalid analysis data' });
    }

    if (!validateTrends(body.trends)) {
      return res.status(400).json({ error: 'Invalid trends data' });
    }

    const analysis = body.analysis;
    const trends = body.trends;

    const ai = new GoogleGenAI({ apiKey });

    // Build seed icon context
    const seedContext = analysis.seedIconAnalysis?.identified
      ? `
=== SEED ICON (EVOLVE FROM THIS) ===
Metaphor: ${sanitizeInput(analysis.seedIconAnalysis.primaryMetaphor)}
Colors: ${analysis.seedIconAnalysis.colorPalette.map((c) => sanitizeInput(c)).join(', ')}
Shape Language: ${sanitizeInput(analysis.seedIconAnalysis.shapeLanguage)}
Lighting: ${sanitizeInput(analysis.seedIconAnalysis.lightingStyle)}
MUST PRESERVE: ${analysis.seedIconAnalysis.mustPreserve.map((p) => sanitizeInput(p)).join(', ')}
`
      : `
=== VISUAL DNA (BASE REFERENCE) ===
${sanitizeInput(analysis.visualDna || 'No visual DNA available')}
`;

    // Build competitor context
    const competitorContext = analysis.competitors
      .map(
        (c, i) => `
${i + 1}. ${sanitizeInput(c.name)}:
   - Colors: ${c.colorPalette.map((col) => sanitizeInput(col)).join(', ')}
   - Style: ${sanitizeInput(c.style)}`
      )
      .join('');

    // Handle both string and object psychographic profiles
    const psychProfile =
      typeof analysis.psychographicProfile === 'string'
        ? { summary: analysis.psychographicProfile, emotionalMotivation: '', functionalMotivation: '', socialMotivation: '' }
        : analysis.psychographicProfile;

    const response = await ai.models.generateContent({
      model: 'gemini-2.0-flash',
      contents: `Architect 5 Creative Directions for app icon EVOLUTION.

${seedContext}

=== COMPETITOR LANDSCAPE (DIFFERENTIATE FROM) ===${competitorContext}

=== USER PSYCHOGRAPHIC ===
Emotional Why: ${sanitizeInput(psychProfile.emotionalMotivation || psychProfile.summary)}
Functional Why: ${sanitizeInput(psychProfile.functionalMotivation || '')}
Social Why: ${sanitizeInput(psychProfile.socialMotivation || '')}
Summary: ${sanitizeInput(psychProfile.summary)}

=== APP CONTEXT ===
Name: ${sanitizeInput(analysis.appName || 'Unknown')}
Vertical: ${sanitizeInput(analysis.vertical)}
Core Features: ${analysis.features.map((f) => sanitizeInput(f)).join(', ')}

=== TRENDING INSPIRATION ===
${trends.entertainmentNarrative.length > 0 ? `Entertainment Narrative: ${trends.entertainmentNarrative.map((cat) => `${cat.category}: ${cat.items.map((i) => `${i.title} - ${i.description}`).join('; ')}`).join(' | ')}` : ''}
${trends.visualTrends.length > 0 ? `Visual Trends: ${trends.visualTrends.map((t) => `${t.trend}: ${t.description}`).join('; ')}` : ''}
${trends.subcultureOverlap.length > 0 ? `Subculture Overlap: ${trends.subcultureOverlap.map((s) => `${s.community}: ${s.visualLanguage}`).join('; ')}` : ''}
${trends.sentimentKeywords.length > 0 ? `Sentiment Keywords: ${trends.sentimentKeywords.join(', ')}` : ''}

=== STRICT RULES ===
1. EVOLUTION, NOT RANDOM: Keep the seed icon's core metaphor intact, evolve style.
2. DIFFERENTIATION: Explicitly AVOID competitor color combos. Stand apart.
3. TREND INTEGRATION: Incorporate at least one trending visual element per direction.
4. CLEAR UTILITY: Icon must be immediately recognizable as ${sanitizeInput(analysis.vertical)}.
5. BRAND CONSISTENCY: Preserve primary colors from seed or transition intelligently.

=== FOR EACH DIRECTION PROVIDE ===
- directionName: Creative name for the direction
- theWhy: Connect to user psychographic - why this resonates emotionally
- designThesis: Brief design philosophy
- prompt: Detailed visual prompt for image generation (subject, form, lighting, materials)
- ctrRationale: Why this drives MORE CLICKS (specific visual hooks that grab attention)
- cvrRationale: Why this drives MORE CONVERSIONS (trust signals, quality perception)
- competitorDifferentiation: How it stands apart from the competitors listed above

Return JSON array of 5 directions.`,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              id: { type: Type.STRING },
              directionName: { type: Type.STRING },
              theWhy: { type: Type.STRING },
              designThesis: { type: Type.STRING },
              prompt: {
                type: Type.STRING,
                description:
                  'Detailed visual prompt for image generation. Focus on the subject\'s 3D form, lighting, and material.',
              },
              suggestedSize: { type: Type.STRING, enum: ['1K', '2K', '4K'] },
              ctrRationale: {
                type: Type.STRING,
                description: 'Why this direction will drive more clicks - specific visual hooks.',
              },
              cvrRationale: {
                type: Type.STRING,
                description: 'Why this direction will drive more conversions - trust and quality signals.',
              },
              competitorDifferentiation: {
                type: Type.STRING,
                description: 'How this direction stands apart from listed competitors.',
              },
            },
            required: [
              'id',
              'directionName',
              'theWhy',
              'designThesis',
              'prompt',
              'suggestedSize',
              'ctrRationale',
              'cvrRationale',
              'competitorDifferentiation',
            ],
          },
        },
      },
    });

    const text = response.text || '[]';
    const cleaned = text.replace(/```json\n?|```/g, '').trim();
    const data = JSON.parse(cleaned);

    return res.status(200).json(data);
  } catch (error) {
    console.error('Briefs creation error:', error);
    const message = error instanceof Error ? error.message : 'Brief creation failed';
    return res.status(500).json({ error: message });
  }
}
