import type {
  AnalysisResult,
  TrendSynthesis,
  CreativeBrief,
  PsychographicProfile,
  EntertainmentInsights,
  EvolutionSuggestions,
  SelectedDimensions,
  IconAnalysis,
  EntertainmentTrends,
} from '../types';

interface ScreenshotInput {
  data: string;
  mimeType: string;
}

interface ApiError {
  error: string;
}

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const errorData = (await response.json().catch(() => ({}))) as ApiError;
    throw new Error(errorData.error || `Request failed with status ${response.status}`);
  }
  return response.json() as Promise<T>;
}

// Legacy API functions (kept for backwards compatibility)
export async function analyzeAppMetadata(
  input: string,
  screenshots: ScreenshotInput[] = [],
  context?: string
): Promise<AnalysisResult> {
  const response = await fetch('/api/analyze', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ input, screenshots, context }),
  });
  return handleResponse<AnalysisResult>(response);
}

export async function synthesizeTrends(
  vertical: string,
  demographics: string,
  appName?: string,
  psychographicProfile?: PsychographicProfile,
  features?: string[],
  context?: string
): Promise<TrendSynthesis> {
  const response = await fetch('/api/trends', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      vertical,
      demographics,
      appName,
      psychographicProfile,
      features,
      context,
    }),
  });
  return handleResponse<TrendSynthesis>(response);
}

export async function createBriefs(
  analysis: AnalysisResult,
  trends: TrendSynthesis,
  context?: string
): Promise<CreativeBrief[]> {
  const response = await fetch('/api/briefs', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ analysis, trends, context }),
  });
  return handleResponse<CreativeBrief[]>(response);
}

export async function generateIcon(
  prompt: string,
  size: '1K' | '2K' | '4K',
  referenceImage?: ScreenshotInput
): Promise<string> {
  const response = await fetch('/api/generate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ prompt, size, referenceImage }),
  });

  const data = await handleResponse<{ imageData: string; mimeType: string }>(response);
  return `data:${data.mimeType};base64,${data.imageData}`;
}

// New Entertainment Insights Flow API functions

export interface EntertainmentInsightsParams {
  // Option A: Play Store URL (auto-fetch)
  playStoreUrl?: string;
  // Option B: Manual input
  appIcon?: string;
  appIconMimeType?: string;
  appName?: string;
  appCategory?: string;
  appDescription?: string;
}

export async function getEntertainmentInsights(
  params: EntertainmentInsightsParams
): Promise<EntertainmentInsights> {
  const response = await fetch('/api/entertainment-insights', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  });
  return handleResponse<EntertainmentInsights>(response);
}

export async function getEvolutionSuggestions(
  iconAnalysis: IconAnalysis,
  entertainmentTrends: EntertainmentTrends,
  selectedTrends?: string[]
): Promise<EvolutionSuggestions> {
  const response = await fetch('/api/evolution-suggestions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      iconAnalysis,
      entertainmentTrends,
      selectedTrends,
    }),
  });
  return handleResponse<EvolutionSuggestions>(response);
}

export async function generateEvolutionIcon(
  referenceImage: ScreenshotInput,
  selectedDimensions: SelectedDimensions,
  iconAnalysis?: IconAnalysis,
  functionGuard?: string[]
): Promise<string> {
  const response = await fetch('/api/generate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      prompt: '',
      size: '2K',
      referenceImage,
      evolutionMode: true,
      selectedDimensions,
      iconAnalysis,
      functionGuard,
    }),
  });

  const data = await handleResponse<{ imageData: string; mimeType: string }>(response);
  // Return raw base64 (consistent with internal handling in EvolutionCustomizer)
  return data.imageData;
}
