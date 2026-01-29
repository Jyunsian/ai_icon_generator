
import { GoogleGenAI, Type, GenerateContentResponse } from "@google/genai";
import { AnalysisResult, TrendSynthesis, CreativeBrief, GroundingSource, ChatMessage } from "./types";

const getAI = () => new GoogleGenAI({ apiKey: process.env.API_KEY });

const extractSources = (response: GenerateContentResponse): GroundingSource[] => {
  const sources: GroundingSource[] = [];
  const metadata = response.candidates?.[0]?.groundingMetadata;
  const chunks = metadata?.groundingChunks;
  
  if (chunks) {
    chunks.forEach((chunk: any) => {
      if (chunk.web) {
        sources.push({ 
          title: chunk.web.title || 'Source', 
          uri: chunk.web.uri 
        });
      }
    });
  }
  return sources;
};

const safeJsonParse = (text: string) => {
  try {
    const cleaned = text.replace(/```json\n?|```/g, '').trim();
    return JSON.parse(cleaned);
  } catch (e) {
    console.error("JSON Parse Error:", e, "Raw Text:", text);
    throw new Error("Failed to parse AI response. Please try again with more specific context.");
  }
};

export const analyzeAppMetadata = async (
  input: string, 
  screenshots: { data: string, mimeType: string }[] = [],
  context?: string
): Promise<AnalysisResult> => {
  const ai = getAI();
  
  const textPart = { text: `Act as a senior ASO & Product Strategist. Analyze this app based on the provided metadata/link and screenshots.
    
    METADATA/LINK: ${input}
    ${context ? `USER CONTEXT: ${context}` : ''}
    
    TASKS:
    1. Identify the Vertical (e.g., Social Utility, Photo Tool, Game).
    2. Identify the Core Functional Utility (e.g., "Downloading WhatsApp Statuses", "Photo Editing").
    3. Identify Demographics.
    4. Audit the screenshots for "Visual DNA" (colors, shapes, primary metaphors).
    5. Identify 3 visual competitors in the same category.
    6. Create a Psychographic Profile for the user's emotional "Why".
    
    Return valid JSON.` };

  const parts: any[] = [textPart];

  screenshots.forEach(s => {
    parts.push({
      inlineData: { data: s.data, mimeType: s.mimeType }
    });
  });

  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: { parts },
    config: {
      tools: [{ googleSearch: {} }],
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
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
                style: { type: Type.STRING }
              }
            }
          },
          psychographicProfile: { type: Type.STRING },
          visualDna: { type: Type.STRING }
        },
        required: ["vertical", "demographics", "features", "competitors", "psychographicProfile", "visualDna"]
      }
    }
  });

  const data = safeJsonParse(response.text || '{}');
  data.sources = extractSources(response);
  return data;
};

export const synthesizeTrends = async (vertical: string, demographics: string, context?: string): Promise<TrendSynthesis> => {
  const ai = getAI();
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Act as a Cultural Media & Market Trend Analyst. Research the LAST 30 DAYS of data for ${vertical} and ${demographics}.
    
    MANDATORY TASKS:
    1. BROAD MARKET PULSE: Identify high-level subculture overlaps and UI trends.
    
    2. SPECIFIC MEDIA INTEL: You MUST name specific titles of dramas, comics, or Netflix content currently viral in the ${demographics} segment. 
    
    3. VIRAL SOCIAL HOOKS: Identify what SPECIFIC visual moments or tropes are being clipped and shared.
    
    Return valid JSON.`,
    config: {
      tools: [{ googleSearch: {} }],
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          subcultureOverlap: { type: Type.STRING },
          visualTrends: { type: Type.STRING },
          sentimentKeywords: { type: Type.ARRAY, items: { type: Type.STRING } },
          entertainmentNarrative: { type: Type.STRING },
          methodologyReasoning: { type: Type.STRING }
        },
        required: ["subcultureOverlap", "visualTrends", "sentimentKeywords", "entertainmentNarrative", "methodologyReasoning"]
      }
    }
  });

  const data = safeJsonParse(response.text || '{}');
  data.sources = extractSources(response);
  return data;
};

export const createBriefs = async (analysis: AnalysisResult, trends: TrendSynthesis, context?: string): Promise<CreativeBrief[]> => {
  const ai = getAI();
  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-preview',
    contents: `Architect 5 Creative Directions for an app icon evolution.
    
    ORIGINAL DNA: ${analysis.visualDna}
    APP UTILITY: ${analysis.vertical} (${analysis.features.join(', ')})
    USER PSYCHOGRAPHIC: ${analysis.psychographicProfile}
    MEDIA TRENDS: ${trends.entertainmentNarrative}
    
    STRICT RULES:
    1. EVOLUTION, NOT RANDOM: The new icons MUST retain the core metaphor/utility of the original app (e.g. if it's a camera app, the camera must stay) but evolve the lighting, texture, and color based on the Media Trends.
    2. BRAND CONSISTENCY: Ensure the primary colors from the original DNA are respected or intelligently transitioned into the new aesthetic.
    3. CLEAR UTILITY: The icon must be immediately recognizable as ${analysis.vertical}.
    
    Return JSON array.`,
    config: {
      thinkingConfig: { thinkingBudget: 24000 },
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            id: { type: Type.STRING },
            directionName: { type: Type.STRING },
            theWhy: { type: Type.STRING },
            designThesis: { type: Type.STRING },
            prompt: { type: Type.STRING, description: "Detailed visual prompt for image generation. Focus on the subject's 3D form, lighting, and material." },
            suggestedSize: { type: Type.STRING, enum: ["1K", "2K", "4K"] }
          },
          required: ["id", "directionName", "theWhy", "designThesis", "prompt", "suggestedSize"]
        }
      }
    }
  });

  return safeJsonParse(response.text || '[]');
};

export const generateIcon = async (
  prompt: string, 
  size: '1K' | '2K' | '4K', 
  referenceImage?: { data: string, mimeType: string }
): Promise<string> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const imageInstruction = referenceImage 
    ? "Maintain the exact core layout, subject, and brand identity of the provided reference image. Evolve only the lighting, materials, and stylistic finish to match the following direction: "
    : "Generate a premium mobile app icon. The subject is: ";

  const parts: any[] = [];
  
  if (referenceImage) {
    parts.push({
      inlineData: { data: referenceImage.data, mimeType: referenceImage.mimeType }
    });
  }
  
  parts.push({
    text: `${imageInstruction} ${prompt}. Style: App Store icon, high fidelity, 3D render, soft global illumination, vibrant but professional colors, clean edges, centered composition, neutral or subtly gradient background.`
  });

  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-image-preview',
    contents: { parts },
    config: {
      imageConfig: {
        aspectRatio: "1:1",
        imageSize: size
      }
    }
  });

  for (const part of response.candidates?.[0]?.content?.parts || []) {
    if (part.inlineData) {
      return `data:image/png;base64,${part.inlineData.data}`;
    }
  }
  throw new Error("Generation failed to return an image.");
};
