import React, { memo, useState, useCallback, useRef } from 'react';
import { Play, PlusCircle, Download, MousePointerClick, TrendingUp, Sparkles, X, RefreshCw, ChevronLeft, ChevronRight } from 'lucide-react';
import type { CreativeBrief, AppState } from '../../types';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { SkeletonImage } from '../ui/Skeleton';

interface BriefsStepProps {
  status: AppState;
  briefs: CreativeBrief[];
  isExecutingAll: boolean;
  onGenerateImage: (briefId: string) => void;
  onRegenerateImage: (briefId: string, newPrompt: string) => void;
  onExecuteAll: () => void;
  onReset: () => void;
}

export const BriefsStep: React.FC<BriefsStepProps> = memo(function BriefsStep({
  status,
  briefs,
  isExecutingAll,
  onGenerateImage,
  onRegenerateImage,
  onExecuteAll,
  onReset,
}) {
  const isLoading = status === 'BRIEFING';
  const scrollRef = useRef<HTMLDivElement>(null);

  const scrollLeft = useCallback(() => {
    scrollRef.current?.scrollBy({ left: -400, behavior: 'smooth' });
  }, []);

  const scrollRight = useCallback(() => {
    scrollRef.current?.scrollBy({ left: 400, behavior: 'smooth' });
  }, []);

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

      {/* Briefs Slider */}
      <div className="relative">
        {/* Left Arrow */}
        <button
          onClick={scrollLeft}
          className="absolute left-0 top-1/2 -translate-y-1/2 z-10 w-10 h-10 bg-white/90 backdrop-blur-sm border border-gray-200 rounded-full shadow-lg flex items-center justify-center text-gray-600 hover:text-gray-900 hover:bg-white transition-all focus:outline-none focus:ring-2 focus:ring-indigo-400"
          aria-label="Scroll left"
        >
          <ChevronLeft size={20} />
        </button>

        {/* Scrollable Container */}
        <div
          ref={scrollRef}
          className="flex gap-6 overflow-x-auto scroll-smooth snap-x snap-mandatory pb-4 px-12 scrollbar-hide"
          role="list"
          aria-label="Creative briefs"
        >
          {briefs.map((brief) => (
            <div key={brief.id} className="snap-center shrink-0 w-80 md:w-96">
              <BriefCard
                brief={brief}
                onGenerateImage={onGenerateImage}
                onRegenerateImage={onRegenerateImage}
              />
            </div>
          ))}
        </div>

        {/* Right Arrow */}
        <button
          onClick={scrollRight}
          className="absolute right-0 top-1/2 -translate-y-1/2 z-10 w-10 h-10 bg-white/90 backdrop-blur-sm border border-gray-200 rounded-full shadow-lg flex items-center justify-center text-gray-600 hover:text-gray-900 hover:bg-white transition-all focus:outline-none focus:ring-2 focus:ring-indigo-400"
          aria-label="Scroll right"
        >
          <ChevronRight size={20} />
        </button>
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
  onGenerateImage: (briefId: string) => void;
  onRegenerateImage: (briefId: string, newPrompt: string) => void;
}

type CardView = 'default' | 'details' | 'adjust';

const BriefCard: React.FC<BriefCardProps> = memo(function BriefCard({ brief, onGenerateImage, onRegenerateImage }) {
  const [imageError, setImageError] = useState(false);
  const [view, setView] = useState<CardView>('default');
  const [editedPrompt, setEditedPrompt] = useState(brief.prompt);

  const isLoading = brief.generatedImage === 'LOADING';
  const hasImage = brief.generatedImage && brief.generatedImage !== 'LOADING' && !imageError;

  // Stable callback that uses brief.id from closure
  const handleGenerate = useCallback(() => {
    onGenerateImage(brief.id);
  }, [onGenerateImage, brief.id]);

  const handleAdjustClick = useCallback(() => {
    setEditedPrompt(brief.prompt);
    setView('adjust');
  }, [brief.prompt]);

  const handleRegenerate = useCallback(() => {
    onRegenerateImage(brief.id, editedPrompt);
    setView('default');
  }, [onRegenerateImage, brief.id, editedPrompt]);

  const handleCancel = useCallback(() => {
    setEditedPrompt(brief.prompt);
    setView('default');
  }, [brief.prompt]);

  // Details View
  if (view === 'details') {
    return (
      <Card glass className="overflow-hidden" role="listitem">
        <div className="p-4 md:p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h5 className="font-bold text-base tracking-tight">{brief.directionName}</h5>
            <button
              onClick={() => setView('default')}
              className="p-1 text-gray-400 hover:text-gray-900 transition-colors"
              aria-label="Close details"
            >
              <X size={18} />
            </button>
          </div>

          <div className="space-y-4">
            <div>
              <p className="text-[10px] text-gray-400 uppercase font-bold mb-1">Design Thesis</p>
              <p className="text-sm text-gray-700 leading-relaxed">{brief.theWhy}</p>
            </div>

            {brief.designThesis && (
              <div>
                <p className="text-[10px] text-gray-400 uppercase font-bold mb-1">Visual Strategy</p>
                <p className="text-sm text-gray-700 leading-relaxed">{brief.designThesis}</p>
              </div>
            )}

            {brief.ctrRationale && (
              <div className="flex items-start gap-2">
                <MousePointerClick size={14} className="text-blue-500 mt-0.5 shrink-0" />
                <div>
                  <p className="text-[10px] text-gray-400 uppercase font-bold">CTR Optimization</p>
                  <p className="text-sm text-gray-600">{brief.ctrRationale}</p>
                </div>
              </div>
            )}

            {brief.cvrRationale && (
              <div className="flex items-start gap-2">
                <TrendingUp size={14} className="text-green-500 mt-0.5 shrink-0" />
                <div>
                  <p className="text-[10px] text-gray-400 uppercase font-bold">CVR Optimization</p>
                  <p className="text-sm text-gray-600">{brief.cvrRationale}</p>
                </div>
              </div>
            )}

            {brief.competitorDifferentiation && (
              <div className="flex items-start gap-2">
                <Sparkles size={14} className="text-purple-500 mt-0.5 shrink-0" />
                <div>
                  <p className="text-[10px] text-gray-400 uppercase font-bold">Competitive Edge</p>
                  <p className="text-sm text-gray-600">{brief.competitorDifferentiation}</p>
                </div>
              </div>
            )}

            <div>
              <p className="text-[10px] text-gray-400 uppercase font-bold mb-1">Generation Prompt</p>
              <p className="text-xs text-gray-600 leading-relaxed whitespace-pre-wrap bg-gray-50 p-3 rounded-lg">{brief.prompt}</p>
            </div>

            <div>
              <p className="text-[10px] text-gray-400 uppercase font-bold mb-1">Suggested Resolution</p>
              <p className="text-sm text-gray-700">{brief.suggestedSize}</p>
            </div>
          </div>
        </div>
      </Card>
    );
  }

  // Adjust View
  if (view === 'adjust') {
    return (
      <Card glass className="overflow-hidden" role="listitem">
        {/* Image Area */}
        <div className="aspect-square bg-gray-50 flex items-center justify-center relative border-b border-gray-100 overflow-hidden">
          {isLoading ? (
            <SkeletonImage className="w-full h-full" />
          ) : hasImage ? (
            <img
              src={brief.generatedImage}
              alt={`Generated icon: ${brief.directionName}`}
              className="w-full h-full object-cover"
              loading="lazy"
              onError={() => setImageError(true)}
            />
          ) : (
            <div className="flex flex-col items-center gap-4 text-gray-400">
              <div className="w-16 h-16 rounded-full border border-gray-200 flex items-center justify-center shadow-sm">
                <Play fill="currentColor" size={24} className="ml-1" aria-hidden="true" />
              </div>
              <span className="text-[10px] font-bold uppercase tracking-widest">
                No image yet
              </span>
            </div>
          )}
        </div>

        <div className="p-4 md:p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h5 className="font-bold text-base tracking-tight">{brief.directionName}</h5>
            <button
              onClick={handleCancel}
              className="p-1 text-gray-400 hover:text-gray-900 transition-colors"
              aria-label="Cancel editing"
            >
              <X size={18} />
            </button>
          </div>

          <div>
            <label htmlFor={`prompt-${brief.id}`} className="text-[10px] text-gray-400 uppercase font-bold mb-2 block">
              Edit Generation Prompt
            </label>
            <textarea
              id={`prompt-${brief.id}`}
              value={editedPrompt}
              onChange={(e) => setEditedPrompt(e.target.value)}
              className="w-full h-32 p-3 text-sm text-gray-700 border border-gray-200 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent"
              placeholder="Enter your generation prompt..."
            />
          </div>

          <div className="flex gap-3">
            <Button
              onClick={handleRegenerate}
              size="sm"
              leftIcon={<RefreshCw size={14} />}
              disabled={editedPrompt.trim() === '' || isLoading}
              className="flex-1"
            >
              Regenerate
            </Button>
            <Button
              onClick={handleCancel}
              variant="secondary"
              size="sm"
              className="flex-1"
            >
              Cancel
            </Button>
          </div>
        </div>
      </Card>
    );
  }

  // Default View
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
            onClick={handleGenerate}
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
          <p className="text-xs text-gray-600 leading-relaxed whitespace-pre-wrap line-clamp-4">{brief.prompt}</p>
        </div>

        <div className="flex gap-4 pt-4 border-t border-gray-50">
          <button
            onClick={() => setView('details')}
            className="text-[10px] font-bold text-gray-400 hover:text-indigo-600 uppercase tracking-widest transition-colors focus:outline-none focus:text-indigo-600"
            aria-label={`View details for ${brief.directionName}`}
          >
            Details
          </button>
          <button
            onClick={handleAdjustClick}
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
