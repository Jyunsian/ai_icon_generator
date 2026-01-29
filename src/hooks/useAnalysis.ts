import { useState, useCallback } from 'react';
import type { AnalysisResult, TrendSynthesis, CreativeBrief, ScreenshotFile, AppState, TrendSelection, TrendCategory } from '../types';
import * as api from '../services/api';

const defaultTrendSelection: TrendSelection = {
  entertainmentNarrative: true,
  sentimentKeywords: true,
  subcultureOverlap: true,
  visualTrends: true,
};

const defaultTrendOrder: TrendCategory[] = [
  'entertainmentNarrative',
  'sentimentKeywords',
  'subcultureOverlap',
  'visualTrends',
];

interface AnalysisState {
  status: AppState;
  analysis: AnalysisResult | null;
  trends: TrendSynthesis | null;
  briefs: CreativeBrief[];
  screenshots: ScreenshotFile[];
  appInput: string;
  isExecutingAll: boolean;
  trendSelection: TrendSelection;
  trendOrder: TrendCategory[];
}

interface UseAnalysisReturn extends AnalysisState {
  setAppInput: (input: string) => void;
  setScreenshots: React.Dispatch<React.SetStateAction<ScreenshotFile[]>>;
  addScreenshot: (file: File) => void;
  removeScreenshot: (index: number) => void;
  startAnalysis: () => Promise<void>;
  startTrends: () => Promise<void>;
  startBriefing: () => Promise<void>;
  generateImage: (briefId: string) => Promise<void>;
  updateBriefPrompt: (briefId: string, newPrompt: string) => void;
  regenerateImage: (briefId: string, newPrompt: string) => Promise<void>;
  executeAll: () => Promise<void>;
  reset: () => void;
  toggleTrendCategory: (category: keyof TrendSelection) => void;
  reorderTrends: (newOrder: TrendCategory[]) => void;
}

const initialState: AnalysisState = {
  status: 'IDLE',
  analysis: null,
  trends: null,
  briefs: [],
  screenshots: [],
  appInput: '',
  isExecutingAll: false,
  trendSelection: defaultTrendSelection,
  trendOrder: defaultTrendOrder,
};

export function useAnalysis(
  onError: (message: string) => void,
  onSuccess?: (message: string) => void
): UseAnalysisReturn {
  const [state, setState] = useState<AnalysisState>(initialState);

  const setAppInput = useCallback((input: string) => {
    setState((prev) => ({ ...prev, appInput: input }));
  }, []);

  const setScreenshots = useCallback(
    (updater: React.SetStateAction<ScreenshotFile[]>) => {
      setState((prev) => ({
        ...prev,
        screenshots: typeof updater === 'function' ? updater(prev.screenshots) : updater,
      }));
    },
    []
  );

  const addScreenshot = useCallback((file: File) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64 = (reader.result as string).split(',')[1];
      setState((prev) => ({
        ...prev,
        screenshots: [
          ...prev.screenshots,
          {
            data: base64,
            mimeType: file.type,
            preview: reader.result as string,
          },
        ],
      }));
    };
    reader.readAsDataURL(file);
  }, []);

  const removeScreenshot = useCallback((index: number) => {
    setState((prev) => ({
      ...prev,
      screenshots: prev.screenshots.filter((_, i) => i !== index),
    }));
  }, []);

  const startAnalysis = useCallback(async () => {
    if (!state.appInput.trim() && state.screenshots.length === 0) {
      onError('Please enter a description or upload screenshots');
      return;
    }

    setState((prev) => ({ ...prev, status: 'ANALYZING' }));

    try {
      const screenshotData = state.screenshots.map((s) => ({
        data: s.data,
        mimeType: s.mimeType,
      }));
      const result = await api.analyzeAppMetadata(state.appInput, screenshotData);
      setState((prev) => ({ ...prev, analysis: result, status: 'ANALYSIS_REVIEW' }));
      onSuccess?.('Analysis complete');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Analysis failed';
      onError(message);
      setState((prev) => ({ ...prev, status: 'IDLE' }));
    }
  }, [state.appInput, state.screenshots, onError, onSuccess]);

  const startTrends = useCallback(async () => {
    if (!state.analysis) {
      onError('Analysis required before trends');
      return;
    }

    setState((prev) => ({ ...prev, status: 'SYNTHESIZING' }));

    try {
      // Pass full context to trends API for better research
      const result = await api.synthesizeTrends(
        state.analysis.vertical,
        state.analysis.demographics,
        state.analysis.appName,
        state.analysis.psychographicProfile,
        state.analysis.features
      );
      setState((prev) => ({ ...prev, trends: result, status: 'TRENDS_REVIEW' }));
      onSuccess?.('Trend synthesis complete');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Trend synthesis failed';
      onError(message);
      setState((prev) => ({ ...prev, status: 'ANALYSIS_REVIEW' }));
    }
  }, [state.analysis, onError, onSuccess]);

  const toggleTrendCategory = useCallback((category: keyof TrendSelection) => {
    setState((prev) => ({
      ...prev,
      trendSelection: {
        ...prev.trendSelection,
        [category]: !prev.trendSelection[category],
      },
    }));
  }, []);

  const reorderTrends = useCallback((newOrder: TrendCategory[]) => {
    setState((prev) => ({ ...prev, trendOrder: newOrder }));
  }, []);

  const startBriefing = useCallback(async () => {
    if (!state.analysis || !state.trends) {
      onError('Analysis and trends required before briefing');
      return;
    }

    setState((prev) => ({ ...prev, status: 'BRIEFING' }));

    try {
      // Filter trends based on selection
      const filteredTrends: TrendSynthesis = {
        entertainmentNarrative: state.trendSelection.entertainmentNarrative
          ? state.trends.entertainmentNarrative
          : [],
        sentimentKeywords: state.trendSelection.sentimentKeywords
          ? state.trends.sentimentKeywords
          : [],
        subcultureOverlap: state.trendSelection.subcultureOverlap
          ? state.trends.subcultureOverlap
          : [],
        visualTrends: state.trendSelection.visualTrends
          ? state.trends.visualTrends
          : [],
        methodologyReasoning: state.trends.methodologyReasoning,
        sources: state.trends.sources,
      };

      const result = await api.createBriefs(state.analysis, filteredTrends);
      setState((prev) => ({ ...prev, briefs: result, status: 'BRIEFS_REVIEW' }));
      onSuccess?.('Creative briefs generated');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Briefing failed';
      onError(message);
      setState((prev) => ({ ...prev, status: 'TRENDS_REVIEW' }));
    }
  }, [state.analysis, state.trends, state.trendSelection, onError, onSuccess]);

  const generateImage = useCallback(
    async (briefId: string) => {
      const brief = state.briefs.find((b) => b.id === briefId);
      if (!brief) return;

      // Check for aistudio key selector
      if (window.aistudio) {
        const hasKey = await window.aistudio.hasSelectedApiKey();
        if (!hasKey) {
          await window.aistudio.openSelectKey();
        }
      }

      // Set loading state
      setState((prev) => ({
        ...prev,
        briefs: prev.briefs.map((b) =>
          b.id === briefId ? { ...b, generatedImage: 'LOADING' } : b
        ),
      }));

      try {
        // Find seed icon specifically - prefer the identified seed, fallback to first screenshot
        let refImg: { data: string; mimeType: string } | undefined;
        if (state.screenshots.length > 0) {
          const seedIndex = state.analysis?.seedIconAnalysis?.identified
            ? state.analysis.seedIconAnalysis.screenshotIndex ?? 0
            : 0;
          const seedScreenshot = state.screenshots[seedIndex] || state.screenshots[0];
          refImg = { data: seedScreenshot.data, mimeType: seedScreenshot.mimeType };
        }

        const imageUrl = await api.generateIcon(brief.prompt, brief.suggestedSize, refImg);

        setState((prev) => ({
          ...prev,
          briefs: prev.briefs.map((b) =>
            b.id === briefId ? { ...b, generatedImage: imageUrl } : b
          ),
        }));
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Image generation failed';
        onError(`Render Error: ${message}`);
        // Only clear LOADING state, preserve existing image
        setState((prev) => ({
          ...prev,
          briefs: prev.briefs.map((b) =>
            b.id === briefId && b.generatedImage === 'LOADING'
              ? { ...b, generatedImage: undefined }
              : b
          ),
        }));
      }
    },
    [state.briefs, state.screenshots, onError]
  );

  const updateBriefPrompt = useCallback((briefId: string, newPrompt: string) => {
    setState((prev) => ({
      ...prev,
      briefs: prev.briefs.map((b) =>
        b.id === briefId ? { ...b, prompt: newPrompt } : b
      ),
    }));
  }, []);

  const regenerateImage = useCallback(
    async (briefId: string, newPrompt: string) => {
      // Store previous image before setting LOADING state
      const previousImage = state.briefs.find((b) => b.id === briefId)?.generatedImage;

      // Update the prompt and set loading state
      setState((prev) => ({
        ...prev,
        briefs: prev.briefs.map((b) =>
          b.id === briefId ? { ...b, prompt: newPrompt, generatedImage: 'LOADING' } : b
        ),
      }));

      // Check for aistudio key selector
      if (window.aistudio) {
        const hasKey = await window.aistudio.hasSelectedApiKey();
        if (!hasKey) {
          await window.aistudio.openSelectKey();
        }
      }

      try {
        const brief = state.briefs.find((b) => b.id === briefId);
        if (!brief) return;

        // Find seed icon specifically
        let refImg: { data: string; mimeType: string } | undefined;
        if (state.screenshots.length > 0) {
          const seedIndex = state.analysis?.seedIconAnalysis?.identified
            ? state.analysis.seedIconAnalysis.screenshotIndex ?? 0
            : 0;
          const seedScreenshot = state.screenshots[seedIndex] || state.screenshots[0];
          refImg = { data: seedScreenshot.data, mimeType: seedScreenshot.mimeType };
        }

        const imageUrl = await api.generateIcon(newPrompt, brief.suggestedSize, refImg);

        setState((prev) => ({
          ...prev,
          briefs: prev.briefs.map((b) =>
            b.id === briefId ? { ...b, generatedImage: imageUrl } : b
          ),
        }));
        onSuccess?.('Image regenerated');
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Image generation failed';
        onError(`Render Error: ${message}`);
        // Restore the previous image on error
        setState((prev) => ({
          ...prev,
          briefs: prev.briefs.map((b) =>
            b.id === briefId ? { ...b, generatedImage: previousImage } : b
          ),
        }));
      }
    },
    [state.briefs, state.screenshots, state.analysis, onError, onSuccess]
  );

  const executeAll = useCallback(async () => {
    if (state.isExecutingAll) return;

    setState((prev) => ({ ...prev, isExecutingAll: true }));

    for (const brief of state.briefs) {
      if (!brief.generatedImage) {
        await generateImage(brief.id);
      }
    }

    setState((prev) => ({ ...prev, isExecutingAll: false }));
    onSuccess?.('All images rendered');
  }, [state.briefs, state.isExecutingAll, generateImage, onSuccess]);

  const reset = useCallback(() => {
    setState(initialState);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  return {
    ...state,
    setAppInput,
    setScreenshots,
    addScreenshot,
    removeScreenshot,
    startAnalysis,
    startTrends,
    startBriefing,
    generateImage,
    updateBriefPrompt,
    regenerateImage,
    executeAll,
    reset,
    toggleTrendCategory,
    reorderTrends,
  };
}
