/** 感覚過敏コントロール設定 */
export interface SensorySettings {
  bgm: 'on' | 'off';
  soundEffectVolume: 'high' | 'normal' | 'low' | 'off';
  animationSpeed: 'normal' | 'slow' | 'none';
  vibration: 'on' | 'off';
}

export const DEFAULT_SENSORY_SETTINGS: SensorySettings = {
  bgm: 'on',
  soundEffectVolume: 'normal',
  animationSpeed: 'normal',
  vibration: 'on',
};

/** soundEffectVolume → 0-1 の音量値へ変換 */
export function volumeLevelToNumber(level: SensorySettings['soundEffectVolume']): number {
  switch (level) {
    case 'high':   return 1.0;
    case 'normal': return 0.7;
    case 'low':    return 0.35;
    case 'off':    return 0;
  }
}

/** animationSpeed → CSS変数値へ変換（multiplier） */
export function animationSpeedToMultiplier(speed: SensorySettings['animationSpeed']): number {
  switch (speed) {
    case 'normal': return 1;
    case 'slow':   return 2;
    case 'none':   return 0;
  }
}
