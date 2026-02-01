import React, { memo } from 'react';
import {
  Check,
  Palette,
  Target,
  Box,
  Square,
  Minus,
  Layers,
  PenTool,
  CircleDot,
  Grid3x3,
  Hexagon,
} from 'lucide-react';
import type { RenderingStyleId } from '../../types';
import { getAllRenderingStyles } from '../../lib/renderingStyles';

interface StyleSelectorProps {
  selectedStyle: RenderingStyleId;
  onSelectStyle: (style: RenderingStyleId) => void;
  seedStyle?: string;
}

type IconComponent = React.FC<{ size?: number; className?: string }>;

const STYLE_ICONS: Record<RenderingStyleId, IconComponent> = {
  match_seed: Target,
  '3d_render': Box,
  flat: Square,
  minimalist: Minus,
  glassmorphism: Layers,
  neo_brutalism: PenTool,
  claymorphism: CircleDot,
  pixel_art: Grid3x3,
  isometric: Hexagon,
};

export const StyleSelector: React.FC<StyleSelectorProps> = memo(function StyleSelector({
  selectedStyle,
  onSelectStyle,
  seedStyle,
}) {
  const styles = getAllRenderingStyles();

  return (
    <div className="p-4 bg-gray-50 border border-gray-200 rounded-xl">
      <div className="flex items-start gap-3">
        <Palette size={20} className="text-gray-600 shrink-0 mt-0.5" />
        <div className="flex-1 min-w-0">
          <label className="font-bold text-sm text-gray-800">Rendering Style</label>
          <p className="text-xs text-gray-500 mt-1 mb-3">
            Choose how your evolved icon should be rendered
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {styles.map((style) => {
              const isSelected = selectedStyle === style.id;
              const isMatchSeed = style.id === 'match_seed';
              const IconComponent = STYLE_ICONS[style.id];

              return (
                <button
                  key={style.id}
                  onClick={() => onSelectStyle(style.id)}
                  className={`
                    relative p-3 rounded-lg border-2 text-left transition-all
                    ${isSelected
                      ? 'border-purple-500 bg-purple-50 ring-2 ring-purple-200'
                      : 'border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50'
                    }
                  `}
                  aria-pressed={isSelected}
                  aria-label={`Select ${style.name} rendering style`}
                >
                  {isSelected && (
                    <div className="absolute top-2 right-2 w-5 h-5 bg-purple-500 rounded-full flex items-center justify-center">
                      <Check size={12} className="text-white" />
                    </div>
                  )}

                  <div className="flex items-center gap-2 mb-1">
                    <IconComponent
                      size={18}
                      className={isSelected ? 'text-purple-600' : 'text-gray-500'}
                      aria-hidden="true"
                    />
                    <span className={`font-medium text-sm ${isSelected ? 'text-purple-800' : 'text-gray-800'}`}>
                      {style.name}
                    </span>
                  </div>

                  <p className={`text-xs leading-tight ${isSelected ? 'text-purple-600' : 'text-gray-500'}`}>
                    {isMatchSeed && seedStyle
                      ? `Preserve: ${seedStyle}`
                      : style.description}
                  </p>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
});
