import type { IntegratedGameId } from '@/games/integrated/types';
import type { MixedSessionPlan, SessionGameSlot } from './mixed-session';

// Session state debug logging (development only)
function debugSessionLog(event: string, state: Record<string, unknown>) {
  if (process.env.NODE_ENV === 'development') {
    console.log(`[Session] ${event}`, {
      ...state,
      timestamp: new Date().toISOString(),
    });
  }
}

export interface MixedTrialResult {
  gameId: IntegratedGameId;
  gameIndex: number;
  trialIndex: number;
  correct: boolean;
  responseTimeMs: number;
  timestamp: number;
}

export class MixedSessionManager {
  private plan: MixedSessionPlan;
  private currentGameIndex: number = 0;
  private currentTrialInGame: number = 0;
  private totalTrialsCompleted: number = 0;
  private warmupCompleted: boolean = false;
  private results: MixedTrialResult[] = [];
  private warmupResults: { correct: boolean }[] = [];
  private startTime: number = 0;

  constructor(plan: MixedSessionPlan) {
    this.plan = plan;
    this.startTime = Date.now();

    const scoredTotal = plan.games.reduce((sum, g) => sum + g.trialCount, 0);
    debugSessionLog('SESSION_START', {
      gameCount: plan.games.length,
      gameIds: plan.games.map(g => g.gameId),
      warmupTrials: plan.config.warmupTrials,
      scoredTotal,
      totalTrials: plan.config.warmupTrials + scoredTotal,
    });
  }

  getCurrentGame(): SessionGameSlot {
    return this.plan.games[this.currentGameIndex];
  }

  getCurrentGameId(): IntegratedGameId {
    return this.getCurrentGame().gameId;
  }

  isWarmup(): boolean {
    return !this.warmupCompleted;
  }

  getPlan(): MixedSessionPlan {
    return this.plan;
  }

  getCurrentGameIndex(): number {
    return this.currentGameIndex;
  }

  getCurrentTrialInGame(): number {
    return this.currentTrialInGame;
  }

  getTotalTrialsCompleted(): number {
    return this.totalTrialsCompleted;
  }

  recordTrial(correct: boolean, responseTimeMs: number): {
    isGameSwitch: boolean;
    isSessionComplete: boolean;
    nextGameId?: IntegratedGameId;
    progress: number;
  } {
    const prevTotal = this.totalTrialsCompleted;

    // ウォームアップ処理
    if (this.isWarmup()) {
      this.warmupResults.push({ correct });
      this.totalTrialsCompleted++;
      if (this.totalTrialsCompleted >= this.plan.config.warmupTrials) {
        this.warmupCompleted = true;
        this.totalTrialsCompleted = 0;

        debugSessionLog('WARMUP_COMPLETE', {
          currentGameIndex: this.currentGameIndex,
          currentTrialInGame: this.currentTrialInGame,
          totalTrialsCompleted: this.totalTrialsCompleted,
          currentGameId: this.getCurrentGameId(),
        });
      }
      return {
        isGameSwitch: false,
        isSessionComplete: false,
        progress: 0,
      };
    }

    // 本番試行記録
    this.results.push({
      gameId: this.getCurrentGameId(),
      gameIndex: this.currentGameIndex,
      trialIndex: this.currentTrialInGame,
      correct,
      responseTimeMs,
      timestamp: Date.now(),
    });

    this.currentTrialInGame++;
    this.totalTrialsCompleted++;

    // State reset detection
    if (this.totalTrialsCompleted < prevTotal) {
      debugSessionLog('⚠️ STATE_RESET_DETECTED', {
        previousTotal: prevTotal,
        currentTotal: this.totalTrialsCompleted,
        currentGameIndex: this.currentGameIndex,
        currentGameId: this.getCurrentGameId(),
      });
    }

    const scoredTotal = this.plan.games.reduce((sum, g) => sum + g.trialCount, 0);
    const progress = this.totalTrialsCompleted / scoredTotal;

    debugSessionLog('TRIAL_COMPLETE', {
      correct,
      currentGameIndex: this.currentGameIndex,
      currentTrialInGame: this.currentTrialInGame,
      totalTrialsCompleted: this.totalTrialsCompleted,
      totalTrialsInSession: scoredTotal,
      currentGameId: this.getCurrentGameId(),
      progress: Math.round(progress * 100) + '%',
    });

    // 現在のゲームの試行が完了したか
    if (this.currentTrialInGame >= this.getCurrentGame().trialCount) {
      this.currentGameIndex++;
      this.currentTrialInGame = 0;

      // 全ゲーム完了
      if (this.currentGameIndex >= this.plan.games.length) {
        debugSessionLog('SESSION_COMPLETE', {
          totalTrialsCompleted: this.totalTrialsCompleted,
          totalCorrect: this.results.filter(r => r.correct).length,
          totalAttempts: this.results.length,
          durationMs: this.getSessionDurationMs(),
        });

        return {
          isGameSwitch: false,
          isSessionComplete: true,
          progress: 1,
        };
      }

      // 次のゲームに切替
      debugSessionLog('GAME_SWITCH', {
        fromGameIndex: this.currentGameIndex - 1,
        toGameIndex: this.currentGameIndex,
        nextGameId: this.getCurrentGameId(),
        totalTrialsCompleted: this.totalTrialsCompleted,
        progress: Math.round(progress * 100) + '%',
      });

      return {
        isGameSwitch: true,
        isSessionComplete: false,
        nextGameId: this.getCurrentGameId(),
        progress,
      };
    }

    return {
      isGameSwitch: false,
      isSessionComplete: false,
      progress,
    };
  }

  getResults(): MixedTrialResult[] {
    return this.results;
  }

  getGameResults(gameId: IntegratedGameId): MixedTrialResult[] {
    return this.results.filter(r => r.gameId === gameId);
  }

  getScoredStats(): { totalCorrect: number; totalAttempts: number; accuracy: number } {
    const totalCorrect = this.results.filter(r => r.correct).length;
    const totalAttempts = this.results.length;
    const accuracy = totalAttempts > 0 ? totalCorrect / totalAttempts : 0;
    return { totalCorrect, totalAttempts, accuracy };
  }

  getSessionDurationMs(): number {
    if (this.startTime === 0) return 0;
    return Date.now() - this.startTime;
  }

  getSessionDurationSec(): number {
    return this.getSessionDurationMs() / 1000;
  }

  /**
   * ウォームアップ結果に基づくDDA初期難易度調整値を返す。
   * 全正解→0, 半分不正解→-1, 全不正解→-2
   */
  getWarmupAdjustment(): number {
    if (this.warmupResults.length === 0) return 0;
    const incorrectCount = this.warmupResults.filter(r => !r.correct).length;
    const incorrectRate = incorrectCount / this.warmupResults.length;
    if (incorrectRate >= 1) return -2;
    if (incorrectRate >= 0.5) return -1;
    return 0;
  }
}
