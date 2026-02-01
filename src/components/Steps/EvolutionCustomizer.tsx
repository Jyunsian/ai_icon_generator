import React, { memo, useState, useMemo, useCallback, useEffect, useRef } from 'react';
import {
  AlertTriangle,
  Sparkles,
  Edit3,
  X,
  Play,
  Download,
  RotateCcw,
  ChevronDown,
  ChevronUp,
  Copy,
  FileText,
  Lightbulb,
  Check,
  ArrowLeft,
} from 'lucide-react';
import type {
  AppState,
  IconAnalysis,
  UnifiedSuggestion,
  RenderingStyleId,
} from '../../types';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Skeleton } from '../ui/Skeleton';
import { StyleSelector } from '../ui/StyleSelector';
import { buildUnifiedEvolutionPrompt } from '../../lib/promptBuilder';

interface EvolutionCustomizerProps {
  status: AppState;
  unifiedSuggestion: UnifiedSuggestion | null;
  editedSuggestion: string;
  selectedTrendNames: string[];
  iconAnalysis: IconAnalysis | null;
  functionGuard: { warning: string; reason: string } | null;
  appIcon?: string;
  generatedIcon?: string;
  selectedRenderingStyle: RenderingStyleId;
  onUpdateSuggestion: (value: string) => void;
  onSelectRenderingStyle: (style: RenderingStyleId) => void;
  onGenerate: (customPrompt?: string) => void;
  onReset: () => void;
  onGoBack?: () => void;
}

interface PromptPreviewProps {
  prompt: string;
}

const PromptPreview: React.FC<PromptPreviewProps> = memo(function PromptPreview({ prompt }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [copied, setCopied] = useState(false);
  const timeoutRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const handleCopy = useCallback(async () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    try {
      await navigator.clipboard.writeText(prompt);
      setCopied(true);
      timeoutRef.current = window.setTimeout(() => setCopied(false), 2000);
    } catch {
      const textArea = document.createElement('textarea');
      textArea.value = prompt;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setCopied(true);
      timeoutRef.current = window.setTimeout(() => setCopied(false), 2000);
    }
  }, [prompt]);

  return (
    <div className="border border-gray-200 rounded-xl overflow-hidden bg-white">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
        aria-expanded={isExpanded}
        aria-controls="prompt-preview-content"
      >
        <div className="flex items-center gap-2 text-gray-700">
          <FileText size={18} className="text-gray-500" />
          <span className="font-medium text-sm">Preview Prompt</span>
        </div>
        {isExpanded ? (
          <ChevronUp size={18} className="text-gray-400" />
        ) : (
          <ChevronDown size={18} className="text-gray-400" />
        )}
      </button>

      {isExpanded && (
        <div id="prompt-preview-content" className="border-t border-gray-200">
          <div className="p-4 bg-gray-50">
            <pre className="text-xs text-gray-700 whitespace-pre-wrap font-mono leading-relaxed max-h-64 overflow-y-auto">
              {prompt}
            </pre>
          </div>
          <div className="p-3 border-t border-gray-200 bg-white">
            <Button
              size="sm"
              variant="secondary"
              onClick={handleCopy}
              leftIcon={copied ? <Check size={14} /> : <Copy size={14} />}
              className="w-full sm:w-auto"
            >
              {copied ? 'Copied!' : 'Copy Prompt'}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
});

interface SuggestionEditorProps {
  suggestion: UnifiedSuggestion;
  editedValue: string;
  selectedTrendNames: string[];
  onUpdate: (value: string) => void;
}

const SuggestionEditor: React.FC<SuggestionEditorProps> = memo(function SuggestionEditor({
  suggestion,
  editedValue,
  selectedTrendNames,
  onUpdate,
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [localValue, setLocalValue] = useState(editedValue);

  useEffect(() => {
    if (!isEditing) {
      setLocalValue(editedValue);
    }
  }, [editedValue, isEditing]);

  const handleSave = () => {
    onUpdate(localValue);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setLocalValue(editedValue);
    setIsEditing(false);
  };

  const handleReset = () => {
    setLocalValue(suggestion.evolutionDirection);
    onUpdate(suggestion.evolutionDirection);
  };

  return (
    <div className="p-5 bg-gradient-to-br from-purple-50 to-indigo-50 border border-purple-200 rounded-2xl">
      <div className="flex items-start gap-3">
        <Sparkles size={20} className="text-purple-600 shrink-0 mt-0.5" />
        <div className="flex-1 min-w-0 space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="font-bold text-sm text-purple-800">Suggested Evolution Direction</h4>
            {!isEditing && (
              <button
                onClick={() => setIsEditing(true)}
                className="p-1 text-purple-400 hover:text-purple-600 transition-colors"
                aria-label="Edit suggestion"
              >
                <Edit3 size={14} />
              </button>
            )}
          </div>

          {isEditing ? (
            <div className="space-y-3">
              <textarea
                value={localValue}
                onChange={(e) => setLocalValue(e.target.value)}
                className="w-full p-3 border border-purple-300 rounded-lg text-sm resize-none focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white"
                rows={5}
                autoFocus
              />
              <div className="flex gap-2">
                <Button size="sm" onClick={handleSave}>
                  Save
                </Button>
                <Button size="sm" variant="secondary" onClick={handleReset}>
                  Reset
                </Button>
                <Button size="sm" variant="ghost" onClick={handleCancel}>
                  <X size={14} />
                </Button>
              </div>
            </div>
          ) : (
            <>
              <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
                {editedValue}
              </p>

              {selectedTrendNames.length > 0 && (
                <div className="pt-2">
                  <p className="text-xs text-purple-600 font-medium mb-1">Based on:</p>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedTrendNames.map((name) => (
                      <span
                        key={name}
                        className="px-2 py-0.5 bg-purple-100 text-purple-700 rounded-full text-xs font-medium"
                      >
                        {name}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {suggestion.keyElements.length > 0 && (
                <div className="pt-2 border-t border-purple-200">
                  <p className="text-xs text-purple-600 font-medium mb-1">Key Visual Elements:</p>
                  <ul className="list-disc list-inside text-xs text-gray-600 space-y-0.5">
                    {suggestion.keyElements.map((element, index) => (
                      <li key={index}>{element}</li>
                    ))}
                  </ul>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
});

export const EvolutionCustomizer: React.FC<EvolutionCustomizerProps> = memo(
  function EvolutionCustomizer({
    status,
    unifiedSuggestion,
    editedSuggestion,
    selectedTrendNames,
    iconAnalysis,
    functionGuard,
    appIcon,
    generatedIcon,
    selectedRenderingStyle,
    onUpdateSuggestion,
    onSelectRenderingStyle,
    onGenerate,
    onReset,
    onGoBack,
  }) {
    const [customPrompt, setCustomPrompt] = useState('');
    const isLoading = status === 'SUGGESTING';
    const isGenerating = status === 'GENERATING';
    const hasSuggestion = editedSuggestion.trim().length > 0;

    const handleGenerate = useCallback(() => {
      onGenerate(customPrompt.trim() || undefined);
    }, [onGenerate, customPrompt]);

    const previewPrompt = useMemo(() => {
      const functionGuardArr = functionGuard?.warning
        ? iconAnalysis?.mustPreserve
        : undefined;
      return buildUnifiedEvolutionPrompt({
        evolutionDirection: editedSuggestion,
        iconAnalysis,
        functionGuard: functionGuardArr,
        additionalPrompt: customPrompt.trim() || undefined,
        renderingStyle: selectedRenderingStyle,
      });
    }, [editedSuggestion, iconAnalysis, functionGuard?.warning, customPrompt, selectedRenderingStyle]);

    const downloadIcon = () => {
      if (!generatedIcon) return;
      const link = document.createElement('a');
      link.href = `data:image/png;base64,${generatedIcon}`;
      link.download = 'evolved-icon.png';
      link.click();
    };

    return (
      <Card glass className="p-4 md:p-6 lg:p-8 shadow-xl">
        {isLoading ? (
          <div
            className="flex flex-col items-center justify-center py-20 gap-6"
            role="status"
            aria-live="polite"
            aria-label="Generating evolution suggestion"
          >
            <div
              className="w-16 h-16 border-4 border-gray-100 border-t-purple-600 rounded-full animate-spin"
              aria-hidden="true"
            />
            <div className="text-center space-y-2">
              <h3 className="text-xl font-bold">Creating Evolution Direction</h3>
              <p className="text-gray-400 text-sm">
                Analyzing selected trends and crafting a unified evolution suggestion...
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div className="space-y-1">
                <h3 className="text-xl md:text-2xl font-bold">Evolution Customizer</h3>
                <p className="text-gray-500 text-sm">
                  Review and customize the suggested evolution direction, then generate your evolved icon.
                </p>
              </div>
              <div className="flex gap-2">
                {onGoBack && !generatedIcon && (
                  <Button
                    onClick={onGoBack}
                    size="lg"
                    variant="ghost"
                    leftIcon={<ArrowLeft size={18} />}
                  >
                    <span className="hidden sm:inline">Back to Trends</span>
                    <span className="sm:hidden">Back</span>
                  </Button>
                )}
                {generatedIcon && (
                  <>
                    <Button
                      onClick={downloadIcon}
                      size="lg"
                      variant="secondary"
                      leftIcon={<Download size={18} />}
                    >
                      Download
                    </Button>
                    <Button
                      onClick={onReset}
                      size="lg"
                      variant="ghost"
                      leftIcon={<RotateCcw size={18} />}
                    >
                      New
                    </Button>
                  </>
                )}
                <Button
                  onClick={handleGenerate}
                  size="lg"
                  disabled={!hasSuggestion || isGenerating}
                  leftIcon={isGenerating ? undefined : <Play size={18} />}
                  className="w-full md:w-auto"
                >
                  {isGenerating ? (
                    <span className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Generating...
                    </span>
                  ) : generatedIcon ? (
                    'Regenerate'
                  ) : (
                    'Generate Evolution'
                  )}
                </Button>
              </div>
            </div>

            {unifiedSuggestion ? (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left: Suggestion and Controls */}
                <div className="lg:col-span-2 space-y-4">
                  {/* Unified Suggestion Editor */}
                  <SuggestionEditor
                    suggestion={unifiedSuggestion}
                    editedValue={editedSuggestion}
                    selectedTrendNames={selectedTrendNames}
                    onUpdate={onUpdateSuggestion}
                  />

                  {/* Function Guard Warning - only show when meaningful */}
                  {functionGuard?.warning && functionGuard.warning.length > 10 && (
                    <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl">
                      <div className="flex items-start gap-3">
                        <AlertTriangle size={20} className="text-amber-600 shrink-0 mt-0.5" />
                        <div>
                          <p className="font-bold text-sm text-amber-800">Function Guard</p>
                          <p className="text-sm text-amber-700 mt-1">{functionGuard.warning}</p>
                          <p className="text-xs text-amber-600 mt-2">{functionGuard.reason}</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Rendering Style Selector */}
                  <StyleSelector
                    selectedStyle={selectedRenderingStyle}
                    onSelectStyle={onSelectRenderingStyle}
                    seedStyle={iconAnalysis?.currentStyle}
                  />

                  {/* Additional Instructions */}
                  <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl">
                    <div className="flex items-start gap-3">
                      <Lightbulb size={20} className="text-blue-600 shrink-0 mt-0.5" />
                      <div className="flex-1 min-w-0">
                        <label
                          htmlFor="custom-prompt"
                          className="font-bold text-sm text-blue-800"
                        >
                          Additional Instructions (Optional)
                        </label>
                        <textarea
                          id="custom-prompt"
                          value={customPrompt}
                          onChange={(e) => setCustomPrompt(e.target.value)}
                          placeholder="e.g., Make it cuter, add sparkle effects, use brighter colors..."
                          className="w-full mt-2 p-3 border border-blue-200 rounded-lg text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                          rows={2}
                          maxLength={500}
                        />
                        <p className="text-xs text-blue-600 mt-2">
                          Add custom instructions to fine-tune the generated icon
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Prompt Preview */}
                  <PromptPreview prompt={previewPrompt} />
                </div>

                {/* Right: Icon Preview */}
                <div className="space-y-4">
                  <div className="text-xs font-bold uppercase tracking-widest text-gray-400">
                    Icon Preview
                  </div>

                  <div className="space-y-4">
                    {/* Original Icon */}
                    <div className="p-4 bg-gray-50 rounded-xl">
                      <p className="text-xs text-gray-500 mb-2">Original</p>
                      {appIcon ? (
                        <img
                          src={appIcon}
                          alt="Original icon"
                          className="w-32 h-32 mx-auto rounded-2xl object-cover border-2 border-white shadow-lg"
                        />
                      ) : (
                        <div className="w-32 h-32 mx-auto rounded-2xl bg-gray-200 flex items-center justify-center">
                          <span className="text-gray-400 text-xs">No icon</span>
                        </div>
                      )}
                      {iconAnalysis && (
                        <p className="text-xs text-gray-500 text-center mt-2">
                          {iconAnalysis.coreSubject}
                        </p>
                      )}
                    </div>

                    {/* Generated Icon */}
                    <div className="p-4 bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl border border-indigo-100">
                      <p className="text-xs text-indigo-600 mb-2">Evolved</p>
                      {isGenerating ? (
                        <div className="w-32 h-32 mx-auto rounded-2xl bg-white flex items-center justify-center border-2 border-indigo-200">
                          <div className="w-8 h-8 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
                        </div>
                      ) : generatedIcon ? (
                        <img
                          src={`data:image/png;base64,${generatedIcon}`}
                          alt="Generated evolved icon"
                          className="w-32 h-32 mx-auto rounded-2xl object-cover border-2 border-white shadow-lg"
                        />
                      ) : (
                        <div className="w-32 h-32 mx-auto rounded-2xl bg-white flex items-center justify-center border-2 border-dashed border-indigo-200">
                          <span className="text-indigo-300 text-xs text-center px-2">
                            Click Generate to create
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <CustomizerSkeleton />
            )}
          </div>
        )}
      </Card>
    );
  }
);

const CustomizerSkeleton: React.FC = () => (
  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
    <div className="lg:col-span-2 space-y-4">
      <Skeleton className="h-48" />
      <Skeleton className="h-24" />
      <Skeleton className="h-32" />
    </div>
    <div className="space-y-4">
      <Skeleton className="h-40" />
      <Skeleton className="h-40" />
    </div>
  </div>
);
