import { describe, it, expect, beforeEach } from 'vitest';
import { FrustrationDetector } from '@/features/safety/FrustrationDetector';

describe('FrustrationDetector', () => {
  let detector: FrustrationDetector;

  beforeEach(() => {
    detector = new FrustrationDetector({
      consecutiveErrorHintThreshold: 3,
      consecutiveErrorBreakThreshold: 5,
      inactivityTimeoutMs: 30_000,
      maxSessionDurationMs: 15 * 60 * 1000,
      rapidTapThresholdMs: 200,
      rapidTapWindowSize: 3,
    });
    detector.startSession(1000);
  });

  it('should return null for correct responses', () => {
    const action = detector.recordResult(true, 500, 2000);
    expect(action).toBeNull();
  });

  it('should show hint after 3 consecutive errors', () => {
    detector.recordResult(false, 500, 2000);
    detector.recordResult(false, 600, 3000);
    const action = detector.recordResult(false, 550, 4000);

    expect(action).not.toBeNull();
    expect(action!.type).toBe('show_hint');
    expect(action!.reason).toBe('consecutive_errors');
  });

  it('should suggest break after 5 consecutive errors', () => {
    for (let i = 0; i < 4; i++) {
      detector.recordResult(false, 500, 2000 + i * 1000);
    }
    const action = detector.recordResult(false, 500, 7000);

    expect(action).not.toBeNull();
    expect(action!.type).toBe('suggest_break');
    expect(action!.reason).toBe('consecutive_errors');
  });

  it('should reset consecutive errors on correct response', () => {
    detector.recordResult(false, 500, 2000);
    detector.recordResult(false, 600, 3000);
    detector.recordResult(true, 400, 4000); // Reset!
    detector.recordResult(false, 500, 5000);
    const action = detector.recordResult(false, 600, 6000);

    // Only 2 consecutive errors, should be null
    expect(action).toBeNull();
  });

  it('should detect inactivity timeout', () => {
    detector.recordResult(true, 500, 2000);

    // 29 seconds later - not yet
    let action = detector.checkInactivity(31_000);
    expect(action).toBeNull();

    // 31 seconds later - timeout
    action = detector.checkInactivity(33_000);
    expect(action).not.toBeNull();
    expect(action!.type).toBe('suggest_break');
    expect(action!.reason).toBe('response_timeout');
  });

  it('should detect session too long', () => {
    // 14 minutes - ok
    let action = detector.checkSessionDuration(14 * 60 * 1000 + 1000);
    expect(action).toBeNull();

    // 16 minutes - too long
    action = detector.checkSessionDuration(16 * 60 * 1000 + 1000);
    expect(action).not.toBeNull();
    expect(action!.type).toBe('end_session');
    expect(action!.reason).toBe('session_too_long');
  });

  it('should detect rapid random tapping', () => {
    // 3 very fast taps (< 200ms each)
    detector.recordResult(false, 100, 2000);
    detector.recordResult(false, 80, 2100);
    const action = detector.recordResult(false, 90, 2200);

    // Should be suggest_break due to rapid taps (5 consecutive errors triggers break first,
    // but with only 3 we get hint for errors + rapid tap detection)
    expect(action).not.toBeNull();
    // 3 consecutive errors → hint, but rapid tapping overrides to break
    expect(action!.type).toBe('suggest_break');
  });

  it('should track consecutive error count', () => {
    expect(detector.getConsecutiveErrors()).toBe(0);
    detector.recordResult(false, 500, 2000);
    expect(detector.getConsecutiveErrors()).toBe(1);
    detector.recordResult(true, 400, 3000);
    expect(detector.getConsecutiveErrors()).toBe(0);
  });

  it('should reset properly', () => {
    detector.recordResult(false, 500, 2000);
    detector.recordResult(false, 600, 3000);

    detector.reset();
    expect(detector.getConsecutiveErrors()).toBe(0);
  });
});
