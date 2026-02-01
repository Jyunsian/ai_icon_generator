import { describe, it, expect } from 'vitest';
import { buildEvolutionPrompt, hasEnabledDimensions } from '../promptBuilder';
import type { SelectedDimensions, IconAnalysis } from '../../types';

const createDimension = (enabled: boolean, value: string) => ({ enabled, value });

const createSelectedDimensions = (overrides: Partial<SelectedDimensions> = {}): SelectedDimensions => ({
  style: createDimension(false, ''),
  pose: createDimension(false, ''),
  costume: createDimension(false, ''),
  mood: createDimension(false, ''),
  ...overrides,
});

const createIconAnalysis = (overrides: Partial<IconAnalysis> = {}): IconAnalysis => ({
  coreSubject: 'Orange cat mascot',
  appFunction: 'Timer app',
  currentStyle: '3D cartoon',
  mustPreserve: ['cat face', 'orange color'],
  ...overrides,
});

describe('buildEvolutionPrompt', () => {
  it('should build prompt with no dimensions enabled', () => {
    const selectedDimensions = createSelectedDimensions();

    const prompt = buildEvolutionPrompt({ selectedDimensions });

    expect(prompt).toContain('娛樂趨勢演化模式');
    expect(prompt).toContain('保持原有風格，僅進行品質提升');
  });

  it('should include enabled style dimension', () => {
    const selectedDimensions = createSelectedDimensions({
      style: createDimension(true, '賽博龐克風格'),
    });

    const prompt = buildEvolutionPrompt({ selectedDimensions });

    expect(prompt).toContain('風格演化: 賽博龐克風格');
  });

  it('should include enabled pose dimension', () => {
    const selectedDimensions = createSelectedDimensions({
      pose: createDimension(true, '跳躍姿勢'),
    });

    const prompt = buildEvolutionPrompt({ selectedDimensions });

    expect(prompt).toContain('動作演化: 跳躍姿勢');
  });

  it('should include enabled costume dimension', () => {
    const selectedDimensions = createSelectedDimensions({
      costume: createDimension(true, '太空裝'),
    });

    const prompt = buildEvolutionPrompt({ selectedDimensions });

    expect(prompt).toContain('服裝/道具演化: 太空裝');
  });

  it('should include enabled mood dimension', () => {
    const selectedDimensions = createSelectedDimensions({
      mood: createDimension(true, '霓虹燈光'),
    });

    const prompt = buildEvolutionPrompt({ selectedDimensions });

    expect(prompt).toContain('背景/氛圍演化: 霓虹燈光');
  });

  it('should include multiple enabled dimensions', () => {
    const selectedDimensions = createSelectedDimensions({
      style: createDimension(true, '賽博龐克風格'),
      mood: createDimension(true, '霓虹燈光'),
    });

    const prompt = buildEvolutionPrompt({ selectedDimensions });

    expect(prompt).toContain('風格演化: 賽博龐克風格');
    expect(prompt).toContain('背景/氛圍演化: 霓虹燈光');
    expect(prompt).not.toContain('動作演化');
    expect(prompt).not.toContain('服裝/道具演化');
  });

  it('should include iconAnalysis data when provided', () => {
    const selectedDimensions = createSelectedDimensions({
      style: createDimension(true, 'Test style'),
    });
    const iconAnalysis = createIconAnalysis();

    const prompt = buildEvolutionPrompt({ selectedDimensions, iconAnalysis });

    expect(prompt).toContain('核心主體：Orange cat mascot');
    expect(prompt).toContain('App 功能：Timer app');
    expect(prompt).toContain('必須保留：cat face, orange color');
  });

  it('should use default values when iconAnalysis is not provided', () => {
    const selectedDimensions = createSelectedDimensions();

    const prompt = buildEvolutionPrompt({ selectedDimensions });

    expect(prompt).toContain('核心主體：原有主體');
    expect(prompt).toContain('App 功能：原有功能');
    expect(prompt).toContain('必須保留：核心識別元素');
  });

  it('should use functionGuard over iconAnalysis.mustPreserve', () => {
    const selectedDimensions = createSelectedDimensions();
    const iconAnalysis = createIconAnalysis();
    const functionGuard = ['Keep the smile', 'Preserve brand color'];

    const prompt = buildEvolutionPrompt({
      selectedDimensions,
      iconAnalysis,
      functionGuard,
    });

    expect(prompt).toContain('必須保留：Keep the smile, Preserve brand color');
    expect(prompt).not.toContain('cat face');
  });

  it('should include additionalPrompt when provided', () => {
    const selectedDimensions = createSelectedDimensions();

    const prompt = buildEvolutionPrompt({
      selectedDimensions,
      additionalPrompt: 'Make it more vibrant',
    });

    expect(prompt).toContain('額外指示: Make it more vibrant');
  });

  it('should not include additionalPrompt section when not provided', () => {
    const selectedDimensions = createSelectedDimensions();

    const prompt = buildEvolutionPrompt({ selectedDimensions });

    expect(prompt).not.toContain('額外指示');
  });

  it('should include output requirements', () => {
    const selectedDimensions = createSelectedDimensions();

    const prompt = buildEvolutionPrompt({ selectedDimensions });

    expect(prompt).toContain('輸出要求');
    expect(prompt).toContain('App Store icon 格式');
    expect(prompt).toContain('高保真 3D 渲染');
  });

  it('should not include dimension with enabled=true but empty value', () => {
    const selectedDimensions = createSelectedDimensions({
      style: createDimension(true, ''),
    });

    const prompt = buildEvolutionPrompt({ selectedDimensions });

    expect(prompt).not.toContain('風格演化:');
    expect(prompt).toContain('保持原有風格，僅進行品質提升');
  });
});

describe('hasEnabledDimensions', () => {
  it('should return false when no dimensions are enabled', () => {
    const selectedDimensions = createSelectedDimensions();

    expect(hasEnabledDimensions(selectedDimensions)).toBe(false);
  });

  it('should return true when style is enabled', () => {
    const selectedDimensions = createSelectedDimensions({
      style: createDimension(true, 'test'),
    });

    expect(hasEnabledDimensions(selectedDimensions)).toBe(true);
  });

  it('should return true when pose is enabled', () => {
    const selectedDimensions = createSelectedDimensions({
      pose: createDimension(true, 'test'),
    });

    expect(hasEnabledDimensions(selectedDimensions)).toBe(true);
  });

  it('should return true when costume is enabled', () => {
    const selectedDimensions = createSelectedDimensions({
      costume: createDimension(true, 'test'),
    });

    expect(hasEnabledDimensions(selectedDimensions)).toBe(true);
  });

  it('should return true when mood is enabled', () => {
    const selectedDimensions = createSelectedDimensions({
      mood: createDimension(true, 'test'),
    });

    expect(hasEnabledDimensions(selectedDimensions)).toBe(true);
  });

  it('should return true when multiple dimensions are enabled', () => {
    const selectedDimensions = createSelectedDimensions({
      style: createDimension(true, 'test'),
      mood: createDimension(true, 'test'),
    });

    expect(hasEnabledDimensions(selectedDimensions)).toBe(true);
  });
});
