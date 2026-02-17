/**
 * TrialEngine - トライアル状態機械
 *
 * 各トライアルのライフサイクルを管理:
 * idle → presenting → awaiting_response → feedback → recording → completed
 *
 * ゲーム固有ロジックはコールバックで注入し、
 * 共通の状態遷移・ログ記録・DDA連携はエンジンが担う。
 */

import type { TrialPhase, DifficultyParams, TrialResponse, ErrorType } from '@/types';
import type { TrialState } from './types';
import { v4 as uuidv4 } from 'uuid';
import { nowMs } from '@/lib/utils';

export interface TrialEngineCallbacks {
  onTrialStart?: (trial: TrialState) => void;
  onStimulusPresented?: (trial: TrialState) => void;
  onResponseRecorded?: (trial: TrialState) => void;
  onTrialComplete?: (trial: TrialState) => void;
}

export class TrialEngine {
  private currentTrial: TrialState | null = null;
  private trialNumber = 0;
  private callbacks: TrialEngineCallbacks;

  constructor(callbacks: TrialEngineCallbacks = {}) {
    this.callbacks = callbacks;
  }

  /** Start a new trial with given stimulus and difficulty */
  startTrial(
    stimulus: Record<string, unknown>,
    correctAnswer: Record<string, unknown>,
    difficulty: DifficultyParams,
  ): TrialState {
    this.trialNumber++;
    const trial: TrialState = {
      trialId: uuidv4(),
      trialNumber: this.trialNumber,
      phase: 'idle',
      difficulty: { ...difficulty },
      stimulus,
      correctAnswer,
      response: null,
      isCorrect: null,
      reactionTimeMs: null,
      errorType: null,
      hintsUsed: 0,
      startedAt: nowMs(),
      stimulusPresentedAt: null,
    };

    this.currentTrial = trial;
    this.transitionTo('presenting');
    this.callbacks.onTrialStart?.(this.currentTrial);
    return this.currentTrial;
  }

  /** Mark stimulus as presented (starts the response clock) */
  presentStimulus(): void {
    if (!this.currentTrial || this.currentTrial.phase !== 'presenting') return;
    this.currentTrial.stimulusPresentedAt = nowMs();
    this.transitionTo('awaiting_response');
    this.callbacks.onStimulusPresented?.(this.currentTrial);
  }

  /** Record the participant's response */
  recordResponse(response: TrialResponse): void {
    if (!this.currentTrial || this.currentTrial.phase !== 'awaiting_response') return;

    this.currentTrial.response = response;
    if (this.currentTrial.stimulusPresentedAt) {
      this.currentTrial.reactionTimeMs =
        response.timestamp_ms - this.currentTrial.stimulusPresentedAt;
    }
    this.transitionTo('feedback');
    this.callbacks.onResponseRecorded?.(this.currentTrial);
  }

  /** Record a hint was used */
  useHint(): void {
    if (!this.currentTrial) return;
    this.currentTrial.hintsUsed++;
  }

  /** Complete the trial with correctness evaluation */
  completeTrial(isCorrect: boolean, errorType: ErrorType = null): TrialState {
    if (!this.currentTrial) {
      throw new Error('No active trial to complete');
    }

    this.currentTrial.isCorrect = isCorrect;
    this.currentTrial.errorType = errorType;
    this.transitionTo('completed');
    this.callbacks.onTrialComplete?.(this.currentTrial);

    const completed = this.currentTrial;
    this.currentTrial = null;
    return completed;
  }

  /** Get the current trial state */
  getCurrentTrial(): TrialState | null {
    return this.currentTrial;
  }

  /** Get current trial number */
  getTrialNumber(): number {
    return this.trialNumber;
  }

  /** Reset engine for a new session */
  reset(): void {
    this.currentTrial = null;
    this.trialNumber = 0;
  }

  private transitionTo(phase: TrialPhase): void {
    if (this.currentTrial) {
      this.currentTrial.phase = phase;
    }
  }
}
