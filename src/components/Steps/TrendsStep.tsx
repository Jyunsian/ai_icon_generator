import React, { memo } from 'react';
import { Tv, Sparkles, ArrowRight, Hash, Users, Palette } from 'lucide-react';
import type { TrendSynthesis, AppState, TrendSelection } from '../../types';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Skeleton } from '../ui/Skeleton';

interface TrendsStepProps {
  status: AppState;
  trends: TrendSynthesis | null;
  trendSelection: TrendSelection;
  onToggleCategory: (category: keyof TrendSelection) => void;
  onNext: () => void;
}

export const TrendsStep: React.FC<TrendsStepProps> = memo(function TrendsStep({
  status,
  trends,
  trendSelection,
  onToggleCategory,
  onNext,
}) {
  const isLoading = status === 'SYNTHESIZING';
  const hasAnySelected = Object.values(trendSelection).some(Boolean);

  return (
    <Card glass className="p-4 md:p-6 lg:p-8 shadow-xl">
      {isLoading ? (
        <div
          className="flex flex-col items-center justify-center py-20 gap-6"
          role="status"
          aria-live="polite"
          aria-label="Synthesizing trends"
        >
          <div
            className="w-16 h-16 border-4 border-gray-100 border-t-indigo-600 rounded-full animate-spin"
            aria-hidden="true"
          />
          <div className="text-center space-y-2">
            <h3 className="text-xl font-bold">Mapping Cultural Pulse</h3>
            <p className="text-gray-400 text-sm">
              Cross-referencing global entertainment trends with your app vertical...
            </p>
          </div>
        </div>
      ) : (
        <div className="space-y-4 md:space-y-6 lg:space-y-8">
          {/* Header */}
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div className="space-y-1">
              <h3 className="text-xl md:text-2xl font-bold">Checkpoint 2: Trend Synthesis</h3>
              <p className="text-gray-500 text-sm">
                AI has mapped current viral media aesthetics to your product DNA.
                {!hasAnySelected && (
                  <span className="text-amber-600 font-medium"> Select at least one trend category.</span>
                )}
              </p>
            </div>
            <Button
              onClick={onNext}
              size="lg"
              rightIcon={<ArrowRight size={18} />}
              className="w-full md:w-auto"
              disabled={!hasAnySelected}
            >
              <span className="hidden sm:inline">Confirm & Architect Briefs</span>
              <span className="sm:hidden">Next</span>
            </Button>
          </div>

          {/* Trends Details */}
          {trends ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 lg:gap-8">
              {/* Entertainment Narrative */}
              <div className="space-y-4 md:space-y-6">
                <div className={`p-4 md:p-6 bg-indigo-50 rounded-2xl space-y-3 md:space-y-4 transition-opacity ${!trendSelection.entertainmentNarrative ? 'opacity-50' : ''}`}>
                  <label className="flex items-center gap-2 text-indigo-700 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={trendSelection.entertainmentNarrative}
                      onChange={() => onToggleCategory('entertainmentNarrative')}
                      className="w-4 h-4 rounded border-indigo-300 text-indigo-600 focus:ring-indigo-500"
                    />
                    <Tv size={18} aria-hidden="true" />
                    <span className="text-xs font-bold uppercase tracking-widest">
                      Entertainment Narrative
                    </span>
                  </label>
                  <div className="space-y-4">
                    {trends.entertainmentNarrative.map((category) => (
                      <div key={category.category}>
                        <h5 className="font-semibold text-indigo-900 text-sm mb-2">{category.category}</h5>
                        <ul className="list-disc pl-4 space-y-1">
                          {category.items.map((item) => (
                            <li key={item.title} className="text-sm text-indigo-800">
                              <strong>{item.title}</strong> – {item.description}
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Sentiment Keywords */}
                <div className={`space-y-3 px-2 transition-opacity ${!trendSelection.sentimentKeywords ? 'opacity-50' : ''}`}>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={trendSelection.sentimentKeywords}
                      onChange={() => onToggleCategory('sentimentKeywords')}
                      className="w-4 h-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                    />
                    <Hash size={16} aria-hidden="true" className="text-gray-400" />
                    <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">
                      Visual Sentiment Keywords
                    </span>
                  </label>
                  <div
                    className="flex flex-wrap gap-2"
                    role="list"
                    aria-label="Sentiment keywords"
                  >
                    {trends.sentimentKeywords.map((keyword) => (
                      <span
                        key={keyword}
                        className="px-3 py-1 bg-white border border-gray-200 rounded-full text-xs font-medium text-gray-600"
                        role="listitem"
                      >
                        #{keyword}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Visual DNA */}
              <div className="space-y-4 md:space-y-6">
                <div className="p-4 md:p-6 border border-gray-100 rounded-2xl space-y-3 md:space-y-4 bg-white">
                  <div className="flex items-center gap-2 text-gray-900">
                    <Sparkles size={18} aria-hidden="true" />
                    <span className="text-xs font-bold uppercase tracking-widest text-gray-400">
                      Proposed Visual DNA
                    </span>
                  </div>
                  <dl className="space-y-4">
                    <div className={`transition-opacity ${!trendSelection.subcultureOverlap ? 'opacity-50' : ''}`}>
                      <dt>
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={trendSelection.subcultureOverlap}
                            onChange={() => onToggleCategory('subcultureOverlap')}
                            className="w-4 h-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                          />
                          <Users size={16} aria-hidden="true" className="text-gray-500" />
                          <span className="font-bold text-gray-900 text-sm">Subculture Overlap</span>
                        </label>
                      </dt>
                      <dd className="text-sm text-gray-600 leading-relaxed mt-1 ml-6">
                        <ul className="list-disc pl-4 space-y-2">
                          {trends.subcultureOverlap.map((item) => (
                            <li key={item.community}>
                              <strong>{item.community}:</strong> {item.visualLanguage}
                            </li>
                          ))}
                        </ul>
                      </dd>
                    </div>
                    <div className={`transition-opacity ${!trendSelection.visualTrends ? 'opacity-50' : ''}`}>
                      <dt>
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={trendSelection.visualTrends}
                            onChange={() => onToggleCategory('visualTrends')}
                            className="w-4 h-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                          />
                          <Palette size={16} aria-hidden="true" className="text-gray-500" />
                          <span className="font-bold text-gray-900 text-sm">Visual Aesthetic</span>
                        </label>
                      </dt>
                      <dd className="text-sm text-gray-600 leading-relaxed mt-1 ml-6">
                        <ul className="list-disc pl-4 space-y-2">
                          {trends.visualTrends.map((item) => (
                            <li key={item.trend}>
                              <strong>{item.trend}:</strong> {item.description}
                            </li>
                          ))}
                        </ul>
                      </dd>
                    </div>
                  </dl>
                </div>
              </div>
            </div>
          ) : (
            <TrendsSkeleton />
          )}
        </div>
      )}
    </Card>
  );
});

const TrendsSkeleton: React.FC = () => (
  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
    <div className="space-y-6">
      <Skeleton className="h-40" />
      <div className="space-y-2">
        <Skeleton className="h-4 w-1/3" />
        <div className="flex gap-2">
          <Skeleton className="h-8 w-20" />
          <Skeleton className="h-8 w-16" />
          <Skeleton className="h-8 w-24" />
        </div>
      </div>
    </div>
    <Skeleton className="h-60" />
  </div>
);
