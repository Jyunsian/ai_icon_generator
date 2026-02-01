import { useState, useCallback } from 'react';
import type {
  ScreenshotFile,
  AppState,
  EntertainmentInsights,
  UnifiedSuggestion,
  SelectedDimensions,
  EvolutionDimension,
  EvolutionInput,
  IconAnalysis,
} from '../types';
import * as api from '../services/api';
import { compressAndConvert } from '../lib/imageCompression';

const defaultSelectedDimensions: SelectedDimensions = {
  style: { enabled: true, value: '' },
  pose: { enabled: false, value: '' },
  costume: { enabled: false, value: '' },
  mood: { enabled: true, value: '' },
};

const defaultEvolutionInput: EvolutionInput = {
  appIcon: '',
  appName: '',
  appCategory: '',
  appDescription: '',
};

interface AnalysisState {
  status: AppState;
  screenshots: ScreenshotFile[];
  appInput: string;
  // New entertainment insights flow
  evolutionInput: EvolutionInput;
  entertainmentInsights: EntertainmentInsights | null;
  // New unified suggestion flow
  unifiedSuggestion: UnifiedSuggestion | null;
  editedSuggestion: string;
  selectedTrendNames: string[];
  functionGuard: { warning: string; reason: string } | null;
  selectedTrends: string[];
  generatedIcon: string | null;
  // Legacy (kept for backwards compatibility)
  selectedDimensions: SelectedDimensions;
}

interface UseAnalysisReturn extends AnalysisState {
  setAppInput: (input: string) => void;
  setScreenshots: React.Dispatch<React.SetStateAction<ScreenshotFile[]>>;
  addScreenshot: (file: File) => void;
  removeScreenshot: (index: number) => void;
  // Evolution input methods
  updateEvolutionInput: (field: keyof EvolutionInput, value: string) => void;
  // Entertainment insights flow
  startEntertainmentAnalysis: () => Promise<void>;
  setSelectedTrends: (trends: string[]) => void;
  startEvolutionSuggestions: () => Promise<void>;
  // New unified suggestion methods
  updateEditedSuggestion: (value: string) => void;
  generateEvolution: (customPrompt?: string) => Promise<void>;
  // Legacy methods (kept for backwards compatibility)
  toggleDimension: (dimension: EvolutionDimension) => void;
  updateDimension: (dimension: EvolutionDimension, value: string) => void;
  reset: () => void;
}

const initialState: AnalysisState = {
  status: 'IDLE',
  screenshots: [],
  appInput: '',
  evolutionInput: defaultEvolutionInput,
  entertainmentInsights: null,
  unifiedSuggestion: null,
  editedSuggestion: '',
  selectedTrendNames: [],
  functionGuard: null,
  selectedTrends: [],
  generatedIcon: null,
  selectedDimensions: defaultSelectedDimensions,
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

  const addScreenshot = useCallback(async (file: File) => {
    try {
      const { data, preview, mimeType } = await compressAndConvert(file, {
        maxWidthOrHeight: 1024,
        maxSizeMB: 1,
      });

      setState((prev) => ({
        ...prev,
        screenshots: [
          ...prev.screenshots,
          {
            data,
            mimeType,
            preview,
          },
        ],
        evolutionInput: {
          ...prev.evolutionInput,
          appIcon: data,
        },
      }));
    } catch {
      onError('Failed to process image');
    }
  }, [onError]);

  const removeScreenshot = useCallback((index: number) => {
    setState((prev) => {
      const newScreenshots = prev.screenshots.filter((_, i) => i !== index);
      return {
        ...prev,
        screenshots: newScreenshots,
        evolutionInput: {
          ...prev.evolutionInput,
          appIcon: newScreenshots[0]?.data || '',
        },
      };
    });
  }, []);

  const updateEvolutionInput = useCallback(
    (field: keyof EvolutionInput, value: string) => {
      setState((prev) => ({
        ...prev,
        evolutionInput: {
          ...prev.evolutionInput,
          [field]: value,
        },
      }));
    },
    []
  );

  const startEntertainmentAnalysis = useCallback(async () => {
    const { evolutionInput, screenshots, appInput } = state;

    // Detect Play Store URL from appInput
    const playStorePattern = /play\.google\.com\/store\/apps\/details\?id=([a-zA-Z0-9._]+)/;
    const playStoreMatch = appInput.match(playStorePattern);
    const playStoreUrl = playStoreMatch
      ? `https://play.google.com/store/apps/details?id=${playStoreMatch[1]}`
      : null;

    if (playStoreUrl) {
      // Play Store URL mode - auto-fetch everything
      setState((prev) => ({ ...prev, status: 'ANALYZING_ENTERTAINMENT' }));

      try {
        const result = await api.getEntertainmentInsights({
          playStoreUrl,
        });

        // Guard: Play Store mode must return icon data
        if (!result.fetchedIcon) {
          onError('Play Store fetch succeeded but no icon data returned');
          setState((prev) => ({ ...prev, status: 'IDLE' }));
          return;
        }

        // Store fetched icon in screenshots for later generation
        const newScreenshots: ScreenshotFile[] = [
          {
            data: result.fetchedIcon.data,
            mimeType: result.fetchedIcon.mimeType,
            preview: `data:${result.fetchedIcon.mimeType};base64,${result.fetchedIcon.data}`,
          },
        ];

        setState((prev) => ({
          ...prev,
          entertainmentInsights: result,
          screenshots: newScreenshots,
          status: 'INSIGHTS_REVIEW',
        }));
        onSuccess?.('Entertainment insights analyzed');
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Entertainment analysis failed';
        onError(message);
        setState((prev) => ({ ...prev, status: 'IDLE' }));
      }
    } else if (screenshots.length > 0) {
      // Manual mode - require icon and use appInput as description if fields are empty
      const appName = evolutionInput.appName.trim();
      const appCategory = evolutionInput.appCategory;
      const appDescription = evolutionInput.appDescription.trim() || appInput.trim();

      if (!appName) {
        onError('Please enter the app name');
        return;
      }
      if (!appCategory) {
        onError('Please select the app category');
        return;
      }
      if (!appDescription) {
        onError('Please describe your app');
        return;
      }

      setState((prev) => ({ ...prev, status: 'ANALYZING_ENTERTAINMENT' }));

      try {
        const result = await api.getEntertainmentInsights({
          appIcon: screenshots[0].data,
          appIconMimeType: screenshots[0].mimeType,
          appName,
          appCategory,
          appDescription,
        });

        setState((prev) => ({
          ...prev,
          entertainmentInsights: result,
          status: 'INSIGHTS_REVIEW',
        }));
        onSuccess?.('Entertainment insights analyzed');
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Entertainment analysis failed';
        onError(message);
        setState((prev) => ({ ...prev, status: 'IDLE' }));
      }
    } else {
      onError('Please paste a Play Store URL or upload your app icon');
    }
  }, [state, onError, onSuccess]);

  const setSelectedTrends = useCallback((trends: string[]) => {
    setState((prev) => ({ ...prev, selectedTrends: trends }));
  }, []);

  const startEvolutionSuggestions = useCallback(async () => {
    const { entertainmentInsights, selectedTrends } = state;

    if (!entertainmentInsights) {
      onError('Entertainment insights required');
      return;
    }

    setState((prev) => ({ ...prev, status: 'SUGGESTING' }));

    try {
      const result = await api.getEvolutionSuggestionsV2(
        entertainmentInsights.iconAnalysis,
        entertainmentInsights.entertainmentTrends,
        selectedTrends
      );

      setState((prev) => ({
        ...prev,
        unifiedSuggestion: result.suggestion,
        editedSuggestion: result.suggestion.evolutionDirection,
        selectedTrendNames: result.selectedTrendNames,
        functionGuard: result.functionGuard,
        status: 'CUSTOMIZATION',
      }));
      onSuccess?.('Evolution suggestion ready');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Evolution suggestions failed';
      onError(message);
      setState((prev) => ({ ...prev, status: 'INSIGHTS_REVIEW' }));
    }
  }, [state, onError, onSuccess]);

  const updateEditedSuggestion = useCallback((value: string) => {
    setState((prev) => ({ ...prev, editedSuggestion: value }));
  }, []);

  // Legacy methods kept for backwards compatibility
  const toggleDimension = useCallback((dimension: EvolutionDimension) => {
    setState((prev) => ({
      ...prev,
      selectedDimensions: {
        ...prev.selectedDimensions,
        [dimension]: {
          ...prev.selectedDimensions[dimension],
          enabled: !prev.selectedDimensions[dimension].enabled,
        },
      },
    }));
  }, []);

  const updateDimension = useCallback(
    (dimension: EvolutionDimension, value: string) => {
      setState((prev) => ({
        ...prev,
        selectedDimensions: {
          ...prev.selectedDimensions,
          [dimension]: {
            ...prev.selectedDimensions[dimension],
            value,
          },
        },
      }));
    },
    []
  );

  const generateEvolution = useCallback(async (customPrompt?: string) => {
    const { screenshots, entertainmentInsights, editedSuggestion, functionGuard } = state;

    if (screenshots.length === 0) {
      onError('App icon required');
      return;
    }

    if (!editedSuggestion.trim()) {
      onError('Evolution direction is required');
      return;
    }

    setState((prev) => ({ ...prev, status: 'GENERATING' }));

    try {
      const referenceImage = {
        data: screenshots[0].data,
        mimeType: screenshots[0].mimeType,
      };

      const iconAnalysis: IconAnalysis | undefined = entertainmentInsights?.iconAnalysis;
      const functionGuardArr = functionGuard?.warning
        ? entertainmentInsights?.iconAnalysis?.mustPreserve
        : undefined;

      const result = await api.generateFromUnifiedSuggestion(
        referenceImage,
        editedSuggestion,
        iconAnalysis,
        functionGuardArr,
        customPrompt
      );

      setState((prev) => ({
        ...prev,
        generatedIcon: result,
        status: 'COMPLETE',
      }));
      onSuccess?.('Icon evolution generated');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Icon generation failed';
      onError(message);
      setState((prev) => ({ ...prev, status: 'CUSTOMIZATION' }));
    }
  }, [state, onError, onSuccess]);

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
    updateEvolutionInput,
    startEntertainmentAnalysis,
    setSelectedTrends,
    startEvolutionSuggestions,
    updateEditedSuggestion,
    toggleDimension,
    updateDimension,
    generateEvolution,
    reset,
  };
}
