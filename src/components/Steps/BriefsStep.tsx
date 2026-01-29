import React, { memo, useState } from 'react';
import { Play, PlusCircle, Download, MousePointerClick, TrendingUp, Sparkles } from 'lucide-react';
import type { CreativeBrief, AppState } from '../../types';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { SkeletonImage } from '../ui/Skeleton';

interface BriefsStepProps {
  status: AppState;
  briefs: CreativeBrief[];
  isExecutingAll: boolean;
  onGenerateImage: (briefId: string) => void;
  onExecuteAll: () => void;
  onReset: () => void;
}

export const BriefsStep: React.FC<BriefsStepProps> = memo(function BriefsStep({
  status,
  briefs,
  isExecutingAll,
  onGenerateImage,
  onExecuteAll,
  onReset,
}) {
  const isLoading = status === 'BRIEFING';

  if (isLoading) {
    return (
      <Card glass className="p-6 md:p-8 lg:p-12">
        <div
          className="flex flex-col items-center justify-center gap-6"
          role="status"
          aria-live="polite"
          aria-label="Creating briefs"
        >
          <div
            className="w-16 h-16 border-4 border-gray-100 border-t-rose-500 rounded-full animate-spin"
            aria-hidden="true"
          />
          <h3 className="text-xl font-bold">Architecting Creative Directions</h3>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-6 md:space-y-8 lg:space-y-12 pb-10 md:pb-20">
      {/* Header */}
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="space-y-1">
          <h3 className="text-xl md:text-2xl font-bold">Final Architecture</h3>
          <p className="text-gray-500 text-sm">
            High-conversion directions optimized to evolve your brand identity.
          </p>
        </div>
        <Button
          onClick={onExecuteAll}
          disabled={isExecutingAll}
          isLoading={isExecutingAll}
          size="lg"
          className="w-full md:w-auto"
        >
          {isExecutingAll ? 'Rendering...' : <><span className="hidden sm:inline">Render All Proposals</span><span className="sm:hidden">Render All</span></>}
        </Button>
      </div>

      {/* Briefs Grid */}
      <div
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 lg:gap-8"
        role="list"
        aria-label="Creative briefs"
      >
        {briefs.map((brief) => (
          <BriefCard
            key={brief.id}
            brief={brief}
            onGenerate={() => onGenerateImage(brief.id)}
          />
        ))}
      </div>

      {/* Call to Action */}
      <div className="mt-6 md:mt-8 lg:mt-12 p-4 md:p-6 lg:p-10 border-t border-gray-100 flex flex-col items-center text-center gap-4 md:gap-6">
        <div className="space-y-2">
          <h4 className="text-lg md:text-xl font-bold">Satisfied with the architecture?</h4>
          <p className="text-gray-400 text-sm max-w-md">
            You can download your favorite renders or start a completely new architectural audit
            for another app.
          </p>
        </div>
        <div className="flex gap-4 flex-wrap justify-center">
          <Button onClick={onReset} size="lg" leftIcon={<PlusCircle size={20} />}>
            Start New Generation
          </Button>
          <Button
            variant="secondary"
            size="lg"
            leftIcon={<Download size={20} />}
            aria-label="Save workspace (coming soon)"
            disabled
          >
            Save Workspace
          </Button>
        </div>
      </div>
    </div>
  );
});

interface BriefCardProps {
  brief: CreativeBrief;
  onGenerate: () => void;
}

const BriefCard: React.FC<BriefCardProps> = memo(function BriefCard({ brief, onGenerate }) {
  const [imageError, setImageError] = useState(false);
  const isLoading = brief.generatedImage === 'LOADING';
  const hasImage = brief.generatedImage && brief.generatedImage !== 'LOADING' && !imageError;

  return (
    <Card
      glass
      className="overflow-hidden group hover:shadow-2xl transition-all"
      role="listitem"
    >
      {/* Image Area */}
      <div className="aspect-square bg-gray-50 flex items-center justify-center relative border-b border-gray-100 overflow-hidden">
        {isLoading ? (
          <SkeletonImage className="w-full h-full" />
        ) : hasImage ? (
          <img
            src={brief.generatedImage}
            alt={`Generated icon: ${brief.directionName}`}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
            loading="lazy"
            onError={() => setImageError(true)}
          />
        ) : (
          <button
            onClick={onGenerate}
            className="flex flex-col items-center gap-4 text-gray-400 hover:text-gray-900 transition-all active:scale-95 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:ring-offset-2 rounded-xl p-4"
            aria-label={`Render ${brief.directionName}`}
          >
            <div className="w-16 h-16 rounded-full border border-gray-200 flex items-center justify-center group-hover:bg-white group-hover:border-gray-400 shadow-sm transition-all">
              <Play fill="currentColor" size={24} className="ml-1" aria-hidden="true" />
            </div>
            <span className="text-[10px] font-bold uppercase tracking-widest">
              Render v{brief.id}
            </span>
          </button>
        )}
      </div>

      {/* Content */}
      <div className="p-4 md:p-6 space-y-3 md:space-y-4">
        <h5 className="font-bold text-base tracking-tight">{brief.directionName}</h5>
        <p className="text-xs text-gray-500 leading-relaxed line-clamp-3">&ldquo;{brief.theWhy}&rdquo;</p>

        {/* CTR/CVR Rationale Section */}
        {(brief.ctrRationale || brief.cvrRationale) && (
          <div className="space-y-2 pt-2 border-t border-gray-50">
            {brief.ctrRationale && (
              <div className="flex items-start gap-2">
                <MousePointerClick size={12} className="text-blue-500 mt-0.5 shrink-0" aria-hidden="true" />
                <div>
                  <p className="text-[10px] text-gray-400 uppercase font-bold">CTR Boost</p>
                  <p className="text-xs text-gray-600 line-clamp-2">{brief.ctrRationale}</p>
                </div>
              </div>
            )}
            {brief.cvrRationale && (
              <div className="flex items-start gap-2">
                <TrendingUp size={12} className="text-green-500 mt-0.5 shrink-0" aria-hidden="true" />
                <div>
                  <p className="text-[10px] text-gray-400 uppercase font-bold">CVR Boost</p>
                  <p className="text-xs text-gray-600 line-clamp-2">{brief.cvrRationale}</p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Competitor Differentiation */}
        {brief.competitorDifferentiation && (
          <div className="flex items-start gap-2 pt-2 border-t border-gray-50">
            <Sparkles size={12} className="text-purple-500 mt-0.5 shrink-0" aria-hidden="true" />
            <div>
              <p className="text-[10px] text-gray-400 uppercase font-bold">Stands Apart</p>
              <p className="text-xs text-gray-600 line-clamp-2">{brief.competitorDifferentiation}</p>
            </div>
          </div>
        )}

        {/* Generation Prompt */}
        <div className="pt-2 border-t border-gray-50">
          <p className="text-[10px] text-gray-400 uppercase font-bold mb-1">Generation Prompt</p>
          <p className="text-xs text-gray-600 leading-relaxed whitespace-pre-wrap">{brief.prompt}</p>
        </div>

        <div className="flex gap-4 pt-4 border-t border-gray-50">
          <button
            className="text-[10px] font-bold text-gray-400 hover:text-indigo-600 uppercase tracking-widest transition-colors focus:outline-none focus:text-indigo-600"
            aria-label={`View details for ${brief.directionName}`}
          >
            Details
          </button>
          <button
            className="text-[10px] font-bold text-gray-400 hover:text-indigo-600 uppercase tracking-widest transition-colors focus:outline-none focus:text-indigo-600"
            aria-label={`Adjust ${brief.directionName}`}
          >
            Adjust
          </button>
        </div>
      </div>
    </Card>
  );
});
