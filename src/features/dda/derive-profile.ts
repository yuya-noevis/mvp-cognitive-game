/**
 * オンボーディングの disabilities[] から DisabilityType を導出
 *
 * 優先順位（最もサポートが必要な特性を優先）:
 *   id_severe > id_moderate > asd > adhd系 > id_mild > typical
 * 空配列 / 障害なし → 'unknown'
 */

import type { DisabilityType } from './disability-profile';

export function deriveDisabilityType(disabilities: string[]): DisabilityType {
  if (!disabilities || disabilities.length === 0) return 'unknown';

  // "none" のみ選択されている場合は typical
  if (disabilities.length === 1 && disabilities[0] === 'none') return 'typical';

  const set = new Set(disabilities);

  // 優先順位順にチェック
  if (set.has('id_severe')) return 'id-severe';
  if (set.has('id_moderate')) return 'id-moderate';
  // id_unspecified は中度扱い（安全側に倒す）
  if (set.has('id_unspecified')) return 'id-moderate';
  if (set.has('asd')) return 'asd';
  if (set.has('adhd_inattentive') || set.has('adhd_hyperactive') || set.has('adhd_combined')) return 'adhd';
  if (set.has('id_mild') || set.has('borderline_iq')) return 'id-mild';

  // LD, DCD, language_delay 等のみの場合は unknown（個別プロファイル未定義）
  return 'unknown';
}
