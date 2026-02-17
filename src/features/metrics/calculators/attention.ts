/**
 * Attention Metrics Calculator
 *
 * 科学的根拠：
 * - Hit Rate / False Alarm Rate: Signal Detection Theory の基本指標
 * - d' (d-prime): 信号検出感度。仮説レベル（トライアル数が少ない場合は不安定）
 * - RT Coefficient of Variation: 注意の持続性指標
 */

import type { ConfidenceLevel } from '@/types';
import { median } from '@/lib/utils';

export interface AttentionTrialData {
  isCorrect: boolean;
  isTarget: boolean;
  reactionTimeMs: number | null;
  responseType: 'hit' | 'miss' | 'false_alarm' | 'correct_rejection';
}

export interface AttentionMetrics {
  hit_rate: { value: number; confidence: ConfidenceLevel };
  false_alarm_rate: { value: number; confidence: ConfidenceLevel };
  d_prime: { value: number; confidence: ConfidenceLevel };
  avg_rt_ms: { value: number; confidence: ConfidenceLevel };
  rt_coefficient_of_variation: { value: number; confidence: ConfidenceLevel };
}

export function calculateAttentionMetrics(trials: AttentionTrialData[]): AttentionMetrics {
  const targetTrials = trials.filter(t => t.isTarget);
  const nonTargetTrials = trials.filter(t => !t.isTarget);

  // Hit rate
  const hits = targetTrials.filter(t => t.responseType === 'hit').length;
  const hitRate = targetTrials.length > 0 ? hits / targetTrials.length : 0;

  // False alarm rate
  const falseAlarms = nonTargetTrials.filter(t => t.responseType === 'false_alarm').length;
  const faRate = nonTargetTrials.length > 0 ? falseAlarms / nonTargetTrials.length : 0;

  // d' (d-prime) - signal detection sensitivity
  // Apply log-linear correction to avoid infinite values
  const correctedHR = (hits + 0.5) / (targetTrials.length + 1);
  const correctedFAR = (falseAlarms + 0.5) / (nonTargetTrials.length + 1);
  const dPrime = zScore(correctedHR) - zScore(correctedFAR);

  // Reaction times (hits only)
  const hitRTs = targetTrials
    .filter(t => t.responseType === 'hit' && t.reactionTimeMs !== null)
    .map(t => t.reactionTimeMs!);

  const avgRT = hitRTs.length > 0 ? median(hitRTs) : 0;

  // RT Coefficient of Variation (SD/Mean) - attention consistency
  const rtMean = hitRTs.length > 0 ? hitRTs.reduce((a, b) => a + b, 0) / hitRTs.length : 0;
  const rtSD = hitRTs.length > 1
    ? Math.sqrt(hitRTs.reduce((sum, rt) => sum + Math.pow(rt - rtMean, 2), 0) / (hitRTs.length - 1))
    : 0;
  const rtCV = rtMean > 0 ? rtSD / rtMean : 0;

  const trialCountConfidence: ConfidenceLevel = trials.length < 15 ? 'low_trial_count' : 'standard';

  return {
    hit_rate: { value: hitRate, confidence: trialCountConfidence },
    false_alarm_rate: { value: faRate, confidence: trialCountConfidence },
    d_prime: {
      value: dPrime,
      confidence: trials.length < 20 ? 'hypothesis' : trialCountConfidence,
    },
    avg_rt_ms: { value: avgRT, confidence: trialCountConfidence },
    rt_coefficient_of_variation: { value: rtCV, confidence: trialCountConfidence },
  };
}

/** Approximate z-score from probability (inverse normal CDF) */
function zScore(p: number): number {
  // Rational approximation (Abramowitz & Stegun)
  if (p <= 0) return -4;
  if (p >= 1) return 4;

  const a1 = -3.969683028665376e+01;
  const a2 = 2.209460984245205e+02;
  const a3 = -2.759285104469687e+02;
  const a4 = 1.383577518672690e+02;
  const a5 = -3.066479806614716e+01;
  const a6 = 2.506628277459239e+00;

  const b1 = -5.447609879822406e+01;
  const b2 = 1.615858368580409e+02;
  const b3 = -1.556989798598866e+02;
  const b4 = 6.680131188771972e+01;
  const b5 = -1.328068155288572e+01;

  const c1 = -7.784894002430293e-03;
  const c2 = -3.223964580411365e-01;
  const c3 = -2.400758277161838e+00;
  const c4 = -2.549732539343734e+00;
  const c5 = 4.374664141464968e+00;
  const c6 = 2.938163982698783e+00;

  const d1 = 7.784695709041462e-03;
  const d2 = 3.224671290700398e-01;
  const d3 = 2.445134137142996e+00;
  const d4 = 3.754408661907416e+00;

  const pLow = 0.02425;
  const pHigh = 1 - pLow;

  let q: number, r: number;

  if (p < pLow) {
    q = Math.sqrt(-2 * Math.log(p));
    return (((((c1 * q + c2) * q + c3) * q + c4) * q + c5) * q + c6) /
      ((((d1 * q + d2) * q + d3) * q + d4) * q + 1);
  } else if (p <= pHigh) {
    q = p - 0.5;
    r = q * q;
    return (((((a1 * r + a2) * r + a3) * r + a4) * r + a5) * r + a6) * q /
      (((((b1 * r + b2) * r + b3) * r + b4) * r + b5) * r + 1);
  } else {
    q = Math.sqrt(-2 * Math.log(1 - p));
    return -(((((c1 * q + c2) * q + c3) * q + c4) * q + c5) * q + c6) /
      ((((d1 * q + d2) * q + d3) * q + d4) * q + 1);
  }
}
