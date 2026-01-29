
export interface GroundingSource {
  title: string;
  uri: string;
}

export interface AnalysisResult {
  vertical: string;
  demographics: string;
  features: string[];
  competitors: { name: string; colorPalette: string[]; style: string }[];
  psychographicProfile: string;
  visualDna?: string;
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

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
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
