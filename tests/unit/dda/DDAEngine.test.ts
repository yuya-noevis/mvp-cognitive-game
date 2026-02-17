import { describe, it, expect, beforeEach } from 'vitest';
import { DDAEngine } from '@/features/dda/DDAEngine';
import type { DDAConfig } from '@/types';

const testConfig: DDAConfig = {
  target_accuracy_min: 0.70,
  target_accuracy_max: 0.85,
  window_size: 5,
  min_trials_before_adjust: 3,
  parameters: [
    {
      name: 'distractor_count',
      type: 'numeric',
      min: 0,
      max: 3,
      step: 1,
      initial: 0,
      direction: 'up_is_harder',
    },
    {
      name: 'display_duration_ms',
      type: 'numeric',
      min: 800,
      max: 2000,
      step: 200,
      initial: 2000,
      direction: 'down_is_harder',
    },
  ],
};

describe('DDAEngine', () => {
  let engine: DDAEngine;

  beforeEach(() => {
    engine = new DDAEngine(testConfig);
  });

  it('should initialize with default parameters', () => {
    const params = engine.getCurrentParams();
    expect(params.distractor_count).toBe(0);
    expect(params.display_duration_ms).toBe(2000);
  });

  it('should not adjust before minimum trials', () => {
    // 2 correct trials (below min_trials_before_adjust=3)
    expect(engine.recordTrialResult(true)).toBeNull();
    expect(engine.recordTrialResult(true)).toBeNull();
    expect(engine.getCurrentParams().distractor_count).toBe(0);
  });

  it('should increase difficulty when accuracy is above target max (85%)', () => {
    // 5 consecutive correct = 100% accuracy > 85%
    for (let i = 0; i < 5; i++) {
      engine.recordTrialResult(true);
    }

    const params = engine.getCurrentParams();
    // Should have increased distractor_count by 1
    expect(params.distractor_count).toBe(1);
  });

  it('should decrease difficulty when accuracy is below target min (70%)', () => {
    // Start with higher difficulty
    const hardConfig: DDAConfig = {
      ...testConfig,
      parameters: [
        { ...testConfig.parameters[0], initial: 2 },
        testConfig.parameters[1],
      ],
    };
    engine = new DDAEngine(hardConfig);

    // 5 trials, only 2 correct = 40% < 70%
    engine.recordTrialResult(true);
    engine.recordTrialResult(true);
    engine.recordTrialResult(false);
    engine.recordTrialResult(false);
    engine.recordTrialResult(false);

    const params = engine.getCurrentParams();
    // Should have decreased distractor_count by 1
    expect(params.distractor_count).toBe(1);
  });

  it('should not adjust when accuracy is within target range', () => {
    // 5 trials, 4 correct = 80% (within 70-85%)
    engine.recordTrialResult(true);
    engine.recordTrialResult(true);
    engine.recordTrialResult(true);
    engine.recordTrialResult(true);
    const change = engine.recordTrialResult(false);

    expect(change).toBeNull();
    expect(engine.getCurrentParams().distractor_count).toBe(0);
  });

  it('should respect parameter minimums', () => {
    // Already at min (0). Try to decrease.
    engine.recordTrialResult(false);
    engine.recordTrialResult(false);
    engine.recordTrialResult(false);
    engine.recordTrialResult(false);
    engine.recordTrialResult(false);

    // distractor_count is at 0 (min), but display_duration_ms should increase
    const params = engine.getCurrentParams();
    expect(params.distractor_count).toBe(0);
    // display_duration_ms goes up when making easier (down_is_harder, so up = easier)
    expect(params.display_duration_ms).toBe(2000); // Already at max for easier direction
  });

  it('should respect parameter maximums', () => {
    const maxConfig: DDAConfig = {
      ...testConfig,
      parameters: [
        { ...testConfig.parameters[0], initial: 3 }, // At max
        { ...testConfig.parameters[1], initial: 800 }, // At min (hardest)
      ],
    };
    engine = new DDAEngine(maxConfig);

    // All correct - try to increase difficulty further
    for (let i = 0; i < 5; i++) {
      engine.recordTrialResult(true);
    }

    // Should stay at max/min
    const params = engine.getCurrentParams();
    expect(params.distractor_count).toBe(3);
    expect(params.display_duration_ms).toBe(800);
  });

  it('should adjust only 1 step at a time', () => {
    // All correct 10 times
    for (let i = 0; i < 10; i++) {
      engine.recordTrialResult(true);
    }

    const params = engine.getCurrentParams();
    // Should have gone up incrementally, not jumped
    // With window_size=5, we get adjustment after trial 3 (min_trials),
    // then re-evaluated at each subsequent trial
    expect(params.distractor_count).toBeGreaterThanOrEqual(1);
    expect(params.distractor_count).toBeLessThanOrEqual(3);
  });

  it('should force reduce difficulty', () => {
    // First increase difficulty
    for (let i = 0; i < 5; i++) {
      engine.recordTrialResult(true);
    }
    const before = engine.getCurrentParams().distractor_count;

    const change = engine.forceReduceDifficulty();
    expect(change).not.toBeNull();
    expect(engine.getCurrentParams().distractor_count).toBeLessThan(before as number);
  });

  it('should handle categorical parameters', () => {
    const catConfig: DDAConfig = {
      target_accuracy_min: 0.70,
      target_accuracy_max: 0.85,
      window_size: 5,
      min_trials_before_adjust: 3,
      parameters: [
        {
          name: 'similarity',
          type: 'categorical',
          levels: ['low', 'mid', 'high'],
          initial: 'low',
          direction: 'up_is_harder',
        },
      ],
    };
    engine = new DDAEngine(catConfig);

    // All correct → should increase to 'mid'
    for (let i = 0; i < 5; i++) {
      engine.recordTrialResult(true);
    }

    expect(engine.getCurrentParams().similarity).toBe('mid');
  });

  it('should reset properly', () => {
    for (let i = 0; i < 5; i++) {
      engine.recordTrialResult(true);
    }

    engine.reset();
    expect(engine.getCurrentParams().distractor_count).toBe(0);
    expect(engine.getTrialCount()).toBe(0);
    expect(engine.getCurrentAccuracy()).toBe(0);
  });

  it('should provide adaptive change details', () => {
    for (let i = 0; i < 4; i++) {
      engine.recordTrialResult(true);
    }
    const change = engine.recordTrialResult(true);

    expect(change).not.toBeNull();
    expect(change!.parameter).toBe('distractor_count');
    expect(change!.old_value).toBe(0);
    expect(change!.new_value).toBe(1);
    expect(change!.reason).toBe('accuracy_above_target');
    expect(change!.trigger_accuracy).toBeGreaterThan(0.85);
    expect(change!.trigger_window).toBe(5);
  });
});
