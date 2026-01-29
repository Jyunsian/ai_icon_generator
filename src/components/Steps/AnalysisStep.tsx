import React, { memo } from 'react';
import { Target, Users, ArrowRight, Palette, Layers, ImageIcon, Shield, Heart, Briefcase, UserCheck } from 'lucide-react';
import type { AnalysisResult, AppState, ScreenshotFile } from '../../types';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Skeleton } from '../ui/Skeleton';

interface AnalysisStepProps {
  status: AppState;
  analysis: AnalysisResult | null;
  screenshots?: ScreenshotFile[];
  onNext: () => void;
}

export const AnalysisStep: React.FC<AnalysisStepProps> = memo(function AnalysisStep({
  status,
  analysis,
  screenshots,
  onNext,
}) {
  const isLoading = status === 'ANALYZING';

  return (
    <Card glass className="p-4 md:p-6 lg:p-8 shadow-xl">
      {isLoading ? (
        <div
          className="flex flex-col items-center justify-center py-20 gap-6"
          role="status"
          aria-live="polite"
          aria-label="Analyzing market DNA"
        >
          <div
            className="w-16 h-16 border-4 border-gray-100 border-t-gray-900 rounded-full animate-spin"
            aria-hidden="true"
          />
          <div className="text-center space-y-2">
            <h3 className="text-xl font-bold">Auditing Market DNA</h3>
            <p className="text-gray-400 text-sm">
              Identifying competitors, demographics, and functional psychographics...
            </p>
          </div>
        </div>
      ) : (
        <div className="space-y-4 md:space-y-6 lg:space-y-8">
          {/* Header */}
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div className="space-y-1">
              <h3 className="text-xl md:text-2xl font-bold">Checkpoint 1: Competitive DNA</h3>
              <p className="text-gray-500 text-sm">
                Review the identified market landscape before proceeding to cultural trends.
              </p>
            </div>
            <Button onClick={onNext} size="lg" rightIcon={<ArrowRight size={18} />} className="w-full md:w-auto">
              <span className="hidden sm:inline">Confirm & Next Step</span>
              <span className="sm:hidden">Next Step</span>
            </Button>
          </div>

          {/* Analysis Details */}
          {analysis ? (
            <>
              {/* Seed Icon Section - Show prominently if identified */}
              {analysis.seedIconAnalysis?.identified && screenshots && screenshots.length > 0 && (
                <div className="p-5 bg-gradient-to-br from-indigo-50 to-purple-50 rounded-2xl space-y-4 border border-indigo-100">
                  <div className="flex items-center gap-2 text-indigo-600">
                    <ImageIcon size={18} aria-hidden="true" />
                    <span className="text-xs font-bold uppercase tracking-widest">
                      Seed Icon Identified
                    </span>
                  </div>
                  <div className="flex gap-6 items-start">
                    {/* Seed Icon Preview */}
                    <div className="shrink-0">
                      <img
                        src={screenshots[analysis.seedIconAnalysis.screenshotIndex ?? 0]?.preview}
                        alt="Seed icon"
                        className="w-24 h-24 rounded-xl object-cover border-2 border-white shadow-lg"
                      />
                    </div>
                    {/* Seed Analysis Details */}
                    <div className="flex-1 space-y-3">
                      <div>
                        <p className="text-xs text-gray-500 uppercase font-bold tracking-wide">Primary Metaphor</p>
                        <p className="text-sm font-medium">{analysis.seedIconAnalysis.primaryMetaphor}</p>
                      </div>
                      <div className="flex gap-6 flex-wrap">
                        <div>
                          <p className="text-xs text-gray-500 uppercase font-bold tracking-wide">Colors</p>
                          <div className="flex gap-1 mt-1">
                            {analysis.seedIconAnalysis.colorPalette.slice(0, 5).map((color, i) => (
                              <div
                                key={i}
                                className="w-5 h-5 rounded border border-gray-200"
                                style={{ backgroundColor: color }}
                                title={color}
                              />
                            ))}
                          </div>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500 uppercase font-bold tracking-wide">Shape</p>
                          <p className="text-sm">{analysis.seedIconAnalysis.shapeLanguage}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500 uppercase font-bold tracking-wide">Lighting</p>
                          <p className="text-sm">{analysis.seedIconAnalysis.lightingStyle}</p>
                        </div>
                      </div>
                      {analysis.seedIconAnalysis.mustPreserve.length > 0 && (
                        <div>
                          <p className="text-xs text-gray-500 uppercase font-bold tracking-wide flex items-center gap-1">
                            <Shield size={12} /> Must Preserve
                          </p>
                          <div className="flex gap-2 flex-wrap mt-1">
                            {analysis.seedIconAnalysis.mustPreserve.map((item, i) => (
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
              )}

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
                {/* Vertical & App Info */}
                <div className="p-5 bg-gray-50 rounded-2xl space-y-3">
                  <div className="flex items-center gap-2 text-indigo-600">
                    <Target size={18} aria-hidden="true" />
                    <span className="text-xs font-bold uppercase tracking-widest">Vertical</span>
                  </div>
                  {analysis.appName && (
                    <p className="text-xs text-gray-400 font-medium">{analysis.appName}</p>
                  )}
                  <p className="font-bold text-lg">{analysis.vertical}</p>
                  <p className="text-sm text-gray-500 leading-relaxed">{analysis.demographics}</p>
                </div>

                {/* Psychographic Profile - Enhanced */}
                <div className="p-5 bg-gray-50 rounded-2xl space-y-4 md:col-span-2">
                  <div className="flex items-center gap-2 text-indigo-600">
                    <Users size={18} aria-hidden="true" />
                    <span className="text-xs font-bold uppercase tracking-widest">
                      Psychographic Profile
                    </span>
                  </div>
                  {typeof analysis.psychographicProfile === 'object' ? (
                    <div className="space-y-3">
                      <p className="text-sm font-medium text-gray-700 leading-relaxed">
                        {analysis.psychographicProfile.summary}
                      </p>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 border-t border-gray-100">
                        <div className="flex items-start gap-2">
                          <Briefcase size={14} className="text-blue-500 mt-0.5 shrink-0" />
                          <div>
                            <p className="text-[10px] text-gray-400 uppercase font-bold">Functional</p>
                            <p className="text-xs text-gray-600">{analysis.psychographicProfile.functionalMotivation}</p>
                          </div>
                        </div>
                        <div className="flex items-start gap-2">
                          <Heart size={14} className="text-rose-500 mt-0.5 shrink-0" />
                          <div>
                            <p className="text-[10px] text-gray-400 uppercase font-bold">Emotional</p>
                            <p className="text-xs text-gray-600">{analysis.psychographicProfile.emotionalMotivation}</p>
                          </div>
                        </div>
                        <div className="flex items-start gap-2">
                          <UserCheck size={14} className="text-green-500 mt-0.5 shrink-0" />
                          <div>
                            <p className="text-[10px] text-gray-400 uppercase font-bold">Social</p>
                            <p className="text-xs text-gray-600">{analysis.psychographicProfile.socialMotivation}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <p className="text-sm font-medium text-gray-700 leading-relaxed">
                      {analysis.psychographicProfile}
                    </p>
                  )}
                </div>
              </div>

              {/* Visual DNA & Features */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                {/* Visual DNA */}
                {analysis.visualDna && (
                  <div className="p-5 border border-gray-100 rounded-2xl space-y-3 bg-white">
                    <div className="flex items-center gap-2 text-indigo-600">
                      <Palette size={18} aria-hidden="true" />
                      <span className="text-xs font-bold uppercase tracking-widest">Visual DNA</span>
                    </div>
                    <p className="text-sm text-gray-600 leading-relaxed">{analysis.visualDna}</p>
                  </div>
                )}

                {/* Core Features */}
                {analysis.features.length > 0 && (
                  <div className="p-5 border border-gray-100 rounded-2xl space-y-3 bg-white">
                    <div className="flex items-center gap-2 text-indigo-600">
                      <Layers size={18} aria-hidden="true" />
                      <span className="text-xs font-bold uppercase tracking-widest">
                        Core Features
                      </span>
                    </div>
                    <ul className="space-y-1">
                      {analysis.features.slice(0, 5).map((feature, idx) => (
                        <li
                          key={idx}
                          className="text-sm text-gray-600 flex items-center gap-2"
                        >
                          <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full" aria-hidden="true" />
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              {/* Competitors */}
              <div className="space-y-3 md:space-y-4">
                <h4 className="text-xs md:text-sm font-bold uppercase tracking-widest text-gray-400">
                  Direct Visual Competitors (Differentiate From)
                </h4>
                <div
                  className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 md:gap-4"
                  role="list"
                  aria-label="Competitors"
                >
                  {analysis.competitors.map((comp, i) => (
                    <div
                      key={i}
                      className="border border-gray-100 p-4 rounded-xl space-y-3"
                      role="listitem"
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className="w-10 h-10 rounded-lg flex items-center justify-center bg-white shadow-sm font-bold text-gray-300"
                          aria-hidden="true"
                        >
                          {comp.name[0]}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-bold truncate">{comp.name}</p>
                          <p className="text-[10px] text-gray-400 uppercase font-bold tracking-tight">
                            {comp.style}
                          </p>
                        </div>
                      </div>
                      {/* Competitor Color Palette */}
                      {comp.colorPalette && comp.colorPalette.length > 0 && (
                        <div className="flex gap-1">
                          {comp.colorPalette.slice(0, 5).map((color, colorIdx) => (
                            <div
                              key={colorIdx}
                              className="w-4 h-4 rounded border border-gray-200"
                              style={{ backgroundColor: color }}
                              title={color}
                            />
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </>
          ) : (
            <AnalysisSkeleton />
          )}
        </div>
      )}
    </Card>
  );
});

const AnalysisSkeleton: React.FC = () => (
  <div className="space-y-6">
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <Skeleton className="h-32" />
      <Skeleton className="h-32 md:col-span-2" />
    </div>
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <Skeleton className="h-20" />
      <Skeleton className="h-20" />
      <Skeleton className="h-20" />
    </div>
  </div>
);
