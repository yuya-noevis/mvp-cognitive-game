import type { Tier } from '@/features/gating';
import { getSessionConfig, getDailyLimitConfig } from './session-config';
import type { SessionConfig, DailyLimitConfig } from './session-config';

export type TrialPhase = 'warmup' | 'scored';
export type SessionState = 'not-started' | 'warmup' | 'playing' | 'completed' | 'daily-limit-reached';

export interface TrialResult {
  trialIndex: number;
  phase: TrialPhase;
  correct: boolean;
  responseTimeMs: number;
  timestamp: number;
}

export class SessionManager {
  private config: SessionConfig;
  private dailyLimit: DailyLimitConfig;
  private trials: TrialResult[] = [];
  private state: SessionState = 'not-started';
  private startTime: number = 0;

  constructor(tier: Tier) {
    this.config = getSessionConfig(tier);
    this.dailyLimit = getDailyLimitConfig(tier);
  }

  start(): void {
    this.state = this.config.warmupTrials > 0 ? 'warmup' : 'playing';
    this.startTime = Date.now();
    this.trials = [];
  }

  getConfig(): SessionConfig {
    return this.config;
  }

  getDailyLimit(): DailyLimitConfig {
    return this.dailyLimit;
  }

  getCurrentTrialIndex(): number {
    return this.trials.length;
  }

  getTotalTrialCount(): number {
    return this.config.warmupTrials + this.config.maxTrials;
  }

  getCurrentPhase(): TrialPhase {
    if (this.trials.length < this.config.warmupTrials) return 'warmup';
    return 'scored';
  }

  isWarmup(): boolean {
    return this.getCurrentPhase() === 'warmup';
  }

  recordTrial(correct: boolean, responseTimeMs: number): {
    phase: TrialPhase;
    isSessionComplete: boolean;
    scoredTrialCount: number;
    progress: number;
  } {
    const phase = this.getCurrentPhase();
    this.trials.push({
      trialIndex: this.trials.length,
      phase,
      correct,
      responseTimeMs,
      timestamp: Date.now(),
    });

    if (phase === 'warmup' && this.trials.length === this.config.warmupTrials) {
      this.state = 'playing';
    }

    const scoredTrials = this.trials.filter(t => t.phase === 'scored');
    const totalTrials = this.config.warmupTrials + this.config.maxTrials;
    const isComplete = this.trials.length >= totalTrials;

    if (isComplete) {
      this.state = 'completed';
    }

    return {
      phase,
      isSessionComplete: isComplete,
      scoredTrialCount: scoredTrials.length,
      progress: this.trials.length / totalTrials,
    };
  }

  getWarmupAdjustment(): number {
    const warmupTrials = this.trials.filter(t => t.phase === 'warmup');
    if (warmupTrials.length === 0) return 0;

    const warmupCorrect = warmupTrials.filter(t => t.correct).length;
    const warmupRate = warmupCorrect / warmupTrials.length;

    if (warmupRate === 1.0) return 0;
    if (warmupRate >= 0.5) return -1;
    return -2;
  }

  getScoredResults(): TrialResult[] {
    return this.trials.filter(t => t.phase === 'scored');
  }

  getSessionDurationSec(): number {
    if (this.startTime === 0) return 0;
    return (Date.now() - this.startTime) / 1000;
  }

  getSessionDurationMs(): number {
    if (this.startTime === 0) return 0;
    return Date.now() - this.startTime;
  }

  getState(): SessionState {
    return this.state;
  }

  getScoredStats(): { totalCorrect: number; totalAttempts: number; accuracy: number } {
    const scored = this.getScoredResults();
    const totalCorrect = scored.filter(t => t.correct).length;
    const totalAttempts = scored.length;
    const accuracy = totalAttempts > 0 ? totalCorrect / totalAttempts : 0;
    return { totalCorrect, totalAttempts, accuracy };
  }

  /** Override config for dev tools */
  overrideMaxTrials(maxTrials: number): void {
    this.config = { ...this.config, maxTrials };
  }

  overrideWarmupTrials(warmupTrials: number): void {
    this.config = { ...this.config, warmupTrials };
  }
}
