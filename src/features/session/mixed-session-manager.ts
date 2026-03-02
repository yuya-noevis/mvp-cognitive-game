import type { IntegratedGameId } from '@/games/integrated/types';
import type { MixedSessionPlan, SessionGameSlot } from './mixed-session';

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
  private startTime: number = 0;

  constructor(plan: MixedSessionPlan) {
    this.plan = plan;
    this.startTime = Date.now();
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
    // ウォームアップ処理
    if (this.isWarmup()) {
      this.totalTrialsCompleted++;
      if (this.totalTrialsCompleted >= this.plan.config.warmupTrials) {
        this.warmupCompleted = true;
        this.totalTrialsCompleted = 0;
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

    const scoredTotal = this.plan.games.reduce((sum, g) => sum + g.trialCount, 0);
    const progress = this.totalTrialsCompleted / scoredTotal;

    // 現在のゲームの試行が完了したか
    if (this.currentTrialInGame >= this.getCurrentGame().trialCount) {
      this.currentGameIndex++;
      this.currentTrialInGame = 0;

      // 全ゲーム完了
      if (this.currentGameIndex >= this.plan.games.length) {
        return {
          isGameSwitch: false,
          isSessionComplete: true,
          progress: 1,
        };
      }

      // 次のゲームに切替
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
}
