import React, { memo, useCallback } from 'react';
import { Check } from 'lucide-react';
import type { AppState } from '../../types';

interface StepProgressProps {
  status: AppState;
  onGoToStep?: (targetStep: AppState) => void;
}

const STEPS = ['Icon Analysis', 'Entertainment Insights', 'Evolution Customizer', 'Generate'] as const;

function getCurrentStep(status: AppState): number {
  switch (status) {
    case 'ANALYZING_ENTERTAINMENT':
      return 0;
    case 'INSIGHTS_REVIEW':
      return 1;
    case 'SUGGESTING':
      return 1;
    case 'CUSTOMIZATION':
      return 2;
    case 'GENERATING':
      return 3;
    case 'COMPLETE':
      return 3;
    default:
      return 0;
  }
}

function getStepTargetStatus(index: number): AppState | null {
  switch (index) {
    case 1:
      return 'INSIGHTS_REVIEW';
    case 2:
      return 'CUSTOMIZATION';
    default:
      return null;
  }
}

export const StepProgress: React.FC<StepProgressProps> = memo(function StepProgress({
  status,
  onGoToStep,
}) {
  const currentStep = getCurrentStep(status);

  const handleStepClick = useCallback(
    (index: number) => {
      if (!onGoToStep) return;
      const targetStatus = getStepTargetStatus(index);
      if (targetStatus) {
        onGoToStep(targetStatus);
      }
    },
    [onGoToStep]
  );

  return (
    <nav
      className="w-full max-w-4xl flex items-center justify-center gap-4 mb-4"
      aria-label="Progress"
    >
      <ol className="flex items-center gap-4" role="list">
        {STEPS.map((step, index) => {
          const isCompleted = currentStep > index;
          const isCurrent = currentStep === index;
          const isClickable = isCompleted && onGoToStep;

          return (
            <li key={step} className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => isClickable && handleStepClick(index)}
                disabled={!isClickable}
                className={`flex items-center gap-2 ${
                  isClickable ? 'cursor-pointer hover:opacity-80' : 'cursor-default'
                }`}
                aria-label={isClickable ? `Go back to ${step}` : step}
              >
                <div
                  className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold transition-colors ${
                    isCompleted
                      ? 'bg-green-500 text-white'
                      : isCurrent
                        ? 'bg-gray-900 text-white'
                        : 'bg-gray-200 text-gray-400'
                  }`}
                  aria-current={isCurrent ? 'step' : undefined}
                >
                  {isCompleted ? (
                    <Check size={12} aria-hidden="true" />
                  ) : (
                    <span>{index + 1}</span>
                  )}
                </div>
                <span
                  className={`text-xs font-bold uppercase tracking-widest hidden sm:inline ${
                    isCurrent ? 'text-gray-900' : 'text-gray-400'
                  } ${isClickable ? 'underline decoration-dotted underline-offset-2' : ''}`}
                >
                  {step}
                  <span className="sr-only">
                    {isCompleted ? ' (completed - click to go back)' : isCurrent ? ' (current)' : ' (pending)'}
                  </span>
                </span>
              </button>
              {index < STEPS.length - 1 && (
                <div className="w-8 md:w-12 h-[1px] bg-gray-200 ml-2" aria-hidden="true" />
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
});
