import React, { memo, useState, useCallback, useEffect } from 'react';
import { RefreshCcw } from 'lucide-react';
import { ALL_PROMPT_SUGGESTIONS } from '../../lib/constants';
import { shuffleArray } from '../../lib/utils';

interface SuggestionsProps {
  onSelect: (prompt: string) => void;
}

export const Suggestions: React.FC<SuggestionsProps> = memo(function Suggestions({ onSelect }) {
  const [suggestions, setSuggestions] = useState<string[]>([]);

  const refreshSuggestions = useCallback(() => {
    const shuffled = shuffleArray([...ALL_PROMPT_SUGGESTIONS]);
    setSuggestions(shuffled.slice(0, 3));
  }, []);

  // Initialize suggestions on mount
  useEffect(() => {
    refreshSuggestions();
  }, [refreshSuggestions]);

  const handleSelect = useCallback(
    (prompt: string) => {
      onSelect(prompt);
    },
    [onSelect]
  );

  return (
    <div className="w-full max-w-4xl space-y-4" aria-labelledby="suggestions-heading">
      <div className="flex items-center justify-between px-2">
        <h2
          id="suggestions-heading"
          className="text-xs font-semibold text-gray-400 uppercase tracking-widest"
        >
          You may want to create...
        </h2>
        <button
          onClick={refreshSuggestions}
          className="flex items-center gap-1 text-[11px] font-bold text-gray-400 hover:text-indigo-600 transition-colors uppercase tracking-widest focus:outline-none focus:text-indigo-600"
          aria-label="Refresh suggestions"
        >
          <RefreshCcw size={12} aria-hidden="true" /> More ideas
        </button>
      </div>

      <div
        className="grid grid-cols-1 md:grid-cols-3 gap-3"
        role="list"
        aria-label="Prompt suggestions"
      >
        {suggestions.map((prompt, idx) => (
          <button
            key={`${prompt}-${idx}`}
            onClick={() => handleSelect(prompt)}
            className="text-left p-4 bg-white border border-gray-200 rounded-xl hover:border-indigo-400 hover:bg-indigo-50 transition-all group active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-indigo-400"
            role="listitem"
            aria-label={`Use prompt: ${prompt}`}
          >
            <p className="text-sm text-gray-500 group-hover:text-indigo-700 line-clamp-2 italic leading-relaxed">
              &ldquo;{prompt}&rdquo;
            </p>
          </button>
        ))}
      </div>
    </div>
  );
});
