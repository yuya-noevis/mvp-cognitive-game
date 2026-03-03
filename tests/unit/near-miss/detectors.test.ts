import { describe, it, expect } from 'vitest';
import {
  detectNearMiss,
  detectHikariCatchNearMiss,
  detectOboeteNarabeteNearMiss,
  detectIrokaeSwitchNearMiss,
  detectPatternPuzzleNearMiss,
  detectMeiroTankenNearMiss,
  detectKotobaCatchNearMiss,
  detectKimochiYomitoriNearMiss,
  detectHayawazaTouchNearMiss,
  NOT_NEAR_MISS,
} from '@/features/near-miss';
import type { NearMissContext } from '@/features/near-miss';

// ============================================
// 1. ひかりキャッチ (hikari-catch) - 注意・抑制
// ============================================
describe('detectHikariCatchNearMiss', () => {
  it('should detect delayed inhibition (commission error with slow RT)', () => {
    const result = detectHikariCatchNearMiss({
      gameId: 'hikari-catch',
      correctAnswer: { targetId: 'target_1' },
      userResponse: { tappedId: 'distractor_1', isTarget: false },
      errorType: 'commission',
      extra: { reactionTimeMs: 1500, responseWindowMs: 2000 },
    });

    expect(result.isNearMiss).toBe(true);
    expect(result.nearMissType).toBe('delayed_inhibition');
    expect(result.message).toBeTruthy();
  });

  it('should NOT detect near-miss for fast commission error (impulsive)', () => {
    const result = detectHikariCatchNearMiss({
      gameId: 'hikari-catch',
      correctAnswer: { targetId: 'target_1' },
      userResponse: { tappedId: 'distractor_1', isTarget: false },
      errorType: 'commission',
      extra: { reactionTimeMs: 300, responseWindowMs: 2000 },
    });

    expect(result.isNearMiss).toBe(false);
  });

  it('should NOT detect near-miss for selection errors', () => {
    const result = detectHikariCatchNearMiss({
      gameId: 'hikari-catch',
      correctAnswer: { targetId: 'target_1' },
      userResponse: { tappedId: 'distractor_1', isTarget: false },
      errorType: 'selection',
      extra: { reactionTimeMs: 1500, responseWindowMs: 2000 },
    });

    expect(result.isNearMiss).toBe(false);
  });

  it('should handle edge case: RT exactly at 60% threshold', () => {
    const result = detectHikariCatchNearMiss({
      gameId: 'hikari-catch',
      correctAnswer: { targetId: 'target_1' },
      userResponse: { tappedId: 'distractor_1', isTarget: false },
      errorType: 'commission',
      extra: { reactionTimeMs: 1200, responseWindowMs: 2000 }, // exactly 60%
    });

    expect(result.isNearMiss).toBe(true);
  });
});

// ============================================
// 2. おぼえてならべて (oboete-narabete) - 記憶
// ============================================
describe('detectOboeteNarabeteNearMiss', () => {
  it('should detect span-1 (one element wrong)', () => {
    const result = detectOboeteNarabeteNearMiss({
      gameId: 'oboete-narabete',
      correctAnswer: { expected_sequence: [0, 3, 5, 2] },
      userResponse: { input_sequence: [0, 3, 7, 2] },
      errorType: 'position',
    });

    expect(result.isNearMiss).toBe(true);
    expect(result.nearMissType).toBe('span_minus_one');
  });

  it('should detect order swap (all elements present but wrong order)', () => {
    const result = detectOboeteNarabeteNearMiss({
      gameId: 'oboete-narabete',
      correctAnswer: { expected_sequence: [1, 2, 3] },
      userResponse: { input_sequence: [2, 1, 3] },
      errorType: 'position',
    });

    expect(result.isNearMiss).toBe(true);
    expect(result.nearMissType).toBe('order_swap');
  });

  it('should NOT detect near-miss for completely wrong sequence', () => {
    const result = detectOboeteNarabeteNearMiss({
      gameId: 'oboete-narabete',
      correctAnswer: { expected_sequence: [0, 1, 2, 3] },
      userResponse: { input_sequence: [5, 6, 7, 8] },
      errorType: 'position',
    });

    expect(result.isNearMiss).toBe(false);
  });

  it('should prioritize span_minus_one over order_swap', () => {
    // If only one element differs and also happens to be a swap, span_minus_one wins
    const result = detectOboeteNarabeteNearMiss({
      gameId: 'oboete-narabete',
      correctAnswer: { expected_sequence: [1, 2, 3] },
      userResponse: { input_sequence: [1, 2, 4] },
      errorType: 'position',
    });

    // One mismatch = span_minus_one (even though not all elements present)
    expect(result.isNearMiss).toBe(true);
    expect(result.nearMissType).toBe('span_minus_one');
  });

  it('should handle empty sequences gracefully', () => {
    const result = detectOboeteNarabeteNearMiss({
      gameId: 'oboete-narabete',
      correctAnswer: { expected_sequence: [] },
      userResponse: { input_sequence: [] },
      errorType: 'position',
    });

    expect(result.isNearMiss).toBe(false);
  });

  it('should handle sequence of length 2 with swap', () => {
    const result = detectOboeteNarabeteNearMiss({
      gameId: 'oboete-narabete',
      correctAnswer: { expected_sequence: [3, 5] },
      userResponse: { input_sequence: [5, 3] },
      errorType: 'position',
    });

    expect(result.isNearMiss).toBe(true);
    expect(result.nearMissType).toBe('order_swap');
  });
});

// ============================================
// 3. いろかえスイッチ (irokae-switch) - 柔軟性
// ============================================
describe('detectIrokaeSwitchNearMiss', () => {
  it('should detect perseverative error as near-miss', () => {
    const result = detectIrokaeSwitchNearMiss({
      gameId: 'irokae-switch',
      correctAnswer: { correct_bin: 1 },
      userResponse: { selected_bin: 0 },
      errorType: 'perseverative',
    });

    expect(result.isNearMiss).toBe(true);
    expect(result.nearMissType).toBe('perseveration');
  });

  it('should NOT detect near-miss for regular selection errors', () => {
    const result = detectIrokaeSwitchNearMiss({
      gameId: 'irokae-switch',
      correctAnswer: { correct_bin: 1 },
      userResponse: { selected_bin: 0 },
      errorType: 'selection',
    });

    expect(result.isNearMiss).toBe(false);
  });
});

// ============================================
// 4. パターンパズル (pattern-puzzle) - 知覚・推論
// ============================================
describe('detectPatternPuzzleNearMiss', () => {
  it('should detect shape correct (shape matches, color differs)', () => {
    const result = detectPatternPuzzleNearMiss({
      gameId: 'pattern-puzzle',
      correctAnswer: { correct: { shape: '●', color: '#EF4444' } },
      userResponse: { selected: { shape: '●', color: '#3B82F6' } },
      errorType: 'selection',
    });

    expect(result.isNearMiss).toBe(true);
    expect(result.nearMissType).toBe('shape_correct');
  });

  it('should detect color correct (color matches, shape differs)', () => {
    const result = detectPatternPuzzleNearMiss({
      gameId: 'pattern-puzzle',
      correctAnswer: { correct: { shape: '●', color: '#EF4444' } },
      userResponse: { selected: { shape: '■', color: '#EF4444' } },
      errorType: 'selection',
    });

    expect(result.isNearMiss).toBe(true);
    expect(result.nearMissType).toBe('color_correct');
  });

  it('should NOT detect near-miss when both shape and color are wrong', () => {
    const result = detectPatternPuzzleNearMiss({
      gameId: 'pattern-puzzle',
      correctAnswer: { correct: { shape: '●', color: '#EF4444' } },
      userResponse: { selected: { shape: '■', color: '#3B82F6' } },
      errorType: 'selection',
    });

    expect(result.isNearMiss).toBe(false);
  });

  it('should handle missing data gracefully', () => {
    const result = detectPatternPuzzleNearMiss({
      gameId: 'pattern-puzzle',
      correctAnswer: {},
      userResponse: {},
      errorType: 'selection',
    });

    expect(result.isNearMiss).toBe(false);
  });
});

// ============================================
// 5. めいろたんけん (meiro-tanken) - 計画
// ============================================
describe('detectMeiroTankenNearMiss', () => {
  it('should detect near goal (Manhattan distance 1)', () => {
    const result = detectMeiroTankenNearMiss({
      gameId: 'meiro-tanken',
      correctAnswer: { goal: { row: 4, col: 4 } },
      userResponse: {},
      errorType: 'omission',
      extra: {
        playerPosition: { row: 4, col: 3 },
        goalPosition: { row: 4, col: 4 },
        mazeSize: 5,
      },
    });

    expect(result.isNearMiss).toBe(true);
    expect(result.nearMissType).toBe('near_goal');
  });

  it('should detect near goal (Manhattan distance 2)', () => {
    const result = detectMeiroTankenNearMiss({
      gameId: 'meiro-tanken',
      correctAnswer: { goal: { row: 4, col: 4 } },
      userResponse: {},
      errorType: 'omission',
      extra: {
        playerPosition: { row: 3, col: 3 },
        goalPosition: { row: 4, col: 4 },
        mazeSize: 5,
      },
    });

    expect(result.isNearMiss).toBe(true);
    expect(result.nearMissType).toBe('near_goal');
  });

  it('should NOT detect near-miss when far from goal', () => {
    const result = detectMeiroTankenNearMiss({
      gameId: 'meiro-tanken',
      correctAnswer: { goal: { row: 4, col: 4 } },
      userResponse: {},
      errorType: 'omission',
      extra: {
        playerPosition: { row: 0, col: 0 },
        goalPosition: { row: 4, col: 4 },
        mazeSize: 5,
      },
    });

    expect(result.isNearMiss).toBe(false);
  });

  it('should handle missing extra data', () => {
    const result = detectMeiroTankenNearMiss({
      gameId: 'meiro-tanken',
      correctAnswer: { goal: { row: 4, col: 4 } },
      userResponse: {},
      errorType: 'omission',
    });

    expect(result.isNearMiss).toBe(false);
  });
});

// ============================================
// 6. ことばキャッチ (kotoba-catch) - 言語
// ============================================
describe('detectKotobaCatchNearMiss', () => {
  it('should detect same category selection as near-miss', () => {
    const result = detectKotobaCatchNearMiss({
      gameId: 'kotoba-catch',
      correctAnswer: { target_word: 'いぬ' },
      userResponse: { selected: 'ねこ' },
      errorType: 'selection',
      extra: {
        targetCategory: 'basic_noun',
        selectedCategory: 'basic_noun',
      },
    });

    expect(result.isNearMiss).toBe(true);
    expect(result.nearMissType).toBe('same_category');
  });

  it('should NOT detect near-miss for different category selection', () => {
    const result = detectKotobaCatchNearMiss({
      gameId: 'kotoba-catch',
      correctAnswer: { target_word: 'いぬ' },
      userResponse: { selected: 'はしる' },
      errorType: 'selection',
      extra: {
        targetCategory: 'basic_noun',
        selectedCategory: 'verb',
      },
    });

    expect(result.isNearMiss).toBe(false);
  });

  it('should handle missing extra data', () => {
    const result = detectKotobaCatchNearMiss({
      gameId: 'kotoba-catch',
      correctAnswer: { target_word: 'いぬ' },
      userResponse: { selected: 'ねこ' },
      errorType: 'selection',
    });

    expect(result.isNearMiss).toBe(false);
  });
});

// ============================================
// 7. きもちよみとり (kimochi-yomitori) - 社会認知
// ============================================
describe('detectKimochiYomitoriNearMiss', () => {
  it('should detect same valence (same emotion group) as near-miss', () => {
    const result = detectKimochiYomitoriNearMiss({
      gameId: 'kimochi-yomitori',
      correctAnswer: { correct_emotion: 'sad' },
      userResponse: { selected: 'angry' },
      errorType: 'selection',
      extra: {
        targetGroup: 'negative',
        selectedGroup: 'negative',
      },
    });

    expect(result.isNearMiss).toBe(true);
    expect(result.nearMissType).toBe('same_valence');
  });

  it('should NOT detect near-miss for different valence', () => {
    const result = detectKimochiYomitoriNearMiss({
      gameId: 'kimochi-yomitori',
      correctAnswer: { correct_emotion: 'happy' },
      userResponse: { selected: 'sad' },
      errorType: 'selection',
      extra: {
        targetGroup: 'positive',
        selectedGroup: 'negative',
      },
    });

    expect(result.isNearMiss).toBe(false);
  });
});

// ============================================
// 8. はやわざタッチ (hayawaza-touch) - 処理速度
// ============================================
describe('detectHayawazaTouchNearMiss', () => {
  it('should detect delayed inhibition (slow commission in CRT)', () => {
    const result = detectHayawazaTouchNearMiss({
      gameId: 'hayawaza-touch',
      correctAnswer: { expected: 'withhold' },
      userResponse: { action: 'tap' },
      errorType: 'commission',
      extra: {
        reactionTimeMs: 1800,
        responseWindowMs: 2500,
        isAnticipation: false,
      },
    });

    expect(result.isNearMiss).toBe(true);
    expect(result.nearMissType).toBe('delayed_inhibition');
  });

  it('should NOT detect near-miss for anticipation responses', () => {
    const result = detectHayawazaTouchNearMiss({
      gameId: 'hayawaza-touch',
      correctAnswer: { expected: 'withhold' },
      userResponse: { action: 'tap' },
      errorType: 'commission',
      extra: {
        reactionTimeMs: 100,
        responseWindowMs: 2500,
        isAnticipation: true,
      },
    });

    expect(result.isNearMiss).toBe(false);
  });

  it('should NOT detect near-miss for fast commission (impulsive)', () => {
    const result = detectHayawazaTouchNearMiss({
      gameId: 'hayawaza-touch',
      correctAnswer: { expected: 'withhold' },
      userResponse: { action: 'tap' },
      errorType: 'commission',
      extra: {
        reactionTimeMs: 300,
        responseWindowMs: 2500,
        isAnticipation: false,
      },
    });

    expect(result.isNearMiss).toBe(false);
  });
});

// ============================================
// Registry / detectNearMiss dispatch
// ============================================
describe('detectNearMiss (registry)', () => {
  it('should dispatch to correct detector based on gameId', () => {
    const result = detectNearMiss({
      gameId: 'irokae-switch',
      correctAnswer: { correct_bin: 1 },
      userResponse: { selected_bin: 0 },
      errorType: 'perseverative',
    });

    expect(result.isNearMiss).toBe(true);
    expect(result.nearMissType).toBe('perseveration');
  });

  it('should return NOT_NEAR_MISS for unknown gameId', () => {
    const result = detectNearMiss({
      gameId: 'unknown-game' as any,
      correctAnswer: {},
      userResponse: {},
      errorType: null,
    });

    expect(result).toEqual(NOT_NEAR_MISS);
  });

  it('should return NOT_NEAR_MISS when no near-miss condition met', () => {
    const result = detectNearMiss({
      gameId: 'irokae-switch',
      correctAnswer: { correct_bin: 1 },
      userResponse: { selected_bin: 0 },
      errorType: 'selection',
    });

    expect(result.isNearMiss).toBe(false);
  });
});
