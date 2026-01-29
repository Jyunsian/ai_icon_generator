import React, { memo } from 'react';
import { Tv, Sparkles, ArrowRight } from 'lucide-react';
import type { TrendSynthesis, AppState } from '../../types';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Skeleton } from '../ui/Skeleton';

interface TrendsStepProps {
  status: AppState;
  trends: TrendSynthesis | null;
  onNext: () => void;
}

export const TrendsStep: React.FC<TrendsStepProps> = memo(function TrendsStep({
  status,
  trends,
  onNext,
}) {
  const isLoading = status === 'SYNTHESIZING';

  return (
    <Card glass className="p-8 shadow-xl">
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
        <div className="space-y-8">
          {/* Header */}
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="space-y-1">
              <h3 className="text-2xl font-bold">Checkpoint 2: Trend Synthesis</h3>
              <p className="text-gray-500 text-sm">
                AI has mapped current viral media aesthetics to your product DNA.
              </p>
            </div>
            <Button onClick={onNext} size="lg" rightIcon={<ArrowRight size={18} />}>
              Confirm & Architect Briefs
            </Button>
          </div>

          {/* Trends Details */}
          {trends ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Entertainment Narrative */}
              <div className="space-y-6">
                <div className="p-6 bg-indigo-50 rounded-2xl space-y-4">
                  <div className="flex items-center gap-2 text-indigo-700">
                    <Tv size={18} aria-hidden="true" />
                    <span className="text-xs font-bold uppercase tracking-widest">
                      Entertainment Narrative
                    </span>
                  </div>
                  <blockquote className="text-base text-indigo-900 font-medium leading-relaxed italic">
                    &ldquo;{trends.entertainmentNarrative}&rdquo;
                  </blockquote>
                </div>

                {/* Sentiment Keywords */}
                <div className="space-y-3 px-2">
                  <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest">
                    Visual Sentiment Keywords
                  </h4>
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
              <div className="space-y-6">
                <div className="p-6 border border-gray-100 rounded-2xl space-y-4 bg-white">
                  <div className="flex items-center gap-2 text-gray-900">
                    <Sparkles size={18} aria-hidden="true" />
                    <span className="text-xs font-bold uppercase tracking-widest text-gray-400">
                      Proposed Visual DNA
                    </span>
                  </div>
                  <dl className="space-y-4">
                    <div>
                      <dt className="font-bold text-gray-900 text-sm">Subculture Overlap</dt>
                      <dd className="text-sm text-gray-600 leading-relaxed mt-1">
                        {trends.subcultureOverlap}
                      </dd>
                    </div>
                    <div>
                      <dt className="font-bold text-gray-900 text-sm">Visual Aesthetic</dt>
                      <dd className="text-sm text-gray-600 leading-relaxed mt-1">
                        {trends.visualTrends}
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
