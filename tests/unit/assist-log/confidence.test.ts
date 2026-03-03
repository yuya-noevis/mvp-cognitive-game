import { describe, it, expect } from 'vitest';
import { computeConfidence, scoreWithConfidence } from '@/features/assist-log/confidence';

describe('computeConfidence', () => {
  it('should return "high" when assist_mode is false', () => {
    expect(computeConfidence(false, 0)).toBe('high');
    expect(computeConfidence(false, 5)).toBe('high');
    expect(computeConfidence(false, 100)).toBe('high');
  });

  it('should return "medium" when assist_mode is true and demo_replay_count <= 1', () => {
    expect(computeConfidence(true, 0)).toBe('medium');
    expect(computeConfidence(true, 1)).toBe('medium');
  });

  it('should return "low" when assist_mode is true and demo_replay_count > 1', () => {
    expect(computeConfidence(true, 2)).toBe('low');
    expect(computeConfidence(true, 5)).toBe('low');
    expect(computeConfidence(true, 10)).toBe('low');
  });

  it('should ignore demo_replay_count when assist_mode is false', () => {
    // Even high demo replay counts result in "high" when assist_mode is off
    expect(computeConfidence(false, 10)).toBe('high');
  });

  it('should handle edge case: demo_replay_count = 0 with assist_mode true', () => {
    // No demo replays but assist mode on -> medium (intervention was available)
    expect(computeConfidence(true, 0)).toBe('medium');
  });
});

describe('scoreWithConfidence', () => {
  it('should wrap score with "high" confidence for no-assist session', () => {
    const result = scoreWithConfidence(0.85, false, 0);
    expect(result).toEqual({ score: 0.85, confidence: 'high' });
  });

  it('should wrap score with "medium" confidence for assist session with 1 demo replay', () => {
    const result = scoreWithConfidence(0.70, true, 1);
    expect(result).toEqual({ score: 0.70, confidence: 'medium' });
  });

  it('should wrap score with "low" confidence for assist session with multiple demo replays', () => {
    const result = scoreWithConfidence(0.90, true, 3);
    expect(result).toEqual({ score: 0.90, confidence: 'low' });
  });

  it('should preserve exact score value', () => {
    const result = scoreWithConfidence(0.333, false, 0);
    expect(result.score).toBe(0.333);
  });

  it('should handle boundary scores (0.0 and 1.0)', () => {
    expect(scoreWithConfidence(0.0, false, 0)).toEqual({ score: 0.0, confidence: 'high' });
    expect(scoreWithConfidence(1.0, true, 2)).toEqual({ score: 1.0, confidence: 'low' });
  });
});
