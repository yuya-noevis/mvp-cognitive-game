import { describe, it, expect, beforeEach } from 'vitest';
import { SpacedRepetitionEngine, DISABILITY_REPETITION_PROFILES } from '@/features/spaced-repetition/SpacedRepetitionEngine';
import { SPACED_REPETITION } from '@/lib/constants';
import {
  MASTERY_CONSECUTIVE_CORRECT,
  MAX_IN_SESSION_RETRIES,
  MAX_REVIEW_PATTERNS,
  SESSIONS_PER_UNIT,
} from '@/features/spaced-repetition/types';
import type { InSessionMiss } from '@/features/spaced-repetition/types';

// ============================================
// テストヘルパー
// ============================================

const HOUR_MS = 60 * 60 * 1000;
const DAY_MS = 24 * HOUR_MS;

function createMiss(overrides: Partial<InSessionMiss> = {}): InSessionMiss {
  return {
    patternKey: 'test-pattern-1',
    gameId: 'hikari-catch',
    domain: 'attention',
    stimulus: { type: 'go', color: 'blue' },
    correctAnswer: { action: 'tap' },
    difficulty: { level: 3 },
    trialNumber: 1,
    ...overrides,
  };
}

// ============================================
// 間隔計算テスト
// ============================================

describe('SpacedRepetitionEngine - 間隔計算', () => {
  let engine: SpacedRepetitionEngine;

  beforeEach(() => {
    engine = new SpacedRepetitionEngine('unknown');
  });

  it('should compute recall probability using Half-Life Regression', () => {
    // p(recall) = 2^(-t/h)
    // t=24h, h=24h → p = 2^(-1) = 0.5
    expect(engine.computeRecallProbability(24, 24)).toBeCloseTo(0.5, 5);

    // t=0, h=24h → p = 2^0 = 1.0
    expect(engine.computeRecallProbability(0, 24)).toBeCloseTo(1.0, 5);

    // t=48h, h=24h → p = 2^(-2) = 0.25
    expect(engine.computeRecallProbability(48, 24)).toBeCloseTo(0.25, 5);

    // t=72h, h=24h → p = 2^(-3) = 0.125
    expect(engine.computeRecallProbability(72, 24)).toBeCloseTo(0.125, 5);
  });

  it('should double half-life on correct answer', () => {
    const initial = 24; // 24 hours
    const updated = engine.updateHalfLife(initial, true);
    expect(updated).toBe(48); // 24 * 2.0
  });

  it('should halve half-life on incorrect answer', () => {
    const initial = 24;
    const updated = engine.updateHalfLife(initial, false);
    expect(updated).toBe(12); // 24 * 0.5
  });

  it('should not exceed max half-life', () => {
    const maxHl = SPACED_REPETITION.MAX_HALF_LIFE_HOURS; // 720 hours
    const updated = engine.updateHalfLife(maxHl, true);
    expect(updated).toBe(maxHl);
  });

  it('should not go below 1 hour half-life', () => {
    const updated = engine.updateHalfLife(1, false);
    expect(updated).toBe(1); // max(1 * 0.5, 1) = 1
  });

  it('should compute next review time based on half-life', () => {
    const now = Date.now();
    const halfLife = 24; // 24 hours
    const nextReview = engine.computeNextReviewAt(halfLife, now);
    expect(nextReview).toBe(now + 24 * HOUR_MS);
  });

  it('should produce interval progression: ~1day -> ~2days -> ~4days on consecutive failures', () => {
    // Start with base half-life of 24h
    let hl = SPACED_REPETITION.INITIAL_HALF_LIFE_HOURS; // 24h
    expect(hl).toBe(24);

    // After one failure: 24 * 0.5 = 12h
    hl = engine.updateHalfLife(hl, false);
    expect(hl).toBe(12);

    // After recovery (correct): 12 * 2.0 = 24h
    hl = engine.updateHalfLife(hl, true);
    expect(hl).toBe(24);

    // After correct again: 24 * 2.0 = 48h (~2 days)
    hl = engine.updateHalfLife(hl, true);
    expect(hl).toBe(48);

    // After correct again: 48 * 2.0 = 96h (~4 days)
    hl = engine.updateHalfLife(hl, true);
    expect(hl).toBe(96);

    // After correct again: 96 * 2.0 = 192h (~8 days)
    hl = engine.updateHalfLife(hl, true);
    expect(hl).toBe(192);
  });
});

// ============================================
// 障害別補正テスト
// ============================================

describe('SpacedRepetitionEngine - 障害別補正', () => {
  it('should apply ID base interval multiplier (0.7)', () => {
    const engine = new SpacedRepetitionEngine('id-severe');
    const baseHl = engine.getBaseHalfLife();
    expect(baseHl).toBeCloseTo(SPACED_REPETITION.INITIAL_HALF_LIFE_HOURS * 0.7, 5);
    // 24 * 0.7 = 16.8h
    expect(baseHl).toBeCloseTo(16.8, 5);
  });

  it('should apply ID max interval multiplier (0.5)', () => {
    const engine = new SpacedRepetitionEngine('id-severe');
    const maxHl = engine.getMaxHalfLife();
    expect(maxHl).toBeCloseTo(SPACED_REPETITION.MAX_HALF_LIFE_HOURS * 0.5, 5);
    // 720 * 0.5 = 360h
    expect(maxHl).toBe(360);
  });

  it('should keep standard intervals for ADHD', () => {
    const engine = new SpacedRepetitionEngine('adhd');
    expect(engine.getBaseHalfLife()).toBe(SPACED_REPETITION.INITIAL_HALF_LIFE_HOURS);
    expect(engine.getMaxHalfLife()).toBe(SPACED_REPETITION.MAX_HALF_LIFE_HOURS);
  });

  it('should keep standard intervals for ASD', () => {
    const engine = new SpacedRepetitionEngine('asd');
    expect(engine.getBaseHalfLife()).toBe(SPACED_REPETITION.INITIAL_HALF_LIFE_HOURS);
    expect(engine.getMaxHalfLife()).toBe(SPACED_REPETITION.MAX_HALF_LIFE_HOURS);
  });

  it('should set fixStimulusFormat for ASD', () => {
    const engine = new SpacedRepetitionEngine('asd');
    const profile = engine.getDisabilityProfile();
    expect(profile.fixStimulusFormat).toBe(true);
  });

  it('should NOT set fixStimulusFormat for ADHD', () => {
    const engine = new SpacedRepetitionEngine('adhd');
    const profile = engine.getDisabilityProfile();
    expect(profile.fixStimulusFormat).toBe(false);
  });

  it('should NOT set fixStimulusFormat for ID', () => {
    const engine = new SpacedRepetitionEngine('id-mild');
    const profile = engine.getDisabilityProfile();
    expect(profile.fixStimulusFormat).toBe(false);
  });

  it('should create weak patterns with fixedStimulusFormat flag for ASD', () => {
    const engine = new SpacedRepetitionEngine('asd');
    const now = Date.now();
    const pattern = engine.recordWeakPattern(
      'hikari-catch', 'attention', 'pattern-1',
      { type: 'go' }, { action: 'tap' }, { level: 1 },
      now,
    );
    expect(pattern.fixedStimulusFormat).toBe(true);
  });

  it('should create weak patterns without fixedStimulusFormat for ADHD', () => {
    const engine = new SpacedRepetitionEngine('adhd');
    const now = Date.now();
    const pattern = engine.recordWeakPattern(
      'hikari-catch', 'attention', 'pattern-1',
      { type: 'go' }, { action: 'tap' }, { level: 1 },
      now,
    );
    expect(pattern.fixedStimulusFormat).toBe(false);
  });

  it('should apply ID-severe shorter intervals to weak patterns', () => {
    const engine = new SpacedRepetitionEngine('id-severe');
    const now = Date.now();
    const pattern = engine.recordWeakPattern(
      'hikari-catch', 'attention', 'pattern-1',
      { type: 'go' }, { action: 'tap' }, { level: 1 },
      now,
    );
    // Base HL for ID-severe = 24 * 0.7 = 16.8h
    expect(pattern.halfLifeHours).toBeCloseTo(16.8, 5);
    // Next review should be 16.8h later
    expect(pattern.nextReviewAt).toBe(now + 16.8 * HOUR_MS);
  });

  it('should limit ID max half-life during updates', () => {
    const engine = new SpacedRepetitionEngine('id-severe');
    // maxHalfLife = 720 * 0.5 = 360h
    let hl = 200;
    hl = engine.updateHalfLife(hl, true); // 400 → capped at 360
    expect(hl).toBe(360);
  });

  it('should define profiles for all disability types', () => {
    const types: Array<'asd' | 'adhd' | 'id-severe' | 'id-moderate' | 'id-mild' | 'typical' | 'unknown'> = [
      'asd', 'adhd', 'id-severe', 'id-moderate', 'id-mild', 'typical', 'unknown',
    ];
    for (const t of types) {
      expect(DISABILITY_REPETITION_PROFILES[t]).toBeDefined();
      expect(DISABILITY_REPETITION_PROFILES[t].baseIntervalMultiplier).toBeGreaterThan(0);
      expect(DISABILITY_REPETITION_PROFILES[t].maxIntervalMultiplier).toBeGreaterThan(0);
    }
  });
});

// ============================================
// セッション内再出題テスト
// ============================================

describe('SpacedRepetitionEngine - セッション内再出題', () => {
  let engine: SpacedRepetitionEngine;

  beforeEach(() => {
    engine = new SpacedRepetitionEngine('unknown');
  });

  it('should record in-session misses', () => {
    engine.recordInSessionMiss(createMiss({ patternKey: 'p1' }));
    engine.recordInSessionMiss(createMiss({ patternKey: 'p2' }));

    expect(engine.getInSessionMissCount()).toBe(2);
  });

  it('should not duplicate same pattern key', () => {
    engine.recordInSessionMiss(createMiss({ patternKey: 'p1' }));
    engine.recordInSessionMiss(createMiss({ patternKey: 'p1' }));

    expect(engine.getInSessionMissCount()).toBe(1);
  });

  it('should return retries up to MAX_IN_SESSION_RETRIES', () => {
    for (let i = 0; i < 10; i++) {
      engine.recordInSessionMiss(createMiss({ patternKey: `p${i}` }));
    }

    const retries = engine.getInSessionRetries();
    expect(retries.length).toBe(MAX_IN_SESSION_RETRIES);
  });

  it('should clear in-session misses', () => {
    engine.recordInSessionMiss(createMiss({ patternKey: 'p1' }));
    engine.clearInSessionMisses();

    expect(engine.getInSessionMissCount()).toBe(0);
    expect(engine.getInSessionRetries()).toHaveLength(0);
  });

  it('should preserve retry order (first-in first-out)', () => {
    engine.recordInSessionMiss(createMiss({ patternKey: 'first', trialNumber: 1 }));
    engine.recordInSessionMiss(createMiss({ patternKey: 'second', trialNumber: 5 }));
    engine.recordInSessionMiss(createMiss({ patternKey: 'third', trialNumber: 10 }));

    const retries = engine.getInSessionRetries();
    expect(retries[0].patternKey).toBe('first');
    expect(retries[1].patternKey).toBe('second');
    expect(retries[2].patternKey).toBe('third');
  });
});

// ============================================
// 苦手パターン管理テスト
// ============================================

describe('SpacedRepetitionEngine - 苦手パターン管理', () => {
  let engine: SpacedRepetitionEngine;
  const now = 1700000000000; // 固定タイムスタンプ

  beforeEach(() => {
    engine = new SpacedRepetitionEngine('unknown');
  });

  it('should create a new weak pattern on first incorrect', () => {
    const pattern = engine.recordWeakPattern(
      'hikari-catch', 'attention', 'level3:go',
      { type: 'go', color: 'blue' }, { action: 'tap' }, { level: 3 },
      now,
    );

    expect(pattern.id).toBe('hikari-catch:attention:level3:go');
    expect(pattern.gameId).toBe('hikari-catch');
    expect(pattern.domain).toBe('attention');
    expect(pattern.consecutiveCorrect).toBe(0);
    expect(pattern.consecutiveIncorrect).toBe(1);
    expect(pattern.totalAttempts).toBe(1);
    expect(pattern.totalCorrect).toBe(0);
    expect(pattern.isMastered).toBe(false);
    expect(pattern.halfLifeHours).toBe(SPACED_REPETITION.INITIAL_HALF_LIFE_HOURS);
  });

  it('should update existing pattern on repeated incorrect', () => {
    engine.recordWeakPattern(
      'hikari-catch', 'attention', 'level3:go',
      { type: 'go' }, { action: 'tap' }, { level: 3 },
      now,
    );

    const updated = engine.recordWeakPattern(
      'hikari-catch', 'attention', 'level3:go',
      { type: 'go' }, { action: 'tap' }, { level: 3 },
      now + HOUR_MS,
    );

    expect(updated.consecutiveIncorrect).toBe(2);
    expect(updated.totalAttempts).toBe(2);
    expect(updated.totalCorrect).toBe(0);
    // Half-life should be shortened: 24 * 0.5 = 12
    expect(updated.halfLifeHours).toBe(12);
  });

  it('should record pattern correct and extend half-life', () => {
    const pattern = engine.recordWeakPattern(
      'hikari-catch', 'attention', 'level3:go',
      { type: 'go' }, { action: 'tap' }, { level: 3 },
      now,
    );

    const corrected = engine.recordPatternCorrect(pattern.id, now + DAY_MS);
    expect(corrected).not.toBeNull();
    expect(corrected!.consecutiveCorrect).toBe(1);
    expect(corrected!.consecutiveIncorrect).toBe(0);
    expect(corrected!.totalCorrect).toBe(1);
    // Half-life should be extended: 24 * 2.0 = 48
    expect(corrected!.halfLifeHours).toBe(48);
  });

  it('should mark pattern as mastered after consecutive correct answers', () => {
    const pattern = engine.recordWeakPattern(
      'hikari-catch', 'attention', 'level3:go',
      { type: 'go' }, { action: 'tap' }, { level: 3 },
      now,
    );

    expect(pattern.isMastered).toBe(false);

    for (let i = 0; i < MASTERY_CONSECUTIVE_CORRECT; i++) {
      engine.recordPatternCorrect(pattern.id, now + (i + 1) * DAY_MS);
    }

    const mastered = engine.getPattern(pattern.id);
    expect(mastered!.isMastered).toBe(true);
    expect(mastered!.consecutiveCorrect).toBe(MASTERY_CONSECUTIVE_CORRECT);
  });

  it('should reset mastery on incorrect after consecutive corrects', () => {
    const pattern = engine.recordWeakPattern(
      'hikari-catch', 'attention', 'level3:go',
      { type: 'go' }, { action: 'tap' }, { level: 3 },
      now,
    );

    // 2 correct (one short of mastery)
    engine.recordPatternCorrect(pattern.id, now + DAY_MS);
    engine.recordPatternCorrect(pattern.id, now + 2 * DAY_MS);

    // Then incorrect
    engine.recordPatternIncorrect(pattern.id, now + 3 * DAY_MS);

    const result = engine.getPattern(pattern.id);
    expect(result!.consecutiveCorrect).toBe(0);
    expect(result!.consecutiveIncorrect).toBe(1);
    expect(result!.isMastered).toBe(false);
  });

  it('should return null when recording correct for non-existent pattern', () => {
    const result = engine.recordPatternCorrect('non-existent', now);
    expect(result).toBeNull();
  });

  it('should track active (non-mastered) patterns separately', () => {
    // Create 3 patterns
    engine.recordWeakPattern('hikari-catch', 'attention', 'p1', {}, {}, {}, now);
    engine.recordWeakPattern('hikari-catch', 'attention', 'p2', {}, {}, {}, now);
    engine.recordWeakPattern('hikari-catch', 'attention', 'p3', {}, {}, {}, now);

    expect(engine.getAllPatterns()).toHaveLength(3);
    expect(engine.getActivePatterns()).toHaveLength(3);

    // Master p1
    const p1Id = 'hikari-catch:attention:p1';
    for (let i = 0; i < MASTERY_CONSECUTIVE_CORRECT; i++) {
      engine.recordPatternCorrect(p1Id, now + (i + 1) * DAY_MS);
    }

    expect(engine.getAllPatterns()).toHaveLength(3);
    expect(engine.getActivePatterns()).toHaveLength(2);
  });
});

// ============================================
// セッション間スケジューリングテスト
// ============================================

describe('SpacedRepetitionEngine - セッション間スケジューリング', () => {
  let engine: SpacedRepetitionEngine;
  const now = 1700000000000;

  beforeEach(() => {
    engine = new SpacedRepetitionEngine('unknown');
  });

  it('should return empty schedule when no patterns exist', () => {
    const schedule = engine.getRepetitionSchedule(now);
    expect(schedule.duePatternCount).toBe(0);
    expect(schedule.earliestDueAt).toBeNull();
    expect(schedule.duePatterns).toHaveLength(0);
  });

  it('should identify due patterns after half-life elapsed', () => {
    engine.recordWeakPattern(
      'hikari-catch', 'attention', 'p1',
      { type: 'go' }, { action: 'tap' }, { level: 3 },
      now,
    );

    // Immediately after recording: not due yet (recall prob near 1.0)
    const scheduleImmediate = engine.getRepetitionSchedule(now + 1);
    expect(scheduleImmediate.duePatternCount).toBe(0);

    // After 1 day (24h = half-life): p(recall) = 0.5, at threshold
    // nextReviewAt = now + 24h
    const scheduleAfter24h = engine.getRepetitionSchedule(now + 24 * HOUR_MS);
    expect(scheduleAfter24h.duePatternCount).toBe(1);
  });

  it('should not include mastered patterns in schedule', () => {
    engine.recordWeakPattern(
      'hikari-catch', 'attention', 'p1', {}, {}, {}, now,
    );

    const p1Id = 'hikari-catch:attention:p1';
    for (let i = 0; i < MASTERY_CONSECUTIVE_CORRECT; i++) {
      engine.recordPatternCorrect(p1Id, now + (i + 1) * DAY_MS);
    }

    // Even after long time, mastered pattern should not appear
    const schedule = engine.getRepetitionSchedule(now + 30 * DAY_MS);
    expect(schedule.duePatternCount).toBe(0);
  });

  it('should sort due patterns by recall probability (lowest first)', () => {
    // Pattern 1: created 3 days ago (lower recall)
    engine.recordWeakPattern(
      'hikari-catch', 'attention', 'old-pattern',
      {}, {}, {}, now - 3 * DAY_MS,
    );

    // Pattern 2: created 1 day ago (higher recall)
    engine.recordWeakPattern(
      'oboete-narabete', 'working_memory', 'new-pattern',
      {}, {}, {}, now - 1 * DAY_MS,
    );

    const schedule = engine.getRepetitionSchedule(now + 2 * DAY_MS);
    // Both should be due
    expect(schedule.duePatternCount).toBe(2);
    // Old pattern (lower recall) should be first
    expect(schedule.duePatterns[0].patternKey).toBe('old-pattern');
    expect(schedule.duePatterns[1].patternKey).toBe('new-pattern');
  });

  it('should filter due patterns by game ID', () => {
    engine.recordWeakPattern('hikari-catch', 'attention', 'p1', {}, {}, {}, now);
    engine.recordWeakPattern('oboete-narabete', 'working_memory', 'p2', {}, {}, {}, now);

    // Move time forward past the review point
    const futureNow = now + 25 * HOUR_MS;
    const forHikari = engine.getDuePatternsForGame('hikari-catch', futureNow);
    const forOboete = engine.getDuePatternsForGame('oboete-narabete', futureNow);

    expect(forHikari).toHaveLength(1);
    expect(forHikari[0].gameId).toBe('hikari-catch');
    expect(forOboete).toHaveLength(1);
    expect(forOboete[0].gameId).toBe('oboete-narabete');
  });

  it('should filter due patterns by domain', () => {
    engine.recordWeakPattern('hikari-catch', 'attention', 'p1', {}, {}, {}, now);
    engine.recordWeakPattern('oboete-narabete', 'working_memory', 'p2', {}, {}, {}, now);

    const futureNow = now + 25 * HOUR_MS;
    const forAttention = engine.getDuePatternsForDomain('attention', futureNow);

    expect(forAttention).toHaveLength(1);
    expect(forAttention[0].domain).toBe('attention');
  });
});

// ============================================
// ユニットレビュー（ボス戦）テスト
// ============================================

describe('SpacedRepetitionEngine - ユニットレビュー（ボス戦）', () => {
  let engine: SpacedRepetitionEngine;
  const now = 1700000000000;

  beforeEach(() => {
    engine = new SpacedRepetitionEngine('unknown', 1);
  });

  it('should identify session 5 as unit review', () => {
    engine.setSessionInUnit(5);
    expect(engine.isUnitReviewSession()).toBe(true);
  });

  it('should not identify sessions 1-4 as unit review', () => {
    for (let s = 1; s <= 4; s++) {
      engine.setSessionInUnit(s);
      expect(engine.isUnitReviewSession()).toBe(false);
    }
  });

  it('should generate review trials from active weak patterns', () => {
    // Create several weak patterns
    engine.recordWeakPattern('hikari-catch', 'attention', 'p1', {}, {}, {}, now - 3 * DAY_MS);
    engine.recordWeakPattern('oboete-narabete', 'working_memory', 'p2', {}, {}, {}, now - 2 * DAY_MS);
    engine.recordWeakPattern('irokae-switch', 'cognitive_flexibility', 'p3', {}, {}, {}, now - 1 * DAY_MS);

    engine.setSessionInUnit(SESSIONS_PER_UNIT);
    const trials = engine.generateUnitReviewTrials(now);

    expect(trials.length).toBe(3);
    // Should be sorted by priority (highest first)
    expect(trials[0].priorityScore).toBeGreaterThanOrEqual(trials[1].priorityScore);
    expect(trials[1].priorityScore).toBeGreaterThanOrEqual(trials[2].priorityScore);
  });

  it('should not include mastered patterns in review', () => {
    engine.recordWeakPattern('hikari-catch', 'attention', 'p1', {}, {}, {}, now);
    engine.recordWeakPattern('oboete-narabete', 'working_memory', 'p2', {}, {}, {}, now);

    // Master p1
    const p1Id = 'hikari-catch:attention:p1';
    for (let i = 0; i < MASTERY_CONSECUTIVE_CORRECT; i++) {
      engine.recordPatternCorrect(p1Id, now + (i + 1) * DAY_MS);
    }

    const trials = engine.generateUnitReviewTrials(now + 5 * DAY_MS);
    expect(trials.length).toBe(1);
    expect(trials[0].weakPattern.patternKey).toBe('p2');
  });

  it('should limit review trials to MAX_REVIEW_PATTERNS', () => {
    // Create many patterns
    for (let i = 0; i < 20; i++) {
      engine.recordWeakPattern(
        'hikari-catch', 'attention', `pattern-${i}`,
        {}, {}, {}, now,
      );
    }

    const trials = engine.generateUnitReviewTrials(now + DAY_MS);
    expect(trials.length).toBe(MAX_REVIEW_PATTERNS);
  });

  it('should prioritize patterns with more consecutive errors', () => {
    // Pattern with 1 error
    engine.recordWeakPattern('hikari-catch', 'attention', 'p1', {}, {}, {}, now);

    // Pattern with 3 errors
    engine.recordWeakPattern('oboete-narabete', 'working_memory', 'p2', {}, {}, {}, now);
    const p2Id = 'oboete-narabete:working_memory:p2';
    engine.recordPatternIncorrect(p2Id, now + HOUR_MS);
    engine.recordPatternIncorrect(p2Id, now + 2 * HOUR_MS);

    const trials = engine.generateUnitReviewTrials(now + DAY_MS);
    expect(trials.length).toBe(2);
    // Pattern with more errors should have higher priority
    expect(trials[0].weakPattern.patternKey).toBe('p2');
  });

  it('should return empty review when no active patterns', () => {
    const trials = engine.generateUnitReviewTrials(now);
    expect(trials).toHaveLength(0);
  });
});

// ============================================
// セッションライフサイクルテスト
// ============================================

describe('SpacedRepetitionEngine - セッションライフサイクル', () => {
  let engine: SpacedRepetitionEngine;
  const now = 1700000000000;

  beforeEach(() => {
    engine = new SpacedRepetitionEngine('unknown', 1);
  });

  it('should clear in-session misses on startSession', () => {
    engine.recordInSessionMiss(createMiss({ patternKey: 'p1' }));
    expect(engine.getInSessionMissCount()).toBe(1);

    engine.startSession();
    expect(engine.getInSessionMissCount()).toBe(0);
  });

  it('should promote in-session misses to weak patterns on endSession', () => {
    engine.recordInSessionMiss(createMiss({ patternKey: 'p1', gameId: 'hikari-catch' }));
    engine.recordInSessionMiss(createMiss({ patternKey: 'p2', gameId: 'oboete-narabete', domain: 'working_memory' }));

    const result = engine.endSession(now);

    expect(result.retryCount).toBe(2);
    expect(result.newWeakPatterns).toHaveLength(2);
    expect(engine.getAllPatterns()).toHaveLength(2);
    // In-session misses should be cleared
    expect(engine.getInSessionMissCount()).toBe(0);
  });

  it('should advance session number on endSession', () => {
    expect(engine.getSessionInUnit()).toBe(1);

    engine.endSession(now);
    expect(engine.getSessionInUnit()).toBe(2);

    engine.endSession(now);
    expect(engine.getSessionInUnit()).toBe(3);
  });

  it('should wrap session number after reaching SESSIONS_PER_UNIT', () => {
    engine.setSessionInUnit(SESSIONS_PER_UNIT);
    expect(engine.getSessionInUnit()).toBe(5);

    engine.endSession(now);
    expect(engine.getSessionInUnit()).toBe(1);
  });

  it('should complete full unit cycle (5 sessions)', () => {
    for (let s = 1; s <= SESSIONS_PER_UNIT; s++) {
      expect(engine.getSessionInUnit()).toBe(s);

      if (s === SESSIONS_PER_UNIT) {
        expect(engine.isUnitReviewSession()).toBe(true);
      } else {
        expect(engine.isUnitReviewSession()).toBe(false);
      }

      engine.startSession();
      engine.endSession(now + s * DAY_MS);
    }

    // After 5 sessions, should reset to 1
    expect(engine.getSessionInUnit()).toBe(1);
  });
});

// ============================================
// 永続化テスト
// ============================================

describe('SpacedRepetitionEngine - 永続化', () => {
  const now = 1700000000000;

  it('should serialize and restore state', () => {
    const engine = new SpacedRepetitionEngine('asd', 3);

    // Add some data
    engine.recordWeakPattern('hikari-catch', 'attention', 'p1', { a: 1 }, { b: 2 }, { c: 3 }, now);
    engine.recordWeakPattern('oboete-narabete', 'working_memory', 'p2', {}, {}, {}, now);
    engine.recordInSessionMiss(createMiss({ patternKey: 'temp' }));

    // Serialize
    const state = engine.serialize();
    expect(state.weakPatterns).toHaveLength(2);
    expect(state.inSessionMisses).toHaveLength(1);
    expect(state.sessionInUnit).toBe(3);
    expect(state.disabilityType).toBe('asd');

    // Restore into new engine
    const engine2 = new SpacedRepetitionEngine();
    engine2.restore(state);

    expect(engine2.getAllPatterns()).toHaveLength(2);
    expect(engine2.getInSessionMissCount()).toBe(1);
    expect(engine2.getSessionInUnit()).toBe(3);
    expect(engine2.getDisabilityType()).toBe('asd');

    // Verify pattern data integrity
    const p1 = engine2.getPattern('hikari-catch:attention:p1');
    expect(p1).not.toBeNull();
    expect(p1!.stimulus).toEqual({ a: 1 });
    expect(p1!.correctAnswer).toEqual({ b: 2 });
  });

  it('should handle restoring empty state', () => {
    const engine = new SpacedRepetitionEngine('adhd', 2);
    engine.recordWeakPattern('hikari-catch', 'attention', 'p1', {}, {}, {}, now);

    // Restore with empty state
    engine.restore({
      weakPatterns: [],
      inSessionMisses: [],
      sessionInUnit: 1,
      disabilityType: 'unknown',
    });

    expect(engine.getAllPatterns()).toHaveLength(0);
    expect(engine.getSessionInUnit()).toBe(1);
    expect(engine.getDisabilityType()).toBe('unknown');
  });
});

// ============================================
// 統合シナリオテスト
// ============================================

describe('SpacedRepetitionEngine - 統合シナリオ', () => {
  it('should handle complete spaced repetition flow', () => {
    const engine = new SpacedRepetitionEngine('adhd', 1);
    const baseTime = 1700000000000;

    // === Session 1: 3つの試行で2つ不正解 ===
    engine.startSession();
    engine.recordInSessionMiss(createMiss({ patternKey: 'go-blue', trialNumber: 1 }));
    engine.recordInSessionMiss(createMiss({ patternKey: 'nogo-red', trialNumber: 3 }));

    // セッション内再出題
    const retries = engine.getInSessionRetries();
    expect(retries).toHaveLength(2);

    // セッション終了 → WeakPattern昇格
    const result1 = engine.endSession(baseTime);
    expect(result1.newWeakPatterns).toHaveLength(2);
    expect(engine.getSessionInUnit()).toBe(2);

    // === 1日後: 復習スケジュール確認 ===
    const schedule = engine.getRepetitionSchedule(baseTime + DAY_MS);
    expect(schedule.duePatternCount).toBe(2); // 両方due

    // === Session 2: 復習 → 1つ正解、1つ不正解 ===
    engine.startSession();
    engine.recordPatternCorrect('hikari-catch:attention:go-blue', baseTime + DAY_MS);
    engine.recordPatternIncorrect('hikari-catch:attention:nogo-red', baseTime + DAY_MS);
    engine.endSession(baseTime + DAY_MS);
    expect(engine.getSessionInUnit()).toBe(3);

    // === 2日後: go-blueはまだdue不要、nogo-redはdue ===
    const schedule2 = engine.getRepetitionSchedule(baseTime + 2 * DAY_MS);
    // go-blue: hl was extended to 48h, 2日後 = 48h → p(recall) = 0.5 → at threshold
    // nogo-red: hl was shortened further, should be due
    expect(schedule2.duePatterns.some(p => p.patternKey === 'nogo-red')).toBe(true);

    // === Sessions 3-4: 通常プレイ ===
    engine.startSession();
    engine.endSession(baseTime + 3 * DAY_MS);
    expect(engine.getSessionInUnit()).toBe(4);

    engine.startSession();
    engine.endSession(baseTime + 4 * DAY_MS);
    expect(engine.getSessionInUnit()).toBe(5);

    // === Session 5: ユニットレビュー（ボス戦） ===
    expect(engine.isUnitReviewSession()).toBe(true);
    const reviewTrials = engine.generateUnitReviewTrials(baseTime + 5 * DAY_MS);
    // nogo-red should still be active (not mastered)
    expect(reviewTrials.length).toBeGreaterThanOrEqual(1);

    engine.startSession();
    engine.endSession(baseTime + 5 * DAY_MS);
    // Should wrap back to session 1
    expect(engine.getSessionInUnit()).toBe(1);
  });

  it('should handle ID-severe disability with shorter intervals', () => {
    const engine = new SpacedRepetitionEngine('id-severe', 1);
    const baseTime = 1700000000000;

    engine.recordWeakPattern(
      'hikari-catch', 'attention', 'p1',
      { type: 'go' }, { action: 'tap' }, { level: 1 },
      baseTime,
    );

    const pattern = engine.getPattern('hikari-catch:attention:p1')!;

    // Base half-life should be 16.8h (24 * 0.7)
    expect(pattern.halfLifeHours).toBeCloseTo(16.8, 5);

    // After 16.8 hours, should be due
    const schedule = engine.getRepetitionSchedule(baseTime + 16.8 * HOUR_MS);
    expect(schedule.duePatternCount).toBe(1);

    // Standard disability (ADHD) would not be due at 16.8h
    const standardEngine = new SpacedRepetitionEngine('adhd', 1);
    standardEngine.recordWeakPattern(
      'hikari-catch', 'attention', 'p1',
      { type: 'go' }, { action: 'tap' }, { level: 1 },
      baseTime,
    );
    const standardSchedule = standardEngine.getRepetitionSchedule(baseTime + 16.8 * HOUR_MS);
    // Standard hl=24h, 16.8h elapsed → recall = 2^(-16.8/24) ≈ 0.63 > 0.5
    expect(standardSchedule.duePatternCount).toBe(0);
  });
});
