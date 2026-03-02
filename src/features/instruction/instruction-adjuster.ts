import type { InstructionLevel } from './instruction-level';

/**
 * 動的指示レベル調整の入力データ
 */
export interface InstructionAdjustmentInput {
  /** 現在の指示レベル */
  currentLevel: InstructionLevel;
  /** ランダム押し率（0–1）: 理解していない指標 */
  randomPressRate: number;
  /** デモ再視聴回数 */
  demoReplayCount: number;
  /** 連続エラー数 */
  consecutiveErrors: number;
  /** セッション正答率（0–1） */
  sessionAccuracy: number;
  /**
   * 正答率 > 90% が何セッション連続しているか。
   * UP判定には2セッション以上必要。
   */
  consecutiveHighAccuracySessions?: number;
}

/**
 * 動的指示レベル調整の結果
 */
export interface InstructionAdjustmentResult {
  newLevel: InstructionLevel;
  /** 調整が発生した場合の理由（デバッグ・ログ用） */
  reason?: string;
}

/** レベルを1段階下げる（L1 が下限） */
function levelDown(level: InstructionLevel): InstructionLevel {
  switch (level) {
    case 'L4': return 'L3';
    case 'L3': return 'L2';
    case 'L2': return 'L1';
    case 'L1': return 'L1'; // これ以上下げない
  }
}

/** レベルを1段階上げる（L3 が自動昇格の上限、L4 は保護者が手動設定） */
function levelUp(level: InstructionLevel): InstructionLevel {
  switch (level) {
    case 'L1': return 'L2';
    case 'L2': return 'L3';
    case 'L3': return 'L3'; // L4 への自動昇格はしない
    case 'L4': return 'L4';
  }
}

/**
 * プレイ中の理解度に基づいて指示レベルを動的に調整する。
 *
 * 下げる条件（優先度高い順）:
 *   1. ランダム押し率 > 50% → 1段階DOWN
 *   2. デモ再視聴3回以上 → 1段階DOWN
 *
 * 上げる条件:
 *   - セッション正答率 > 90% かつ 2セッション連続 → 1段階UP
 *   - L4 へは自動昇格しない
 *
 * 注意: DOWN 条件が複数一致しても1段階のみ下げる（重複適用なし）。
 */
export function adjustInstructionLevel(
  input: InstructionAdjustmentInput,
): InstructionAdjustmentResult {
  const {
    currentLevel,
    randomPressRate,
    demoReplayCount,
    sessionAccuracy,
    consecutiveHighAccuracySessions = 0,
  } = input;

  // --- DOWN 判定 ---
  if (randomPressRate > 0.5) {
    const newLevel = levelDown(currentLevel);
    return {
      newLevel,
      reason: `ランダム押し率が高い (${Math.round(randomPressRate * 100)}% > 50%) → DOWN`,
    };
  }

  if (demoReplayCount >= 3) {
    const newLevel = levelDown(currentLevel);
    return {
      newLevel,
      reason: `デモ再視聴回数が多い (${demoReplayCount}回 ≥ 3) → DOWN`,
    };
  }

  // --- UP 判定 ---
  if (sessionAccuracy > 0.9 && consecutiveHighAccuracySessions >= 2) {
    const newLevel = levelUp(currentLevel);
    if (newLevel !== currentLevel) {
      return {
        newLevel,
        reason: `正答率 ${Math.round(sessionAccuracy * 100)}% かつ ${consecutiveHighAccuracySessions}セッション連続 → UP`,
      };
    }
  }

  // 変更なし
  return { newLevel: currentLevel };
}
