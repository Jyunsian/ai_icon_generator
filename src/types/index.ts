export interface GroundingSource {
  title: string;
  uri: string;
}

export interface Competitor {
  name: string;
  colorPalette: string[];
  style: string;
}

// Image classification for distinguishing seed icons from screenshots
export type ImageClassification = 'original_icon' | 'app_screenshot' | 'reference';

export interface ClassifiedImage {
  data: string;
  mimeType: string;
  preview: string;
  classification: ImageClassification;
  source?: 'upload' | 'playstore';
}

// Structured psychographic profile
export interface PsychographicProfile {
  functionalMotivation: string;
  emotionalMotivation: string;
  socialMotivation: string;
  summary: string;
}

// Seed icon analysis for evolution-based generation
export interface SeedIconAnalysis {
  identified: boolean;
  screenshotIndex?: number;
  primaryMetaphor: string;
  colorPalette: string[];
  shapeLanguage: string;
  lightingStyle: string;
  mustPreserve: string[];
}

export interface AnalysisResult {
  appName?: string;
  appCategory?: string;
  vertical: string;
  demographics: string;
  features: string[];
  competitors: Competitor[];
  psychographicProfile: PsychographicProfile;
  visualDna?: string;
  seedIconAnalysis?: SeedIconAnalysis;
  sources?: GroundingSource[];
}

export interface TrendSynthesis {
  subcultureOverlap: string;
  visualTrends: string;
  sentimentKeywords: string[];
  methodologyReasoning?: string;
  entertainmentNarrative?: string;
  sources?: GroundingSource[];
}

export interface CreativeBrief {
  id: string;
  directionName: string;
  theWhy: string;
  designThesis?: string;
  prompt: string;
  suggestedSize: '1K' | '2K' | '4K';
  generatedImage?: string;
  ctrRationale: string;
  cvrRationale: string;
  competitorDifferentiation: string;
}

export interface ExploreItem {
  id: string;
  title: string;
  category: string;
  style: string;
  imageUrl: string;
  author: string;
  isFeatured: boolean;
}

export interface ScreenshotFile {
  data: string;
  mimeType: string;
  preview: string;
}

export type AppState =
  | 'IDLE'
  | 'ANALYZING'
  | 'ANALYSIS_REVIEW'
  | 'SYNTHESIZING'
  | 'TRENDS_REVIEW'
  | 'BRIEFING'
  | 'BRIEFS_REVIEW'
  | 'COMPLETE';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface Toast {
  id: string;
  type: ToastType;
  message: string;
  duration?: number;
}

// Window augmentation for aistudio
declare global {
  interface Window {
    aistudio?: {
      openSelectKey: () => Promise<void>;
      hasSelectedApiKey: () => Promise<boolean>;
    };
  }
}
