import React, { memo, useState } from 'react';
import {
  Wand2,
  Hand,
  Shirt,
  CloudSun,
  AlertTriangle,
  Sparkles,
  Check,
  Edit3,
  X,
  Play,
  Download,
  RotateCcw,
} from 'lucide-react';
import type {
  EvolutionSuggestions,
  SelectedDimensions,
  EvolutionDimension,
  AppState,
  IconAnalysis,
} from '../../types';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Skeleton } from '../ui/Skeleton';

interface EvolutionCustomizerProps {
  status: AppState;
  suggestions: EvolutionSuggestions | null;
  selectedDimensions: SelectedDimensions;
  iconAnalysis: IconAnalysis | null;
  appIcon?: string;
  generatedIcon?: string;
  onToggleDimension: (dimension: EvolutionDimension) => void;
  onUpdateDimension: (dimension: EvolutionDimension, value: string) => void;
  onGenerate: () => void;
  onReset: () => void;
}

interface DimensionCardProps {
  dimension: EvolutionDimension;
  title: string;
  icon: React.ReactNode;
  recommendation: string;
  rationale: string;
  reference: string;
  enabled: boolean;
  value: string;
  color: string;
  onToggle: () => void;
  onUpdateValue: (value: string) => void;
}

const DimensionCard: React.FC<DimensionCardProps> = memo(function DimensionCard({
  title,
  icon,
  recommendation,
  rationale,
  reference,
  enabled,
  value,
  color,
  onToggle,
  onUpdateValue,
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(value);

  const handleSaveEdit = () => {
    onUpdateValue(editValue);
    setIsEditing(false);
  };

  const handleCancelEdit = () => {
    setEditValue(value);
    setIsEditing(false);
  };

  const colorClasses: Record<string, { bg: string; border: string; text: string; lightBg: string }> = {
    indigo: {
      bg: 'bg-indigo-500',
      border: 'border-indigo-500',
      text: 'text-indigo-600',
      lightBg: 'bg-indigo-50',
    },
    rose: {
      bg: 'bg-rose-500',
      border: 'border-rose-500',
      text: 'text-rose-600',
      lightBg: 'bg-rose-50',
    },
    amber: {
      bg: 'bg-amber-500',
      border: 'border-amber-500',
      text: 'text-amber-600',
      lightBg: 'bg-amber-50',
    },
    emerald: {
      bg: 'bg-emerald-500',
      border: 'border-emerald-500',
      text: 'text-emerald-600',
      lightBg: 'bg-emerald-50',
    },
  };

  const colors = colorClasses[color] || colorClasses.indigo;

  return (
    <div
      className={`p-4 rounded-2xl border-2 transition-all ${
        enabled ? `${colors.border} ${colors.lightBg}` : 'border-gray-200 bg-white opacity-60'
      }`}
    >
      <div className="flex items-start gap-3">
        {/* Toggle */}
        <button
          onClick={onToggle}
          className={`w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 mt-0.5 transition-colors ${
            enabled ? `${colors.border} ${colors.bg}` : 'border-gray-300'
          }`}
          aria-label={`${enabled ? 'Disable' : 'Enable'} ${title}`}
        >
          {enabled && <Check size={14} className="text-white" />}
        </button>

        <div className="flex-1 min-w-0 space-y-3">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className={colors.text}>{icon}</span>
              <h4 className="font-bold text-sm">{title}</h4>
            </div>
            {enabled && !isEditing && (
              <button
                onClick={() => setIsEditing(true)}
                className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
                aria-label={`Edit ${title}`}
              >
                <Edit3 size={14} />
              </button>
            )}
          </div>

          {/* Content */}
          {isEditing ? (
            <div className="space-y-2">
              <textarea
                value={editValue}
                onChange={(e) => setEditValue(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-lg text-sm resize-none focus:outline-none focus:ring-2 focus:ring-indigo-500"
                rows={3}
                autoFocus
              />
              <div className="flex gap-2">
                <Button size="sm" onClick={handleSaveEdit}>
                  Save
                </Button>
                <Button size="sm" variant="ghost" onClick={handleCancelEdit}>
                  <X size={14} />
                </Button>
              </div>
            </div>
          ) : (
            <>
              <div>
                <p className="text-xs text-gray-500 uppercase font-bold tracking-wide">
                  Recommendation
                </p>
                <p className="text-sm font-medium">{value || recommendation}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase font-bold tracking-wide">
                  Why This Works
                </p>
                <p className="text-xs text-gray-600">{rationale}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase font-bold tracking-wide">Reference</p>
                <p className="text-xs text-gray-500 italic">{reference}</p>
              </div>
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
    suggestions,
    selectedDimensions,
    iconAnalysis,
    appIcon,
    generatedIcon,
    onToggleDimension,
    onUpdateDimension,
    onGenerate,
    onReset,
  }) {
    const isLoading = status === 'SUGGESTING';
    const isGenerating = status === 'GENERATING';

    const hasAnySelected =
      selectedDimensions.style.enabled ||
      selectedDimensions.pose.enabled ||
      selectedDimensions.costume.enabled ||
      selectedDimensions.mood.enabled;

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
            aria-label="Generating evolution suggestions"
          >
            <div
              className="w-16 h-16 border-4 border-gray-100 border-t-purple-600 rounded-full animate-spin"
              aria-hidden="true"
            />
            <div className="text-center space-y-2">
              <h3 className="text-xl font-bold">Creating Evolution Directions</h3>
              <p className="text-gray-400 text-sm">
                Analyzing trends and crafting personalized icon evolution suggestions...
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
                  Toggle dimensions on/off and edit suggestions to customize your icon evolution.
                  {!hasAnySelected && (
                    <span className="text-amber-600 font-medium">
                      {' '}
                      Enable at least one dimension.
                    </span>
                  )}
                </p>
              </div>
              <div className="flex gap-2">
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
                  onClick={onGenerate}
                  size="lg"
                  disabled={!hasAnySelected || isGenerating}
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

            {suggestions ? (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left: Dimensions Grid */}
                <div className="lg:col-span-2 space-y-4">
                  <div className="flex items-center gap-2 text-gray-900">
                    <Sparkles size={18} aria-hidden="true" />
                    <span className="text-xs font-bold uppercase tracking-widest text-gray-400">
                      Evolution Dimensions
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <DimensionCard
                      dimension="style"
                      title="Style"
                      icon={<Wand2 size={16} />}
                      recommendation={suggestions.suggestions.style.recommendation}
                      rationale={suggestions.suggestions.style.rationale}
                      reference={suggestions.suggestions.style.reference}
                      enabled={selectedDimensions.style.enabled}
                      value={selectedDimensions.style.value}
                      color="indigo"
                      onToggle={() => onToggleDimension('style')}
                      onUpdateValue={(v) => onUpdateDimension('style', v)}
                    />

                    <DimensionCard
                      dimension="pose"
                      title="Pose / Action"
                      icon={<Hand size={16} />}
                      recommendation={suggestions.suggestions.pose.recommendation}
                      rationale={suggestions.suggestions.pose.rationale}
                      reference={suggestions.suggestions.pose.reference}
                      enabled={selectedDimensions.pose.enabled}
                      value={selectedDimensions.pose.value}
                      color="rose"
                      onToggle={() => onToggleDimension('pose')}
                      onUpdateValue={(v) => onUpdateDimension('pose', v)}
                    />

                    <DimensionCard
                      dimension="costume"
                      title="Costume / Props"
                      icon={<Shirt size={16} />}
                      recommendation={suggestions.suggestions.costume.recommendation}
                      rationale={suggestions.suggestions.costume.rationale}
                      reference={suggestions.suggestions.costume.reference}
                      enabled={selectedDimensions.costume.enabled}
                      value={selectedDimensions.costume.value}
                      color="amber"
                      onToggle={() => onToggleDimension('costume')}
                      onUpdateValue={(v) => onUpdateDimension('costume', v)}
                    />

                    <DimensionCard
                      dimension="mood"
                      title="Mood / Background"
                      icon={<CloudSun size={16} />}
                      recommendation={suggestions.suggestions.mood.recommendation}
                      rationale={suggestions.suggestions.mood.rationale}
                      reference={suggestions.suggestions.mood.reference}
                      enabled={selectedDimensions.mood.enabled}
                      value={selectedDimensions.mood.value}
                      color="emerald"
                      onToggle={() => onToggleDimension('mood')}
                      onUpdateValue={(v) => onUpdateDimension('mood', v)}
                    />
                  </div>

                  {/* Function Guard Warning */}
                  <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl">
                    <div className="flex items-start gap-3">
                      <AlertTriangle size={20} className="text-amber-600 shrink-0 mt-0.5" />
                      <div>
                        <p className="font-bold text-sm text-amber-800">Function Guard</p>
                        <p className="text-sm text-amber-700 mt-1">{suggestions.functionGuard.warning}</p>
                        <p className="text-xs text-amber-600 mt-2">{suggestions.functionGuard.reason}</p>
                      </div>
                    </div>
                  </div>
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
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Skeleton className="h-48" />
        <Skeleton className="h-48" />
        <Skeleton className="h-48" />
        <Skeleton className="h-48" />
      </div>
    </div>
    <div className="space-y-4">
      <Skeleton className="h-40" />
      <Skeleton className="h-40" />
    </div>
  </div>
);
