import React, { useRef, useCallback, memo, useMemo } from 'react';
import { Zap, RotateCcw, X, Upload, CheckCircle } from 'lucide-react';
import type { ScreenshotFile, AppState, EvolutionInput } from '../../types';
import { Button } from '../ui/Button';

interface CommandCenterProps {
  appInput: string;
  setAppInput: (value: string) => void;
  screenshots: ScreenshotFile[];
  onAddScreenshot: (file: File) => void;
  onRemoveScreenshot: (index: number) => void;
  status: AppState;
  onStartAnalysis: () => void;
  onReset: () => void;
  // New evolution input fields
  evolutionInput: EvolutionInput;
  onUpdateEvolutionInput: (field: keyof EvolutionInput, value: string) => void;
}

const APP_CATEGORIES = [
  'Finance & Banking',
  'Health & Fitness',
  'Social Networking',
  'Entertainment',
  'Productivity',
  'Education',
  'Shopping & E-commerce',
  'Travel & Navigation',
  'Food & Drink',
  'Photo & Video',
  'Music & Audio',
  'Games',
  'News & Magazines',
  'Weather',
  'Utilities',
  'Business',
  'Lifestyle',
  'Kids & Family',
  'Dating',
  'Other',
];

function detectPlayStoreUrl(input: string): { isPlayStore: boolean; packageId?: string } {
  const pattern = /play\.google\.com\/store\/apps\/details\?id=([a-zA-Z0-9._]+)/;
  const match = input.match(pattern);
  if (match) {
    return { isPlayStore: true, packageId: match[1] };
  }
  return { isPlayStore: false };
}

export const CommandCenter: React.FC<CommandCenterProps> = memo(function CommandCenter({
  appInput,
  setAppInput,
  screenshots,
  onAddScreenshot,
  onRemoveScreenshot,
  status,
  onStartAnalysis,
  onReset,
  evolutionInput,
  onUpdateEvolutionInput,
}) {
  const iconInputRef = useRef<HTMLInputElement>(null);

  const handleIconSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
        onAddScreenshot(file);
      }
      if (iconInputRef.current) {
        iconInputRef.current.value = '';
      }
    },
    [onAddScreenshot]
  );

  const isIdle = status === 'IDLE';

  // Detect Play Store URL
  const playStoreDetection = useMemo(
    () => detectPlayStoreUrl(appInput),
    [appInput]
  );

  // Validation - simpler now: either URL or (icon + manual fields)
  const validation = useMemo(() => {
    // Play Store URL mode - no other validation needed
    if (playStoreDetection.isPlayStore) {
      return { isValid: true, errors: [], mode: 'url' as const };
    }

    // Manual mode - need icon + fields
    const errors: string[] = [];
    if (screenshots.length === 0) {
      errors.push('Upload app icon or paste Play Store URL');
    } else {
      if (!evolutionInput.appName.trim()) {
        errors.push('App name is required');
      }
      if (!evolutionInput.appCategory) {
        errors.push('App category is required');
      }
      if (!evolutionInput.appDescription.trim() && !appInput.trim()) {
        errors.push('App description is required');
      }
    }
    return {
      isValid: errors.length === 0,
      errors,
      mode: 'manual' as const,
    };
  }, [playStoreDetection.isPlayStore, screenshots.length, evolutionInput, appInput]);

  const appIconPreview = screenshots[0]?.preview;

  return (
    <div className="w-full max-w-4xl command-center rounded-2xl p-4 md:p-6 space-y-5 relative overflow-hidden">
      {/* Main Input - URL or Description */}
      <div className="space-y-2">
        <label
          htmlFor="app-input"
          className="text-xs font-bold uppercase tracking-widest text-gray-400"
        >
          Your App
        </label>
        <textarea
          id="app-input"
          placeholder="Paste a Google Play URL, or describe your app..."
          value={appInput}
          onChange={(e) => setAppInput(e.target.value)}
          disabled={!isIdle}
          className="w-full min-h-[100px] px-4 py-3 border border-gray-200 rounded-xl text-base focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400 disabled:opacity-50 disabled:bg-gray-50 resize-none"
        />
      </div>

      {/* Play Store URL Detected Indicator */}
      {playStoreDetection.isPlayStore && (
        <div className="flex items-center gap-2 p-3 bg-emerald-50 border border-emerald-200 rounded-xl">
          <CheckCircle size={18} className="text-emerald-500 shrink-0" />
          <div className="text-sm text-emerald-700">
            <p className="font-medium">Google Play URL detected</p>
            <p className="text-xs text-emerald-600">
              App icon and info will be auto-fetched from <span className="font-mono">{playStoreDetection.packageId}</span>
            </p>
          </div>
        </div>
      )}

      {/* Manual Input Section - only show if no Play Store URL */}
      {!playStoreDetection.isPlayStore && (
        <>
          {/* App Icon Upload - Optional when URL provided */}
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-widest text-gray-400 flex items-center gap-1">
              App Icon {!playStoreDetection.isPlayStore && <span className="text-rose-500">*</span>}
            </label>
            <div className="flex items-start gap-4">
              {appIconPreview ? (
                <div className="relative group shrink-0">
                  <img
                    src={appIconPreview}
                    alt="App icon"
                    className="w-24 h-24 object-cover rounded-2xl border-2 border-indigo-200 shadow-lg"
                  />
                  {isIdle && (
                    <button
                      onClick={() => onRemoveScreenshot(0)}
                      className="absolute -top-2 -right-2 bg-white border border-gray-200 rounded-full p-1.5 shadow-md opacity-0 group-hover:opacity-100 transition-opacity"
                      aria-label="Remove icon"
                    >
                      <X size={14} />
                    </button>
                  )}
                </div>
              ) : (
                <button
                  onClick={() => iconInputRef.current?.click()}
                  disabled={!isIdle}
                  className="w-24 h-24 rounded-2xl border-2 border-dashed border-gray-300 flex flex-col items-center justify-center gap-2 hover:border-indigo-400 hover:bg-indigo-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  aria-label="Upload app icon"
                >
                  <Upload size={24} className="text-gray-400" />
                  <span className="text-xs text-gray-500">Upload</span>
                </button>
              )}
              <div className="flex-1 text-sm text-gray-500">
                <p>Upload your current app icon that you want to evolve.</p>
                <p className="text-xs text-gray-400 mt-1">
                  PNG, JPEG, or WebP. Square format recommended.
                </p>
              </div>
            </div>
          </div>

          {/* Show additional fields only when icon is uploaded */}
          {screenshots.length > 0 && (
            <>
              {/* App Name */}
              <div className="space-y-2">
                <label
                  htmlFor="app-name"
                  className="text-xs font-bold uppercase tracking-widest text-gray-400 flex items-center gap-1"
                >
                  App Name <span className="text-rose-500">*</span>
                </label>
                <input
                  id="app-name"
                  type="text"
                  placeholder="e.g., MoneyTracker"
                  value={evolutionInput.appName}
                  onChange={(e) => onUpdateEvolutionInput('appName', e.target.value)}
                  disabled={!isIdle}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl text-base focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400 disabled:opacity-50 disabled:bg-gray-50"
                />
              </div>

              {/* App Category */}
              <div className="space-y-2">
                <label
                  htmlFor="app-category"
                  className="text-xs font-bold uppercase tracking-widest text-gray-400 flex items-center gap-1"
                >
                  App Category <span className="text-rose-500">*</span>
                </label>
                <select
                  id="app-category"
                  value={evolutionInput.appCategory}
                  onChange={(e) => onUpdateEvolutionInput('appCategory', e.target.value)}
                  disabled={!isIdle}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl text-base focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400 disabled:opacity-50 disabled:bg-gray-50 appearance-none bg-white cursor-pointer"
                >
                  <option value="">Select a category...</option>
                  {APP_CATEGORIES.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
              </div>

              {/* App Description */}
              <div className="space-y-2">
                <label
                  htmlFor="app-description"
                  className="text-xs font-bold uppercase tracking-widest text-gray-400 flex items-center gap-1"
                >
                  App Core Function <span className="text-rose-500">*</span>
                </label>
                <textarea
                  id="app-description"
                  placeholder="Describe what your app does and its main features..."
                  value={evolutionInput.appDescription}
                  onChange={(e) => onUpdateEvolutionInput('appDescription', e.target.value)}
                  disabled={!isIdle}
                  className="w-full min-h-[80px] px-4 py-3 border border-gray-200 rounded-xl text-base focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400 disabled:opacity-50 disabled:bg-gray-50 resize-none"
                />
                <p className="text-xs text-gray-400">
                  Or use the main input above to describe your app.
                </p>
              </div>
            </>
          )}
        </>
      )}

      {/* Actions */}
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-end pt-4 border-t border-gray-100">
        {isIdle ? (
          <Button
            onClick={onStartAnalysis}
            size="lg"
            leftIcon={<Zap size={18} />}
            className="w-full md:w-auto"
            disabled={!validation.isValid}
          >
            <span className="hidden sm:inline">Analyze Entertainment Trends</span>
            <span className="sm:hidden">Analyze Trends</span>
          </Button>
        ) : (
          <Button
            variant="ghost"
            onClick={onReset}
            leftIcon={<RotateCcw size={14} />}
            aria-label="Restart project"
            className="w-full md:w-auto"
          >
            Restart Project
          </Button>
        )}
      </div>

      {/* Hidden file input */}
      <input
        type="file"
        ref={iconInputRef}
        className="hidden"
        accept="image/png,image/jpeg,image/webp,image/gif"
        onChange={handleIconSelect}
        aria-hidden="true"
      />
    </div>
  );
});
