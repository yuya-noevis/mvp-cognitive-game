export class VibrationManager {
  private supported: boolean;

  constructor() {
    this.supported = typeof navigator !== 'undefined' && 'vibrate' in navigator;
  }

  /** 正解: 軽いパルス (50ms) */
  vibrateCorrect(): void {
    if (this.supported) navigator.vibrate(50);
  }

  /** 連続正解ブースト: ダブルパルス */
  vibrateStreak(): void {
    if (this.supported) navigator.vibrate([50, 50, 50]);
  }

  // 不正解: なし（振動で罰を与えない）
  // 意図的に実装しない
}

export const vibrationManager = new VibrationManager();
