/**
 * FrustrationDetector - フラストレーション兆候検知
 *
 * 科学的根拠：連続誤答、反応停止、ランダム高速タップは
 * 認知的過負荷やモチベーション低下の兆候。
 * 早期検知して難易度低下・休憩提案で情動安全を守る。
 */

import type { FrustrationSignal, SafetyAction } from '@/types';
import {
  CONSECUTIVE_ERROR_HINT_THRESHOLD,
  CONSECUTIVE_ERROR_BREAK_THRESHOLD,
  INACTIVITY_TIMEOUT_MS,
  MAX_SESSION_DURATION_MS,
} from '@/lib/constants';

export interface FrustrationDetectorConfig {
  consecutiveErrorHintThreshold: number;
  consecutiveErrorBreakThreshold: number;
  inactivityTimeoutMs: number;
  maxSessionDurationMs: number;
  rapidTapThresholdMs: number;  // Minimum expected RT; faster = random
  rapidTapWindowSize: number;    // How many rapid taps to consider a signal
}

const DEFAULT_CONFIG: FrustrationDetectorConfig = {
  consecutiveErrorHintThreshold: CONSECUTIVE_ERROR_HINT_THRESHOLD,
  consecutiveErrorBreakThreshold: CONSECUTIVE_ERROR_BREAK_THRESHOLD,
  inactivityTimeoutMs: INACTIVITY_TIMEOUT_MS,
  maxSessionDurationMs: MAX_SESSION_DURATION_MS,
  rapidTapThresholdMs: 200,
  rapidTapWindowSize: 3,
};

export class FrustrationDetector {
  private config: FrustrationDetectorConfig;
  private consecutiveErrors = 0;
  private recentReactionTimes: number[] = [];
  private lastActivityMs = 0;
  private sessionStartMs = 0;

  constructor(config?: Partial<FrustrationDetectorConfig>) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  /** Call at session start */
  startSession(nowMs: number): void {
    this.sessionStartMs = nowMs;
    this.lastActivityMs = nowMs;
    this.consecutiveErrors = 0;
    this.recentReactionTimes = [];
  }

  /** Record a trial result. Returns action if frustration detected. */
  recordResult(isCorrect: boolean, reactionTimeMs: number, nowMs: number): SafetyAction | null {
    this.lastActivityMs = nowMs;

    if (isCorrect) {
      this.consecutiveErrors = 0;
    } else {
      this.consecutiveErrors++;
    }

    // Track reaction times for rapid tap detection
    this.recentReactionTimes.push(reactionTimeMs);
    if (this.recentReactionTimes.length > this.config.rapidTapWindowSize) {
      this.recentReactionTimes.shift();
    }

    // Check: consecutive errors → break
    if (this.consecutiveErrors >= this.config.consecutiveErrorBreakThreshold) {
      return {
        type: 'suggest_break',
        reason: 'consecutive_errors',
        timestamp_ms: nowMs,
      };
    }

    // Check: rapid random taps (giving up) — override hint to suggest break
    if (this.isRapidRandomTapping()) {
      return {
        type: 'suggest_break',
        reason: 'rapid_random_taps',
        timestamp_ms: nowMs,
      };
    }

    // Check: consecutive errors → hint
    if (this.consecutiveErrors >= this.config.consecutiveErrorHintThreshold) {
      return {
        type: 'show_hint',
        reason: 'consecutive_errors',
        timestamp_ms: nowMs,
      };
    }

    return null;
  }

  /** Check for inactivity. Call periodically (e.g., every second). */
  checkInactivity(nowMs: number): SafetyAction | null {
    if (this.lastActivityMs === 0) return null;

    const elapsed = nowMs - this.lastActivityMs;
    if (elapsed >= this.config.inactivityTimeoutMs) {
      return {
        type: 'suggest_break',
        reason: 'response_timeout',
        timestamp_ms: nowMs,
      };
    }

    return null;
  }

  /** Check if session has been too long */
  checkSessionDuration(nowMs: number): SafetyAction | null {
    if (this.sessionStartMs === 0) return null;

    const elapsed = nowMs - this.sessionStartMs;
    if (elapsed >= this.config.maxSessionDurationMs) {
      return {
        type: 'end_session',
        reason: 'session_too_long',
        timestamp_ms: nowMs,
      };
    }

    return null;
  }

  /** Detect if recent taps are suspiciously rapid (random mashing) */
  private isRapidRandomTapping(): boolean {
    if (this.recentReactionTimes.length < this.config.rapidTapWindowSize) {
      return false;
    }

    return this.recentReactionTimes.every(
      rt => rt < this.config.rapidTapThresholdMs
    );
  }

  /** Get current consecutive error count */
  getConsecutiveErrors(): number {
    return this.consecutiveErrors;
  }

  /** Reset state */
  reset(): void {
    this.consecutiveErrors = 0;
    this.recentReactionTimes = [];
    this.lastActivityMs = 0;
    this.sessionStartMs = 0;
  }
}
