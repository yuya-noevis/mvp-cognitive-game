import { describe, it, expect } from 'vitest';
import {
  calculateAttentionMetrics,
  type AttentionTrialData,
} from '@/features/metrics/calculators/attention';

describe('Attention Metrics Calculator', () => {
  it('should calculate perfect hit rate', () => {
    const trials: AttentionTrialData[] = Array.from({ length: 10 }, () => ({
      isCorrect: true,
      isTarget: true,
      reactionTimeMs: 500,
      responseType: 'hit' as const,
    }));

    const metrics = calculateAttentionMetrics(trials);
    expect(metrics.hit_rate.value).toBe(1.0);
    expect(metrics.false_alarm_rate.value).toBe(0);
  });

  it('should calculate mixed hit and miss rates', () => {
    const trials: AttentionTrialData[] = [
      { isCorrect: true, isTarget: true, reactionTimeMs: 500, responseType: 'hit' },
      { isCorrect: true, isTarget: true, reactionTimeMs: 600, responseType: 'hit' },
      { isCorrect: false, isTarget: true, reactionTimeMs: null, responseType: 'miss' },
      { isCorrect: true, isTarget: false, reactionTimeMs: null, responseType: 'correct_rejection' },
      { isCorrect: false, isTarget: false, reactionTimeMs: 300, responseType: 'false_alarm' },
    ];

    const metrics = calculateAttentionMetrics(trials);
    expect(metrics.hit_rate.value).toBeCloseTo(2 / 3, 2); // 2 hits out of 3 targets
    expect(metrics.false_alarm_rate.value).toBeCloseTo(0.5, 2); // 1 FA out of 2 non-targets
  });

  it('should calculate d-prime', () => {
    const trials: AttentionTrialData[] = [
      ...Array.from({ length: 8 }, () => ({
        isCorrect: true, isTarget: true, reactionTimeMs: 400, responseType: 'hit' as const,
      })),
      ...Array.from({ length: 2 }, () => ({
        isCorrect: false, isTarget: true, reactionTimeMs: null, responseType: 'miss' as const,
      })),
      ...Array.from({ length: 9 }, () => ({
        isCorrect: true, isTarget: false, reactionTimeMs: null, responseType: 'correct_rejection' as const,
      })),
      ...Array.from({ length: 1 }, () => ({
        isCorrect: false, isTarget: false, reactionTimeMs: 200, responseType: 'false_alarm' as const,
      })),
    ];

    const metrics = calculateAttentionMetrics(trials);
    // Good performance should yield positive d'
    expect(metrics.d_prime.value).toBeGreaterThan(0);
    expect(metrics.d_prime.confidence).toBe('standard'); // 20 trials is enough
  });

  it('should mark low trial count confidence', () => {
    const trials: AttentionTrialData[] = [
      { isCorrect: true, isTarget: true, reactionTimeMs: 500, responseType: 'hit' },
    ];

    const metrics = calculateAttentionMetrics(trials);
    expect(metrics.hit_rate.confidence).toBe('low_trial_count');
  });

  it('should calculate RT median and CV', () => {
    const trials: AttentionTrialData[] = [
      { isCorrect: true, isTarget: true, reactionTimeMs: 400, responseType: 'hit' },
      { isCorrect: true, isTarget: true, reactionTimeMs: 500, responseType: 'hit' },
      { isCorrect: true, isTarget: true, reactionTimeMs: 600, responseType: 'hit' },
      { isCorrect: true, isTarget: true, reactionTimeMs: 450, responseType: 'hit' },
      { isCorrect: true, isTarget: true, reactionTimeMs: 550, responseType: 'hit' },
    ];

    const metrics = calculateAttentionMetrics(trials);
    expect(metrics.avg_rt_ms.value).toBe(500); // Median of 400,450,500,550,600
    expect(metrics.rt_coefficient_of_variation.value).toBeGreaterThan(0);
    expect(metrics.rt_coefficient_of_variation.value).toBeLessThan(1);
  });

  it('should handle empty trials', () => {
    const metrics = calculateAttentionMetrics([]);
    expect(metrics.hit_rate.value).toBe(0);
    expect(metrics.false_alarm_rate.value).toBe(0);
    expect(metrics.avg_rt_ms.value).toBe(0);
  });
});
