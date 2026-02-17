import { describe, it, expect, beforeEach, vi } from 'vitest';
import { TrialEngine } from '@/features/game-engine/TrialEngine';

describe('TrialEngine', () => {
  let engine: TrialEngine;
  const onTrialStart = vi.fn();
  const onTrialComplete = vi.fn();

  beforeEach(() => {
    engine = new TrialEngine({
      onTrialStart,
      onTrialComplete,
    });
    onTrialStart.mockClear();
    onTrialComplete.mockClear();
  });

  it('should start a trial with correct initial state', () => {
    const trial = engine.startTrial(
      { type: 'go' },
      { expected: 'tap' },
      { difficulty: 1 },
    );

    expect(trial.trialNumber).toBe(1);
    expect(trial.phase).toBe('presenting');
    expect(trial.stimulus).toEqual({ type: 'go' });
    expect(trial.correctAnswer).toEqual({ expected: 'tap' });
    expect(trial.response).toBeNull();
    expect(trial.isCorrect).toBeNull();
    expect(trial.hintsUsed).toBe(0);
    expect(onTrialStart).toHaveBeenCalledOnce();
  });

  it('should transition through phases correctly', () => {
    engine.startTrial({}, {}, {});
    let trial = engine.getCurrentTrial();
    expect(trial!.phase).toBe('presenting');

    engine.presentStimulus();
    trial = engine.getCurrentTrial();
    expect(trial!.phase).toBe('awaiting_response');
    expect(trial!.stimulusPresentedAt).not.toBeNull();

    engine.recordResponse({ type: 'tap', value: {}, timestamp_ms: Date.now() });
    trial = engine.getCurrentTrial();
    expect(trial!.phase).toBe('feedback');
    expect(trial!.response).not.toBeNull();

    const completed = engine.completeTrial(true);
    expect(completed.phase).toBe('completed');
    expect(completed.isCorrect).toBe(true);
    expect(engine.getCurrentTrial()).toBeNull();
    expect(onTrialComplete).toHaveBeenCalledOnce();
  });

  it('should increment trial numbers', () => {
    engine.startTrial({}, {}, {});
    engine.completeTrial(true);

    engine.startTrial({}, {}, {});
    const trial = engine.getCurrentTrial();
    expect(trial!.trialNumber).toBe(2);
    expect(engine.getTrialNumber()).toBe(2);
  });

  it('should track hints', () => {
    engine.startTrial({}, {}, {});
    engine.useHint();
    engine.useHint();

    const trial = engine.getCurrentTrial();
    expect(trial!.hintsUsed).toBe(2);
  });

  it('should calculate reaction time', () => {
    engine.startTrial({}, {}, {});
    engine.presentStimulus();
    const presentedAt = engine.getCurrentTrial()!.stimulusPresentedAt!;

    // Wait a tiny bit then respond
    const responseTime = presentedAt + 500;
    engine.recordResponse({ type: 'tap', value: {}, timestamp_ms: responseTime });

    const trial = engine.getCurrentTrial();
    expect(trial!.reactionTimeMs).toBe(500);
  });

  it('should reset for new session', () => {
    engine.startTrial({}, {}, {});
    engine.completeTrial(true);

    engine.reset();
    expect(engine.getTrialNumber()).toBe(0);
    expect(engine.getCurrentTrial()).toBeNull();
  });

  it('should record error type', () => {
    engine.startTrial({}, {}, {});
    engine.presentStimulus();
    engine.recordResponse({ type: 'tap', value: {}, timestamp_ms: Date.now() });
    const completed = engine.completeTrial(false, 'commission');

    expect(completed.isCorrect).toBe(false);
    expect(completed.errorType).toBe('commission');
  });
});
