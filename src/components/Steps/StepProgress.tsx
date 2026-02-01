import React, { memo } from 'react';
import { Check } from 'lucide-react';
import type { AppState } from '../../types';

interface StepProgressProps {
  status: AppState;
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

export const StepProgress: React.FC<StepProgressProps> = memo(function StepProgress({ status }) {
  const currentStep = getCurrentStep(status);

  return (
    <nav
      className="w-full max-w-4xl flex items-center justify-center gap-4 mb-4"
      aria-label="Progress"
    >
      <ol className="flex items-center gap-4" role="list">
        {STEPS.map((step, index) => {
          const isCompleted = currentStep > index;
          const isCurrent = currentStep === index;

          return (
            <li key={step} className="flex items-center gap-2">
              <div className="flex items-center gap-2">
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
                  }`}
                >
                  {step}
                  <span className="sr-only">
                    {isCompleted ? ' (completed)' : isCurrent ? ' (current)' : ' (pending)'}
                  </span>
                </span>
              </div>
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
