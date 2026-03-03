/**
 * Near-Miss Detectors - 各ゲーム用ニアミス判定関数
 *
 * 各ゲームの特性に合わせた「惜しい」条件を定義。
 * すべての判定関数は NearMissDetector インターフェースに準拠。
 */

import type { NearMissContext, NearMissResult, NearMissDetector } from './types';
import { NOT_NEAR_MISS } from './types';

// ============================================
// 1. ひかりキャッチ (hikari-catch) - 注意・抑制
// ============================================
/**
 * ニアミス条件:
 * - No-Go刺激に反応したが、RT基準値に近い（反応抑制の途中段階を示唆）
 *   → commissionエラーだがRTが長い = 抑制を試みた形跡
 *
 * extra.reactionTimeMs: 反応時間
 * extra.responseWindowMs: 応答窓の長さ
 */
export const detectHikariCatchNearMiss: NearMissDetector = (context: NearMissContext): NearMissResult => {
  const { errorType, extra } = context;

  // commission エラー（No-Go刺激へのタップ）でRTが遅い = 抑制を試みた
  if (errorType === 'commission' && extra?.reactionTimeMs != null) {
    const rt = extra.reactionTimeMs as number;
    const responseWindow = (extra.responseWindowMs as number) || 2000;
    // 応答窓の60%以上のRTなら「抑制を試みた」と判定
    if (rt >= responseWindow * 0.6) {
      return {
        isNearMiss: true,
        nearMissType: 'delayed_inhibition',
        message: 'おしい！ がまんできそうだったね！',
      };
    }
  }

  return NOT_NEAR_MISS;
};

// ============================================
// 2. おぼえてならべて (oboete-narabete) - 記憶・学習
// ============================================
/**
 * ニアミス条件:
 * - 系列の1要素だけ間違い（span-1正解）
 * - 正しい要素を含むが順序が入れ替わっている
 *
 * correctAnswer.expected_sequence: number[]
 * userResponse.input_sequence: number[]
 */
export const detectOboeteNarabeteNearMiss: NearMissDetector = (context: NearMissContext): NearMissResult => {
  const expected = context.correctAnswer.expected_sequence as number[] | undefined;
  const input = context.userResponse.input_sequence as number[] | undefined;

  if (!expected || !input || expected.length === 0) return NOT_NEAR_MISS;

  // 一致数をカウント
  let matchCount = 0;
  for (let i = 0; i < expected.length; i++) {
    if (input[i] === expected[i]) matchCount++;
  }

  // span-1: 1つだけ間違い
  if (matchCount === expected.length - 1) {
    return {
      isNearMiss: true,
      nearMissType: 'span_minus_one',
      message: 'おしい！ あと ひとつだったね！',
    };
  }

  // 順序入れ替わり: すべての要素が含まれているが順序が違う
  if (input.length === expected.length) {
    const sortedExpected = [...expected].sort();
    const sortedInput = [...input].sort();
    const allElementsPresent = sortedExpected.every((v, i) => v === sortedInput[i]);
    if (allElementsPresent && matchCount < expected.length) {
      return {
        isNearMiss: true,
        nearMissType: 'order_swap',
        message: 'おしい！ じゅんばんが ちがったね！',
      };
    }
  }

  return NOT_NEAR_MISS;
};

// ============================================
// 3. いろかえスイッチ (irokae-switch) - 柔軟性
// ============================================
/**
 * ニアミス条件:
 * - 保続エラー: 直前ルールでは正しい回答（ルール理解は示している）
 *
 * errorType === 'perseverative' を使用
 */
export const detectIrokaeSwitchNearMiss: NearMissDetector = (context: NearMissContext): NearMissResult => {
  if (context.errorType === 'perseverative') {
    return {
      isNearMiss: true,
      nearMissType: 'perseveration',
      message: 'おしい！ ルールが かわったよ！',
    };
  }

  return NOT_NEAR_MISS;
};

// ============================================
// 4. パターンパズル (pattern-puzzle) - 知覚・推論
// ============================================
/**
 * ニアミス条件:
 * - 形は正解だが色が違う
 * - 色は正解だが形が違う
 *
 * correctAnswer.correct: { shape, color }
 * userResponse.selected: { shape, color }
 */
export const detectPatternPuzzleNearMiss: NearMissDetector = (context: NearMissContext): NearMissResult => {
  const correct = context.correctAnswer.correct as { shape?: string; color?: string } | undefined;
  const selected = context.userResponse.selected as { shape?: string; color?: string } | undefined;

  if (!correct || !selected) return NOT_NEAR_MISS;

  const shapeMatch = correct.shape === selected.shape;
  const colorMatch = correct.color === selected.color;

  // 形は合っているが色が違う
  if (shapeMatch && !colorMatch) {
    return {
      isNearMiss: true,
      nearMissType: 'shape_correct',
      message: 'おしい！ かたちは あってたよ！',
    };
  }

  // 色は合っているが形が違う
  if (!shapeMatch && colorMatch) {
    return {
      isNearMiss: true,
      nearMissType: 'color_correct',
      message: 'おしい！ いろは あってたよ！',
    };
  }

  return NOT_NEAR_MISS;
};

// ============================================
// 5. めいろたんけん (meiro-tanken) - 計画・問題解決
// ============================================
/**
 * ニアミス条件:
 * - ゴールに近い位置まで到達している（マンハッタン距離が1-2以内）
 *
 * extra.playerPosition: { row, col }
 * extra.goalPosition: { row, col }
 * extra.mazeSize: number
 */
export const detectMeiroTankenNearMiss: NearMissDetector = (context: NearMissContext): NearMissResult => {
  const { extra } = context;
  if (!extra) return NOT_NEAR_MISS;

  const playerPos = extra.playerPosition as { row: number; col: number } | undefined;
  const goalPos = extra.goalPosition as { row: number; col: number } | undefined;

  if (!playerPos || !goalPos) return NOT_NEAR_MISS;

  const distance = Math.abs(playerPos.row - goalPos.row) + Math.abs(playerPos.col - goalPos.col);

  // ゴールまでマンハッタン距離2以内
  if (distance <= 2 && distance > 0) {
    return {
      isNearMiss: true,
      nearMissType: 'near_goal',
      message: 'おしい！ ゴールの すぐ ちかくだったよ！',
    };
  }

  return NOT_NEAR_MISS;
};

// ============================================
// 6. ことばキャッチ (kotoba-catch) - 言語
// ============================================
/**
 * ニアミス条件:
 * - 同カテゴリの別単語を選択
 *
 * extra.targetCategory: string (正解の単語のカテゴリ)
 * extra.selectedCategory: string (選択した単語のカテゴリ)
 */
export const detectKotobaCatchNearMiss: NearMissDetector = (context: NearMissContext): NearMissResult => {
  const { extra } = context;
  if (!extra) return NOT_NEAR_MISS;

  const targetCategory = extra.targetCategory as string | undefined;
  const selectedCategory = extra.selectedCategory as string | undefined;

  if (targetCategory && selectedCategory && targetCategory === selectedCategory) {
    return {
      isNearMiss: true,
      nearMissType: 'same_category',
      message: 'おしい！ にている ことばだったね！',
    };
  }

  return NOT_NEAR_MISS;
};

// ============================================
// 7. きもちよみとり (kimochi-yomitori) - 社会認知
// ============================================
/**
 * ニアミス条件:
 * - valence（正負）は合っているが具体的表情を間違えた
 *
 * extra.targetGroup: 'positive' | 'negative' | 'neutral'
 * extra.selectedGroup: 'positive' | 'negative' | 'neutral'
 */
export const detectKimochiYomitoriNearMiss: NearMissDetector = (context: NearMissContext): NearMissResult => {
  const { extra } = context;
  if (!extra) return NOT_NEAR_MISS;

  const targetGroup = extra.targetGroup as string | undefined;
  const selectedGroup = extra.selectedGroup as string | undefined;

  if (targetGroup && selectedGroup && targetGroup === selectedGroup) {
    return {
      isNearMiss: true,
      nearMissType: 'same_valence',
      message: 'おしい！ にている きもちだったね！',
    };
  }

  return NOT_NEAR_MISS;
};

// ============================================
// 8. はやわざタッチ (hayawaza-touch) - 微細運動/処理速度
// ============================================
/**
 * ニアミス条件:
 * - commission エラーだがRTが遅い（抑制を試みた形跡）
 * - omission エラーだがRT窓の末尾近くまで待った（反応しようとした形跡）
 *
 * extra.reactionTimeMs: number | null
 * extra.responseWindowMs: number
 * extra.isAnticipation: boolean
 */
export const detectHayawazaTouchNearMiss: NearMissDetector = (context: NearMissContext): NearMissResult => {
  const { errorType, extra } = context;
  if (!extra) return NOT_NEAR_MISS;

  const isAnticipation = extra.isAnticipation as boolean | undefined;

  // 予測反応（< 150ms）はニアミスにしない
  if (isAnticipation) return NOT_NEAR_MISS;

  // commission in CRT mode: タップしてはいけないのにタップしたが、RTが遅い = 抑制を試みた
  if (errorType === 'commission' && extra.reactionTimeMs != null) {
    const rt = extra.reactionTimeMs as number;
    const responseWindow = (extra.responseWindowMs as number) || 2000;
    if (rt >= responseWindow * 0.6) {
      return {
        isNearMiss: true,
        nearMissType: 'delayed_inhibition',
        message: 'おしい！ よく がまんしようとしたね！',
      };
    }
  }

  return NOT_NEAR_MISS;
};

// ============================================
// Detector Registry
// ============================================

/** ゲームIDからニアミス判定関数へのマッピング */
const DETECTOR_MAP: Partial<Record<string, NearMissDetector>> = {
  'hikari-catch': detectHikariCatchNearMiss,
  'oboete-narabete': detectOboeteNarabeteNearMiss,
  'irokae-switch': detectIrokaeSwitchNearMiss,
  'pattern-puzzle': detectPatternPuzzleNearMiss,
  'meiro-tanken': detectMeiroTankenNearMiss,
  'kotoba-catch': detectKotobaCatchNearMiss,
  'kimochi-yomitori': detectKimochiYomitoriNearMiss,
  'hayawaza-touch': detectHayawazaTouchNearMiss,
};

/**
 * ゲームIDに基づいてニアミス判定を実行する。
 * 対応するdetectorがない場合はNOT_NEAR_MISSを返す。
 */
export function detectNearMiss(context: NearMissContext): NearMissResult {
  const detector = DETECTOR_MAP[context.gameId];
  if (!detector) return NOT_NEAR_MISS;
  return detector(context);
}
