export class StreakTracker {
  private consecutiveCorrect: number = 0;
  private totalCorrect: number = 0;
  private totalAttempts: number = 0;
  private consecutiveIncorrect: number = 0;

  recordCorrect(): {
    streak: number;
    isStreak3: boolean;
    isStreak5: boolean;
  } {
    this.consecutiveCorrect++;
    this.consecutiveIncorrect = 0;
    this.totalCorrect++;
    this.totalAttempts++;
    return {
      streak: this.consecutiveCorrect,
      isStreak3: this.consecutiveCorrect === 3,
      isStreak5: this.consecutiveCorrect === 5,
    };
  }

  recordIncorrect(): {
    consecutiveIncorrect: number;
    shouldShowHint: boolean;       // 2連続不正解
    shouldShowDemo: boolean;       // 3連続不正解
    shouldEaseDifficulty: boolean; // 3連続不正解→DDAへ通知
  } {
    this.consecutiveCorrect = 0;
    this.consecutiveIncorrect++;
    this.totalAttempts++;
    return {
      consecutiveIncorrect: this.consecutiveIncorrect,
      shouldShowHint: this.consecutiveIncorrect === 2,
      shouldShowDemo: this.consecutiveIncorrect >= 3,
      shouldEaseDifficulty: this.consecutiveIncorrect >= 3,
    };
  }

  /** 惜しい判定（near-miss）— 連続正解ブーストを失わない */
  recordNearMiss(): void {
    // consecutiveCorrectをリセットしない
    this.totalAttempts++;
  }

  reset(): void {
    this.consecutiveCorrect = 0;
    this.consecutiveIncorrect = 0;
    this.totalCorrect = 0;
    this.totalAttempts = 0;
  }

  getStats() {
    return {
      consecutiveCorrect: this.consecutiveCorrect,
      consecutiveIncorrect: this.consecutiveIncorrect,
      totalCorrect: this.totalCorrect,
      totalAttempts: this.totalAttempts,
      accuracy: this.totalAttempts > 0 ? this.totalCorrect / this.totalAttempts : 0,
    };
  }
}
