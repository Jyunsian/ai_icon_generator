import React, { useRef, useCallback, memo, useMemo } from 'react';
import { Image, ChevronDown, Zap, RotateCcw, X, Link2, Check } from 'lucide-react';
import type { ScreenshotFile, AppState } from '../../types';
import { Button } from '../ui/Button';

// Detect Google Play Store URL in input
function detectPlayStoreUrl(input: string): { isPlayStore: boolean; packageId?: string } {
  const pattern = /play\.google\.com\/store\/apps\/details\?id=([a-zA-Z0-9._]+)/;
  const match = input.match(pattern);
  return match ? { isPlayStore: true, packageId: match[1] } : { isPlayStore: false };
}

interface CommandCenterProps {
  appInput: string;
  setAppInput: (value: string) => void;
  screenshots: ScreenshotFile[];
  onAddScreenshot: (file: File) => void;
  onRemoveScreenshot: (index: number) => void;
  status: AppState;
  onStartAnalysis: () => void;
  onReset: () => void;
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
}) {
  const screenshotInputRef = useRef<HTMLInputElement>(null);

  const handleScreenshotSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = Array.from(e.target.files || []);
      files.forEach((file) => onAddScreenshot(file));
      // Reset input to allow re-selecting same file
      if (screenshotInputRef.current) {
        screenshotInputRef.current.value = '';
      }
    },
    [onAddScreenshot]
  );

  const handleTextareaChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      setAppInput(e.target.value);
    },
    [setAppInput]
  );

  // Detect Play Store URL in input
  const playStoreDetection = useMemo(() => detectPlayStoreUrl(appInput), [appInput]);

  const isIdle = status === 'IDLE';

  return (
    <div className="w-full max-w-4xl command-center rounded-2xl p-6 space-y-6 relative overflow-hidden">
      {/* Text Input */}
      <label htmlFor="app-input" className="sr-only">
        Describe your app or paste a link
      </label>
      <textarea
        id="app-input"
        placeholder="A package tracking app..."
        value={appInput}
        onChange={handleTextareaChange}
        disabled={!isIdle}
        className="w-full min-h-[140px] text-xl outline-none resize-none placeholder:text-gray-300 font-normal leading-relaxed disabled:opacity-50 focus:ring-2 focus:ring-indigo-200 focus:ring-offset-2 rounded-lg p-2 -m-2"
        aria-describedby="input-help"
      />
      <span id="input-help" className="sr-only">
        Enter a description of your app, paste a link, or upload screenshots to analyze
      </span>

      {/* Play Store URL Detection Feedback */}
      {playStoreDetection.isPlayStore && isIdle && (
        <div className="flex items-center gap-2 px-3 py-2 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-center justify-center w-5 h-5 bg-green-500 rounded-full">
            <Check size={12} className="text-white" aria-hidden="true" />
          </div>
          <div className="flex-1">
            <p className="text-xs font-medium text-green-800">
              Google Play URL detected
            </p>
            <p className="text-[10px] text-green-600">
              App icon will be automatically extracted as seed for evolution
            </p>
          </div>
          <Link2 size={16} className="text-green-500" aria-hidden="true" />
        </div>
      )}

      {/* Screenshots Preview */}
      {screenshots.length > 0 && (
        <div
          className="flex gap-3 overflow-x-auto pb-2 scroll-smooth"
          role="list"
          aria-label="Uploaded screenshots"
        >
          {screenshots.map((s, i) => (
            <div key={i} className="relative group shrink-0" role="listitem">
              <img
                src={s.preview}
                alt={`Screenshot ${i + 1}`}
                className="w-20 h-20 object-cover rounded-xl border border-gray-100 shadow-sm"
                loading="lazy"
              />
              <button
                disabled={!isIdle}
                onClick={() => onRemoveScreenshot(i)}
                className="absolute -top-2 -right-2 bg-white border border-gray-200 rounded-full p-1 shadow-md opacity-0 group-hover:opacity-100 transition-opacity disabled:hidden focus:opacity-100"
                aria-label={`Remove screenshot ${i + 1}`}
              >
                <X size={12} aria-hidden="true" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center justify-between pt-4 border-t border-gray-50">
        <div className="flex gap-3">
          <button
            onClick={() => screenshotInputRef.current?.click()}
            disabled={!isIdle}
            className="action-chip px-4 py-2 flex items-center gap-2 disabled:opacity-30 focus:ring-2 focus:ring-indigo-200"
            aria-label="Upload image"
          >
            <Image size={16} aria-hidden="true" />
            <span className="text-sm">Image</span>
          </button>

          <div
            className="flex gap-2 items-center px-2 py-2 border border-gray-200 rounded-lg bg-white opacity-50 cursor-not-allowed"
            aria-label="Color palette selector (coming soon)"
            title="Color palette selector (coming soon)"
          >
            <div className="w-4 h-4 rounded-full bg-indigo-500" aria-hidden="true" />
            <div className="w-4 h-4 rounded-full bg-violet-500" aria-hidden="true" />
            <ChevronDown size={14} className="text-gray-400 ml-1" aria-hidden="true" />
          </div>
        </div>

        {isIdle ? (
          <Button onClick={onStartAnalysis} size="lg" leftIcon={<Zap size={18} />}>
            Begin Intelligence Audit
          </Button>
        ) : (
          <Button
            variant="ghost"
            onClick={onReset}
            leftIcon={<RotateCcw size={14} />}
            aria-label="Restart project"
          >
            Restart Project
          </Button>
        )}
      </div>

      {/* Hidden file input */}
      <input
        type="file"
        ref={screenshotInputRef}
        className="hidden"
        accept="image/png,image/jpeg,image/webp,image/gif"
        multiple
        onChange={handleScreenshotSelect}
        aria-hidden="true"
      />
    </div>
  );
});
