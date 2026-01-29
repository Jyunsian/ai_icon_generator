import React, { useCallback, useState } from 'react';
import { ErrorBoundary } from './components/ErrorBoundary';
import { Sidebar } from './components/Layout/Sidebar';
import { CommandCenter } from './components/CommandCenter/CommandCenter';
import { StepProgress, AnalysisStep, TrendsStep, BriefsStep } from './components/Steps';
import { ExploreGallery } from './components/ExploreGallery/ExploreGallery';
import { Suggestions } from './components/Suggestions/Suggestions';
import { ToastContainer, ConfirmDialog } from './components/ui';
import { useToast } from './hooks/useToast';
import { useAnalysis } from './hooks/useAnalysis';
import { APP_VERSION } from './lib/constants';

const App: React.FC = () => {
  const { toasts, removeToast, error: showError, success: showSuccess } = useToast();
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  const analysis = useAnalysis(showError, showSuccess);

  const handleOpenSettings = useCallback(async () => {
    if (window.aistudio?.openSelectKey) {
      await window.aistudio.openSelectKey();
    }
  }, []);

  const handleResetRequest = useCallback(() => {
    // Only show confirmation if there's progress
    if (analysis.status !== 'IDLE') {
      setShowResetConfirm(true);
    } else {
      analysis.reset();
    }
  }, [analysis]);

  const handleConfirmReset = useCallback(() => {
    setShowResetConfirm(false);
    analysis.reset();
  }, [analysis]);

  const handleCancelReset = useCallback(() => {
    setShowResetConfirm(false);
  }, []);

  const isIdle = analysis.status === 'IDLE';
  const showAnalysis = analysis.status === 'ANALYZING' || analysis.status === 'ANALYSIS_REVIEW';
  const showTrends = analysis.status === 'SYNTHESIZING' || analysis.status === 'TRENDS_REVIEW';
  const showBriefs =
    analysis.status === 'BRIEFING' ||
    analysis.status === 'BRIEFS_REVIEW' ||
    analysis.status === 'COMPLETE';

  return (
    <ErrorBoundary>
      <div className="flex flex-col md:flex-row min-h-screen text-gray-900">
        {/* Sidebar */}
        <Sidebar onNewTask={handleResetRequest} onOpenSettings={handleOpenSettings} />

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto flex flex-col items-center relative pt-14 md:pt-0">
          {/* Header */}
          <div className="w-full max-w-6xl flex justify-end px-4 py-3 md:p-4 sticky top-0 bg-gray-50/80 backdrop-blur-sm z-20">
            <a
              href="https://github.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[11px] font-medium text-gray-400 border border-gray-200 px-3 py-1 rounded-md hover:bg-white transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-400"
            >
              Submit Feedback &rarr;
            </a>
          </div>

          <div className="w-full max-w-6xl px-4 md:px-8 py-6 md:py-12 flex flex-col items-center gap-4 md:gap-6 lg:gap-8">
            {/* Hero */}
            <header className="text-center space-y-3 md:space-y-4">
              <div className="inline-block px-2 py-0.5 bg-gray-100 text-[10px] font-medium text-gray-500 rounded-md border border-gray-200 uppercase tracking-wider">
                AI Icon Generator v{APP_VERSION}
              </div>
              <h1 className="text-2xl md:text-4xl lg:text-5xl font-bold tracking-tight">
                AI-Powered App Icon Generation
              </h1>
              <p className="text-gray-400 text-base md:text-lg font-normal px-2">
                Enter your app description or upload screenshots to generate stunning app icons.
              </p>
            </header>

            {/* Step Progress */}
            {!isIdle && <StepProgress status={analysis.status} />}

            {/* Command Center */}
            <CommandCenter
              appInput={analysis.appInput}
              setAppInput={analysis.setAppInput}
              screenshots={analysis.screenshots}
              onAddScreenshot={analysis.addScreenshot}
              onRemoveScreenshot={analysis.removeScreenshot}
              status={analysis.status}
              onStartAnalysis={analysis.startAnalysis}
              onReset={handleResetRequest}
            />

            {/* Suggestions (IDLE state only) */}
            {isIdle && <Suggestions onSelect={analysis.setAppInput} />}

            {/* Steps */}
            {!isIdle && (
              <div className="w-full max-w-5xl space-y-4 md:space-y-6 lg:space-y-8">
                {showAnalysis && (
                  <AnalysisStep
                    status={analysis.status}
                    analysis={analysis.analysis}
                    screenshots={analysis.screenshots}
                    onNext={analysis.startTrends}
                  />
                )}

                {showTrends && (
                  <TrendsStep
                    status={analysis.status}
                    trends={analysis.trends}
                    onNext={analysis.startBriefing}
                  />
                )}

                {showBriefs && (
                  <BriefsStep
                    status={analysis.status}
                    briefs={analysis.briefs}
                    isExecutingAll={analysis.isExecutingAll}
                    onGenerateImage={analysis.generateImage}
                    onRegenerateImage={analysis.regenerateImage}
                    onExecuteAll={analysis.executeAll}
                    onReset={handleResetRequest}
                  />
                )}
              </div>
            )}

            {/* Explore Gallery (IDLE state only) */}
            {isIdle && <ExploreGallery className="mt-12 px-4 md:px-0" />}
          </div>
        </main>

        {/* Toast Notifications */}
        <ToastContainer toasts={toasts} onDismiss={removeToast} />

        {/* Confirmation Dialog */}
        <ConfirmDialog
          isOpen={showResetConfirm}
          title="Reset Progress?"
          message="You're about to start a new task. All current progress will be lost."
          confirmLabel="Reset"
          cancelLabel="Cancel"
          variant="warning"
          onConfirm={handleConfirmReset}
          onCancel={handleCancelReset}
        />
      </div>
    </ErrorBoundary>
  );
};

export default App;
