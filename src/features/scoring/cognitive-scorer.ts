/**
 * CognitiveScorer - セッション結果 → 4軸スコア算出
 *
 * 4軸: Score / Confidence / Load / Need
 *
 * Score算出:
 *   正答率(35%) + 反応時間(20%) + 到達レベル(20%) + 自立度(15%) + 集中度(10%)
 *
 * Confidence:
 *   High: 7日で5セッション以上 かつ 変動係数<0.2
 *   Medium: 3-4セッション or 変動係数0.2-0.4
 *   Low: 2セッション以下 or 変動係数>0.4
 *
 * Load:
 *   認知負荷(40%) + 後半正答率低下(30%) + 集中度低下(30%)
 */

import type { AgeGroup, CognitiveDomain, ScoreTrend, ScoreConfidence, DomainScore } from '@/types';
import { normalizeAccuracy, normalizeReactionTime, normalizeDifficultyLevel } from './norm-engine';

/** Raw session data for scoring */
export interface SessionScoreInput {
  domain: CognitiveDomain;
  accuracy: number;              // 0-1
  avgReactionTimeMs: number;
  maxDifficultyLevel: number;    // Highest difficulty reached
  hintsUsed: number;
  totalTrials: number;
  correctTrials: number;
  // For load calculation
  firstHalfAccuracy?: number;    // Accuracy in first half of trials
  secondHalfAccuracy?: number;   // Accuracy in second half
  biometricCognitiveLoad?: number; // 0-100 from camera
  biometricAttention?: number;     // 0-100 from camera
}

/** Historical data for trend/confidence */
export interface HistoricalData {
  recentScores: number[];     // Last 7 days of scores
  sessionCount7d: number;
  lastAssessedAt: string;
  lastPlayedDaysAgo: number;
}

/**
 * Calculate the composite Score (0-100) from session data.
 *
 * Weights: 正答率(35%) + 反応時間(20%) + 到達レベル(20%) + 自立度(15%) + 集中度(10%)
 */
export function calculateScore(
  input: SessionScoreInput,
  ageGroup: AgeGroup,
): number {
  // 1. Accuracy component (35%)
  const accuracyScore = normalizeAccuracy(input.accuracy, ageGroup);

  // 2. Reaction time component (20%)
  const rtScore = normalizeReactionTime(input.avgReactionTimeMs, ageGroup);

  // 3. Difficulty level reached (20%)
  const levelScore = normalizeDifficultyLevel(input.maxDifficultyLevel, ageGroup);

  // 4. Independence / 自立度 (15%) — fewer hints = more independent
  const maxExpectedHints = Math.max(1, input.totalTrials * 0.3); // Up to 30% hint rate
  const independenceScore = Math.round(
    Math.min(100, Math.max(0, (1 - input.hintsUsed / maxExpectedHints) * 100))
  );

  // 5. Focus / 集中度 (10%)
  let focusScore = 70; // Default when no biometric data
  if (input.biometricAttention !== undefined) {
    focusScore = input.biometricAttention;
  }

  const composite =
    accuracyScore * 0.35 +
    rtScore * 0.20 +
    levelScore * 0.20 +
    independenceScore * 0.15 +
    focusScore * 0.10;

  return Math.round(Math.min(100, Math.max(0, composite)));
}

/**
 * Calculate Load (0-100): fatigue/stress indicator.
 *
 * Weights: 認知負荷(40%) + 後半正答率低下(30%) + 集中度低下(30%)
 */
export function calculateLoad(input: SessionScoreInput): number {
  // 1. Cognitive load from biometrics (40%)
  const cognitiveLoad = input.biometricCognitiveLoad ?? 50;

  // 2. Second-half accuracy drop (30%)
  let accuracyDropScore = 50; // Neutral if no data
  if (input.firstHalfAccuracy !== undefined && input.secondHalfAccuracy !== undefined) {
    const drop = input.firstHalfAccuracy - input.secondHalfAccuracy;
    // drop > 0 means performance declined → higher load
    accuracyDropScore = Math.min(100, Math.max(0, 50 + drop * 200));
  }

  // 3. Focus decline (30%)
  let focusDecline = 50;
  if (input.biometricAttention !== undefined) {
    // Lower attention = higher load
    focusDecline = Math.min(100, Math.max(0, 100 - input.biometricAttention));
  }

  const load =
    cognitiveLoad * 0.40 +
    accuracyDropScore * 0.30 +
    focusDecline * 0.30;

  return Math.round(Math.min(100, Math.max(0, load)));
}

/**
 * Determine score trend from historical data.
 */
export function calculateTrend(history: HistoricalData): ScoreTrend {
  const scores = history.recentScores;
  if (scores.length < 2) return 'stable';

  // Compare average of last 2 vs previous scores
  const recent = scores.slice(-2);
  const older = scores.slice(0, -2);

  if (older.length === 0) return 'stable';

  const recentAvg = recent.reduce((a, b) => a + b, 0) / recent.length;
  const olderAvg = older.reduce((a, b) => a + b, 0) / older.length;

  const diff = recentAvg - olderAvg;
  if (diff > 5) return 'improving';
  if (diff < -5) return 'declining';
  return 'stable';
}

/**
 * Determine confidence level from session count and score variability.
 */
export function calculateConfidence(history: HistoricalData): ScoreConfidence {
  const { sessionCount7d, recentScores } = history;

  // Calculate coefficient of variation
  let cv = 0;
  if (recentScores.length >= 2) {
    const mean = recentScores.reduce((a, b) => a + b, 0) / recentScores.length;
    if (mean > 0) {
      const variance = recentScores.reduce((s, v) => s + (v - mean) ** 2, 0) / recentScores.length;
      cv = Math.sqrt(variance) / mean;
    }
  }

  // High: 5+ sessions in 7 days AND CV < 0.2
  if (sessionCount7d >= 5 && cv < 0.2) return 'high';

  // Low: 2 or fewer sessions OR CV > 0.4
  if (sessionCount7d <= 2 || cv > 0.4) return 'low';

  // Medium: everything else
  return 'medium';
}

/**
 * Build a complete DomainScore from session and historical data.
 */
export function buildDomainScore(
  input: SessionScoreInput,
  history: HistoricalData,
  ageGroup: AgeGroup,
): DomainScore {
  const score = calculateScore(input, ageGroup);
  const load = calculateLoad(input);
  const scoreTrend = calculateTrend(history);
  const confidence = calculateConfidence(history);

  // Need is calculated separately via need-calculator
  // Placeholder — will be overwritten by NeedCalculator
  const need = 0;

  return {
    domain: input.domain,
    score,
    scoreTrend,
    confidence,
    load,
    need,
    lastAssessedAt: history.lastAssessedAt,
    sessionCount7d: history.sessionCount7d,
  };
}
