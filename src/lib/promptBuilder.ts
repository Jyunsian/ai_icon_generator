import type { SelectedDimensions, IconAnalysis, RenderingStyleId } from '../types';
import { getRenderingStylePrompt } from './renderingStyles';

export interface BuildPromptOptions {
  selectedDimensions: SelectedDimensions;
  iconAnalysis?: IconAnalysis | null;
  functionGuard?: string[];
  additionalPrompt?: string;
  renderingStyle?: RenderingStyleId;
}

/**
 * Build the evolution prompt from selected dimensions.
 * This mirrors the logic in api/generate.ts:126-174
 * @deprecated Use buildUnifiedEvolutionPrompt for the new simplified flow
 */
export function buildEvolutionPrompt(options: BuildPromptOptions): string {
  const { selectedDimensions, iconAnalysis, functionGuard = [], additionalPrompt, renderingStyle } = options;

  const enabledDimensions: string[] = [];

  if (selectedDimensions.style?.enabled && selectedDimensions.style.value) {
    enabledDimensions.push(`風格演化: ${selectedDimensions.style.value}`);
  }
  if (selectedDimensions.pose?.enabled && selectedDimensions.pose.value) {
    enabledDimensions.push(`動作演化: ${selectedDimensions.pose.value}`);
  }
  if (selectedDimensions.costume?.enabled && selectedDimensions.costume.value) {
    enabledDimensions.push(`服裝/道具演化: ${selectedDimensions.costume.value}`);
  }
  if (selectedDimensions.mood?.enabled && selectedDimensions.mood.value) {
    enabledDimensions.push(`背景/氛圍演化: ${selectedDimensions.mood.value}`);
  }

  const dimensionsText =
    enabledDimensions.length > 0
      ? enabledDimensions.join('\n')
      : '保持原有風格，僅進行品質提升';

  const coreSubject = iconAnalysis?.coreSubject || '原有主體';
  const appFunction = iconAnalysis?.appFunction || '原有功能';
  const mustPreserve =
    functionGuard.length > 0
      ? functionGuard.join(', ')
      : iconAnalysis?.mustPreserve?.join(', ') || '核心識別元素';

  const additionalSection = additionalPrompt ? `\n額外指示: ${additionalPrompt}\n` : '';

  return `娛樂趨勢演化模式：附上的圖片是現有的 App Icon（種子 icon）。

核心主體：${coreSubject}
App 功能：${appFunction}

演化關鍵規則：
1. 必須保留：${mustPreserve}
2. 核心主體必須一眼可辨認 - 這是「演化」不是「重新設計」
3. 保持 App 功能的視覺暗示
4. 維持 icon 格式：方形、居中、適合 App Store

選擇的演化維度：
${dimensionsText}
${additionalSection}
輸出要求：
${getRenderingStylePrompt(renderingStyle || 'match_seed', iconAnalysis?.currentStyle)}
- 必須感覺像種子 icon 的自然演化，而非替換品`;
}

/**
 * Check if any dimension is enabled
 * @deprecated Use unified suggestion flow instead
 */
export function hasEnabledDimensions(selectedDimensions: SelectedDimensions): boolean {
  return (
    selectedDimensions.style.enabled ||
    selectedDimensions.pose.enabled ||
    selectedDimensions.costume.enabled ||
    selectedDimensions.mood.enabled
  );
}

// New unified suggestion prompt builder

export interface BuildUnifiedPromptOptions {
  evolutionDirection: string;
  iconAnalysis?: IconAnalysis | null;
  functionGuard?: string[];
  additionalPrompt?: string;
  renderingStyle?: RenderingStyleId;
}

/**
 * Build the evolution prompt from a unified suggestion.
 * Used in the new simplified flow that replaces the 4-dimension system.
 */
export function buildUnifiedEvolutionPrompt(options: BuildUnifiedPromptOptions): string {
  const { evolutionDirection, iconAnalysis, functionGuard = [], additionalPrompt, renderingStyle } = options;

  const coreSubject = iconAnalysis?.coreSubject || '原有主體';
  const appFunction = iconAnalysis?.appFunction || '原有功能';
  const mustPreserve =
    functionGuard.length > 0
      ? functionGuard.join(', ')
      : iconAnalysis?.mustPreserve?.join(', ') || '核心識別元素';

  const additionalSection = additionalPrompt ? `\n額外指示: ${additionalPrompt}\n` : '';

  return `娛樂趨勢演化模式：附上的圖片是現有的 App Icon（種子 icon）。

核心主體：${coreSubject}
App 功能：${appFunction}

演化關鍵規則：
1. 必須保留：${mustPreserve}
2. 核心主體必須一眼可辨認 - 這是「演化」不是「重新設計」
3. 保持 App 功能的視覺暗示
4. 維持 icon 格式：方形、居中、適合 App Store

演化方向：
${evolutionDirection}
${additionalSection}
輸出要求：
${getRenderingStylePrompt(renderingStyle || 'match_seed', iconAnalysis?.currentStyle)}
- 必須感覺像種子 icon 的自然演化，而非替換品`;
}
