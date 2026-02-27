import type { Tier } from '@/features/gating';

export type InstructionLevel = 'L1' | 'L2' | 'L3' | 'L4';

export interface InstructionLevelConfig {
  level: InstructionLevel;
  label: string;
  showDemo: boolean;
  showText: boolean;
  showAudio: boolean;
  showIcon: boolean;
  audioToggleable: boolean;
  textStyle: 'none' | 'icon-only' | 'hiragana' | 'standard';
}

export const INSTRUCTION_LEVELS: Record<InstructionLevel, InstructionLevelConfig> = {
  L1: {
    level: 'L1',
    label: '非言語',
    showDemo: true,
    showText: false,
    showAudio: false,
    showIcon: false,
    audioToggleable: false,
    textStyle: 'none',
  },
  L2: {
    level: 'L2',
    label: '最小言語',
    showDemo: true,
    showText: false,
    showAudio: true,
    showIcon: true,
    audioToggleable: false,
    textStyle: 'icon-only',
  },
  L3: {
    level: 'L3',
    label: '音声支援',
    showDemo: true,
    showText: true,
    showAudio: true,
    showIcon: true,
    audioToggleable: false,
    textStyle: 'hiragana',
  },
  L4: {
    level: 'L4',
    label: '視覚優位',
    showDemo: true,
    showText: true,
    showAudio: true,
    showIcon: true,
    audioToggleable: true,
    textStyle: 'standard',
  },
};

/** ティアからデフォルト指示レベルを決定 */
export function getDefaultInstructionLevel(tier: Tier): InstructionLevel {
  switch (tier) {
    case 1: return 'L1';
    case 2: return 'L2';
    case 3: return 'L3'; // L4は保護者が手動で設定
  }
}
