import React, { memo, useState } from 'react';
import {
  Film,
  Gamepad2,
  BookOpen,
  Palette,
  ArrowRight,
  ImageIcon,
  Shield,
  Users,
  Sparkles,
  Check,
} from 'lucide-react';
import type { EntertainmentInsights, AppState, EntertainmentTrendItem, AestheticTrend } from '../../types';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Skeleton } from '../ui/Skeleton';

interface EntertainmentInsightsStepProps {
  status: AppState;
  insights: EntertainmentInsights | null;
  appIcon?: string;
  onSelectTrends: (trends: string[]) => void;
  onNext: () => void;
}

interface TrendItemCardProps {
  item: EntertainmentTrendItem;
  isSelected: boolean;
  onToggle: () => void;
}

const TrendItemCard: React.FC<TrendItemCardProps> = memo(function TrendItemCard({
  item,
  isSelected,
  onToggle,
}) {
  return (
    <button
      onClick={onToggle}
      className={`text-left p-3 rounded-xl border-2 transition-all ${
        isSelected
          ? 'border-indigo-500 bg-indigo-50'
          : 'border-gray-200 bg-white hover:border-gray-300'
      }`}
    >
      <div className="flex items-start gap-2">
        <div
          className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 mt-0.5 ${
            isSelected ? 'border-indigo-500 bg-indigo-500' : 'border-gray-300'
          }`}
        >
          {isSelected && <Check size={12} className="text-white" />}
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-sm truncate">{item.title}</p>
          <p className="text-xs text-gray-500 line-clamp-2">{item.relevance}</p>
          <div className="flex flex-wrap gap-1 mt-2">
            {item.visualElements.slice(0, 3).map((element, i) => (
              <span
                key={i}
                className="px-2 py-0.5 bg-gray-100 rounded text-[10px] text-gray-600"
              >
                {element}
              </span>
            ))}
          </div>
        </div>
      </div>
    </button>
  );
});

interface AestheticCardProps {
  aesthetic: AestheticTrend;
  isSelected: boolean;
  onToggle: () => void;
}

const AestheticCard: React.FC<AestheticCardProps> = memo(function AestheticCard({
  aesthetic,
  isSelected,
  onToggle,
}) {
  return (
    <button
      onClick={onToggle}
      className={`text-left p-4 rounded-xl border-2 transition-all ${
        isSelected
          ? 'border-purple-500 bg-purple-50'
          : 'border-gray-200 bg-white hover:border-gray-300'
      }`}
    >
      <div className="flex items-start gap-2">
        <div
          className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 mt-0.5 ${
            isSelected ? 'border-purple-500 bg-purple-500' : 'border-gray-300'
          }`}
        >
          {isSelected && <Check size={12} className="text-white" />}
        </div>
        <div className="flex-1">
          <p className="font-bold text-sm">{aesthetic.name}</p>
          <p className="text-xs text-gray-500 mt-1">{aesthetic.description}</p>
          <div className="flex flex-wrap gap-1 mt-2">
            {aesthetic.examples.slice(0, 3).map((example, i) => (
              <span
                key={i}
                className="px-2 py-0.5 bg-purple-100 rounded text-[10px] text-purple-700"
              >
                {example}
              </span>
            ))}
          </div>
        </div>
      </div>
    </button>
  );
});

export const EntertainmentInsightsStep: React.FC<EntertainmentInsightsStepProps> = memo(
  function EntertainmentInsightsStep({ status, insights, appIcon, onSelectTrends, onNext }) {
    const [selectedTrends, setSelectedTrends] = useState<Set<string>>(new Set());
    const isLoading = status === 'ANALYZING_ENTERTAINMENT';

    const toggleTrend = (trendId: string) => {
      const newSelected = new Set(selectedTrends);
      if (newSelected.has(trendId)) {
        newSelected.delete(trendId);
      } else {
        newSelected.add(trendId);
      }
      setSelectedTrends(newSelected);
      onSelectTrends(Array.from(newSelected));
    };

    const handleNext = () => {
      onSelectTrends(Array.from(selectedTrends));
      onNext();
    };

    return (
      <Card glass className="p-4 md:p-6 lg:p-8 shadow-xl">
        {isLoading ? (
          <div
            className="flex flex-col items-center justify-center py-20 gap-6"
            role="status"
            aria-live="polite"
            aria-label="Analyzing entertainment trends"
          >
            <div
              className="w-16 h-16 border-4 border-gray-100 border-t-indigo-600 rounded-full animate-spin"
              aria-hidden="true"
            />
            <div className="text-center space-y-2">
              <h3 className="text-xl font-bold">Analyzing Entertainment Trends</h3>
              <p className="text-gray-400 text-sm">
                Researching what your target users are watching, playing, and loving...
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div className="space-y-1">
                <h3 className="text-xl md:text-2xl font-bold">Entertainment Insights</h3>
                <p className="text-gray-500 text-sm">
                  Select trends that resonate with your app to influence the icon evolution.
                </p>
              </div>
              <Button
                onClick={handleNext}
                size="lg"
                rightIcon={<ArrowRight size={18} />}
                className="w-full md:w-auto"
              >
                <span className="hidden sm:inline">Get Evolution Suggestions</span>
                <span className="sm:hidden">Next</span>
              </Button>
            </div>

            {insights ? (
              <>
                {/* Icon Analysis Section */}
                <div className="p-5 bg-gradient-to-br from-indigo-50 to-purple-50 rounded-2xl space-y-4 border border-indigo-100">
                  <div className="flex items-center gap-2 text-indigo-600">
                    <ImageIcon size={18} aria-hidden="true" />
                    <span className="text-xs font-bold uppercase tracking-widest">
                      Your Icon Analysis
                    </span>
                  </div>
                  <div className="flex gap-6 items-start">
                    {appIcon && (
                      <div className="shrink-0">
                        <img
                          src={appIcon}
                          alt="Current app icon"
                          className="w-24 h-24 rounded-xl object-cover border-2 border-white shadow-lg"
                        />
                      </div>
                    )}
                    <div className="flex-1 space-y-3">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <p className="text-xs text-gray-500 uppercase font-bold tracking-wide">
                            Core Subject
                          </p>
                          <p className="text-sm font-medium">{insights.iconAnalysis.coreSubject}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500 uppercase font-bold tracking-wide">
                            App Function
                          </p>
                          <p className="text-sm font-medium">{insights.iconAnalysis.appFunction}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500 uppercase font-bold tracking-wide">
                            Current Style
                          </p>
                          <p className="text-sm">{insights.iconAnalysis.currentStyle}</p>
                        </div>
                      </div>
                      {insights.iconAnalysis.mustPreserve.length > 0 && (
                        <div>
                          <p className="text-xs text-gray-500 uppercase font-bold tracking-wide flex items-center gap-1">
                            <Shield size={12} /> Must Preserve
                          </p>
                          <div className="flex gap-2 flex-wrap mt-1">
                            {insights.iconAnalysis.mustPreserve.map((item, i) => (
                              <span
                                key={i}
                                className="px-2 py-1 bg-white rounded-md text-xs font-medium text-indigo-700 border border-indigo-200"
                              >
                                {item}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Target Audience */}
                <div className="p-4 bg-gray-50 rounded-xl">
                  <div className="flex items-center gap-2 text-gray-600 mb-2">
                    <Users size={16} aria-hidden="true" />
                    <span className="text-xs font-bold uppercase tracking-widest">
                      Target Audience
                    </span>
                  </div>
                  <p className="text-sm font-medium">{insights.targetAudience.demographics}</p>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {insights.targetAudience.interests.map((interest, i) => (
                      <span
                        key={i}
                        className="px-2 py-1 bg-white rounded-full text-xs text-gray-600 border border-gray-200"
                      >
                        {interest}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Entertainment Trends Grid */}
                <div className="space-y-6">
                  <div className="flex items-center gap-2 text-gray-900">
                    <Sparkles size={18} aria-hidden="true" />
                    <span className="text-xs font-bold uppercase tracking-widest text-gray-400">
                      Entertainment Trends (select to influence evolution)
                    </span>
                  </div>

                  {/* Guidance Banner */}
                  <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <p className="text-sm text-blue-700">
                      <strong>Tip:</strong> Select 2-4 trends for best results.
                      Selected trends will directly influence your icon evolution.
                    </p>
                  </div>

                  {/* Movies */}
                  {insights.entertainmentTrends.movies.length > 0 && (
                    <div className="space-y-3">
                      <div className="flex items-center gap-2 text-rose-600">
                        <Film size={16} aria-hidden="true" />
                        <span className="text-xs font-bold uppercase tracking-widest">
                          Movies & TV Shows
                        </span>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                        {insights.entertainmentTrends.movies.map((item) => (
                          <TrendItemCard
                            key={`movie-${item.title}`}
                            item={item}
                            isSelected={selectedTrends.has(`movie-${item.title}`)}
                            onToggle={() => toggleTrend(`movie-${item.title}`)}
                          />
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Games */}
                  {insights.entertainmentTrends.games.length > 0 && (
                    <div className="space-y-3">
                      <div className="flex items-center gap-2 text-green-600">
                        <Gamepad2 size={16} aria-hidden="true" />
                        <span className="text-xs font-bold uppercase tracking-widest">
                          Games & Gaming Culture
                        </span>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                        {insights.entertainmentTrends.games.map((item) => (
                          <TrendItemCard
                            key={`game-${item.title}`}
                            item={item}
                            isSelected={selectedTrends.has(`game-${item.title}`)}
                            onToggle={() => toggleTrend(`game-${item.title}`)}
                          />
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Anime */}
                  {insights.entertainmentTrends.anime.length > 0 && (
                    <div className="space-y-3">
                      <div className="flex items-center gap-2 text-blue-600">
                        <BookOpen size={16} aria-hidden="true" />
                        <span className="text-xs font-bold uppercase tracking-widest">
                          Anime & Manga
                        </span>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                        {insights.entertainmentTrends.anime.map((item) => (
                          <TrendItemCard
                            key={`anime-${item.title}`}
                            item={item}
                            isSelected={selectedTrends.has(`anime-${item.title}`)}
                            onToggle={() => toggleTrend(`anime-${item.title}`)}
                          />
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Aesthetics */}
                  {insights.entertainmentTrends.aesthetics.length > 0 && (
                    <div className="space-y-3">
                      <div className="flex items-center gap-2 text-purple-600">
                        <Palette size={16} aria-hidden="true" />
                        <span className="text-xs font-bold uppercase tracking-widest">
                          Visual Aesthetics
                        </span>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {insights.entertainmentTrends.aesthetics.map((aesthetic) => (
                          <AestheticCard
                            key={`aesthetic-${aesthetic.name}`}
                            aesthetic={aesthetic}
                            isSelected={selectedTrends.has(`aesthetic-${aesthetic.name}`)}
                            onToggle={() => toggleTrend(`aesthetic-${aesthetic.name}`)}
                          />
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Selection Summary */}
                {selectedTrends.size > 0 ? (
                  <div className="p-4 bg-indigo-50 rounded-xl border border-indigo-100">
                    <p className="text-sm text-indigo-700">
                      <strong>{selectedTrends.size}</strong> trend
                      {selectedTrends.size !== 1 ? 's' : ''} selected. These will influence your
                      icon evolution suggestions.
                    </p>
                  </div>
                ) : (
                  <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
                    <p className="text-sm text-amber-700">
                      <strong>No trends selected.</strong> Suggestions will be more generic without trend influence.
                    </p>
                  </div>
                )}
              </>
            ) : (
              <InsightsSkeleton />
            )}
          </div>
        )}
      </Card>
    );
  }
);

const InsightsSkeleton: React.FC = () => (
  <div className="space-y-6">
    <Skeleton className="h-40" />
    <Skeleton className="h-24" />
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
      <Skeleton className="h-28" />
      <Skeleton className="h-28" />
      <Skeleton className="h-28" />
    </div>
  </div>
);
