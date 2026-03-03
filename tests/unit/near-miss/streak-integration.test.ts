import { describe, it, expect } from 'vitest';
import { StreakTracker } from '@/features/feedback/streak-tracker';

describe('StreakTracker - Near-Miss Integration', () => {
  it('should maintain streak on near-miss (recordNearMiss)', () => {
    const tracker = new StreakTracker();

    // Build a streak
    tracker.recordCorrect();
    tracker.recordCorrect();
    expect(tracker.getStats().consecutiveCorrect).toBe(2);

    // Near-miss should NOT reset the streak
    tracker.recordNearMiss();
    expect(tracker.getStats().consecutiveCorrect).toBe(2);

    // Continue streak
    const result = tracker.recordCorrect();
    expect(result.streak).toBe(3);
    expect(result.isStreak3).toBe(true);
  });

  it('should count near-miss as attempt but not as correct', () => {
    const tracker = new StreakTracker();

    tracker.recordCorrect();  // attempt 1, correct 1
    tracker.recordNearMiss(); // attempt 2, correct 1
    tracker.recordCorrect();  // attempt 3, correct 2

    const stats = tracker.getStats();
    expect(stats.totalAttempts).toBe(3);
    expect(stats.totalCorrect).toBe(2);
    expect(stats.accuracy).toBeCloseTo(2 / 3);
  });

  it('should NOT reset consecutive incorrect counter on near-miss', () => {
    const tracker = new StreakTracker();

    // Near-miss does not add to consecutiveIncorrect
    tracker.recordNearMiss();
    expect(tracker.getStats().consecutiveIncorrect).toBe(0);
  });

  it('should preserve streak even with multiple near-misses', () => {
    const tracker = new StreakTracker();

    tracker.recordCorrect();
    tracker.recordCorrect();
    tracker.recordNearMiss();
    tracker.recordNearMiss();
    tracker.recordNearMiss();

    // Streak should still be 2
    expect(tracker.getStats().consecutiveCorrect).toBe(2);

    // Next correct should be 3
    const result = tracker.recordCorrect();
    expect(result.isStreak3).toBe(true);
  });

  it('regular incorrect SHOULD reset streak (contrast with near-miss)', () => {
    const tracker = new StreakTracker();

    tracker.recordCorrect();
    tracker.recordCorrect();
    expect(tracker.getStats().consecutiveCorrect).toBe(2);

    tracker.recordIncorrect();
    expect(tracker.getStats().consecutiveCorrect).toBe(0);
    expect(tracker.getStats().consecutiveIncorrect).toBe(1);
  });
});
