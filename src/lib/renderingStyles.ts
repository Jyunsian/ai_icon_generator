import type { RenderingStyleId, RenderingStyle } from '../types';

/**
 * Rendering style presets with Chinese prompt fragments.
 * Each style defines visual output requirements for icon generation.
 */
export const RENDERING_STYLES: Record<RenderingStyleId, RenderingStyle> = {
  match_seed: {
    id: 'match_seed',
    name: 'Match Original',
    description: 'Preserve the visual style of your seed icon',
    promptFragment: '', // Dynamic - uses iconAnalysis.currentStyle
  },
  '3d_render': {
    id: '3d_render',
    name: '3D Render',
    description: 'High-fidelity 3D with soft global illumination',
    promptFragment: `- App Store icon 格式
- 高保真 3D 渲染
- 柔和的全局光照
- 鮮豔但專業的配色
- 乾淨的邊緣，居中構圖
- 中性或微漸層背景`,
  },
  flat: {
    id: 'flat',
    name: 'Flat Design',
    description: 'Clean, minimal with solid colors, no shadows',
    promptFragment: `- App Store icon 格式
- 扁平 2D 設計風格
- 純色塊，無漸層或陰影
- 簡潔幾何形狀
- 高對比配色
- 乾淨的邊緣，居中構圖
- 純色或簡單背景`,
  },
  minimalist: {
    id: 'minimalist',
    name: 'Minimalist',
    description: 'Ultra-simplified, essential elements only',
    promptFragment: `- App Store icon 格式
- 極簡風格
- 僅保留最核心的視覺元素
- 大量留白
- 單色或雙色配色
- 簡化的線條和形狀
- 乾淨純色背景`,
  },
  glassmorphism: {
    id: 'glassmorphism',
    name: 'Glassmorphism',
    description: 'Frosted glass effect with blur and transparency',
    promptFragment: `- App Store icon 格式
- 玻璃擬態風格 (Glassmorphism)
- 毛玻璃效果與模糊
- 半透明層次
- 柔和的光線折射
- 精緻的邊框高光
- 漸層或抽象背景`,
  },
  neo_brutalism: {
    id: 'neo_brutalism',
    name: 'Neo-Brutalism',
    description: 'Bold colors, thick black outlines, raw aesthetic',
    promptFragment: `- App Store icon 格式
- 新粗野主義風格 (Neo-Brutalism)
- 粗黑色輪廓線
- 大膽鮮豔的純色
- 明顯的陰影偏移
- 故意的「未完成」美感
- 高對比色塊背景`,
  },
  claymorphism: {
    id: 'claymorphism',
    name: 'Claymorphism',
    description: 'Soft clay-like 3D with rounded edges',
    promptFragment: `- App Store icon 格式
- 黏土擬態風格 (Claymorphism)
- 柔軟的黏土質感
- 圓潤的邊緣和角落
- 柔和的內外陰影
- 溫暖的粉彩配色
- 立體但不銳利
- 柔和漸層背景`,
  },
  pixel_art: {
    id: 'pixel_art',
    name: 'Pixel Art',
    description: 'Retro 8-bit/16-bit pixel aesthetic',
    promptFragment: `- App Store icon 格式
- 像素藝術風格
- 8-bit 或 16-bit 復古美學
- 清晰可見的像素邊緣
- 有限的調色盤
- 懷舊遊戲風格
- 純色或簡單像素背景`,
  },
  isometric: {
    id: 'isometric',
    name: 'Isometric 3D',
    description: '3D isometric projection view',
    promptFragment: `- App Store icon 格式
- 等距立體風格 (Isometric)
- 等角投影視角
- 精確的 30 度角度
- 清晰的立體層次
- 乾淨的幾何線條
- 鮮豔但協調的配色
- 中性或漸層背景`,
  },
};

/**
 * Get the rendering style prompt fragment.
 * For 'match_seed', uses the seed icon's current style from analysis.
 *
 * @param styleId - The selected rendering style ID
 * @param seedStyle - The current style from iconAnalysis (for match_seed mode)
 * @returns The prompt fragment for output requirements
 */
export function getRenderingStylePrompt(
  styleId: RenderingStyleId,
  seedStyle?: string
): string {
  if (styleId === 'match_seed') {
    const styleDescription = seedStyle || '原有風格';
    return `- App Store icon 格式
- 保持原有視覺風格：${styleDescription}
- 維持種子 icon 的渲染品質和質感
- 乾淨的邊緣，居中構圖
- 配色與原 icon 協調
- 必須感覺像種子 icon 的自然演化`;
  }

  const style = RENDERING_STYLES[styleId];
  if (!style) {
    // Fallback to 3D render for unknown styles
    return RENDERING_STYLES['3d_render'].promptFragment;
  }

  return style.promptFragment;
}

/**
 * Get all available rendering styles as an array for UI display.
 */
export function getAllRenderingStyles(): RenderingStyle[] {
  return Object.values(RENDERING_STYLES);
}
