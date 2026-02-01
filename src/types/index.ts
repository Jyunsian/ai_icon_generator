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

export interface EntertainmentItem {
  title: string;
  description: string;
}

export interface EntertainmentCategory {
  category: string;
  items: EntertainmentItem[];
}

export interface SubcultureItem {
  community: string;
  visualLanguage: string;
}

export interface VisualTrendItem {
  trend: string;
  description: string;
}

export interface TrendSynthesis {
  subcultureOverlap: SubcultureItem[];
  visualTrends: VisualTrendItem[];
  sentimentKeywords: string[];
  methodologyReasoning?: string;
  entertainmentNarrative: EntertainmentCategory[];
  sources?: GroundingSource[];
}

export interface TrendSelection {
  entertainmentNarrative: boolean;
  sentimentKeywords: boolean;
  subcultureOverlap: boolean;
  visualTrends: boolean;
}

export type TrendCategory = keyof TrendSelection;

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

// ============================================
// Entertainment Insights Flow Types (New Flow)
// ============================================

export interface EntertainmentTrendItem {
  title: string;
  relevance: string;
  visualElements: string[];
}

export interface AestheticTrend {
  name: string;
  description: string;
  examples: string[];
}

export interface EntertainmentTrends {
  movies: EntertainmentTrendItem[];
  games: EntertainmentTrendItem[];
  anime: EntertainmentTrendItem[];
  aesthetics: AestheticTrend[];
}

export interface IconAnalysis {
  coreSubject: string;
  appFunction: string;
  currentStyle: string;
  mustPreserve: string[];
}

export interface TargetAudience {
  demographics: string;
  interests: string[];
}

export interface EntertainmentInsights {
  targetAudience: TargetAudience;
  entertainmentTrends: EntertainmentTrends;
  iconAnalysis: IconAnalysis;
  sources?: GroundingSource[];
  fetchedIcon?: {
    data: string;
    mimeType: string;
  };
}

export interface DimensionSuggestion {
  recommendation: string;
  rationale: string;
  reference: string;
}

export interface EvolutionSuggestions {
  suggestions: {
    style: DimensionSuggestion;
    pose: DimensionSuggestion;
    costume: DimensionSuggestion;
    mood: DimensionSuggestion;
  };
  functionGuard: {
    warning: string;
    reason: string;
  };
}

// New unified suggestion types (simplified flow)
export interface UnifiedSuggestion {
  evolutionDirection: string;
  rationale: string;
  keyElements: string[];
}

export interface EvolutionSuggestionsV2 {
  suggestion: UnifiedSuggestion;
  functionGuard: {
    warning: string;
    reason: string;
  };
}

export type EvolutionDimension = 'style' | 'pose' | 'costume' | 'mood';

export interface SelectedDimension {
  enabled: boolean;
  value: string;
}

export interface SelectedDimensions {
  style: SelectedDimension;
  pose: SelectedDimension;
  costume: SelectedDimension;
  mood: SelectedDimension;
}

export interface EvolutionInput {
  appIcon: string;
  appName: string;
  appCategory: string;
  appDescription: string;
}

// AppState - Combined for backwards compatibility with old components
// New flow states: ANALYZING_ENTERTAINMENT, INSIGHTS_REVIEW, SUGGESTING, CUSTOMIZATION, GENERATING
// Legacy states (kept for old components): ANALYZING, ANALYSIS_REVIEW, SYNTHESIZING, TRENDS_REVIEW, BRIEFING, BRIEFS_REVIEW
export type AppState =
  | 'IDLE'
  // New entertainment insights flow
  | 'ANALYZING_ENTERTAINMENT'
  | 'INSIGHTS_REVIEW'
  | 'SUGGESTING'
  | 'CUSTOMIZATION'
  | 'GENERATING'
  | 'COMPLETE'
  // Legacy states (for backwards compatibility)
  | 'ANALYZING'
  | 'ANALYSIS_REVIEW'
  | 'SYNTHESIZING'
  | 'TRENDS_REVIEW'
  | 'BRIEFING'
  | 'BRIEFS_REVIEW';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

// Rendering style types for configurable output requirements
export type RenderingStyleId =
  | 'match_seed'
  | '3d_render'
  | 'flat'
  | 'minimalist'
  | 'glassmorphism'
  | 'neo_brutalism'
  | 'claymorphism'
  | 'pixel_art'
  | 'isometric';

export interface RenderingStyle {
  id: RenderingStyleId;
  name: string;
  description: string;
  promptFragment: string;
}

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
